"""
n8n 워크플로우 v2.0을 위한 시드 데이터 생성 스크립트
"""
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.config import settings
from app.models import *
from app.database import Base, engine
from passlib.context import CryptContext
from datetime import datetime, date

# bcrypt 해시 컨텍스트 생성
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def simple_hash(password):
    """bcrypt 해시 함수"""
    return pwd_context.hash(password)

def create_v2_seed_data():
    """n8n v2.0용 새로운 시드 데이터 생성"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("n8n v2.0 시드 데이터 생성을 시작합니다...")
        
        # 1. 체크리스트 유형 기본 데이터 생성
        print("체크리스트 유형 데이터를 생성합니다...")
        
        # 기존 데이터 확인 후 삽입
        existing_types = db.query(ChecklistType).count()
        if existing_types == 0:
            checklist_types = [
                ChecklistType(
                    type_code="nutrition",
                    type_name="식사/영양 상태",
                    description="어르신의 식사량 및 영양 상태 체크",
                    max_score=4
                ),
                ChecklistType(
                    type_code="hypertension", 
                    type_name="고혈압 상태",
                    description="혈압 관련 증상, 복약, 생활습관 체크",
                    max_score=16
                ),
                ChecklistType(
                    type_code="depression",
                    type_name="우울증 상태", 
                    description="정서, 수면, 복약, 위험행동 체크",
                    max_score=16
                )
            ]
            
            for checklist_type in checklist_types:
                db.add(checklist_type)
                
            print("체크리스트 유형 3개가 생성되었습니다.")
        else:
            print("체크리스트 유형이 이미 존재합니다.")
        
        # 2. 돌봄노트 질문 기본 데이터 생성
        print("돌봄노트 질문 데이터를 생성합니다...")
        
        existing_questions = db.query(CareNoteQuestion).count()
        if existing_questions == 0:
            care_note_questions = [
                CareNoteQuestion(
                    question_number=1,
                    question_title="특별한 순간",
                    question_text="어르신과 함께한 시간 중 가장 인상 깊었던 순간이나 따뜻했던 에피소드가 있다면?",
                    guide_text="어르신이 웃으셨던 순간, 특별히 좋아하신 것들, 감동적이었던 대화나 행동",
                    is_active=True
                ),
                CareNoteQuestion(
                    question_number=2,
                    question_title="가족에 대한 그리움",
                    question_text="어르신이 가족에 대해 하신 말씀이나 표현하신 감정이 있다면?",
                    guide_text="자녀나 손자에 대한 언급, 가족 사진을 보실 때 반응, 가족에게 전하고 싶다고 하신 말씀",
                    is_active=True
                ),
                CareNoteQuestion(
                    question_number=3,
                    question_title="기분과 감정 표현",
                    question_text="어르신의 오늘 기분이나 감정 상태를 한두 단어로 표현한다면? 특별한 감정 표현이 있었나요?",
                    guide_text="밝음, 평온함, 그리움, 피곤함, 불안함, 외로움 등",
                    is_active=True
                ),
                CareNoteQuestion(
                    question_number=4,
                    question_title="대화 내용과 소통",
                    question_text="어르신과 나눈 대화 중 기억에 남는 내용이나 자주 하신 말씀이 있다면?",
                    guide_text="어르신이 자주 하시는 말씀, 과거 추억이나 경험담, 현재 관심사나 걱정거리",
                    is_active=True
                ),
                CareNoteQuestion(
                    question_number=5,
                    question_title="평소와 다른 변화나 특이사항",
                    question_text="평소와 비교해서 달라진 점이나 새롭게 관찰된 것이 있다면?",
                    guide_text="평소보다 말씀을 많이/적게 하심, 활기차거나 조용하심, 새로운 관심사나 행동",
                    is_active=True
                ),
                CareNoteQuestion(
                    question_number=6,
                    question_title="케어 과정에서의 에피소드",
                    question_text="어르신을 돌보는 과정에서 있었던 따뜻한 순간이나 특별한 에피소드가 있다면?",
                    guide_text="어르신이 도움을 받으실 때의 반응, 케어에 대한 감사 표현, 함께 웃었던 순간",
                    is_active=True
                )
            ]
            
            for question in care_note_questions:
                db.add(question)
                
            print("돌봄노트 질문 6개가 생성되었습니다.")
        else:
            print("돌봄노트 질문이 이미 존재합니다.")
        
        # 3. 기존 사용자들이 있는지 확인하고 샘플 주간 점수 데이터 생성
        print("샘플 주간 점수 데이터를 생성합니다...")
        
        # 기존 시니어가 있는지 확인
        seniors = db.query(Senior).all()
        
        if seniors:
            # 첫 번째 시니어에 대해 샘플 주간 점수 생성
            senior = seniors[0]
            
            # 기존 주간 점수가 없다면 생성
            existing_scores = db.query(WeeklyChecklistScore).filter(
                WeeklyChecklistScore.senior_id == senior.id
            ).count()
            
            if existing_scores == 0:
                # 최근 3주차 샘플 데이터 생성
                from datetime import timedelta
                
                for week_offset in range(3):
                    week_date = date.today() - timedelta(weeks=week_offset)
                    
                    for type_code, max_score in [("nutrition", 4), ("hypertension", 16), ("depression", 16)]:
                        # 점수 계산 (시간이 지날수록 약간씩 개선되는 패턴)
                        base_score = max_score * 0.7  # 70% 기준
                        improvement = week_offset * 0.05 * max_score  # 주당 5% 개선
                        total_score = int(base_score + improvement)
                        
                        score_percentage = (total_score / max_score) * 100
                        
                        # 상태 코드 (랜덤하게 설정)
                        import random
                        status_code = random.choice([1, 2, 3])  # 개선, 유지, 악화
                        
                        week_start = week_date - timedelta(days=week_date.weekday())
                        session = db.query(CareSession).filter(
                            CareSession.senior_id == senior.id
                        ).first()
                        weekly_score = WeeklyChecklistScore(
                            senior_id=senior.id,
                            caregiver_id=senior.caregiver_id,
                            care_session_id=session.id if session else None,
                            checklist_type_code=type_code,
                            week_start_date=week_start,
                            week_end_date=week_start + timedelta(days=6),
                            week_date=week_date,
                            checklist_count=1,
                            total_score=total_score,
                            max_possible_score=max_score,
                            score_percentage=score_percentage,
                            status_code=status_code
                        )
                        db.add(weekly_score)
                
                print(f"시니어 '{senior.name}'에 대한 샘플 주간 점수 데이터가 생성되었습니다.")
            else:
                print("주간 점수 데이터가 이미 존재합니다.")
        else:
            print("시니어가 없어서 주간 점수 데이터를 생성하지 않습니다.")
        
        # 모든 변경사항 커밋
        db.commit()
        
        print("✅ n8n v2.0 시드 데이터 생성이 완료되었습니다!")
        
        # 생성된 데이터 요약
        print("\n📊 생성된 데이터 요약:")
        print(f"- 체크리스트 유형: {db.query(ChecklistType).count()}개")
        print(f"- 돌봄노트 질문: {db.query(CareNoteQuestion).count()}개")
        print(f"- 주간 점수 데이터: {db.query(WeeklyChecklistScore).count()}개")
        
    except Exception as e:
        print(f"❌ 시드 데이터 생성 중 오류 발생: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def update_existing_models():
    """기존 모델들의 새 컬럼 기본값 설정"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("기존 모델 데이터를 업데이트합니다...")
        
        # 기존 ChecklistResponse에 새 컬럼 기본값 설정
        existing_responses = db.query(ChecklistResponse).filter(
            ChecklistResponse.checklist_type_code == None
        ).all()
        
        for response in existing_responses:
            # 기존 데이터에 기본 타입 할당
            if "영양" in response.question_key or "식사" in response.question_key:
                response.checklist_type_code = "nutrition"
                response.selected_score = 3  # 기본 점수
            elif "혈압" in response.question_key or "약" in response.question_key:
                response.checklist_type_code = "hypertension"
                response.selected_score = 3
            elif "기분" in response.question_key or "우울" in response.question_key:
                response.checklist_type_code = "depression"
                response.selected_score = 3
            else:
                response.checklist_type_code = "nutrition"  # 기본값
                response.selected_score = 3
            
            response.sub_question_id = "A"  # 기본 서브 질문 ID
        
        # 기존 CareNote에 새 컬럼 기본값 설정
        existing_notes = db.query(CareNote).filter(
            CareNote.selected_question_id == None
        ).all()
        
        for note in existing_notes:
            note.selected_question_id = 1  # 기본 질문 ID
            note.question_number = 1
        
        db.commit()
        print("기존 모델 데이터 업데이트가 완료되었습니다.")
        
    except Exception as e:
        print(f"기존 모델 업데이트 중 오류: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # 테이블 생성
    print("데이터베이스 테이블을 생성합니다...")
    Base.metadata.create_all(bind=engine)
    
    # v2.0 시드 데이터 생성
    create_v2_seed_data()
    
    # 기존 데이터 업데이트
    update_existing_models()
    
    print("\n🎉 모든 작업이 완료되었습니다!")
    print("\n다음 단계:")
    print("1. 데이터베이스에 SQL 쿼리 실행")
    print("2. 백엔드 서버 재시작")
    print("3. n8n 워크플로우 설정")
    print("4. API 테스트 진행")
