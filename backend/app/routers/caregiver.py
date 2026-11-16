"""
케어기버 관련 라우터 - 체크리스트 & 돌봄노트 통합 버전
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, timedelta
import time

from ..config import settings
from ..database import get_db
from ..models import User, Senior, CareSession, ChecklistResponse, CareNote, Notification, NursingHome, ChecklistType
from ..models.care import WeeklyChecklistScore, CareNoteQuestion, AttendanceLog
from ..models.enhanced_care import CareSchedule
from ..models.report import AIReport, Feedback
from ..services.care import CareService
from ..schemas import (
    CareSessionResponse, SeniorResponse, ChecklistSubmission, CareNoteSubmission,
    CaregiverHomeResponse, AttendanceCheckIn, AttendanceCheckOut
)
from ..schemas.care import (
    ChecklistRequest, ChecklistSuccessResponse, ChecklistStatusResponse,
    CareNoteRequest, CareNoteSuccessResponse, RandomQuestionResponse,
    TaskStatusResponse, AttendanceCheckoutRequest, CheckoutSuccessResponse
)
from ..schemas.home import CareScheduleResponse, CareScheduleGroup
from ..schemas.senior import SeniorWithChecklistTypes, AvailableChecklistType
from ..services.auth import get_current_user
from ..services.checkout import CheckoutService
from ..services.checklist import ChecklistService
from ..services.care_note import CareNoteService
from ..exceptions import (
    DailyLimitExceeded, SessionNotActive, SessionNotFound, 
    ModificationBlocked, RequiredTasksIncomplete, InvalidScoreFormat,
    ContentLengthError, QuestionNotFound
)

router = APIRouter()

@router.get("/home", response_model=CaregiverHomeResponse)
async def get_caregiver_home(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """케어기버 홈 화면 데이터 조회 - 돌봄 일정 포함"""
    try:
        # 케어기버 프로필 조회 (관계를 통해)
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        caregiver = current_user.caregiver_profile
        
        # 오늘 날짜 기준 돌봄 세션 조회
        today = date.today()
        today_sessions = db.query(CareSession).filter(
            CareSession.caregiver_id == caregiver.id,
            CareSession.created_at >= today
        ).all()
        
        # 담당 시니어 목록 조회
        seniors = db.query(Senior).filter(
            Senior.caregiver_id == caregiver.id
        ).all()
        
        # 읽지 않은 알림 조회
        notifications = db.query(Notification).filter(
            Notification.receiver_id == current_user.id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).limit(10).all()
        
        # ===== 새로운 돌봄 일정 조회 로직 =====
        care_schedules = await get_caregiver_care_schedules(caregiver.id, db)
        
        # 통계 계산
        total_assigned_seniors = len(seniors)
        
        # 이번 주 완료된 세션 수
        week_start = today - timedelta(days=today.weekday())
        completed_sessions_this_week = db.query(CareSession).filter(
            CareSession.caregiver_id == caregiver.id,
            CareSession.start_time >= week_start,
            CareSession.status == "completed"
        ).count()
        
        # 오늘 대기 중인 일정 수
        pending_schedules_today = len([s for s in care_schedules.today_schedules if s.status == "scheduled"])
        
        return CaregiverHomeResponse(
            caregiver_name=caregiver.name,
            caregiver_id=caregiver.id,
            today_sessions=today_sessions,
            seniors=seniors,
            notifications=notifications,
            care_schedules=care_schedules,
            total_assigned_seniors=total_assigned_seniors,
            completed_sessions_this_week=completed_sessions_this_week,
            pending_schedules_today=pending_schedules_today
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"홈 데이터 조회 중 오류가 발생했습니다: {str(e)}"
        )

async def get_caregiver_care_schedules(caregiver_id: int, db: Session) -> CareScheduleGroup:
    """케어기버의 돌봄 일정을 조회하여 분류"""
    
    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # 이번 주 월요일
    week_end = week_start + timedelta(days=6)  # 이번 주 일요일
    next_week_start = week_end + timedelta(days=1)  # 다음 주 월요일
    next_week_end = next_week_start + timedelta(days=6)  # 다음 주 일요일
    
    # care_calendar 테이블에서 돌봄 일정 조회 (시니어 정보와 요양원 정보 포함)
    from sqlalchemy import text
    from datetime import time as time_obj
    
    # 지난 30일부터 앞으로 30일까지의 일정 조회
    start_date = today - timedelta(days=30)
    end_date = today + timedelta(days=30)
    
    query = text("""
        SELECT 
            cc.id,
            cc.senior_id,
            s.name as senior_name,
            s.photo as senior_photo,
            cc.care_date,
            cc.start_time,
            cc.end_time,
            cc.status,
            cc.notes,
            nh.name as nursing_home_name,
            nh.address as nursing_home_address
        FROM care_calendar cc
        JOIN seniors s ON cc.senior_id = s.id
        LEFT JOIN nursing_homes nh ON s.nursing_home_id = nh.id
        WHERE cc.caregiver_id = :caregiver_id
        AND cc.care_date BETWEEN :start_date AND :end_date
        ORDER BY cc.care_date ASC, cc.start_time ASC
    """)
    
    result = db.execute(query, {
        "caregiver_id": caregiver_id,
        "start_date": start_date,
        "end_date": end_date
    })
    
    schedule_rows = result.fetchall()
    
    # 일정을 분류
    today_schedules = []
    past_schedules = []
    upcoming_schedules = []
    this_week_schedules = []
    next_week_schedules = []
    
    def convert_timedelta_to_time(td):
        """timedelta를 time 객체로 변환"""
        if td is None:
            return None
        if isinstance(td, timedelta):
            # timedelta의 총 초를 시간:분:초로 변환
            total_seconds = int(td.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return time_obj(hours, minutes, seconds)
        return td  # 이미 time 객체인 경우
    
    for row in schedule_rows:
        # timedelta를 time으로 변환
        start_time_converted = convert_timedelta_to_time(row.start_time)
        end_time_converted = convert_timedelta_to_time(row.end_time)
        
        schedule = CareScheduleResponse(
            id=row.id,
            senior_id=row.senior_id,
            senior_name=row.senior_name,
            senior_photo=row.senior_photo,
            care_date=row.care_date,
            start_time=start_time_converted,
            end_time=end_time_converted,
            status=row.status,
            is_today=(row.care_date == today),
            nursing_home_name=row.nursing_home_name,
            nursing_home_address=row.nursing_home_address,
            notes=row.notes
        )
        
        # 오늘 일정
        if row.care_date == today:
            today_schedules.append(schedule)
        
        # 과거 일정 (최근 7일)
        elif row.care_date < today and row.care_date >= today - timedelta(days=7):
            past_schedules.append(schedule)
        
        # 미래 일정 (내일부터 30일)
        elif row.care_date > today:
            upcoming_schedules.append(schedule)
        
        # 이번 주 일정
        if week_start <= row.care_date <= week_end:
            this_week_schedules.append(schedule)
        
        # 다음 주 일정
        elif next_week_start <= row.care_date <= next_week_end:
            next_week_schedules.append(schedule)
    
    return CareScheduleGroup(
        today_schedules=today_schedules,
        past_schedules=past_schedules,
        upcoming_schedules=upcoming_schedules,
        this_week_schedules=this_week_schedules,
        next_week_schedules=next_week_schedules
    )

@router.get("/seniors", response_model=List[SeniorWithChecklistTypes])
async def get_assigned_seniors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """담당 시니어 목록 조회 (질병 정보 및 체크리스트 타입 포함)"""
    try:
        # 케어기버 프로필 확인
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        caregiver = current_user.caregiver_profile
        
        # ✅ 수정: diseases 관계를 함께 로드
        seniors = db.query(Senior).filter(
            Senior.caregiver_id == caregiver.id
        ).options(
            joinedload(Senior.diseases),  # 질병 정보 함께 조회
            joinedload(Senior.nursing_home),
            joinedload(Senior.caregiver),
            joinedload(Senior.guardian)
        ).all()
        
        # ✅ 추가: 각 시니어의 질병에 따른 체크리스트 타입 정보 생성
        result = []
        for senior in seniors:
            # 기본 시니어 정보 생성
            senior_dict = {
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "gender": senior.gender,
                "photo": senior.photo,
                "nursing_home_id": senior.nursing_home_id,
                "caregiver_id": senior.caregiver_id,
                "guardian_id": senior.guardian_id,
                "created_at": senior.created_at,
                "diseases": [
                    {
                        "id": disease.id,
                        "disease_type": disease.disease_type,
                        "severity": disease.severity,
                        "notes": disease.notes,
                        "created_at": disease.created_at
                    } for disease in senior.diseases
                ]
            }
            
            # 해당 시니어의 질병에 따른 사용 가능한 체크리스트 타입 조회
            available_types = []
            
            # 모든 시니어에게 공통 체크리스트 추가
            available_types.append({
                "type_code": "nutrition",  # ✅ 수정: nutrition_common → nutrition
                "type_name": "식사/영양 상태",
                "description": "모든 시니어 공통 체크리스트"
            })
            
            # 질병별 체크리스트 타입 추가
            for disease in senior.diseases:
                disease_type = disease.disease_type
                
                # 간단한 매핑으로 카테고리 이름 결정
                category_names = {
                    "nutrition": "식사/영양 상태",
                    "hypertension": "고혈압 관리", 
                    "depression": "우울증/정신건강",
                    "diabetes": "당뇨 관리"
                }
                
                category_name = category_names.get(disease_type, disease_type)
                
                available_types.append({
                    "type_code": disease_type,
                    "type_name": category_name,
                    "description": f"{disease.severity or ''} 수준의 {category_name} 관리".strip()
                })
            
            senior_dict["available_checklist_types"] = available_types
            result.append(senior_dict)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"시니어 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/attendance/checkin")
async def check_in_attendance(
    senior_id: int = Form(...),
    location: str = Form(default="요양원"),
    attendance_status: str = Form(default="정상출근"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """출근 체크인"""
    try:
        # 케어기버 프로필 확인
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        caregiver = current_user.caregiver_profile
        
        # 시니어 확인
        senior = db.query(Senior).filter(Senior.id == senior_id).first()
        if not senior:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="시니어를 찾을 수 없습니다."
            )
        
        # 돌봄 세션 생성
        care_session = CareSession(
            caregiver_id=caregiver.id,
            senior_id=senior_id,
            start_time=datetime.utcnow(),
            start_location=location,
            status="active"
        )
        
        db.add(care_session)
        db.commit()
        db.refresh(care_session)
        
        # 출석 로그 생성
        from ..models.care import AttendanceLog
        
        attendance_log = AttendanceLog(
            care_session_id=care_session.id,
            type="checkin",
            location=location,
            attendance_status=attendance_status
        )
        
        db.add(attendance_log)
        db.commit()
        
        return {
            "message": "출근 체크가 완료되었습니다.",
            "session_id": care_session.id,
            "start_time": care_session.start_time,
            "attendance_status": attendance_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"출근 체크 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/attendance/checkout", response_model=CheckoutSuccessResponse)
async def check_out_attendance(
    checkout_data: AttendanceCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """퇴근 체크 (필수 작업 완료 확인 + n8n 트리거)"""
    try:
        # 케어기버 프로필 확인
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        # 활성 세션 조회 (가장 최근 세션)
        session = db.query(CareSession).filter(
            CareSession.caregiver_id == current_user.caregiver_profile.id,
            CareSession.status == 'active'
        ).order_by(CareSession.start_time.desc()).first()  # 🔥 가장 최근 세션
        
        if not session:
            raise SessionNotFound()
        
        # 필수 작업 완료 확인
        can_checkout, missing_tasks = CheckoutService.validate_required_tasks(
            db, session.id
        )
        
        if not can_checkout:
            raise RequiredTasksIncomplete(missing_tasks)
        
        # 퇴근 처리
        checkout_time = datetime.now()
        session.status = 'completed'
        session.end_time = checkout_time
        session.end_location = checkout_data.location
        
        # 출석 로그 저장
        attendance_log = AttendanceLog(
            care_session_id=session.id,
            type='checkout',
            location=checkout_data.location,
            attendance_status='정상퇴근'
        )
        
        db.add(attendance_log)
        db.commit()
        
        # n8n 워크플로우 트리거
        ai_triggered = await CheckoutService.trigger_n8n_workflow(
            session.id, session.senior_id
        )
        
        n8n_response = None
        if ai_triggered:
            n8n_response = {
                "status": "triggered",
                "workflow": "complete-ai-analysis",
                "session_id": session.id
            }
        
        return CheckoutSuccessResponse(
            message="퇴근이 완료되었습니다",
            session_id=session.id,
            checkout_time=checkout_time,
            ai_analysis_triggered=ai_triggered,
            n8n_response=n8n_response
        )
        
    except (SessionNotFound, RequiredTasksIncomplete) as e:
        raise e
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"퇴근 체크 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/task-status/{session_id}", response_model=TaskStatusResponse)
async def get_task_status(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """작업 완료 상태 조회"""
    try:
        can_checkout, missing_tasks = CheckoutService.validate_required_tasks(db, session_id)
        
        checklist_completed = ChecklistService.get_completion_status(db, session_id)
        care_note_completed = CareNoteService.get_completion_status(db, session_id)
        
        # 완료 시간 정보
        completion_summary = {}
        
        if checklist_completed:
            last_checklist = db.query(ChecklistResponse).filter(
                ChecklistResponse.care_session_id == session_id
            ).order_by(ChecklistResponse.created_at.desc()).first()
            if last_checklist:
                completion_summary["checklist"] = last_checklist.created_at.isoformat()
        
        if care_note_completed:
            care_note = CareNoteService.get_care_note_by_session(db, session_id)
            if care_note:
                completion_summary["care_note"] = care_note.created_at.isoformat()
        
        return TaskStatusResponse(
            session_id=session_id,
            checklist_completed=checklist_completed,
            care_note_completed=care_note_completed,
            can_checkout=can_checkout,
            missing_tasks=missing_tasks,
            completion_summary=completion_summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"작업 상태 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/checklist/{senior_id}")
async def get_checklist_template(
    senior_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """체크리스트 템플릿 조회"""
    try:
        # 시니어 정보 조회
        senior = db.query(Senior).filter(Senior.id == senior_id).first()
        if not senior:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="시니어를 찾을 수 없습니다."
            )
        
        # 케어 서비스를 통해 체크리스트 템플릿 생성
        care_service = CareService(db)
        template = care_service.get_checklist_template(senior)
        
        return {
            "senior_info": senior,
            "template": template
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"체크리스트 템플릿 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/checklist", response_model=ChecklistSuccessResponse)
async def submit_checklist(
    checklist_data: ChecklistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """체크리스트 제출 (점수 배열 방식)"""
    start_time = time.time()
    
    try:
        # 케어기버 프로필 확인
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        # 활성 세션 검증
        if not ChecklistService.validate_active_session(db, checklist_data.session_id):
            raise SessionNotActive()
        
        # 하루 1회 제약 검증
        if not ChecklistService.validate_daily_submission(db, checklist_data.session_id):
            raise DailyLimitExceeded("체크리스트")
        
        # 점수 처리 및 저장
        results = ChecklistService.process_checklist_scores(
            db, 
            checklist_data.session_id, 
            checklist_data.checklist_scores
        )
        
        processing_time = f"{(time.time() - start_time):.2f}s"
        
        return ChecklistSuccessResponse(
            message="체크리스트가 성공적으로 저장되었습니다",
            session_id=checklist_data.session_id,
            results=results,
            processing_time=processing_time
        )
        
    except (DailyLimitExceeded, SessionNotActive, InvalidScoreFormat) as e:
        raise e
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"체크리스트 제출 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/checklist/status/{session_id}", response_model=ChecklistStatusResponse)
async def get_checklist_status(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """체크리스트 완료 상태 조회"""
    try:
        checklist_completed = ChecklistService.get_completion_status(db, session_id)
        category_scores = ChecklistService.get_category_scores(db, session_id)
        
        return ChecklistStatusResponse(
            session_id=session_id,
            checklist_completed=checklist_completed,
            category_scores=category_scores,
            message="완료" if checklist_completed else "미완료"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"체크리스트 상태 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/checklist/{id}")
async def update_checklist(id: int):
    """체크리스트 수정 차단"""
    raise ModificationBlocked("체크리스트")

@router.delete("/checklist/{id}")
async def delete_checklist(id: int):
    """체크리스트 삭제 차단"""
    raise ModificationBlocked("체크리스트")

@router.post("/care-note", response_model=CareNoteSuccessResponse)
async def submit_care_note(
    care_note_data: CareNoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """돌봄노트 제출 (새로운 제약 조건 적용)"""
    try:
        # 케어기버 프로필 확인
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        # 활성 세션 검증
        if not CareNoteService.validate_active_session(db, care_note_data.session_id):
            raise SessionNotActive()
        
        # 하루 1회 제약 검증
        if not CareNoteService.validate_daily_submission(db, care_note_data.session_id):
            raise DailyLimitExceeded("돌봄노트")
        
        # 내용 길이 검증
        if not CareNoteService.validate_content_length(care_note_data.content):
            raise ContentLengthError()
        
        # 돌봄노트 생성
        care_note = CareNoteService.create_care_note(
            db,
            care_note_data.session_id,
            care_note_data.content,
            care_note_data.question_id
        )
        
        # 선택된 질문 정보
        selected_question = None
        if care_note.selected_question:
            selected_question = {
                "id": care_note.selected_question.id,
                "question_number": care_note.selected_question.question_number,
                "question_title": care_note.selected_question.question_title,
                "question_text": care_note.selected_question.question_text,
                "guide_text": care_note.selected_question.guide_text
            }
        
        return CareNoteSuccessResponse(
            message="돌봄노트가 성공적으로 저장되었습니다",
            session_id=care_note_data.session_id,
            care_note_id=care_note.id,
            selected_question=selected_question,
            content_length=len(care_note_data.content)
        )
        
    except (DailyLimitExceeded, SessionNotActive, ContentLengthError, QuestionNotFound) as e:
        raise e
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"돌봄노트 제출 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/care-note/random-question", response_model=RandomQuestionResponse)
async def get_random_question(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """랜덤 질문 조회"""
    try:
        question = CareNoteService.get_random_question(db)
        
        if not question:
            raise QuestionNotFound()
        
        return RandomQuestionResponse(
            id=question.id,
            question_number=question.question_number,
            question_title=question.question_title,
            question_text=question.question_text,
            guide_text=question.guide_text,
            examples=question.examples
        )
        
    except QuestionNotFound as e:
        raise e
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"랜덤 질문 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/care-note/{id}")
async def update_care_note(id: int):
    """돌봄노트 수정 차단"""
    raise ModificationBlocked("돌봄노트")

@router.delete("/care-note/{id}")
async def delete_care_note(id: int):
    """돌봄노트 삭제 차단"""
    raise ModificationBlocked("돌봄노트")

async def calculate_and_save_weekly_scores(session_id: int, senior_id: int, db: Session):
    """주간 체크리스트 점수 계산 및 저장"""
    from ..models.care import WeeklyChecklistScore, ChecklistType
    
    week_date = date.today()
    
    # 3가지 유형별 점수 계산
    type_codes = ["nutrition", "hypertension", "depression"]
    
    for type_code in type_codes:
        # 해당 유형의 체크리스트 응답 조회
        responses = db.query(ChecklistResponse).filter(
            ChecklistResponse.care_session_id == session_id,
            ChecklistResponse.checklist_type_code == type_code
        ).all()
        
        if not responses:
            continue
            
        # 점수 합계 계산
        total_score = sum([r.selected_score for r in responses if r.selected_score])
        checklist_type = db.query(ChecklistType).filter(
            ChecklistType.type_code == type_code
        ).first()
        max_score = checklist_type.max_score if checklist_type else 16
        score_percentage = (total_score / max_score) * 100 if max_score > 0 else 0
        
        # 지난 주 점수와 비교하여 상태코드 결정
        last_week_score = db.query(WeeklyChecklistScore).filter(
            WeeklyChecklistScore.senior_id == senior_id,
            WeeklyChecklistScore.checklist_type_code == type_code
        ).order_by(WeeklyChecklistScore.week_date.desc()).first()
        
        status_code = 2  # 기본값: 유지
        if last_week_score:
            if total_score > last_week_score.total_score:
                status_code = 1  # 개선
            elif total_score < last_week_score.total_score:
                status_code = 3  # 악화
        
        # 주간 점수 저장
        weekly_score = WeeklyChecklistScore(
            senior_id=senior_id,
            care_session_id=session_id,
            checklist_type_code=type_code,
            week_date=week_date,
            total_score=total_score,
            max_possible_score=max_score,
            score_percentage=score_percentage,
            status_code=status_code
        )
        db.add(weekly_score)
    
    db.commit()

async def trigger_ai_analysis_workflows_v2(session_id: int, senior_id: int):
    """n8n AI 분석 워크플로우 v2.0 트리거"""
    import requests
    
    webhook_base_url = f"{settings.n8n_webhook_url}/webhook"
    
    trigger_data = {
        "session_id": session_id,
        "senior_id": senior_id,
        "trigger_time": datetime.now().isoformat()
    }
    
    # 통합 조율 워크플로우 호출
    try:
        response = requests.post(
            f"{webhook_base_url}/complete-ai-analysis",
            json=trigger_data,
            timeout=30
        )
        print(f"n8n v2.0 워크플로우 트리거 성공: {response.status_code}")
        return {"status": "triggered", "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"n8n v2.0 워크플로우 트리거 실패: {e}")
        return {"status": "failed", "error": str(e)}

# ❌ 해커톤에서 제거: /care-history - 홈 화면의 최근 이력으로 대체
# GET /care-history API 제거됨 (홈 화면에서 최근 돌봄 이력 확인 가능)

@router.get("/profile")
async def get_caregiver_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """케어기버 프로필 조회"""
    try:
        return {
            "user_info": current_user,
            "assigned_seniors_count": db.query(Senior).filter(
                Senior.caregiver_id == current_user.id
            ).count(),
            "total_sessions": db.query(CareSession).filter(
                CareSession.caregiver_id == current_user.id
            ).count()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로필 조회 중 오류가 발생했습니다: {str(e)}"
        )

# ❌ 해커톤에서 제거: /schedule - 홈 화면의 오늘 일정으로 대체
# GET /schedule API 제거됨 (홈 화면에서 오늘/이번 주 일정 확인 가능)

@router.get("/care-schedule/{senior_id}")
async def get_care_schedule(
    senior_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """시니어별 케어 스케줄 조회"""
    
    # 케어기버 권한 확인
    if not current_user.caregiver_profile:
        raise HTTPException(status_code=403, detail="케어기버 권한이 필요합니다")
    
    schedules = db.query(CareSchedule).filter(
        CareSchedule.senior_id == senior_id,
        CareSchedule.caregiver_id == current_user.caregiver_profile.id,
        CareSchedule.is_active == True
    ).all()
    
    # 요일명 매핑
    day_names = ["일", "월", "화", "수", "목", "금", "토"]
    
    schedule_data = []
    for schedule in schedules:
        # 다음 케어 날짜 계산
        next_care_date = calculate_next_care_date(schedule.day_of_week)
        
        schedule_data.append({
            "id": schedule.id,
            "day_of_week": schedule.day_of_week,
            "day_name": day_names[schedule.day_of_week],
            "start_time": schedule.start_time.strftime("%H:%M"),
            "end_time": schedule.end_time.strftime("%H:%M"),
            "next_care_date": next_care_date.strftime("%Y-%m-%d"),
            "notes": schedule.notes
        })
    
    return {
        "senior_id": senior_id,
        "schedules": schedule_data,
        "total_schedules": len(schedule_data)
    }

# ❌ 해커톤에서 제거: care-schedule 관련 함수들
# 일정 관리 기능은 관리자가 사전에 설정하는 것으로 대체

# calculate_next_care_date 함수 제거됨 (불필요)
# POST /care-schedule API 제거됨 (관리자가 사전 설정)

# ================================================================
# 🧪 테스트용 API - 개발 환경에서만 사용
# ================================================================

@router.delete("/test/session/{session_id}")
async def delete_test_session_complete(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🚨 테스트/개발용 API: AI 리포트 포함 세션 완전 삭제
    
    - AI 리포트 생성 후에도 세션과 모든 관련 데이터 삭제 가능
    - SQL 기반 안전한 삭제 처리
    
    ⚠️ 주의: 프로덕션 환경에서는 사용 금지!
    """
    
    try:
        # 케어기버 권한 확인
        if current_user.user_type != "caregiver":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="케어기버만 접근 가능합니다"
            )
        
        # 세션 존재 여부 확인
        session = db.query(CareSession).filter(
            CareSession.id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"세션 ID {session_id}를 찾을 수 없습니다"
            )
        
        # 케어기버 소유권 확인
        caregiver = current_user.caregiver_profile
        if not caregiver or session.caregiver_id != caregiver.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="본인이 담당한 세션만 삭제할 수 있습니다"
            )
        
        # SQL로 직접 삭제 처리 (외래키 순서)
        from sqlalchemy import text
        
        deleted_counts = {}
        
        try:
            # 1단계: feedbacks 삭제
            result = db.execute(text("""
                DELETE FROM feedbacks 
                WHERE ai_report_id IN (
                    SELECT id FROM ai_reports WHERE care_session_id = :session_id
                )
            """), {"session_id": session_id})
            deleted_counts["feedbacks"] = result.rowcount
            
            # 2단계: ai_reports 삭제
            result = db.execute(text("""
                DELETE FROM ai_reports WHERE care_session_id = :session_id
            """), {"session_id": session_id})
            deleted_counts["ai_reports"] = result.rowcount
            
            # 3단계: weekly_checklist_scores 삭제
            result = db.execute(text("""
                DELETE FROM weekly_checklist_scores WHERE care_session_id = :session_id
            """), {"session_id": session_id})
            deleted_counts["weekly_scores"] = result.rowcount
            
            # 4단계: care_notes 삭제
            result = db.execute(text("""
                DELETE FROM care_notes WHERE care_session_id = :session_id
            """), {"session_id": session_id})
            deleted_counts["care_notes"] = result.rowcount
            
            # 5단계: checklist_responses 삭제
            result = db.execute(text("""
                DELETE FROM checklist_responses WHERE care_session_id = :session_id
            """), {"session_id": session_id})
            deleted_counts["checklist_responses"] = result.rowcount
            
            # 6단계: attendance_logs 삭제
            result = db.execute(text("""
                DELETE FROM attendance_logs WHERE care_session_id = :session_id
            """), {"session_id": session_id})
            deleted_counts["attendance_logs"] = result.rowcount
            
            # 7단계: notifications 삭제
            result = db.execute(text("""
                DELETE FROM notifications 
                WHERE data LIKE :pattern
            """), {"pattern": f'%"session_id": {session_id}%'})
            deleted_counts["notifications"] = result.rowcount
            
            # 8단계: care_sessions 삭제 (최종)
            result = db.execute(text("""
                DELETE FROM care_sessions WHERE id = :session_id
            """), {"session_id": session_id})
            deleted_counts["care_session"] = result.rowcount
            
            # 커밋
            db.commit()
            
            total_deleted = sum(deleted_counts.values())
            
            return {
                "success": True,
                "message": f"세션 {session_id}와 모든 관련 데이터가 완전히 삭제되었습니다",
                "session_id": session_id,
                "total_deleted_records": total_deleted,
                "deletion_summary": deleted_counts,
                "warning": "⚠️ 이 작업은 되돌릴 수 없습니다. 테스트 목적으로만 사용하세요."
            }
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            print(f"세션 {session_id} 삭제 중 오류 발생: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"삭제 중 오류가 발생했습니다: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"예상치 못한 오류: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"서버 내부 오류가 발생했습니다: {str(e)}"
        )


