# 테스트 계정 사용 가이드

이 문서는 개발 및 테스트를 위한 테스트 계정 사용법을 설명합니다.

## 🧪 테스트 계정 정보

### 📱 사용 가능한 테스트 계정

| 계정 타입 | ID | 비밀번호 | 설명 |
|-----------|----|----------|------|
| 케어기버 | CG001 | password123 | 케어기버 기능 테스트용 |
| 가디언 | GD001 | password123 | 가디언 기능 테스트용 |
| 관리자 | AD001 | admin123 | 관리자 기능 테스트용 |

## 🚀 테스트 방법

### 1. 테스트 로그인 화면 사용

`TestLoginScreen` 컴포넌트를 사용하여 쉽게 테스트 계정으로 로그인할 수 있습니다.

```typescript
import TestLoginScreen from '../components/TestLoginScreen';

// 앱에서 테스트 로그인 화면 표시
<TestLoginScreen />
```

### 2. API 연결 테스트

`ApiTestScreen` 컴포넌트를 사용하여 백엔드 API 연결 상태를 확인할 수 있습니다.

```typescript
import ApiTestScreen from '../components/ApiTestScreen';

// API 테스트 화면 표시
<ApiTestScreen />
```

### 3. 프로그래밍 방식으로 테스트

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { login } = useAuth();

  const testLogin = async () => {
    try {
      // 케어기버 계정으로 로그인
      const result = await login({
        email: 'CG001',
        password: 'password123'
      });
      
      console.log('로그인 성공:', result);
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <TouchableOpacity onPress={testLogin}>
      <Text>테스트 로그인</Text>
    </TouchableOpacity>
  );
};
```

## 🔧 API 테스트 유틸리티

### 전체 API 테스트 실행

```typescript
import { runApiTests } from '../utils/apiTester';

const testAllApis = async () => {
  const results = await runApiTests();
  console.log('테스트 결과:', results);
};
```

### 개별 API 테스트

```typescript
import { testSpecificApi } from '../utils/apiTester';

// 인증 API만 테스트
const authResult = await testSpecificApi('auth');

// 케어기버 API만 테스트
const caregiverResult = await testSpecificApi('caregiver');

// 가디언 API만 테스트
const guardianResult = await testSpecificApi('guardian');

// AI API만 테스트
const aiResult = await testSpecificApi('ai');
```

## 📋 테스트 시나리오

### 시나리오 1: 케어기버 기능 테스트

1. **로그인**: CG001 / password123
2. **홈 화면 조회**: 오늘의 돌봄 일정 확인
3. **출근 체크**: 위치 정보와 함께 출근 체크
4. **체크리스트 제출**: 돌봄 체크리스트 작성 및 제출
5. **돌봄노트 작성**: 돌봄 활동 기록 및 제출
6. **퇴근 체크**: 위치 정보와 함께 퇴근 체크

### 시나리오 2: 가디언 기능 테스트

1. **로그인**: GD001 / password123
2. **홈 화면 조회**: 어르신 목록 및 최근 리포트 확인
3. **리포트 목록 조회**: 생성된 리포트 목록 확인
4. **리포트 상세 조회**: 특정 리포트의 상세 내용 확인
5. **피드백 제출**: 리포트에 대한 피드백 작성 및 제출

### 시나리오 3: AI 리포트 기능 테스트

1. **로그인**: CG001 또는 GD001 계정 사용
2. **AI 리포트 생성 요청**: 일일/주간/월간 리포트 생성
3. **리포트 조회**: 생성된 리포트 확인
4. **체크리스트 분석**: AI를 통한 체크리스트 분석

## 🛠️ 개발 환경 설정

### 1. 백엔드 서버 URL 설정

`src/api/config.ts` 파일에서 백엔드 서버 URL을 설정하세요:

```typescript
export const API_BASE_URL = 'http://localhost:3000/api'; // 개발 환경
// export const API_BASE_URL = 'https://your-production-domain.com/api'; // 프로덕션 환경
```

### 2. 네트워크 설정

#### Android
`android/app/src/main/AndroidManifest.xml`에 네트워크 보안 설정 추가:

```xml
<application
  android:usesCleartextTraffic="true"
  ...>
```

#### iOS
`ios/Sinabro/Info.plist`에 ATS 설정 추가:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

## 🔍 문제 해결

### 일반적인 문제들

1. **네트워크 연결 실패**
   - 백엔드 서버가 실행 중인지 확인
   - API_BASE_URL이 올바른지 확인
   - 네트워크 보안 설정 확인

2. **인증 실패**
   - 테스트 계정 정보가 올바른지 확인
   - 백엔드에서 해당 계정이 등록되어 있는지 확인

3. **CORS 에러**
   - 백엔드에서 React Native 앱의 요청을 허용하도록 CORS 설정

4. **토큰 관련 문제**
   - AsyncStorage가 올바르게 설치되었는지 확인
   - 토큰 저장/조회 로직 확인

### 디버깅 팁

1. **콘솔 로그 확인**
   ```typescript
   console.log('API 요청:', requestData);
   console.log('API 응답:', responseData);
   ```

2. **네트워크 탭 확인**
   - 개발자 도구에서 네트워크 요청/응답 확인

3. **API 테스트 화면 사용**
   - `ApiTestScreen`을 통해 각 API 엔드포인트별로 테스트

## 📞 지원

테스트 중 문제가 발생하면:

1. 콘솔 로그 확인
2. API 테스트 화면에서 개별 API 테스트
3. 백엔드 개발자와 API 응답 형식 확인
4. 네트워크 연결 상태 확인

이제 테스트 계정을 사용하여 앱의 모든 기능을 테스트해보세요! 🚀 