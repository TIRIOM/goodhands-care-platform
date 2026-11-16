# API 연결 가이드

이 문서는 React Native 앱과 백엔드 API를 연결하는 방법을 설명합니다.

## 📁 프로젝트 구조

```
src/
├── api/
│   ├── config.ts          # API 기본 설정
│   ├── client.ts          # API 클라이언트
│   ├── auth.ts            # 인증 관련 API
│   ├── caregiver.ts       # 케어기버 관련 API
│   ├── guardian.ts        # 가디언 관련 API
│   ├── ai.ts              # AI 리포트 관련 API
│   └── index.ts           # 모든 API export
├── hooks/
│   ├── useAuth.ts         # 인증 관련 훅
│   ├── useCaregiver.ts    # 케어기버 관련 훅
│   └── index.ts           # 모든 훅 export
├── utils/
│   └── tokenStorage.ts    # 토큰 관리 유틸리티
└── components/
    └── LoginScreen.tsx    # 로그인 화면 예시
```

## 🔧 설정

### 1. API 기본 설정 (`src/api/config.ts`)

```typescript
export const API_BASE_URL = 'http://localhost:3000/api'; // 개발 환경
// export const API_BASE_URL = 'https://your-production-domain.com/api'; // 프로덕션 환경
```

백엔드 서버의 실제 URL로 변경하세요.

### 2. 필요한 패키지 설치

```bash
npm install @react-native-async-storage/async-storage
```

## 📱 API 엔드포인트

### 🔐 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 👨‍⚕️ 케어기버
- `GET /api/caregiver/home` - 홈 화면
- `POST /api/caregiver/attendance/checkin` - 출근 체크
- `POST /api/caregiver/attendance/checkout` - 퇴근 체크
- `POST /api/caregiver/checklist` - 체크리스트 제출
- `POST /api/caregiver/care-note` - 돌봄노트 제출

### 👨‍👩‍👧‍👦 가디언
- `GET /api/guardian/home` - 홈 화면
- `GET /api/guardian/reports` - 리포트 목록
- `POST /api/guardian/feedback` - 피드백 제출

### 🤖 AI 리포트
- `POST /api/ai/generate-report` - AI 리포트 생성
- `GET /api/ai/reports/{report_id}` - 리포트 조회
- `POST /api/ai/analyze-checklist` - 체크리스트 분석

## 🚀 사용 방법

### 1. 인증 (로그인/회원가입)

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { login, register, logout, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await login({
        email: 'user@example.com',
        password: 'password123'
      });
      console.log('로그인 성공:', result);
    } catch (err) {
      console.error('로그인 실패:', err);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin} disabled={loading}>
      <Text>{loading ? '로그인 중...' : '로그인'}</Text>
    </TouchableOpacity>
  );
};
```

### 2. 케어기버 기능

```typescript
import { useCaregiver } from '../hooks/useCaregiver';

const CaregiverScreen = () => {
  const { 
    getHomeData, 
    handleCheckIn, 
    handleCheckOut, 
    handleSubmitChecklist,
    handleSubmitCareNote,
    loading, 
    error 
  } = useCaregiver();

  // 홈 데이터 조회
  const loadHomeData = async () => {
    try {
      const data = await getHomeData();
      console.log('홈 데이터:', data);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    }
  };

  // 출근 체크
  const checkIn = async () => {
    try {
      await handleCheckIn({
        location: { latitude: 37.5665, longitude: 126.9780 },
        timestamp: new Date().toISOString()
      });
      console.log('출근 체크 완료');
    } catch (err) {
      console.error('출근 체크 실패:', err);
    }
  };

  // 체크리스트 제출
  const submitChecklist = async () => {
    try {
      await handleSubmitChecklist({
        seniorId: 'senior123',
        checklistItems: [
          { itemId: 'item1', completed: true, notes: '완료' },
          { itemId: 'item2', completed: false, notes: '미완료' }
        ],
        timestamp: new Date().toISOString()
      });
      console.log('체크리스트 제출 완료');
    } catch (err) {
      console.error('체크리스트 제출 실패:', err);
    }
  };
};
```

### 3. 가디언 기능

```typescript
import { getGuardianHome, getReports, submitFeedback } from '../api/guardian';
import { getToken } from '../utils/tokenStorage';

const GuardianScreen = () => {
  const loadGuardianData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const homeData = await getGuardianHome(token);
      const reports = await getReports(token, 1, 10);
      
      console.log('가디언 홈 데이터:', homeData);
      console.log('리포트 목록:', reports);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    }
  };
};
```

### 4. AI 리포트 기능

```typescript
import { generateReport, getReport, analyzeChecklist } from '../api/ai';
import { getToken } from '../utils/tokenStorage';

const AIReportScreen = () => {
  const createReport = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const result = await generateReport({
        seniorId: 'senior123',
        reportType: 'daily',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-01'
        },
        includeChecklist: true,
        includeCareNotes: true
      }, token);

      console.log('리포트 생성 요청:', result);
    } catch (err) {
      console.error('리포트 생성 실패:', err);
    }
  };
};
```

## 🔒 토큰 관리

토큰은 AsyncStorage에 자동으로 저장되고 관리됩니다.

```typescript
import { getToken, saveToken, removeToken } from '../utils/tokenStorage';

// 토큰 조회
const token = await getToken();

// 토큰 저장 (로그인 시 자동으로 처리됨)
await saveToken('your-jwt-token');

// 토큰 삭제 (로그아웃 시 자동으로 처리됨)
await removeToken();
```

## 🛠️ 에러 처리

모든 API 호출은 자동으로 에러를 처리합니다:

```typescript
const { login, error } = useAuth();

// error 상태를 통해 에러 메시지를 표시할 수 있습니다
if (error) {
  console.error('에러 발생:', error);
}
```

## 📝 백엔드 연결 시 주의사항

1. **CORS 설정**: 백엔드에서 React Native 앱의 요청을 허용하도록 CORS를 설정해야 합니다.

2. **네트워크 보안**: Android에서는 `android/app/src/main/AndroidManifest.xml`에 네트워크 보안 설정이 필요할 수 있습니다.

3. **iOS 네트워크 보안**: iOS에서는 `Info.plist`에 ATS(App Transport Security) 설정이 필요할 수 있습니다.

4. **API 응답 형식**: 백엔드 API는 다음과 같은 형식으로 응답해야 합니다:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "성공 메시지"
   }
   ```

## 🔄 백엔드 개발자와의 협업

1. API 스펙 문서를 공유하세요
2. 요청/응답 형식을 맞춰주세요
3. 에러 코드와 메시지를 표준화하세요
4. 인증 방식(JWT 토큰)을 확인하세요

이제 백엔드 개발자와 함께 API 엔드포인트를 구현하고 테스트해보세요! 