"""
관리자 관련 라우터
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta

from ..database import get_db
from ..models import User, Senior, CareSession, AIReport, Feedback, Notification
from ..schemas import (
    UserCreate, UserResponse, SeniorCreate, SeniorResponse, 
    NotificationCreate, NotificationResponse
)
from ..services.auth import get_current_user, get_password_hash
from ..services.notification import NotificationService
from sqlalchemy import text

router = APIRouter()

def verify_admin_permission(current_user: User):
    """관리자 권한 확인"""
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다."
        )

@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """관리자 대시보드 데이터 조회"""
    verify_admin_permission(current_user)
    
    try:
        # 전체 통계 조회
        total_users = db.query(User).count()
        total_caregivers = db.query(User).filter(User.user_type == "caregiver").count()
        total_guardians = db.query(User).filter(User.user_type == "guardian").count()
        total_seniors = db.query(Senior).count()
        
        # 오늘 활동 통계
        today = date.today()
        today_sessions = db.query(CareSession).filter(
            CareSession.created_at >= today
        ).count()
        
        today_reports = db.query(AIReport).filter(
            AIReport.created_at >= today
        ).count()
        
        # 펜딩 피드백 수
        pending_feedbacks = db.query(Feedback).filter(
            Feedback.status == "pending"
        ).count()
        
        # 최근 활동 (최근 20개)
        recent_activities = db.query(CareSession).order_by(
            CareSession.created_at.desc()
        ).limit(20).all()
        
        return {
            "statistics": {
                "total_users": total_users,
                "total_caregivers": total_caregivers,
                "total_guardians": total_guardians,
                "total_seniors": total_seniors,
                "today_sessions": today_sessions,
                "today_reports": today_reports,
                "pending_feedbacks": pending_feedbacks
            },
            "recent_activities": recent_activities
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"대시보드 데이터 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    user_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 목록 조회"""
    verify_admin_permission(current_user)
    
    try:
        query = db.query(User)
        
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        users = query.order_by(User.created_at.desc()).all()
        
        return users
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """새 사용자 생성"""
    verify_admin_permission(current_user)
    
    try:
        # 사용자 코드 중복 확인
        existing_user = db.query(User).filter(
            User.user_code == user_data.user_code
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 존재하는 사용자 코드입니다."
            )
        
        # 이메일 중복 확인
        if user_data.email:
            existing_email = db.query(User).filter(
                User.email == user_data.email
            ).first()
            
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="이미 존재하는 이메일입니다."
                )
        
        # 새 사용자 생성
        new_user = User(
            user_code=user_data.user_code,
            user_type=user_data.user_type,
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            password_hash=get_password_hash(user_data.password),
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 생성 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 활성화"""
    verify_admin_permission(current_user)
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다."
            )
        
        user.is_active = True
        db.commit()
        
        return {"message": "사용자가 활성화되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 활성화 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 비활성화"""
    verify_admin_permission(current_user)
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다."
            )
        
        user.is_active = False
        db.commit()
        
        return {"message": "사용자가 비활성화되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 비활성화 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/seniors", response_model=List[SeniorResponse])
