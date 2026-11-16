# 🏥 Good Hands Backend API

재외동포 케어 서비스 백엔드 API 서버

## 📋 프로젝트 개요

Good Hands는 해외 거주 재외동포를 한국으로 데려와 요양원·병원 연결 및 케어기버를 통한 지속적 돌봄 서비스를 제공하고, 이를 가디언(재외동포 자녀)에게 실시간으로 전달하는 통합 케어 플랫폼입니다.

## 🛠️ 기술 스택

- **Framework**: FastAPI 0.116.0
- **Language**: Python 3.13
- **Database**: MariaDB 
- **ORM**: SQLAlchemy 2.0.41
- **Authentication**: JWT (python-jose)
- **Migration**: Alembic 1.16.4
- **Container**: Docker
- **API Documentation**: Swagger UI (자동 생성)

## 👥 사용자 구성

- **케어기버**: 실제 돌봄 서비스 제공자
- **가디언**: 재외동포 자녀(보호자)
- **시니어**: 돌봄을 받는 어르신
- **관리자**: 서비스 전반 관리

## 🚀 주요 기능

### ✅ 완료된 기능

#### 1. 인증 시스템
- JWT 토큰 기반 인증
- 사용자 타입별 권한 관리 (케어기버/가디언/관리자)
- 회원코드 기반 로그인 시스템

#### 2. 케어기버 기능
- 출근/퇴근 체크 시스템
- 질병별 맞춤형 체크리스트
- 6개 핵심 질문 돌봄노트
- 담당 시니어 관리
- 돌봄 세션 관리

#### 3. 가디언 기능
- AI 리포트 조회
- 케어기버 피드백 전송
- 실시간 알림 수신

#### 4. AI 시스템
- 자동 리포트 생성 (체크리스트 + 돌봄노트 기반)
- 키워드 추출
- 맞춤형 분석 및 AI 코멘트 생성

#### 5. 관리자 기능
- 사용자 사전 등록 시스템
- 시니어-케어기버-가디언 매핑
- 시스템 전반 관리 및 모니터링

## 🗄️ 데이터베이스 구조

### 핵심 테이블
- **users**: 기본 인증 정보
- **caregivers**: 케어기버 프로필
- **guardians**: 가디언 프로필
- **seniors**: 시니어 기본 정보
- **care_sessions**: 돌봄 세션
- **attendance_logs**: 출근/퇴근 로그
- **checklist_responses**: 체크리스트 응답
- **care_notes**: 돌봄노트
- **ai_reports**: AI 리포트
- **notifications**: 알림

## 🔧 설치 및 실행

### 로컬 개발 환경

1. **레포지토리 클론**
```bash
git clone https://github.com/YOUR_USERNAME/goodhands_backend.git
cd goodhands_backend
```

2. **가상환경 생성 및 활성화**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **의존성 설치**
```bash
pip install -r requirements.txt
```

4. **환경 설정**
```bash
cp .env.example .env
# .env 파일에서 데이터베이스 연결 정보 수정
```

5. **데이터베이스 초기화**
```bash
python -c "from app.database import Base, engine; from app.models import *; Base.metadata.create_all(bind=engine)"
python seed_data.py
```

6. **서버 실행**
```bash
python -m uvicorn app.main:app --reload
```

### Docker 실행

```bash
docker build -t goodhands-backend .
docker run -p 8000:8000 goodhands-backend
```

## 📚 API 문서

서버 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입 (관리자용)

### 케어기버
- `GET /api/caregiver/home` - 홈 화면 데이터
- `POST /api/caregiver/attendance/checkin` - 출근 체크
- `POST /api/caregiver/attendance/checkout` - 퇴근 체크
- `POST /api/caregiver/checklist` - 체크리스트 제출
- `POST /api/caregiver/care-note` - 돌봄노트 제출

### 가디언
- `GET /api/guardian/home` - 홈 화면 데이터
- `GET /api/guardian/reports` - AI 리포트 목록
- `POST /api/guardian/feedback` - 피드백 전송

### AI
- `POST /api/ai/generate-report` - AI 리포트 생성
- `GET /api/ai/reports/{id}` - 리포트 조회

## 🧪 테스트

### 테스트 계정
- **케어기버**: CG001 / password123
- **가디언**: GD001 / password123
- **관리자**: AD001 / admin123

### API 테스트
```bash
python test_api.py
```

## 🚀 배포

### 운영 서버 정보
- **도메인**: 운영 당시 사내 서버 (현재 비공개)
- **Docker Hub**: qwert884/goodhands-backend

### 배포 방법
```bash
# Docker 이미지 빌드
docker build -t qwert884/goodhands-backend:1.4.0 .

# Docker Hub 업로드
docker push qwert884/goodhands-backend:1.4.0

# 서버 배포 (서버에서 실행)
docker pull qwert884/goodhands-backend:1.4.0
docker run -d --name goodhands-api -p 10007:10007 qwert884/goodhands-backend:1.4.0
```

## 📊 프로젝트 구조

```
goodhands_backend/
├── app/
│   ├── models/          # SQLAlchemy 모델
│   ├── routers/         # FastAPI 라우터
│   ├── schemas/         # Pydantic 스키마
│   ├── services/        # 비즈니스 로직
│   ├── config.py        # 설정
│   ├── database.py      # 데이터베이스 연결
│   └── main.py          # 메인 애플리케이션
├── alembic/             # DB 마이그레이션
├── requirements.txt     # Python 의존성
├── Dockerfile          # Docker 설정
└── README.md           # 프로젝트 문서
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 연락처

프로젝트 관련 문의: goodhands@example.com

Project Link: [https://github.com/YOUR_USERNAME/goodhands_backend](https://github.com/YOUR_USERNAME/goodhands_backend)
