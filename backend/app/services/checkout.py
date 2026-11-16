import requests
import urllib3
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.care import CareSession, ChecklistResponse, CareNote
from app.exceptions import RequiredTasksIncomplete
from app.config import settings

# SSL 경고 비활성화
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class CheckoutService:
    
    @staticmethod
    def validate_required_tasks(db: Session, care_session_id: int) -> tuple[bool, List[str]]:
        """필수 작업 완료 확인 (상세한 로깅 포함)"""
        missing_tasks = []
        
        # 체크리스트 완료 확인
        checklist_count = db.query(ChecklistResponse).filter(
            ChecklistResponse.care_session_id == care_session_id
        ).count()
        
        print(f"DEBUG 체크리스트 검증: session_id={care_session_id}, count={checklist_count}")
        
        if checklist_count == 0:
            missing_tasks.append("체크리스트")
        
        # 돌봄노트 완료 확인
        care_note_count = db.query(CareNote).filter(
            CareNote.care_session_id == care_session_id
        ).count()
        
        print(f"DEBUG 돌봄노트 검증: session_id={care_session_id}, count={care_note_count}")
        
        if care_note_count == 0:
            missing_tasks.append("돌봄노트")
        
        print(f"DEBUG 검증 결과: missing_tasks={missing_tasks}, can_checkout={len(missing_tasks) == 0}")
        
        return len(missing_tasks) == 0, missing_tasks
    
    @staticmethod
    async def trigger_n8n_workflow(session_id: int, senior_id: int) -> bool:
        """n8n 워크플로우 자동 트리거"""
        try:
            # 프로덕션 n8n 웹훅 URL 사용
            webhook_url = f"{settings.n8n_webhook_url}/webhook/complete-ai-analysis"
            
            payload = {
                "session_id": session_id,
                "senior_id": senior_id,
                "trigger_time": datetime.now().isoformat(),
                "caregiver_name": "이돌봄",
                "senior_name": "김옥자",
                "care_date": datetime.now().strftime("%Y-%m-%d")
            }
            
            print(f"🚀 n8n 웹훅 호출 시작: {webhook_url}")
            print(f"📤 전송 데이터: {payload}")
            
            response = requests.post(
                webhook_url,
                json=payload,
                timeout=30,
                verify=False,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "GoodHands-Backend/1.0"
                }
            )
            
            print(f"✅ n8n 응답: {response.status_code} - {response.text}")
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ n8n 트리거 실패: {e}")
            return False
        except Exception as e:
            print(f"n8n 트리거 실패: {e}")
            return False