async def get_seniors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """시니어 목록 조회"""
    verify_admin_permission(current_user)
    
    try:
        seniors = db.query(Senior).order_by(Senior.created_at.desc()).all()
        
        return seniors
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"시니어 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/seniors", response_model=SeniorResponse)
async def create_senior(
    senior_data: SeniorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """새 시니어 생성"""
    verify_admin_permission(current_user)
    
    try:
        # 케어기버 및 가디언 존재 확인
        caregiver = db.query(User).filter(
            User.id == senior_data.caregiver_id,
            User.user_type == "caregiver"
        ).first()
        
        if not caregiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="케어기버를 찾을 수 없습니다."
            )
        
        guardian = db.query(User).filter(
            User.id == senior_data.guardian_id,
            User.user_type == "guardian"
        ).first()
        
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="가디언을 찾을 수 없습니다."
            )
        
        # 새 시니어 생성
        new_senior = Senior(
            name=senior_data.name,
            age=senior_data.age,
            gender=senior_data.gender,
            photo=senior_data.photo,
            caregiver_id=senior_data.caregiver_id,
            guardian_id=senior_data.guardian_id,
            nursing_home_id=senior_data.nursing_home_id,
            diseases=senior_data.diseases,
            preferences=senior_data.preferences
        )
        
        db.add(new_senior)
        db.commit()
        db.refresh(new_senior)
        
        return new_senior
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"시니어 생성 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/reports")
async def get_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """리포트 목록 조회"""
    verify_admin_permission(current_user)
    
    try:
        query = db.query(AIReport)
        
        if start_date:
            query = query.filter(AIReport.created_at >= start_date)
        if end_date:
            query = query.filter(AIReport.created_at <= end_date)
        
        reports = query.order_by(AIReport.created_at.desc()).all()
        
        return {
            "reports": reports,
            "total_count": len(reports)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"리포트 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/notifications/broadcast")
