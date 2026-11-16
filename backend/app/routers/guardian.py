"""
가디언 관련 라우터
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func
from typing import List, Optional
from datetime import datetime, date, timedelta

from ..database import get_db
from ..models import User, Guardian, Senior, AIReport, CareSession, Feedback, Notification, Caregiver, ChecklistResponse, CareNote
from ..models.report import AIReport, Feedback
from ..models.care import WeeklyChecklistScore
from ..schemas import (
    GuardianHomeResponse, AIReportResponse, FeedbackSubmission, 
    SeniorResponse, NotificationResponse, WeeklyReportsResponse, WeeklyReportDetail
)
from sqlalchemy import text
from ..services.auth import get_current_user
from ..services.notification import NotificationService

router = APIRouter()


def _current_guardian(db: Session, current_user: User) -> "Guardian":
    """로그인한 사용자(users.id)에 대응하는 guardians 행. seniors.guardian_id는 guardians.id를 가리킨다."""
    guardian = db.query(Guardian).filter(Guardian.user_id == current_user.id).first()
    if not guardian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="가디언 정보를 찾을 수 없습니다")
    return guardian

@router.get("/home")
async def get_guardian_home(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """가디언 홈 화면 데이터 조회 - 이번 주의 돌봄노트 형태"""
    try:
        # 1. 현재 사용자의 가디언 정보 조회
        guardian = db.query(Guardian).filter(
            Guardian.user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언 정보를 찾을 수 없습니다."
            )
        
        # 2. 담당 시니어 목록 조회 (관계 정보 포함)
        seniors = db.query(Senior).options(
            joinedload(Senior.caregiver),
            joinedload(Senior.nursing_home)
        ).filter(
            Senior.guardian_id == guardian.id
        ).all()
        
        if not seniors:
            return {
                "guardian_name": guardian.name,
                "seniors_care_notes": [],
                "recent_reports": [],
                "unread_notifications": [],
                "weekly_summary": {
                    "total_seniors": 0,
                    "completed_care": 0,
                    "pending_care": 0
                }
            }
        
        # 3. 이번 주 날짜 계산 (월요일 시작)
        today = datetime.now().date()
        days_since_monday = today.weekday()  # 0=월요일, 6=일요일
        week_start = today - timedelta(days=days_since_monday)
        week_end = week_start + timedelta(days=6)
        
        # 4. 시니어별 이번 주 돌봄 현황 분석
        seniors_care_notes = []
        total_completed = 0
        total_pending = 0
        
        for senior in seniors:
            # 이번 주 돌봄 세션 조회
            weekly_sessions = db.query(CareSession).filter(
                CareSession.senior_id == senior.id,
                CareSession.start_time >= week_start,
                CareSession.start_time <= week_end
            ).all()
            
            # 돌봄 완료도 계산
            total_sessions = len(weekly_sessions)
            completed_sessions = len([s for s in weekly_sessions if s.status == 'completed'])
            
            # 최신 돌봄 세션의 특이사항 조회
            latest_session = None
            special_note = "특이사항 없음"
            progress_ratio = f"{completed_sessions}/{total_sessions}" if total_sessions > 0 else "0/0"
            
            if weekly_sessions:
                latest_session = max(weekly_sessions, key=lambda x: x.start_time)
                
                # 최신 세션의 돌봄노트에서 특이사항 추출
                care_notes = db.query(CareNote).filter(
                    CareNote.care_session_id == latest_session.id
                ).all()
                
                # 가장 중요한 특이사항 추출 (family_longing 또는 health_observation 우선)
                priority_notes = [note for note in care_notes if note.question_type in ['family_longing', 'health_observation']]
                if priority_notes:
                    special_note = priority_notes[0].content[:50] + "..." if len(priority_notes[0].content) > 50 else priority_notes[0].content
                elif care_notes:
                    special_note = care_notes[0].content[:50] + "..." if len(care_notes[0].content) > 50 else care_notes[0].content
                
                # AI 리포트 확인 (keywords 없으므로 content 기반으로 처리)
                try:
                    ai_report = db.query(AIReport).filter(
                        AIReport.care_session_id == latest_session.id
                    ).first()
                    
                    if ai_report:
                        # content 기반으로 특이사항 추출
                        if ai_report.content:
                            content_preview = ai_report.content[:50] + "..." if len(ai_report.content) > 50 else ai_report.content
                            special_note = f"AI 분석: {content_preview}"
                        # ai_comment가 있으면 우선 사용
                        elif ai_report.ai_comment:
                            comment_preview = ai_report.ai_comment[:50] + "..." if len(ai_report.ai_comment) > 50 else ai_report.ai_comment
                            special_note = f"AI 제안: {comment_preview}"
                except HTTPException:
                    raise
                except Exception as e:
                    print(f"AI 리포트 조회 중 오류: {e}")
                    pass
            
            # 케어기버 정보 (관계를 통해 이미 로드됨)
            caregiver_name = senior.caregiver.name if senior.caregiver else "케어기버 미배정"
            
            # 시니어 돌봄 정보 구성
            senior_care_info = {
                "senior_id": senior.id,
                "senior_name": senior.name,
                "senior_age": senior.age,
                "senior_photo": senior.photo,
                "caregiver_name": caregiver_name,
                "special_note": special_note,
                "progress_ratio": progress_ratio,
                "total_sessions_this_week": total_sessions,
                "completed_sessions": completed_sessions,
                "nursing_home": senior.nursing_home.name if senior.nursing_home else "요양원 정보 없음",
                "last_care_date": latest_session.start_time.strftime("%Y-%m-%d") if latest_session else None,
                "status": "완료" if completed_sessions > 0 else "대기중"
            }
            
            seniors_care_notes.append(senior_care_info)
            
            if completed_sessions > 0:
                total_completed += 1
            else:
                total_pending += 1
        
        # 5. 최근 AI 리포트 조회 (최근 5개)
        senior_ids = [senior.id for senior in seniors]
        recent_reports = db.query(AIReport).join(CareSession).filter(
            CareSession.senior_id.in_(senior_ids)
        ).order_by(AIReport.created_at.desc()).limit(5).all()
        
        recent_reports_data = []
        for report in recent_reports:
            try:
                session = db.query(CareSession).filter(CareSession.id == report.care_session_id).first()
                senior = db.query(Senior).filter(Senior.id == session.senior_id).first()
                
                # keywords 컬럼이 없으므로 content에서 키워드 추출
                keywords = None
                if report.content:
                    # content의 첫 몇 단어를 키워드로 사용
                    content_words = report.content.split()[:3]  # 첫 3단어
                    keywords = content_words if content_words else None
                
                recent_reports_data.append({
                    "report_id": report.id,
                    "senior_name": senior.name if senior else "시니어 정보 없음",
                    "created_date": report.created_at.strftime("%Y-%m-%d"),
                    "keywords": keywords,
                    "status": report.status,
                    "priority": "high" if "위험" in (report.ai_comment or "") else "normal"
                })
            except HTTPException:
                raise
            except Exception as e:
                print(f"리포트 처리 중 오류: {e}")
                continue
        
        # 6. 읽지 않은 알림 조회
        unread_notifications = db.query(Notification).filter(
            Notification.receiver_id == current_user.id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).limit(10).all()
        
        unread_notifications_data = []
        for notification in unread_notifications:
            # notification.data 처리 (문자열이면 JSON 파싱, 딕셔너리면 그대로 사용)
            notification_data = {}
            if notification.data:
                if isinstance(notification.data, str):
                    try:
                        import json
                        notification_data = json.loads(notification.data)
                    except (json.JSONDecodeError, TypeError):
                        notification_data = {}
                elif isinstance(notification.data, dict):
                    notification_data = notification.data
            
            unread_notifications_data.append({
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "content": notification.content,
                "created_at": notification.created_at.strftime("%Y-%m-%d %H:%M"),
                "priority": notification_data.get("priority", "normal")
            })
        
        return {
            "guardian_name": guardian.name,
            "guardian_country": guardian.country,
            "guardian_relationship": guardian.relationship_type,
            "week_period": {
                "start_date": week_start.strftime("%Y-%m-%d"),
                "end_date": week_end.strftime("%Y-%m-%d"),
                "week_description": f"{week_start.strftime('%m월 %d일')} - {week_end.strftime('%m월 %d일')}"
            },
            "seniors_care_notes": seniors_care_notes,
            "recent_reports": recent_reports_data,
            "unread_notifications": unread_notifications_data,
            "weekly_summary": {
                "total_seniors": len(seniors),
                "completed_care": total_completed,
                "pending_care": total_pending,
                "completion_rate": round((total_completed / len(seniors)) * 100, 1) if seniors else 0
            },
            "quick_actions": [
                {
                    "action": "view_reports",
                    "title": "리포트 조회",
                    "description": "최신 돌봄 리포트 확인"
                },
                {
                    "action": "send_feedback",
                    "title": "피드백 전송",
                    "description": "케어기버에게 메시지 보내기"
                },
                {
                    "action": "view_notifications",
                    "title": "알림 확인",
                    "description": f"{len(unread_notifications_data)}개의 읽지 않은 알림"
                }
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Guardian home error: {str(e)}")  # 디버깅용 로그
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"홈 데이터 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/seniors")
async def get_guardian_seniors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """담당 시니어 목록 조회 - 수정된 버전"""
    try:
        # 가디언 정보 조회
        guardian = db.query(Guardian).filter(
            Guardian.user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언 정보를 찾을 수 없습니다."
            )
        
        # 시니어 목록 조회 (관계 정보 포함)
        seniors = db.query(Senior).options(
            joinedload(Senior.caregiver),
            joinedload(Senior.nursing_home),
            joinedload(Senior.diseases)  # ✅ 추가: 질병 정보 함께 조회
        ).filter(
            Senior.guardian_id == guardian.id
        ).all()
        
        seniors_data = []
        for senior in seniors:
            # 최근 돌봄 세션 정보
            latest_session = db.query(CareSession).filter(
                CareSession.senior_id == senior.id
            ).order_by(CareSession.start_time.desc()).first()
            
            # 최근 AI 리포트 정보
            latest_report = None
            if latest_session:
                latest_report = db.query(AIReport).filter(
                    AIReport.care_session_id == latest_session.id
                ).first()
            
            seniors_data.append({
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "gender": senior.gender,
                "photo": senior.photo,
                "diseases": [disease.disease_type for disease in senior.diseases],
                "caregiver": {
                    "name": senior.caregiver.name if senior.caregiver else None,
                    "phone": senior.caregiver.phone if senior.caregiver else None
                },
                "nursing_home": {
                    "name": senior.nursing_home.name if senior.nursing_home else None,
                    "address": senior.nursing_home.address if senior.nursing_home else None
                },
                "latest_care": {
                    "date": latest_session.start_time.strftime("%Y-%m-%d") if latest_session else None,
                    "status": latest_session.status if latest_session else None
                },
                "latest_report": {
                    "id": latest_report.id if latest_report else None,
                    "status": latest_report.status if latest_report else None,
                    "created_date": latest_report.created_at.strftime("%Y-%m-%d") if latest_report else None
                }
            })
        
        return {
            "guardian_name": guardian.name,
            "seniors": seniors_data,
            "total_count": len(seniors_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"시니어 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

# ===== 🔥 구체적인 경로를 먼저 정의 (라우터 순서 중요!) =====

@router.get("/reports/weekly", response_model=WeeklyReportsResponse)
async def get_weekly_ai_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """🗓️ 이번 주차 AI 리포트 목록 조회 - 상세 점수 정보 포함"""
    try:
        # 가디언 정보 조회
        guardian = db.query(Guardian).filter(Guardian.user_id == current_user.id).first()
        if not guardian:
            raise HTTPException(status_code=404, detail="가디언 정보를 찾을 수 없습니다")
        
        # 담당 시니어 조회
        senior = db.query(Senior).filter(Senior.guardian_id == guardian.id).first()
        if not senior:
            raise HTTPException(status_code=404, detail="담당 시니어를 찾을 수 없습니다")
        
        # 이번 주 날짜 계산
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        # 이번 주 AI 리포트 조회
        reports = db.query(AIReport).filter(
            AIReport.senior_id == senior.id,
            func.date(AIReport.created_at) >= week_start,
            func.date(AIReport.created_at) <= week_end
        ).order_by(AIReport.created_at.desc()).all()
        
        # 각 리포트에 상세 정보 추가
        detailed_reports = []
        
        for report in reports:
            # 현재 주 점수 데이터 조회
            current_week_score_data = db.query(WeeklyChecklistScore).filter(
                WeeklyChecklistScore.senior_id == senior.id,
                WeeklyChecklistScore.checklist_type_code == report.checklist_type_code,
                WeeklyChecklistScore.care_session_id == report.care_session_id
            ).first()
            
            # 이전 주 점수 조회 (care_session_id 기준으로 이전 세션)
            previous_week_score_data = db.query(WeeklyChecklistScore).filter(
                WeeklyChecklistScore.senior_id == senior.id,
                WeeklyChecklistScore.checklist_type_code == report.checklist_type_code,
                WeeklyChecklistScore.care_session_id < report.care_session_id
            ).order_by(WeeklyChecklistScore.care_session_id.desc()).first()
            
            # 최근 트렌드 데이터 조회 (최대 10개)
            recent_trends = db.query(WeeklyChecklistScore).filter(
                WeeklyChecklistScore.senior_id == senior.id,
                WeeklyChecklistScore.checklist_type_code == report.checklist_type_code
            ).order_by(WeeklyChecklistScore.week_date.desc()).limit(10).all()
            
            # 점수 계산
            current_score = float(current_week_score_data.score_percentage) if current_week_score_data else 0.0
            previous_score = float(previous_week_score_data.score_percentage) if previous_week_score_data else 0.0
            
            score_change = current_score - previous_score if previous_score > 0 else 0.0
            score_change_percentage = (score_change / previous_score * 100) if previous_score > 0 else 0.0
            
            # 추이 데이터 변환
            trend_items = []
            for trend in recent_trends:
                trend_items.append({
                    "week_date": trend.week_date.strftime("%Y-%m-%d") if trend.week_date else "",
                    "score_percentage": float(trend.score_percentage),
                    "status_code": trend.status_code or 2
                })
            
            # 상태 텍스트 및 메시지 생성
            status_text = get_status_text(report.status_code or 2)
            improvement_message = calculate_improvement_message(
                current_score, previous_score, report.status_code or 2
            )
            
            # 상세 리포트 객체 생성
            detailed_report = {
                "id": report.id,
                "report_type": report.report_type,
                "checklist_type_code": report.checklist_type_code or "",
                "content": report.content,
                "ai_comment": report.ai_comment,
                "status_code": report.status_code,
                "trend_analysis": report.trend_analysis or "",
                "created_at": report.created_at.strftime("%Y-%m-%d %H:%M"),
                "senior_name": senior.name,
                "senior_id": senior.id,
                "session_id": report.care_session_id,
                
                # 새로 추가되는 필드들
                "current_week_score": current_score,
                "previous_week_score": previous_score,
                "score_change": round(score_change, 2),
                "score_change_percentage": round(score_change_percentage, 2),
                "recent_3_weeks_trend": trend_items,
                "status_text": status_text,
                "improvement_message": improvement_message
            }
            
            detailed_reports.append(detailed_report)
        
        has_detailed_reports = len([r for r in reports if r.report_type != 'care_note_comment']) > 0
        
        return {
            "current_week": week_start.strftime("%Y-%m-%d"),
            "senior_name": senior.name,
            "senior_id": senior.id,
            "total_reports": len(reports),
            "reports": detailed_reports,
            "has_detailed_reports": has_detailed_reports
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"주간 리포트 조회 중 오류: {str(e)}")

def get_status_text(status_code: int) -> str:
    """상태 코드를 텍스트로 변환"""
    status_map = {1: "개선", 2: "유지", 3: "악화"}
    return status_map.get(status_code, "알 수 없음")

def calculate_improvement_message(current_score: float, previous_score: float, status_code: int) -> str:
    """개선 메시지 생성"""
    if previous_score == 0:
        return "첫 주 데이터입니다"
    
    change = current_score - previous_score
    change_percentage = abs(change / previous_score * 100) if previous_score > 0 else 0
    
    if status_code == 1:  # 개선
        return f"지난주 대비 {change:.1f}점 상승하여 개선되었습니다"
    elif status_code == 3:  # 악화
        return f"지난주 대비 {abs(change):.1f}점 하락하여 주의가 필요합니다"
    else:  # 유지
        if abs(change) < 0.1:
            return f"지난주와 동일한 수준으로 안정적으로 유지되었습니다"
        else:
            return f"지난주 대비 {abs(change):.1f}점 {'상승' if change > 0 else '하락'}하여 유지되었습니다"

@router.get("/reports")
async def get_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    senior_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI 리포트 목록 조회 - 수정된 버전"""
    try:
        # 가디언 정보 조회
        guardian = db.query(Guardian).filter(
            Guardian.user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언 정보를 찾을 수 없습니다."
            )
        
        # 가디언이 담당하는 시니어들 조회
        seniors = db.query(Senior).filter(
            Senior.guardian_id == guardian.id
        ).all()
        
        senior_ids = [senior.id for senior in seniors]
        
        if not senior_ids:
            return {
                "reports": [],
                "total_count": 0
            }
        
        # 리포트 쿼리 작성
        query = db.query(AIReport).join(CareSession).filter(
            CareSession.senior_id.in_(senior_ids)
        )
        
        # 필터 적용
        if start_date:
            query = query.filter(AIReport.created_at >= start_date)
        if end_date:
            query = query.filter(AIReport.created_at <= end_date)
        if senior_id:
            if senior_id not in senior_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="해당 시니어의 리포트에 접근할 권한이 없습니다."
                )
            query = query.filter(CareSession.senior_id == senior_id)
        
        reports = query.order_by(AIReport.created_at.desc()).all()
        
        reports_data = []
        for report in reports:
            session = db.query(CareSession).filter(CareSession.id == report.care_session_id).first()
            senior = db.query(Senior).filter(Senior.id == session.senior_id).first()
            caregiver = db.query(Caregiver).filter(Caregiver.id == session.caregiver_id).first()
            
            # keywords 컬럼이 없으므로 content에서 키워드 생성
            keywords = None
            if report.content:
                # content의 첫 몇 단어를 키워드로 사용
                content_words = report.content.split()[:3]
                keywords = content_words if content_words else None
            
            reports_data.append({
                "id": report.id,
                "report_type": report.report_type,
                "content": report.content,
                "ai_comment": report.ai_comment,
                "status_code": report.status_code,
                "trend_analysis": report.trend_analysis,
                "checklist_type_code": report.checklist_type_code,
                "keywords": keywords,
                "status": report.status,
                "created_at": report.created_at.strftime("%Y-%m-%d %H:%M"),
                "senior": {
                    "id": senior.id,
                    "name": senior.name,
                    "photo": senior.photo
                },
                "caregiver": {
                    "name": caregiver.name
                },
                "session_date": session.start_time.strftime("%Y-%m-%d")
            })
        
        return {
            "reports": reports_data,
            "total_count": len(reports_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"리포트 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/reports/today")
async def get_today_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """오늘 생성된 AI 리포트들 조회"""
    try:
        # 현재 사용자의 가디언 정보 조회
        guardian = db.query(Guardian).filter(
            Guardian.user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언 정보를 찾을 수 없습니다."
            )
        
        # 담당 시니어 목록 조회
        seniors = db.query(Senior).filter(
            Senior.guardian_id == guardian.id
        ).all()
        
        if not seniors:
            return {
                "reports": [],
                "total_count": 0,
                "today_date": datetime.now().strftime("%Y-%m-%d")
            }
        
        senior_ids = [senior.id for senior in seniors]
        
        # 오늘 날짜 계산 (한국 시간 기준)
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        
        # 오늘 생성된 AI 리포트 조회
        today_reports_query = text("""
            SELECT 
                ar.id,
                ar.report_type,
                ar.content,
                ar.ai_comment,
                ar.status_code,
                ar.trend_analysis,
                ar.checklist_type_code,
                ar.status,
                ar.created_at,
                cs.id as session_id,
                cs.start_time,
                cs.end_time,
                cs.senior_id,
                s.name as senior_name,
                s.age as senior_age,
                s.photo as senior_photo,
                cg.id as caregiver_id,
                cg.name as caregiver_name
            FROM ai_reports ar
            JOIN care_sessions cs ON ar.care_session_id = cs.id
            JOIN seniors s ON cs.senior_id = s.id
            LEFT JOIN caregivers cg ON cs.caregiver_id = cg.id
            WHERE cs.senior_id IN :senior_ids
            AND DATE(ar.created_at) = :today_date
            ORDER BY ar.created_at DESC, ar.report_type
        """)
        
        reports_result = db.execute(
            today_reports_query,
            {
                "senior_ids": tuple(senior_ids),
                "today_date": today
            }
        ).fetchall()
        
        # 시니어별로 리포트 그룹화
        reports_by_senior = {}
        for report in reports_result:
            senior_id = report.senior_id
            if senior_id not in reports_by_senior:
                reports_by_senior[senior_id] = {
                    "senior": {
                        "id": senior_id,
                        "name": report.senior_name,
                        "age": report.senior_age,
                        "photo": report.senior_photo
                    },
                    "caregiver": {
                        "id": report.caregiver_id,
                        "name": report.caregiver_name
                    },
                    "session": {
                        "id": report.session_id,
                        "start_time": report.start_time.strftime("%Y-%m-%d %H:%M") if report.start_time else None,
                        "end_time": report.end_time.strftime("%Y-%m-%d %H:%M") if report.end_time else None
                    },
                    "reports": []
                }
            
            # keywords 생성
            keywords = None
            if report.content:
                content_words = report.content.split()[:3]
                keywords = content_words if content_words else None
            
            reports_by_senior[senior_id]["reports"].append({
                "id": report.id,
                "report_type": report.report_type,
                "content": report.content,
                "ai_comment": report.ai_comment,
                "status_code": report.status_code,
                "trend_analysis": report.trend_analysis,
                "checklist_type_code": report.checklist_type_code,
                "keywords": keywords,
                "status": report.status,
                "created_at": report.created_at.strftime("%Y-%m-%d %H:%M")
            })
        
        # 응답 데이터 구성
        formatted_reports = list(reports_by_senior.values())
        
        return {
            "reports": formatted_reports,
            "total_count": len(reports_result),
            "senior_count": len(formatted_reports),
            "today_date": today.strftime("%Y-%m-%d"),
            "summary": {
                "nutrition_reports": len([r for r in reports_result if r.report_type == "nutrition_report"]),
                "hypertension_reports": len([r for r in reports_result if r.report_type == "hypertension_report"]), 
                "depression_reports": len([r for r in reports_result if r.report_type == "depression_report"]),
                "care_note_comments": len([r for r in reports_result if r.report_type == "care_note_comment"])
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"오늘 리포트 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/checklist/{session_id}")
async def get_checklist_scores(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """특정 세션의 체크리스트 원본 점수 조회 (가디언용)"""
    try:
        # 현재 사용자의 가디언 정보 조회
        guardian = db.query(Guardian).filter(
            Guardian.user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언 정보를 찾을 수 없습니다."
            )
        
        # 세션 정보 조회
        session = db.query(CareSession).filter(
            CareSession.id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="돌봄 세션을 찾을 수 없습니다."
            )
        
        # 시니어 정보 조회 및 권한 확인
        senior = db.query(Senior).filter(
            Senior.id == session.senior_id
        ).first()
        
        if not senior or senior.guardian_id != guardian.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="해당 세션에 접근할 권한이 없습니다."
            )
        
        # 체크리스트 응답 조회
        checklist_responses = db.query(ChecklistResponse).filter(
            ChecklistResponse.care_session_id == session_id
        ).all()
        
        if not checklist_responses:
            return {
                "session_id": session_id,
                "senior": {
                    "id": senior.id,
                    "name": senior.name,
                    "photo": senior.photo
                },
                "session_date": session.start_time.strftime("%Y-%m-%d") if session.start_time else None,
                "checklist_scores": {},
                "total_count": 0,
                "message": "체크리스트 데이터가 없습니다."
            }
        
        # 케어기버 정보 조회
        caregiver = db.query(Caregiver).filter(
            Caregiver.id == session.caregiver_id
        ).first()
        
        # 체크리스트 점수를 카테고리별로 그룹화
        checklist_by_category = {}
        
        for response in checklist_responses:
            # question_key에서 카테고리 추출 (예: nutrition_1 -> nutrition)
            if '_' in response.question_key:
                category = response.question_key.split('_')[0]
            else:
                category = response.question_key
            
            if category not in checklist_by_category:
                checklist_by_category[category] = {
                    "category": category,
                    "scores": [],
                    "notes": []
                }
            
            # 점수와 노트 추가
            if response.selected_score is not None:
                checklist_by_category[category]["scores"].append(response.selected_score)
            
            if response.notes:
                checklist_by_category[category]["notes"].append(response.notes)
        
        # 카테고리별 통계 계산
        checklist_summary = {}
        for category, data in checklist_by_category.items():
            if data["scores"]:
                total_score = sum(data["scores"])
                max_possible = len(data["scores"]) * 4  # 각 질문 최대 4점
                percentage = (total_score / max_possible) * 100 if max_possible > 0 else 0
                
                checklist_summary[category] = {
                    "category_name": _get_category_name(category),
                    "raw_scores": data["scores"],
                    "total_score": total_score,
                    "max_possible_score": max_possible,
                    "percentage": round(percentage, 1),
                    "question_count": len(data["scores"]),
                    "notes": data["notes"],
                    "average_score": round(total_score / len(data["scores"]), 1) if data["scores"] else 0
                }
        
        return {
            "session_id": session_id,
            "senior": {
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "photo": senior.photo
            },
            "caregiver": {
                "id": caregiver.id if caregiver else None,
                "name": caregiver.name if caregiver else "케어기버 정보 없음"
            },
            "session_date": session.start_time.strftime("%Y-%m-%d") if session.start_time else None,
            "session_time": {
                "start_time": session.start_time.strftime("%Y-%m-%d %H:%M") if session.start_time else None,
                "end_time": session.end_time.strftime("%Y-%m-%d %H:%M") if session.end_time else None
            },
            "checklist_scores": checklist_summary,
            "total_categories": len(checklist_summary),
            "total_responses": len(checklist_responses)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"체크리스트 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/checklist/today/{senior_id}")
async def get_today_checklist_scores(
    senior_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """특정 시니어의 오늘 체크리스트 점수 조회 (가디언용)"""
    try:
        # 현재 사용자의 가디언 정보 조회
        guardian = db.query(Guardian).filter(
            Guardian.user_id == current_user.id
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언 정보를 찾을 수 없습니다."
            )
        
        # 시니어 정보 조회 및 권한 확인
        senior = db.query(Senior).filter(
            Senior.id == senior_id,
            Senior.guardian_id == guardian.id
        ).first()
        
        if not senior:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="시니어 정보를 찾을 수 없습니다."
            )
        
        # 오늘 날짜
        today = datetime.now().date()
        
        # 오늘의 돌봄 세션 조회
        today_session = db.query(CareSession).filter(
            CareSession.senior_id == senior_id,
            func.date(CareSession.start_time) == today
        ).first()
        
        if not today_session:
            return {
                "senior": {
                    "id": senior.id,
                    "name": senior.name,
                    "photo": senior.photo
                },
                "today_date": today.strftime("%Y-%m-%d"),
                "checklist_scores": {},
                "total_categories": 0,
                "message": "오늘 체크리스트 데이터가 없습니다."
            }
        
        # 오늘 세션의 체크리스트 조회
        checklist_responses = db.query(ChecklistResponse).filter(
            ChecklistResponse.care_session_id == today_session.id
        ).all()
        
        if not checklist_responses:
            return {
                "senior": {
                    "id": senior.id,
                    "name": senior.name,
                    "photo": senior.photo
                },
                "today_date": today.strftime("%Y-%m-%d"),
                "session_id": today_session.id,
                "checklist_scores": {},
                "total_categories": 0,
                "message": "오늘 체크리스트 데이터가 없습니다."
            }
        
        # 체크리스트 점수를 카테고리별로 그룹화
        checklist_by_category = {}
        
        for response in checklist_responses:
            # question_key에서 카테고리 추출
            if '_' in response.question_key:
                category = response.question_key.split('_')[0]
            else:
                category = response.question_key
            
            if category not in checklist_by_category:
                checklist_by_category[category] = {
                    "category": category,
                    "scores": [],
                    "notes": []
                }
            
            if response.selected_score is not None:
                checklist_by_category[category]["scores"].append(response.selected_score)
            
            if response.notes:
                checklist_by_category[category]["notes"].append(response.notes)
        
        # 카테고리별 통계 계산
        checklist_summary = {}
        for category, data in checklist_by_category.items():
            if data["scores"]:
                total_score = sum(data["scores"])
                max_possible = len(data["scores"]) * 4
                percentage = (total_score / max_possible) * 100 if max_possible > 0 else 0
                
                checklist_summary[category] = {
                    "category_name": _get_category_name(category),
                    "raw_scores": data["scores"],
                    "total_score": total_score,
                    "max_possible_score": max_possible,
                    "percentage": round(percentage, 1),
                    "question_count": len(data["scores"]),
                    "notes": data["notes"],
                    "average_score": round(total_score / len(data["scores"]), 1) if data["scores"] else 0
                }
        
        return {
            "senior": {
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "photo": senior.photo
            },
            "today_date": today.strftime("%Y-%m-%d"),
            "session_id": today_session.id,
            "checklist_scores": checklist_summary,
            "total_categories": len(checklist_summary),
            "total_responses": len(checklist_responses)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"오늘 체크리스트 조회 중 오류가 발생했습니다: {str(e)}"
        )

def _get_category_name(category_code: str) -> str:
    """카테고리 코드를 한국어 이름으로 변환"""
    category_names = {
        "nutrition": "영양상태",
        "hypertension": "고혈압",
        "depression": "우울증/정신건강",
        "diabetes": "당뇨",
        "dementia": "치매/인지기능"
    }
    return category_names.get(category_code, category_code)

@router.get("/reports/{report_id}")
async def get_report_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI 리포트 상세 조회"""
    try:
        # 리포트 조회
        report = db.query(AIReport).filter(AIReport.id == report_id).first()
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="리포트를 찾을 수 없습니다."
            )
        
        # 세션 정보 조회
        session = db.query(CareSession).filter(
            CareSession.id == report.session_id
        ).first()
        
        # 시니어 정보 조회
        senior = db.query(Senior).filter(
            Senior.id == session.senior_id
        ).first()
        
        # 권한 확인
        if senior.guardian_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="해당 리포트에 접근할 권한이 없습니다."
            )
        
        # 리포트 읽음 상태 업데이트
        if report.status == "generated":
            report.status = "read"
            db.commit()
        
        return {
            "report": report,
            "session": session,
            "senior": senior,
            "caregiver": session.caregiver
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"리포트 상세 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/feedback")
async def submit_feedback(
    feedback_data: FeedbackSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """피드백 제출"""
    try:
        # 리포트 존재 확인
        report = db.query(AIReport).filter(
            AIReport.id == feedback_data.report_id
        ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="리포트를 찾을 수 없습니다."
            )
        
        # 세션 및 시니어 정보 조회
        session = db.query(CareSession).filter(
            CareSession.id == report.session_id
        ).first()
        
        senior = db.query(Senior).filter(
            Senior.id == session.senior_id
        ).first()
        
        # 권한 확인
        if senior.guardian_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="해당 리포트에 피드백할 권한이 없습니다."
            )
        
        # 피드백 생성
        feedback = Feedback(
            report_id=feedback_data.report_id,
            guardian_id=current_user.id,
            message=feedback_data.message,
            requirements=feedback_data.requirements,
            status="pending"
        )
        
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        # 케어기버에게 알림 전송
        notification_service = NotificationService(db)
        await notification_service.send_notification(
            sender_id=current_user.id,
            receiver_id=session.caregiver_id,
            type="feedback",
            title="새로운 피드백이 도착했습니다",
            content=f"{senior.name}님 담당 가디언으로부터 피드백이 도착했습니다.",
            data={"feedback_id": feedback.id, "report_id": report.id}
        )
        
        return {
            "message": "피드백이 성공적으로 제출되었습니다.",
            "feedback_id": feedback.id,
            "status": "pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"피드백 제출 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/feedback/history")
async def get_feedback_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """피드백 이력 조회"""
    try:
        feedbacks = db.query(Feedback).filter(
            Feedback.guardian_id == current_user.id
        ).order_by(Feedback.created_at.desc()).all()
        
        return {
            "feedbacks": feedbacks,
            "total_count": len(feedbacks)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"피드백 이력 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """알림 목록 조회"""
    try:
        query = db.query(Notification).filter(
            Notification.receiver_id == current_user.id
        )
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        notifications = query.order_by(Notification.created_at.desc()).all()
        
        return notifications
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"알림 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """알림 읽음 처리"""
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.receiver_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="알림을 찾을 수 없습니다."
            )
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "알림이 읽음 처리되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"알림 읽음 처리 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/profile")
async def get_guardian_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """가디언 프로필 조회"""
    try:
        # 담당 시니어 수 조회
        seniors_count = db.query(Senior).filter(
            Senior.guardian_id == _current_guardian(db, current_user).id
        ).count()
        
        # 총 리포트 수 조회
        seniors = db.query(Senior).filter(
            Senior.guardian_id == _current_guardian(db, current_user).id
        ).all()
        
        senior_ids = [senior.id for senior in seniors]
        
        total_reports = db.query(AIReport).join(CareSession).filter(
            CareSession.senior_id.in_(senior_ids)
        ).count()
        
        return {
            "user_info": current_user,
            "assigned_seniors_count": seniors_count,
            "total_reports": total_reports,
            "pending_feedback": db.query(Feedback).filter(
                Feedback.guardian_id == current_user.id,
                Feedback.status == "pending"
            ).count()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로필 조회 중 오류가 발생했습니다: {str(e)}"
        )

# 추이 분석 엔드포인트 추가
from app.services.trend_analysis import TrendAnalysisService

@router.get("/trend-analysis/{senior_id}")
async def get_trend_analysis(
    senior_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """시니어 상태 변화 추이 분석"""
    
    # 권한 확인 (가디언이 해당 시니어의 보호자인지)
    senior = db.query(Senior).filter(
        Senior.id == senior_id,
        Senior.guardian_id == current_user.guardian_profile.id
    ).first()
    
    if not senior:
        raise HTTPException(status_code=404, detail="시니어 정보를 찾을 수 없습니다")
    
    # 추이 분석 수행
    trend_service = TrendAnalysisService(db)
    analysis = trend_service.analyze_4week_trend(senior_id)
    
    return {
        "senior_name": senior.name,
        "analysis_date": datetime.now().isoformat(),
        "trend_analysis": analysis
    }

# ==========================================
# 4단계: 카테고리별 상세 분석 엔드포인트
# ==========================================

@router.get("/home-enhanced")
async def get_guardian_home_enhanced(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """카테고리별 상태 포함 가디언 홈 화면"""
    try:
        # 담당 시니어 목록 조회
        seniors = db.query(Senior).filter(
            Senior.guardian_id == _current_guardian(db, current_user).id
        ).all()
        
        if not seniors:
            return {
                "guardian_name": _current_guardian(db, current_user).name,
                "seniors": [],
                "recent_reports": [],
                "unread_notifications": []
            }
        
        senior_ids = [senior.id for senior in seniors]
        
        # 시니어별 최신 카테고리 상태 조회 (뷰 사용)
        seniors_with_categories = []
        for senior in seniors:
            # 최신 카테고리 상태 조회
            category_query = text("""
                SELECT * FROM v_latest_category_status 
                WHERE senior_id = :senior_id
            """)
            
            category_result = db.execute(category_query, {"senior_id": senior.id}).fetchone()
            
            if category_result:
                category_status = {
                    "nutrition": {
                        "title": "영양상태 상세 추이",
                        "avatar_color": category_result.nutrition_color or "blue",
                        "avatar_emotion": category_result.nutrition_emotion or "happy",
                        "change_display": category_result.nutrition_change_display or "0",
                        "current_percentage": category_result.nutrition_percentage or 0,
                        "status_message": category_result.nutrition_message or "상태 확인 중입니다."
                    },
                    "hypertension": {
                        "title": "고혈압 상세 추이", 
                        "avatar_color": category_result.hypertension_color or "blue",
                        "avatar_emotion": category_result.hypertension_emotion or "happy",
                        "change_display": category_result.hypertension_change_display or "0",
                        "current_percentage": category_result.hypertension_percentage or 0,
                        "status_message": category_result.hypertension_message or "상태 확인 중입니다."
                    },
                    "depression": {
                        "title": "우울증 상세 추이",
                        "avatar_color": category_result.depression_color or "blue", 
                        "avatar_emotion": category_result.depression_emotion or "happy",
                        "change_display": category_result.depression_change_display or "0",
                        "current_percentage": category_result.depression_percentage or 0,
                        "status_message": category_result.depression_message or "상태 확인 중입니다."
                    }
                }
            else:
                # 기본값 설정
                category_status = {
                    "nutrition": {
                        "title": "영양상태 상세 추이",
                        "avatar_color": "blue",
                        "avatar_emotion": "happy", 
                        "change_display": "0",
                        "current_percentage": 0,
                        "status_message": "아직 데이터가 없습니다."
                    },
                    "hypertension": {
                        "title": "고혈압 상세 추이",
                        "avatar_color": "blue",
                        "avatar_emotion": "happy",
                        "change_display": "0", 
                        "current_percentage": 0,
                        "status_message": "아직 데이터가 없습니다."
                    },
                    "depression": {
                        "title": "우울증 상세 추이",
                        "avatar_color": "blue",
                        "avatar_emotion": "happy",
                        "change_display": "0",
                        "current_percentage": 0,
                        "status_message": "아직 데이터가 없습니다."
                    }
                }
            
            seniors_with_categories.append({
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "photo": senior.photo,
                "category_status": category_status
            })
        
        # 최근 리포트 조회 (향상된 버전 - 카테고리 정보 포함)
        recent_reports_query = text("""
            SELECT 
                ar.id, ar.content, ar.ai_comment,
                ar.created_at, ar.status,
                cs.senior_id,
                s.name as senior_name
            FROM ai_reports ar
            JOIN care_sessions cs ON ar.care_session_id = cs.id
            JOIN seniors s ON cs.senior_id = s.id
            WHERE cs.senior_id IN :senior_ids
            ORDER BY ar.created_at DESC
            LIMIT 10
        """)
        
        recent_reports_result = db.execute(
            recent_reports_query, 
            {"senior_ids": tuple(senior_ids)}
        ).fetchall()
        
        recent_reports = []
        for report in recent_reports_result:
            # keywords 컬럼이 없으므로 content에서 키워드 생성
            keywords = None
            if hasattr(report, 'content') and report.content:
                content_words = report.content.split()[:3]
                keywords = content_words if content_words else None
            
            recent_reports.append({
                "id": report.id,
                "keywords": keywords,
                "content": report.content,
                "ai_comment": report.ai_comment,
                "created_at": report.created_at,
                "status": report.status,
                "senior_id": report.senior_id,
                "senior_name": report.senior_name
            })
        
        # 읽지 않은 알림 조회
        unread_notifications = db.query(Notification).filter(
            Notification.receiver_id == current_user.id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).limit(10).all()
        
        return {
            "guardian_name": _current_guardian(db, current_user).name,
            "seniors": seniors_with_categories,
            "recent_reports": recent_reports,
            "unread_notifications": unread_notifications,
            "enhanced_features": {
                "category_analysis_enabled": True,
                "ui_version": "enhanced_v1.0"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"향상된 홈 데이터 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/senior/{senior_id}/category-details")
async def get_senior_category_details(
    senior_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """시니어 카테고리별 상세 정보 조회"""
    try:
        # 권한 확인
        senior = db.query(Senior).filter(
            Senior.id == senior_id,
            Senior.guardian_id == _current_guardian(db, current_user).id
        ).first()
        
        if not senior:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 시니어 정보를 찾을 수 없거나 접근 권한이 없습니다."
            )
        
        # 4주간 카테고리별 트렌드 데이터 조회
        trend_query = text("""
            SELECT 
                cta.analysis_date,
                cta.category_name,
                cta.current_score,
                cta.previous_score,
                cta.score_change,
                cta.trend_direction,
                cta.category_insights,
                cta.recommendations,
                cta.ui_data
            FROM category_trend_analysis cta
            WHERE cta.senior_id = :senior_id
            AND cta.analysis_date >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
            ORDER BY cta.analysis_date DESC, cta.category_name
        """)
        
        trend_results = db.execute(trend_query, {"senior_id": senior_id}).fetchall()
        
        # 카테고리별로 데이터 그룹화
        category_details = {
            "nutrition": {
                "title": "영양상태 상세 추이",
                "description": "식사량, 영양 섭취, 체중 변화 등을 종합 분석",
                "weekly_data": [],
                "current_status": {},
                "insights": [],
                "recommendations": []
            },
            "hypertension": {
                "title": "고혈압 상세 추이", 
                "description": "혈압 측정, 복약 관리, 증상 관찰 등을 종합 분석",
                "weekly_data": [],
                "current_status": {},
                "insights": [],
                "recommendations": []
            },
            "depression": {
                "title": "우울증 상세 추이",
                "description": "감정 상태, 활동 참여, 소통 정도 등을 종합 분석", 
                "weekly_data": [],
                "current_status": {},
                "insights": [],
                "recommendations": []
            }
        }
        
        # 트렌드 데이터를 카테고리별로 분류
        for trend in trend_results:
            category = trend.category_name
            if category in category_details:
                week_data = {
                    "date": trend.analysis_date,
                    "score": trend.current_score,
                    "change": trend.score_change,
                    "trend": trend.trend_direction,
                    "ui_data": trend.ui_data
                }
                category_details[category]["weekly_data"].append(week_data)
                
                # 가장 최근 데이터를 현재 상태로 설정
                if not category_details[category]["current_status"] or \
                   trend.analysis_date > category_details[category]["current_status"].get("date"):
                    category_details[category]["current_status"] = {
                        "score": trend.current_score,
                        "previous_score": trend.previous_score,
                        "change": trend.score_change,
                        "trend": trend.trend_direction,
                        "date": trend.analysis_date
                    }
                
                # 인사이트와 권장사항 추가
                if trend.category_insights:
                    category_details[category]["insights"].append(trend.category_insights)
                if trend.recommendations:
                    category_details[category]["recommendations"].append(trend.recommendations)
        
        # 최근 관련 리포트 조회
        recent_reports_query = text("""
            SELECT 
                ar.id, ar.content, ar.ai_comment, ar.created_at,
                ar.category_details
            FROM ai_reports ar
            JOIN care_sessions cs ON ar.care_session_id = cs.id
            WHERE cs.senior_id = :senior_id
            AND ar.category_details IS NOT NULL
            ORDER BY ar.created_at DESC
            LIMIT 5
        """)
        
        recent_reports = db.execute(recent_reports_query, {"senior_id": senior_id}).fetchall()
        
        return {
            "senior": {
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "photo": senior.photo
            },
            "category_details": category_details,
            "recent_reports": [
                {
                    "id": report.id,
                    "content": report.content,
                    "ai_comment": report.ai_comment,
                    "created_at": report.created_at,
                    "category_details": report.category_details
                } for report in recent_reports
            ],
            "analysis_summary": {
                "total_weeks_analyzed": len(set(trend.analysis_date for trend in trend_results)),
                "last_analysis_date": max((trend.analysis_date for trend in trend_results), default=None)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"카테고리별 상세 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/reports-enhanced")
async def get_reports_enhanced(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    senior_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """상세 분석 포함 AI 리포트 목록 조회"""
    try:
        # 가디언이 담당하는 시니어들 조회
        seniors = db.query(Senior).filter(
            Senior.guardian_id == _current_guardian(db, current_user).id
        ).all()
        
        senior_ids = [senior.id for senior in seniors]
        
        if not senior_ids:
            return {
                "reports": [],
                "total_count": 0,
                "categories_summary": {}
            }
        
        # 향상된 리포트 쿼리 (카테고리 정보 포함)
        query_conditions = ["cs.senior_id IN :senior_ids"]
        query_params = {"senior_ids": tuple(senior_ids)}
        
        # 필터 조건 추가
        if start_date:
            query_conditions.append("ar.created_at >= :start_date")
            query_params["start_date"] = start_date
        if end_date:
            query_conditions.append("ar.created_at <= :end_date") 
            query_params["end_date"] = end_date
        if senior_id:
            if senior_id not in senior_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="해당 시니어의 리포트에 접근할 권한이 없습니다."
                )
            query_conditions.append("cs.senior_id = :specific_senior_id")
            query_params["specific_senior_id"] = senior_id
        
        where_clause = " AND ".join(query_conditions)
        
        enhanced_reports_query = text(f"""
            SELECT 
                ar.id,
                ar.content,
                ar.ai_comment,
                ar.status,
                ar.created_at,
                cs.senior_id,
                s.name as senior_name,
                s.photo as senior_photo,
                cg.name as caregiver_name
            FROM ai_reports ar
            JOIN care_sessions cs ON ar.care_session_id = cs.id
            JOIN seniors s ON cs.senior_id = s.id
            JOIN caregivers cg ON cs.caregiver_id = cg.id
            WHERE {where_clause}
            ORDER BY ar.created_at DESC
        """)
        
        reports_result = db.execute(enhanced_reports_query, query_params).fetchall()
        
        # 카테고리별 요약 통계
        categories_summary = {
            "nutrition": {"total": 0, "improving": 0, "stable": 0, "declining": 0},
            "hypertension": {"total": 0, "improving": 0, "stable": 0, "declining": 0},
            "depression": {"total": 0, "improving": 0, "stable": 0, "declining": 0}
        }
        
        enhanced_reports = []
        for report in reports_result:
            # 카테고리 세부 정보 파싱
            category_details = None
            ui_components = None
            
            if report.category_details:
                try:
                    import json
                    category_details = json.loads(report.category_details) if isinstance(report.category_details, str) else report.category_details
                except:
                    category_details = None
            
            if report.ui_components:
                try:
                    import json
                    ui_components = json.loads(report.ui_components) if isinstance(report.ui_components, str) else report.ui_components
                except:
                    ui_components = None
            
            # 카테고리별 통계 업데이트
            if category_details:
                for category in ["nutrition", "hypertension", "depression"]:
                    if category in category_details:
                        categories_summary[category]["total"] += 1
                        trend = category_details[category].get("trend_direction", "stable")
                        if trend in categories_summary[category]:
                            categories_summary[category][trend] += 1
            
            # keywords 컬럼이 없으므로 content에서 키워드 생성
            keywords = None
            if hasattr(report, 'content') and report.content:
                content_words = report.content.split()[:3]
                keywords = content_words if content_words else None
            
            enhanced_reports.append({
                "id": report.id,
                "keywords": keywords,
                "content": report.content,
                "ai_comment": report.ai_comment,
                "status": report.status,
                "created_at": report.created_at,
                "senior": {
                    "id": report.senior_id,
                    "name": report.senior_name,
                    "photo": getattr(report, 'senior_photo', None)
                },
                "caregiver_name": report.caregiver_name
            })
        
        return {
            "reports": enhanced_reports,
            "total_count": len(enhanced_reports),
            "categories_summary": categories_summary,
            "enhanced_features": {
                "category_analysis": True,
                "trend_tracking": True,
                "ui_enhancements": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"향상된 리포트 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/report/{report_id}/detailed")
async def get_report_detailed(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """상세 리포트 조회 (카테고리별 분석 포함)"""
    try:
        # 상세 리포트 조회
        detailed_query = text("""
            SELECT 
                ar.id,
                ar.report_type,
                ar.content,
                ar.ai_comment,
                ar.status_code,
                ar.trend_analysis,
                ar.checklist_type_code,
                ar.status,
                ar.created_at,
                cs.id as session_id,
                cs.start_time,
                cs.end_time,
                cs.senior_id,
                s.name as senior_name,
                s.age as senior_age,
                s.photo as senior_photo,
                cg.id as caregiver_id,
                cg.name as caregiver_name,
                cg.phone as caregiver_phone
            FROM ai_reports ar
            JOIN care_sessions cs ON ar.care_session_id = cs.id
            JOIN seniors s ON cs.senior_id = s.id
            JOIN caregivers cg ON cs.caregiver_id = cg.id
            WHERE ar.id = :report_id
        """)
        
        report_result = db.execute(detailed_query, {"report_id": report_id}).fetchone()
        
        if not report_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="리포트를 찾을 수 없습니다."
            )
        
        # 권한 확인
        senior = db.query(Senior).filter(
            Senior.id == report_result.senior_id,
            Senior.guardian_id == _current_guardian(db, current_user).id
        ).first()
        
        if not senior:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="해당 리포트에 접근할 권한이 없습니다."
            )
        
        # 카테고리 세부 정보 파싱
        category_details = None
        ui_components = None
        
        if report_result.category_details:
            try:
                import json
                category_details = json.loads(report_result.category_details) if isinstance(report_result.category_details, str) else report_result.category_details
            except:
                category_details = None
        
        if report_result.ui_components:
            try:
                import json
                ui_components = json.loads(report_result.ui_components) if isinstance(report_result.ui_components, str) else report_result.ui_components
            except:
                ui_components = None
        
        # 관련 체크리스트 및 돌봄노트 조회
        session_details_query = text("""
            SELECT 
                'checklist' as type,
                cr.question_key,
                cr.question_text,
                cr.answer,
                cr.notes,
                cr.score_value,
                cr.category
            FROM checklist_responses cr
            WHERE cr.care_session_id = :session_id
            
            UNION ALL
            
            SELECT 
                'care_note' as type,
                cn.question_type as question_key,
                cn.question_text,
                cn.content as answer,
                NULL as notes,
                NULL as score_value,
                NULL as category
            FROM care_notes cn
            WHERE cn.care_session_id = :session_id
        """)
        
        session_details = db.execute(session_details_query, {"session_id": report_result.session_id}).fetchall()
        
        # 체크리스트와 돌봄노트 분리
        checklist_data = [detail for detail in session_details if detail.type == 'checklist']
        care_notes_data = [detail for detail in session_details if detail.type == 'care_note']
        
        # 리포트 읽음 상태 업데이트
        if report_result.status == "generated":
            update_query = text("UPDATE ai_reports SET status = 'read' WHERE id = :report_id")
            db.execute(update_query, {"report_id": report_id})
            db.commit()
        
        # keywords 컬럼이 없으므로 content에서 키워드 생성
        keywords = None
        if hasattr(report_result, 'content') and report_result.content:
            content_words = report_result.content.split()[:3]
            keywords = content_words if content_words else None
        
        return {
            "report": {
                "id": report_result.id,
                "report_type": report_result.report_type,
                "content": report_result.content,
                "ai_comment": report_result.ai_comment,
                "status_code": report_result.status_code,
                "trend_analysis": report_result.trend_analysis,
                "checklist_type_code": report_result.checklist_type_code,
                "keywords": keywords,
                "status": "read",  # 읽음 처리됨
                "created_at": report_result.created_at
            },
            "session": {
                "id": report_result.session_id,
                "start_time": report_result.start_time,
                "end_time": report_result.end_time,
                "checklist_responses": [
                    {
                        "question_key": item.question_key,
                        "question_text": item.question_text,
                        "answer": item.answer,
                        "notes": item.notes,
                        "score_value": item.score_value,
                        "category": item.category
                    } for item in checklist_data
                ],
                "care_notes": [
                    {
                        "question_type": item.question_key,
                        "question_text": item.question_text,
                        "content": item.answer
                    } for item in care_notes_data
                ]
            },
            "senior": {
                "id": report_result.senior_id,
                "name": report_result.senior_name,
                "age": report_result.senior_age,
                "photo": report_result.senior_photo
            },
            "caregiver": {
                "id": report_result.caregiver_id,
                "name": report_result.caregiver_name,
                "phone": report_result.caregiver_phone
            },
            "enhanced_features": {
                "category_breakdown": True,
                "visual_components": True,
                "trend_analysis": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"상세 리포트 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/seniors/{senior_id}/latest-report")
async def get_senior_latest_report(
    senior_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """📋 특정 시니어의 최신 AI 리포트 요약 조회"""
    try:
        # 가디언 정보 조회
        guardian = db.query(Guardian).filter(Guardian.user_id == current_user.id).first()
        if not guardian:
            raise HTTPException(status_code=404, detail="가디언 정보를 찾을 수 없습니다")
        
        # 시니어 정보 및 권한 확인
        senior = db.query(Senior).filter(
            Senior.id == senior_id,
            Senior.guardian_id == guardian.id
        ).first()
        
        if not senior:
            raise HTTPException(
                status_code=404,
                detail="시니어 정보를 찾을 수 없거나 접근 권한이 없습니다"
            )
        
        # 최신 AI 리포트 조회 (모든 타입)
        latest_reports = db.query(AIReport).filter(
            AIReport.senior_id == senior_id
        ).order_by(AIReport.created_at.desc()).limit(10).all()
        
        if not latest_reports:
            return {
                "senior": {
                    "id": senior.id,
                    "name": senior.name,
                    "age": senior.age,
                    "photo": senior.photo
                },
                "latest_reports": [],
                "total_count": 0,
                "message": "아직 AI 리포트가 없습니다"
            }
        
        # 리포트 타입별로 그룹화
        reports_by_type = {}
        for report in latest_reports:
            report_type = report.report_type
            if report_type not in reports_by_type:
                reports_by_type[report_type] = []
            
            # keywords 생성
            keywords = None
            if report.content:
                content_words = report.content.split()[:3]
                keywords = content_words if content_words else None
            
            reports_by_type[report_type].append({
                "id": report.id,
                "report_type": report.report_type,
                "checklist_type_code": report.checklist_type_code,
                "content": report.content,
                "ai_comment": report.ai_comment,
                "status_code": report.status_code,
                "trend_analysis": report.trend_analysis,
                "keywords": keywords,
                "status": report.status,
                "created_at": report.created_at.strftime("%Y-%m-%d %H:%M")
            })
        
        # 가장 최신 리포트들 선별 (타입별 1개씩)
        summary_reports = []
        for report_type, type_reports in reports_by_type.items():
            if type_reports:
                latest_of_type = type_reports[0]  # 이미 날짜순 정렬됨
                summary_reports.append(latest_of_type)
        
        # 날짜순으로 다시 정렬
        summary_reports.sort(key=lambda x: x["created_at"], reverse=True)
        
        # 케어기버 정보 조회
        caregiver = db.query(Caregiver).filter(Caregiver.id == senior.caregiver_id).first()
        
        return {
            "senior": {
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "photo": senior.photo,
                "caregiver_name": caregiver.name if caregiver else "케어기버 미배정"
            },
            "latest_reports": summary_reports,
            "total_count": len(summary_reports),
            "reports_by_type": {
                "nutrition_report": len([r for r in summary_reports if r["report_type"] == "nutrition_report"]),
                "hypertension_report": len([r for r in summary_reports if r["report_type"] == "hypertension_report"]),
                "depression_report": len([r for r in summary_reports if r["report_type"] == "depression_report"]),
                "care_note_comment": len([r for r in summary_reports if r["report_type"] == "care_note_comment"])
            },
            "last_updated": summary_reports[0]["created_at"] if summary_reports else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"최신 리포트 조회 중 오류: {str(e)}"
        )


@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """알림 목록 조회"""
    
    if not current_user.guardian_profile:
        raise HTTPException(status_code=403, detail="가디언 권한이 필요합니다")
    
    try:
        query = db.query(Notification).filter(
            Notification.receiver_id == current_user.guardian_profile.id
        )
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        notifications = query.order_by(Notification.created_at.desc()).all()
        
        return [
            {
                "id": notification.id,
                "title": notification.title,
                "content": notification.content,
                "type": notification.type,
                "sender_id": notification.sender_id,
                "receiver_id": notification.receiver_id,
                "data": notification.data,
                "is_read": notification.is_read,
                "read_at": notification.read_at,
                "created_at": notification.created_at
            } for notification in notifications
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"알림 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """알림 읽음 처리"""
    
    if not current_user.guardian_profile:
        raise HTTPException(status_code=403, detail="가디언 권한이 필요합니다")
    
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.receiver_id == current_user.guardian_profile.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="알림을 찾을 수 없습니다."
            )
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "알림이 읽음 처리되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"알림 읽음 처리 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/feedback/history")
async def get_feedback_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """피드백 이력 조회"""
    
    if not current_user.guardian_profile:
        raise HTTPException(status_code=403, detail="가디언 권한이 필요합니다")
    
    try:
        feedbacks = db.query(Feedback).filter(
            Feedback.guardian_id == current_user.guardian_profile.id
        ).order_by(Feedback.created_at.desc()).all()
        
        return {
            "feedbacks": [
                {
                    "id": feedback.id,
                    "message": feedback.message,
                    "requirements": feedback.requirements,
                    "report_id": feedback.report_id,
                    "status": feedback.status,
                    "created_at": feedback.created_at,
                    "updated_at": feedback.updated_at
                } for feedback in feedbacks
            ],
            "total_count": len(feedbacks)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"피드백 이력 조회 중 오류가 발생했습니다: {str(e)}"
        )



# ===== 🆕 AI 리포트 조회 API 추가 =====
from pydantic import BaseModel
from typing import Dict, Any
import calendar

class AIReportSummary(BaseModel):
    """AI 리포트 요약 정보"""
    id: int
    report_type: str
    checklist_type_code: Optional[str]
    content: str
    ai_comment: Optional[str]
    status_code: Optional[int]  # 1:개선, 2:유지, 3:악화
    trend_analysis: Optional[str]
    created_at: datetime
    senior_name: str
    senior_id: int
    session_id: int

class WeeklyReportsResponse(BaseModel):
    """주간 AI 리포트 목록 응답"""
    current_week: date
    senior_name: str
    senior_id: int
    total_reports: int
    reports: List[AIReportSummary]
    has_detailed_reports: bool

class ScoreTrend(BaseModel):
    """점수 추이 정보"""
    week_date: date
    score_percentage: float
    status_code: int

class ReportDetailResponse(BaseModel):
    """AI 리포트 상세 응답"""
    id: int
    report_type: str
    checklist_type_code: str
    content: str
    ai_comment: Optional[str]
    status_code: int
    trend_analysis: Optional[str]
    created_at: datetime
    senior_name: str
    senior_id: int
    session_id: int
    current_week_score: float
    previous_week_score: Optional[float]
    score_change: Optional[float]
    score_change_percentage: Optional[float]
    recent_3_weeks_trend: List[ScoreTrend]
    status_text: str
    improvement_message: str





@router.get("/reports/{report_id}/detail")
async def get_ai_report_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """📊 AI 리포트 상세 정보 조회 (모든 타입 지원)"""
    try:
        # 가디언 정보 조회
        guardian = db.query(Guardian).filter(Guardian.user_id == current_user.id).first()
        if not guardian:
            raise HTTPException(status_code=404, detail="가디언 정보를 찾을 수 없습니다")
        
        # AI 리포트 조회
        report = db.query(AIReport).filter(AIReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="AI 리포트를 찾을 수 없습니다")
        
        # 시니어 정보 및 권한 확인
        senior = db.query(Senior).filter(Senior.id == report.senior_id).first()
        if not senior or senior.guardian_id != guardian.id:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
        
        # 모든 리포트 타입 지원 (care_note_comment 포함)
        
        # care_note_comment의 경우 간단한 응답
        if report.report_type == 'care_note_comment':
            return {
                "id": report.id,
                "report_type": report.report_type,
                "content": report.content,
                "ai_comment": report.ai_comment,
                "created_at": report.created_at,
                "senior_name": senior.name,
                "senior_id": senior.id,
                "session_id": report.care_session_id,
                "is_care_note": True,
                "message": "돌봄노트 코멘트"
            }
        
        if not report.checklist_type_code:
            raise HTTPException(status_code=400, detail="체크리스트 타입이 없는 리포트입니다")
        
        # 현재 주차 점수 조회
        current_week_score_record = db.query(WeeklyChecklistScore).filter(
            WeeklyChecklistScore.senior_id == senior.id,
            WeeklyChecklistScore.checklist_type_code == report.checklist_type_code,
            WeeklyChecklistScore.care_session_id == report.care_session_id
        ).first()
        
        current_week_score = float(current_week_score_record.score_percentage) if current_week_score_record else 0.0
        
        # 지난 주 점수 조회
        previous_week_score_record = db.query(WeeklyChecklistScore).filter(
            WeeklyChecklistScore.senior_id == senior.id,
            WeeklyChecklistScore.checklist_type_code == report.checklist_type_code,
            WeeklyChecklistScore.week_date < (current_week_score_record.week_date if current_week_score_record else date.today())
        ).order_by(WeeklyChecklistScore.week_date.desc()).first()
        
        previous_week_score = float(previous_week_score_record.score_percentage) if previous_week_score_record else None
        
        # 점수 변화 계산
        score_change = None
        score_change_percentage = None
        if previous_week_score is not None:
            score_change = current_week_score - previous_week_score
            if previous_week_score > 0:
                score_change_percentage = (score_change / previous_week_score) * 100
        
        # 지난 3주 추이 데이터 조회
        three_weeks_ago = date.today() - timedelta(weeks=3)
        recent_trends = db.query(WeeklyChecklistScore).filter(
            WeeklyChecklistScore.senior_id == senior.id,
            WeeklyChecklistScore.checklist_type_code == report.checklist_type_code,
            WeeklyChecklistScore.week_date >= three_weeks_ago
        ).order_by(WeeklyChecklistScore.week_date.asc()).all()
        
        # 추이 데이터 구성
        recent_3_weeks_trend = []
        for trend in recent_trends:
            recent_3_weeks_trend.append(ScoreTrend(
                week_date=trend.week_date,
                score_percentage=float(trend.score_percentage),
                status_code=trend.status_code or 2
            ))
        
        # 상태 텍스트 변환
        status_texts = {1: "개선", 2: "유지", 3: "악화"}
        status_text = status_texts.get(report.status_code, "알 수 없음")
        
        # 개선/악화 메시지 생성
        improvement_message = ""
        if score_change is not None:
            if score_change > 0:
                improvement_message = f"지난주 대비 {score_change:.1f}점 상승하여 {status_text}되었습니다"
            elif score_change < 0:
                improvement_message = f"지난주 대비 {abs(score_change):.1f}점 하락하여 {status_text}되었습니다"
            else:
                improvement_message = f"지난주와 동일한 점수로 {status_text} 상태입니다"
        else:
            improvement_message = f"이번 주 첫 기록으로 {status_text} 상태입니다"
        
        return ReportDetailResponse(
            id=report.id,
            report_type=report.report_type,
            checklist_type_code=report.checklist_type_code,
            content=report.content,
            ai_comment=report.ai_comment,
            status_code=report.status_code or 2,
            trend_analysis=report.trend_analysis,
            created_at=report.created_at,
            senior_name=senior.name,
            senior_id=senior.id,
            session_id=report.care_session_id,
            current_week_score=current_week_score,
            previous_week_score=previous_week_score,
            score_change=score_change,
            score_change_percentage=score_change_percentage,
            recent_3_weeks_trend=recent_3_weeks_trend,
            status_text=status_text,
            improvement_message=improvement_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"리포트 상세 조회 중 오류: {str(e)}")
