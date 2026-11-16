"""
Checklist Service for Sinabro API
체크리스트 템플릿 관련 비즈니스 로직
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional, List, Dict, Any
from uuid import UUID
import logging
import json

from models import ChecklistTemplate
from .base import BaseService

logger = logging.getLogger(__name__)


class ChecklistService(BaseService):
    """체크리스트 서비스"""
    
    def get_all_templates(self, category: Optional[str] = None, is_active: bool = True) -> Dict[str, Any]:
        """
        체크리스트 템플릿 목록 조회
        
        Args:
            category: 카테고리 필터 (선택사항)
            is_active: 활성 상태 필터
            
        Returns:
            Dict containing list of checklist templates
        """
        try:
            query = self.db.query(ChecklistTemplate)
            
            # checklist_templates 테이블에는 활성 여부 컬럼이 없어 모든 템플릿을 활성으로 봅니다.
            
            # 카테고리 필터링
            if category:
                query = query.filter(ChecklistTemplate.category == category)
            
            # 생성일 순으로 정렬
            templates = query.order_by(ChecklistTemplate.created_at.desc()).all()
            
            # 템플릿 정보를 딕셔너리로 변환
            templates_data = []
            for template in templates:
                # JSON 형태의 template_items 파싱
                items = []
                if template.items:
                    try:
                        items_data = json.loads(template.items) if isinstance(template.items, str) else template.items
                        if isinstance(items_data, dict) and "items" in items_data:
                            items = items_data["items"]
                        elif isinstance(items_data, list):
                            items = items_data
                    except (json.JSONDecodeError, TypeError) as e:
                        logger.warning(f"Failed to parse items for template {template.id}: {str(e)}")
                        items = []
                
                template_data = {
                    "id": str(template.id),
                    "name": template.name,
                    "category": template.category,
                    "items": items,
                    "is_active": True,
                    "created_at": template.created_at.isoformat() if template.created_at else None
                }
                templates_data.append(template_data)
            
            return self.create_response(
                message=f"{len(templates_data)}개의 체크리스트 템플릿을 성공적으로 조회했습니다.",
                data=templates_data
            )
            
        except SQLAlchemyError as e:
            return self.handle_db_error(e, "get all templates")
        except Exception as e:
            logger.error(f"Unexpected error in get_all_templates: {str(e)}")
            return self.create_error_response(
                message="서버 오류가 발생했습니다.",
                error_code="INTERNAL_ERROR"
            )
    
    def get_template_by_id(self, template_id: UUID) -> Dict[str, Any]:
        """
        체크리스트 템플릿 ID로 상세 정보 조회
        
        Args:
            template_id: 템플릿 ID
            
        Returns:
            Dict containing template detailed info
        """
        try:
            template = self.db.query(ChecklistTemplate).filter(
                ChecklistTemplate.id == template_id
            ).first()
            
            if not template:
                return self.create_error_response(
                    message="체크리스트 템플릿을 찾을 수 없습니다.",
                    error_code="TEMPLATE_NOT_FOUND"
                )
            
            # JSON 형태의 template_items 파싱
            items = []
            if template.items:
                try:
                    items_data = json.loads(template.items) if isinstance(template.items, str) else template.items
                    if isinstance(items_data, dict) and "items" in items_data:
                        items = items_data["items"]
                    elif isinstance(items_data, list):
                        items = items_data
                except (json.JSONDecodeError, TypeError) as e:
                    logger.warning(f"Failed to parse items for template {template.id}: {str(e)}")
                    items = []
            
            template_data = {
                "id": str(template.id),
                "name": template.name,
                "category": template.category,
                "items": items,
                "is_active": True,
                "created_at": template.created_at.isoformat() if template.created_at else None
            }
            
            return self.create_response(
                message="체크리스트 템플릿을 성공적으로 조회했습니다.",
                data=template_data
            )
            
        except SQLAlchemyError as e:
            return self.handle_db_error(e, "get template by id")
        except Exception as e:
            logger.error(f"Unexpected error in get_template_by_id: {str(e)}")
            return self.create_error_response(
                message="서버 오류가 발생했습니다.",
                error_code="INTERNAL_ERROR"
            )
    
    def get_templates_by_category(self, category: str) -> Dict[str, Any]:
        """
        카테고리별 체크리스트 템플릿 조회
        
        Args:
            category: 카테고리명
            
        Returns:
            Dict containing templates for the category
        """
        return self.get_all_templates(category=category, is_active=True)