@router.get("/test/session/{session_id}/dependencies")
async def check_session_dependencies(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🔍 세션 삭제 전 의존성 확인 API
    
    - 삭제 대상 데이터 개수 미리 확인
    - 삭제 가능 여부 사전 검증
    """
    
    if current_user.user_type != "caregiver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="케어기버만 접근 가능합니다"
        )
    
    # 세션 존재 확인
    session = db.query(CareSession).filter(CareSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"세션 ID {session_id}를 찾을 수 없습니다"
        )
    
    # 의존성 데이터 개수 확인
    dependencies = {}
    
    # AI 리포트 및 피드백
    ai_reports = db.query(AIReport).filter(AIReport.care_session_id == session_id)
    ai_report_ids = [report.id for report in ai_reports.all()]
    dependencies['ai_reports'] = ai_reports.count()
    
    if ai_report_ids:
        dependencies['feedbacks'] = db.query(Feedback).filter(
            Feedback.ai_report_id.in_(ai_report_ids)
        ).count()
    else:
        dependencies['feedbacks'] = 0
    
    # 돌봄 관련 데이터
    dependencies['weekly_scores'] = db.query(WeeklyChecklistScore).filter(
        WeeklyChecklistScore.care_session_id == session_id
    ).count()
    
    dependencies['care_notes'] = db.query(CareNote).filter(
        CareNote.care_session_id == session_id
    ).count()
    
    dependencies['checklist_responses'] = db.query(ChecklistResponse).filter(
        ChecklistResponse.care_session_id == session_id
    ).count()
    
    dependencies['attendance_logs'] = db.query(AttendanceLog).filter(
        AttendanceLog.care_session_id == session_id
    ).count()
    
    # 관련 알림
    dependencies['notifications'] = db.query(Notification).filter(
        Notification.data.like(f'%"session_id": {session_id}%')
    ).count()
    
    total_dependencies = sum(dependencies.values())
    
    return {
        "session_id": session_id,
        "session_status": session.status,
        "can_delete": True,  # 이제 항상 삭제 가능
        "total_dependent_records": total_dependencies,
        "dependencies": dependencies,
        "message": "AI 리포트 포함 모든 관련 데이터를 안전하게 삭제할 수 있습니다" if total_dependencies > 0 else "삭제할 관련 데이터가 없습니다"
    }


@router.post("/attendance/simple-checkin")
async def simple_check_in(
    checkin_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """🚀 간단한 출근 체크인 (senior_id만 필요)"""
    try:
        senior_id = checkin_data.get('senior_id')
        if not senior_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="senior_id는 필수입니다."
            )
        
        # 케어기버 프로필 확인
        if not current_user.caregiver_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버 정보를 찾을 수 없습니다."
            )
        
        caregiver = current_user.caregiver_profile
        
        # 시니어 확인
        senior = db.query(Senior).filter(Senior.id == senior_id).first()
        if not senior:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="시니어를 찾을 수 없습니다."
            )
        
        # 자동으로 location과 status 설정
        location = senior.nursing_home.name if senior.nursing_home else "요양원"
        attendance_status = "정상출근"
        
        # 돌봄 세션 생성
        care_session = CareSession(
            caregiver_id=caregiver.id,
            senior_id=senior_id,
            start_time=datetime.now(),
            status='active',
            start_location=location
        )
        
        db.add(care_session)
        db.flush()
        
        # 출석 로그 저장
        attendance_log = AttendanceLog(
            care_session_id=care_session.id,
            type='checkin',
            location=location,
            attendance_status=attendance_status
        )
        
        db.add(attendance_log)
        db.commit()
        
        return {
            "status": "success",
            "message": f"{senior.name}님 돌봄 출근이 완료되었습니다.",
            "session_id": care_session.id,
            "senior_name": senior.name,
            "checkin_time": care_session.start_time,
            "location": location,
            "attendance_status": attendance_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"출근 처리 중 오류가 발생했습니다: {str(e)}"
        )