async def broadcast_notification(
    notification_data: NotificationCreate,
    user_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """전체 또는 특정 사용자 그룹에 알림 전송"""
    verify_admin_permission(current_user)
    
    try:
        # 대상 사용자 조회
        query = db.query(User).filter(User.is_active == True)
        
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        target_users = query.all()
        
        # 알림 서비스 초기화
        notification_service = NotificationService(db)
        
        # 각 사용자에게 알림 전송
        sent_count = 0
        for user in target_users:
            await notification_service.send_notification(
                sender_id=current_user.id,
                receiver_id=user.id,
                type=notification_data.type,
                title=notification_data.title,
                content=notification_data.content,
                data=notification_data.data
            )
            sent_count += 1
        
        return {
            "message": f"알림이 {sent_count}명에게 전송되었습니다.",
            "sent_count": sent_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"알림 전송 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/feedbacks")
async def get_feedbacks(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """피드백 목록 조회"""
    verify_admin_permission(current_user)
    
    try:
        query = db.query(Feedback)
        
        if status:
            query = query.filter(Feedback.status == status)
        
        feedbacks = query.order_by(Feedback.created_at.desc()).all()
        
        return {
            "feedbacks": feedbacks,
            "total_count": len(feedbacks)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"피드백 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/feedbacks/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """피드백 상태 업데이트"""
    verify_admin_permission(current_user)
    
    try:
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        
        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="피드백을 찾을 수 없습니다."
            )
        
        feedback.status = status
        feedback.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {"message": "피드백 상태가 업데이트되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"피드백 상태 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

# ==========================================
# 알림 관련 엔드포인트 (서버 동기화)
# ==========================================

@router.post("/notifications/send-to-guardian")
async def send_guardian_notification(
    notification_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """가디언에게 알림 발송"""
    verify_admin_permission(current_user)
    
    try:
        senior_id = notification_data.get("senior_id")
        notification_type = notification_data.get("type", "new_ai_report")
        title = notification_data.get("title", "새로운 알림")
        content = notification_data.get("content", "")
        priority = notification_data.get("priority", "normal")
        
        # 시니어를 통해 가디언 찾기
        senior = db.query(Senior).filter(Senior.id == senior_id).first()
        if not senior or not senior.guardian_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 시니어의 가디언을 찾을 수 없습니다."
            )
        
        # 알림 생성
        notification = Notification(
            sender_id=current_user.id,
            receiver_id=senior.guardian_id,
            type=notification_type,
            title=title,
            content=content,
            data={"senior_id": senior_id, "priority": priority}
        )
        
        db.add(notification)
        db.commit()
        
        return {
            "status": "success",
            "message": "가디언에게 알림이 전송되었습니다.",
            "notification_id": notification.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"알림 전송 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/notifications/send-monthly-report")
async def send_monthly_report_notification(
    report_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """월간 트렌드 리포트 알림 발송"""
    verify_admin_permission(current_user)
    
    try:
        senior_id = report_data.get("senior_id")
        trend_direction = report_data.get("trend_direction", "stable")
        priority = report_data.get("priority", "medium")
        
        # 시니어를 통해 가디언 찾기
        senior = db.query(Senior).filter(Senior.id == senior_id).first()
        if not senior or not senior.guardian_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 시니어의 가디언을 찾을 수 없습니다."
            )
        
        # 트렌드에 따른 제목 및 내용 설정
        trend_messages = {
            "improving": {
                "title": "좋은 소식! 건강 상태가 개선되고 있습니다",
                "content": f"{senior.name}님의 지난 4주간 상태가 지속적으로 개선되고 있습니다."
            },
            "declining": {
                "title": "주의 필요: 건강 상태 변화 감지",
                "content": f"{senior.name}님의 상태에 변화가 감지되었습니다. 상세한 분석 리포트를 확인해보세요."
            },
            "stable": {
                "title": "월간 건강 리포트 업데이트",
                "content": f"{senior.name}님의 지난 4주간 상태가 안정적으로 유지되고 있습니다."
            }
        }
        
        message_info = trend_messages.get(trend_direction, trend_messages["stable"])
        
        # 알림 생성
        notification = Notification(
            sender_id=current_user.id,
            receiver_id=senior.guardian_id,
            type="monthly_trend_report",
            title=message_info["title"],
            content=message_info["content"],
            data={
                "senior_id": senior_id,
                "trend_direction": trend_direction,
                "priority": priority,
                "report_type": "monthly_trend"
            }
        )
        
        db.add(notification)
        db.commit()
        
        return {
            "status": "success",
            "message": "월간 리포트 알림이 전송되었습니다.",
            "notification_id": notification.id,
            "trend_direction": trend_direction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"월간 리포트 알림 전송 중 오류가 발생했습니다: {str(e)}"
        )

# ==========================================
# 5단계: 관리자 카테고리별 분석 시스템
# ==========================================

@router.get("/dashboard-enhanced")
async def get_admin_dashboard_enhanced(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """카테고리별 통계 포함 관리자 대시보드"""
    verify_admin_permission(current_user)
    
    try:
        # 기본 통계
        total_users = db.query(User).count()
        total_caregivers = db.query(User).filter(User.user_type == "caregiver").count()
        total_guardians = db.query(User).filter(User.user_type == "guardian").count()
        total_seniors = db.query(Senior).count()
        
        # 오늘 활동 통계
        today = date.today()
        today_sessions = db.query(CareSession).filter(
            CareSession.created_at >= today
        ).count()
        
        today_reports = db.query(AIReport).filter(
            AIReport.created_at >= today
        ).count()
        
        # 카테고리별 트렌드 통계 (최근 4주)
        category_stats_query = text("""
            SELECT 
                cta.category_name,
                COUNT(*) as total_analyses,
                AVG(cta.current_score) as avg_score,
                SUM(CASE WHEN cta.trend_direction = 'improving' THEN 1 ELSE 0 END) as improving_count,
                SUM(CASE WHEN cta.trend_direction = 'stable' THEN 1 ELSE 0 END) as stable_count,
                SUM(CASE WHEN cta.trend_direction = 'declining' THEN 1 ELSE 0 END) as declining_count
            FROM category_trend_analysis cta
            WHERE cta.analysis_date >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
            GROUP BY cta.category_name
        """)
        
        category_stats_result = db.execute(category_stats_query).fetchall()
        
        category_overview = {}
        for stat in category_stats_result:
            category_overview[stat.category_name] = {
                "total_analyses": stat.total_analyses,
                "average_score": round(stat.avg_score, 1) if stat.avg_score else 0,
                "trend_distribution": {
                    "improving": stat.improving_count,
                    "stable": stat.stable_count,
                    "declining": stat.declining_count
                },
                "health_percentage": round((stat.improving_count + stat.stable_count) / stat.total_analyses * 100, 1) if stat.total_analyses > 0 else 0
            }
        
        # 시니어별 최신 상태 요약 (위험도 기준)
        seniors_risk_query = text("""
            SELECT 
                s.id, s.name, s.age,
                vcs.nutrition_percentage,
                vcs.hypertension_percentage, 
                vcs.depression_percentage,
                CASE 
                    WHEN (vcs.nutrition_percentage + vcs.hypertension_percentage + vcs.depression_percentage) / 3 < 60 THEN 'high'
                    WHEN (vcs.nutrition_percentage + vcs.hypertension_percentage + vcs.depression_percentage) / 3 < 80 THEN 'medium'
                    ELSE 'low'
                END as risk_level
            FROM seniors s
            LEFT JOIN v_latest_category_status vcs ON s.id = vcs.senior_id
            ORDER BY 
                CASE 
                    WHEN (vcs.nutrition_percentage + vcs.hypertension_percentage + vcs.depression_percentage) / 3 < 60 THEN 1
                    WHEN (vcs.nutrition_percentage + vcs.hypertension_percentage + vcs.depression_percentage) / 3 < 80 THEN 2
                    ELSE 3
                END,
                s.name
        """)
        
        seniors_risk_result = db.execute(seniors_risk_query).fetchall()
        
        seniors_by_risk = {
            "high": [],
            "medium": [],
            "low": []
        }
        
        for senior in seniors_risk_result:
            seniors_by_risk[senior.risk_level].append({
                "id": senior.id,
                "name": senior.name,
                "age": senior.age,
                "scores": {
                    "nutrition": senior.nutrition_percentage or 0,
                    "hypertension": senior.hypertension_percentage or 0,
                    "depression": senior.depression_percentage or 0
                },
                "average_score": round((
                    (senior.nutrition_percentage or 0) +
                    (senior.hypertension_percentage or 0) +
                    (senior.depression_percentage or 0)
                ) / 3, 1)
            })
        
        # 최근 알림 및 피드백 요약
        recent_notifications = db.query(Notification).filter(
            Notification.created_at >= today
        ).count()
        
        pending_feedbacks = db.query(Feedback).filter(
            Feedback.status == "pending"
        ).count()
        
        # AI 리포트 생성 통계 (오늘)
        reports_with_categories = db.query(AIReport).filter(
            AIReport.created_at >= today,
            AIReport.category_details.isnot(None)
        ).count()
        
        return {
            "basic_statistics": {
                "total_users": total_users,
                "total_caregivers": total_caregivers,
                "total_guardians": total_guardians,
                "total_seniors": total_seniors,
                "today_sessions": today_sessions,
                "today_reports": today_reports,
                "recent_notifications": recent_notifications,
                "pending_feedbacks": pending_feedbacks,
                "enhanced_reports_today": reports_with_categories
            },
            "category_overview": category_overview,
            "seniors_risk_analysis": {
                "high_risk_count": len(seniors_by_risk["high"]),
                "medium_risk_count": len(seniors_by_risk["medium"]),
                "low_risk_count": len(seniors_by_risk["low"]),
                "seniors_by_risk": seniors_by_risk
            },
            "system_health": {
                "category_analysis_enabled": len(category_overview) > 0,
                "ai_enhancement_rate": round(reports_with_categories / today_reports * 100, 1) if today_reports > 0 else 0,
                "data_coverage": round(len(seniors_risk_result) / total_seniors * 100, 1) if total_seniors > 0 else 0
            },
            "dashboard_version": "enhanced_v1.0"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"향상된 대시보드 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/category-analysis-report")
async def get_category_analysis_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """카테고리별 분석 리포트 조회"""
    verify_admin_permission(current_user)
    
    try:
        # 기본 날짜 설정 (최근 4주)
        if not start_date:
            start_date = date.today() - timedelta(weeks=4)
        if not end_date:
            end_date = date.today()
        
        # 카테고리별 상세 분석 쿼리
        analysis_query_conditions = ["cta.analysis_date BETWEEN :start_date AND :end_date"]
        query_params = {"start_date": start_date, "end_date": end_date}
        
        if category:
            analysis_query_conditions.append("cta.category_name = :category")
            query_params["category"] = category
        
        where_clause = " AND ".join(analysis_query_conditions)
        
        detailed_analysis_query = text(f"""
            SELECT 
                cta.category_name,
                cta.analysis_date,
                cta.senior_id,
                s.name as senior_name,
                cta.current_score,
                cta.previous_score,
                cta.score_change,
                cta.trend_direction,
                cta.category_insights,
                cta.recommendations,
                cta.ui_data
            FROM category_trend_analysis cta
            JOIN seniors s ON cta.senior_id = s.id
            WHERE {where_clause}
            ORDER BY cta.category_name, cta.analysis_date DESC, cta.current_score ASC
        """)
        
        analysis_results = db.execute(detailed_analysis_query, query_params).fetchall()
        
        # 카테고리별 데이터 그룹화
        category_reports = {}
        
        for result in analysis_results:
            cat_name = result.category_name
            if cat_name not in category_reports:
                category_reports[cat_name] = {
                    "category_name": cat_name,
                    "analysis_period": {
                        "start_date": start_date,
                        "end_date": end_date
                    },
                    "summary_statistics": {
                        "total_seniors": 0,
                        "average_score": 0,
                        "score_range": {"min": 100, "max": 0},
                        "trend_distribution": {"improving": 0, "stable": 0, "declining": 0}
                    },
                    "detailed_analyses": [],
                    "key_insights": [],
                    "priority_recommendations": []
                }
            
            # 통계 업데이트
            cat_report = category_reports[cat_name]
            cat_report["summary_statistics"]["total_seniors"] += 1
            cat_report["summary_statistics"]["score_range"]["min"] = min(
                cat_report["summary_statistics"]["score_range"]["min"], 
                result.current_score
            )
            cat_report["summary_statistics"]["score_range"]["max"] = max(
                cat_report["summary_statistics"]["score_range"]["max"], 
                result.current_score
            )
            cat_report["summary_statistics"]["trend_distribution"][result.trend_direction] += 1
            
            # 상세 분석 데이터 추가
            cat_report["detailed_analyses"].append({
                "senior_id": result.senior_id,
                "senior_name": result.senior_name,
                "analysis_date": result.analysis_date,
                "current_score": result.current_score,
                "previous_score": result.previous_score,
                "score_change": result.score_change,
                "trend_direction": result.trend_direction,
                "insights": result.category_insights,
                "recommendations": result.recommendations
            })
            
            # 주요 인사이트 수집 (점수가 낮거나 하락 추세인 경우)
            if result.current_score < 70 or result.trend_direction == "declining":
                cat_report["key_insights"].append({
                    "senior_name": result.senior_name,
                    "issue": "주의 필요" if result.current_score < 70 else "하락 추세",
                    "score": result.current_score,
                    "insight": result.category_insights
                })
            
            # 우선순위 권장사항 수집
            if result.recommendations and (result.current_score < 80 or result.trend_direction == "declining"):
                cat_report["priority_recommendations"].append({
                    "senior_name": result.senior_name,
                    "priority": "high" if result.current_score < 60 else "medium",
                    "recommendation": result.recommendations
                })
        
        # 평균 점수 계산
        for cat_name, cat_report in category_reports.items():
            if cat_report["detailed_analyses"]:
                total_score = sum(analysis["current_score"] for analysis in cat_report["detailed_analyses"])
                cat_report["summary_statistics"]["average_score"] = round(
                    total_score / len(cat_report["detailed_analyses"]), 1
                )
        
        # 전체 요약 통계
        overall_summary = {
            "total_categories_analyzed": len(category_reports),
            "total_seniors_analyzed": len(set(result.senior_id for result in analysis_results)),
            "analysis_period_days": (end_date - start_date).days,
            "system_performance": {
                "data_completeness": round(len(analysis_results) / (len(category_reports) * 10) * 100, 1) if category_reports else 0,  # 가정: 카테고리당 평균 10개 분석
                "critical_cases": sum(1 for result in analysis_results if result.current_score < 60),
                "improving_cases": sum(1 for result in analysis_results if result.trend_direction == "improving")
            }
        }
        
        return {
            "overall_summary": overall_summary,
            "category_reports": category_reports,
            "analysis_metadata": {
                "generated_at": datetime.now().isoformat(),
                "query_parameters": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "category_filter": category
                },
                "report_version": "admin_v1.0"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"카테고리별 분석 리포트 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/notifications/send-enhanced-guardian")
async def send_enhanced_guardian_notification(
    notification_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """카테고리 정보 포함 가디언 알림 발송"""
    verify_admin_permission(current_user)
    
    try:
        senior_id = notification_data.get("senior_id")
        category_alerts = notification_data.get("category_alerts", {})  # 카테고리별 알림 정보
        priority = notification_data.get("priority", "normal")
        custom_message = notification_data.get("custom_message", "")
        
        # 시니어 및 가디언 정보 조회
        senior = db.query(Senior).filter(Senior.id == senior_id).first()
        if not senior or not senior.guardian_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 시니어의 가디언을 찾을 수 없습니다."
            )
        
        # 최신 카테고리 상태 조회
        category_status_query = text("""
            SELECT * FROM v_latest_category_status 
            WHERE senior_id = :senior_id
        """)
        
        category_status = db.execute(category_status_query, {"senior_id": senior_id}).fetchone()
        
        # 카테고리별 상태 분석
        category_summary = []
        alert_level = "normal"
        
        if category_status:
            categories = ["nutrition", "hypertension", "depression"]
            for category in categories:
                percentage = getattr(category_status, f"{category}_percentage", 0) or 0
                change_display = getattr(category_status, f"{category}_change_display", "0")
                
                if percentage < 60:
                    alert_level = "urgent"
                    category_summary.append(f"{category}: {percentage}% (주의 필요)")
                elif percentage < 80:
                    if alert_level == "normal":
                        alert_level = "medium"
                    category_summary.append(f"{category}: {percentage}% (관찰 필요)")
                else:
                    category_summary.append(f"{category}: {percentage}% (양호)")
        
        # 알림 제목 및 내용 생성
        if alert_level == "urgent":
            title = f"🚨 {senior.name}님 건강 상태 주의 필요"
            content = f"{senior.name}님의 건강 상태에 주의가 필요한 항목이 발견되었습니다.\n\n카테고리별 상태:\n" + "\n".join(category_summary)
        elif alert_level == "medium":
            title = f"⚠️ {senior.name}님 건강 상태 확인 권장"
            content = f"{senior.name}님의 일부 건강 항목에서 변화가 감지되었습니다.\n\n카테고리별 상태:\n" + "\n".join(category_summary)
        else:
            title = f"📊 {senior.name}님 주간 건강 리포트"
            content = f"{senior.name}님의 이번 주 건강 상태입니다.\n\n카테고리별 상태:\n" + "\n".join(category_summary)
        
        if custom_message:
            content += f"\n\n추가 메시지: {custom_message}"
        
        # 향상된 알림 데이터
        enhanced_data = {
            "senior_id": senior_id,
            "priority": alert_level,
            "category_alerts": category_alerts,
            "category_summary": category_summary,
            "notification_type": "enhanced_category_alert",
            "ui_enhancements": {
                "show_category_breakdown": True,
                "enable_quick_actions": True,
                "priority_level": alert_level
            }
        }
        
        # 알림 생성
        notification = Notification(
            sender_id=current_user.id,
            receiver_id=senior.guardian_id,
            type="enhanced_category_alert",
            title=title,
            content=content,
            data=enhanced_data
        )
        
        db.add(notification)
        db.commit()
        
        return {
            "status": "success",
            "message": "향상된 카테고리 알림이 전송되었습니다.",
            "notification_id": notification.id,
            "alert_level": alert_level,
            "category_summary": category_summary,
            "enhanced_features": {
                "category_breakdown": True,
                "priority_routing": True,
                "ui_enhancements": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"향상된 알림 전송 중 오류가 발생했습니다: {str(e)}"
        )
