"""
로컬 개발용 DB 초기화 스크립트.

빈 MariaDB에 대해 한 번 실행하면 앱이 쓰는 테이블·뷰와 시연용 데이터가 모두 준비됩니다.
여러 번 실행해도 이미 있는 데이터는 건너뜁니다.

    DATABASE_URL=mysql+pymysql://goodhands:goodhands@127.0.0.1:3306/goodhands python init_db.py
"""
from datetime import date, time, timedelta
from pathlib import Path

from sqlalchemy import text

from app.database import Base, SessionLocal, engine
from app.models import *  # noqa: F401,F403 - 모든 모델을 메타데이터에 등록
from app.models import Senior, SeniorDisease, User

import seed_data
import seed_data_v2

EXTRA_SCHEMA = Path(__file__).parent / "database" / "schema_extra.sql"


def run_sql_file(path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    # 주석 줄을 지우고 세미콜론 단위로 실행
    body = "\n".join(line for line in sql.splitlines() if not line.strip().startswith("--"))
    with engine.begin() as conn:
        for stmt in body.split(";"):
            if stmt.strip():
                conn.execute(text(stmt))


def seed_demo_data() -> None:
    """화면 시연용 추가 데이터: 시니어 2명, 오늘·이번 주 돌봄 일정, 카테고리 추이."""
    db = SessionLocal()
    try:
        first = db.query(Senior).order_by(Senior.id).first()
        if first is None:
            return

        if db.query(Senior).count() == 1:
            for name, age, gender, diseases in [
                ("김할아버지", 84, "남성", [("고혈압", "중등도"), ("관절염", "경증")]),
                ("최할머니", 77, "여성", [("우울증", "경증")]),
            ]:
                s = Senior(
                    name=name, age=age, gender=gender,
                    nursing_home_id=first.nursing_home_id,
                    caregiver_id=first.caregiver_id,
                    guardian_id=first.guardian_id,
                )
                db.add(s)
                db.flush()
                for disease, severity in diseases:
                    db.add(SeniorDisease(senior_id=s.id, disease_type=disease, severity=severity))
            db.commit()

        seniors = db.query(Senior).order_by(Senior.id).all()
        today = date.today()

        has_calendar = db.execute(text("SELECT COUNT(*) FROM care_calendar")).scalar()
        if not has_calendar:
            slots = [(time(9, 0), time(11, 0)), (time(13, 0), time(15, 0)), (time(16, 0), time(18, 0))]
            for day_offset in range(-7, 8):
                care_date = today + timedelta(days=day_offset)
                for senior, (start, end) in zip(seniors, slots):
                    status = "completed" if day_offset < 0 else "scheduled"
                    db.execute(
                        text(
                            "INSERT INTO care_calendar (senior_id, caregiver_id, care_date, start_time, end_time, status) "
                            "VALUES (:sid, :cid, :d, :st, :et, :status)"
                        ),
                        {"sid": senior.id, "cid": senior.caregiver_id, "d": care_date,
                         "st": start, "et": end, "status": status},
                    )
            db.commit()

        has_trend = db.execute(text("SELECT COUNT(*) FROM category_trend_analysis")).scalar()
        if not has_trend:
            profiles = {
                "nutrition": [(72, "green", "happy", "식사량이 안정적으로 유지되고 있어요")],
                "hypertension": [(64, "blue", "worried", "혈압 변동이 있어 관찰이 필요해요")],
                "depression": [(81, "green", "happy", "기분이 밝고 대화에 적극적이에요")],
            }
            for senior in seniors:
                for code, [(score, color, emotion, message)] in profiles.items():
                    for week in range(4, -1, -1):
                        current = score - week * 2 + (senior.id % 3)
                        previous = current - 2 if week < 4 else None
                        db.execute(
                            text(
                                "INSERT INTO category_trend_analysis (senior_id, category_code, analysis_date, "
                                "current_score, previous_score, change_amount, change_direction, status_level, "
                                "avatar_emotion, avatar_color, status_message, category_name, trend_direction, "
                                "score_change) VALUES "
                                "(:sid, :code, :d, :cur, :prev, :chg, :dir, :lvl, :emo, :color, :msg, :code, :trend, :chg)"
                            ),
                            {"sid": senior.id, "code": code, "d": today - timedelta(weeks=week),
                             "cur": current, "prev": previous,
                             "chg": (current - previous) if previous is not None else 0,
                             "dir": "up" if previous is not None else "stable",
                             "lvl": "good" if current >= 70 else "caution",
                             "emo": emotion, "color": color, "msg": message,
                             "trend": "improving" if previous is not None else "stable"},
                        )
            db.commit()
    finally:
        db.close()


def main() -> None:
    print("1/4 ORM 테이블 생성")
    Base.metadata.create_all(bind=engine)

    print("2/4 기본 계정·시니어 시드")
    db = SessionLocal()
    try:
        has_users = db.query(User).count() > 0
    finally:
        db.close()
    if not has_users:
        seed_data.create_seed_data()
    seed_data_v2.create_v2_seed_data()

    print("3/4 raw SQL용 테이블·뷰 생성")
    run_sql_file(EXTRA_SCHEMA)

    print("4/4 시연용 데이터")
    seed_demo_data()
    print("완료")


if __name__ == "__main__":
    main()
