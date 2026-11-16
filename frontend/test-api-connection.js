// 백엔드 API 연결 테스트 스크립트
const API_BASE_URL = 'http://localhost:8000/api';

// 테스트 계정 정보
const testAccounts = [
  { id: 'CG001', password: 'password123', type: '케어기버' },
  { id: 'GD001', password: 'password123', type: '가디언' },
  { id: 'AD001', password: 'admin123', type: '관리자' }
];

// API 요청 헬퍼 함수
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      error: !response.ok ? data.message || 'Unknown error' : null
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: null,
      error: error.message
    };
  }
}

// 서버 연결 테스트
async function testServerConnection() {
  console.log('🔍 서버 연결 테스트 중...');
  
  try {
    const response = await fetch('http://localhost:8000/');
    if (response.ok) {
      console.log('✅ 서버 연결 성공');
      return true;
    } else {
      console.log('❌ 서버 연결 실패:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ 서버 연결 실패:', error.message);
    return false;
  }
}

// 인증 API 테스트
async function testAuthAPI() {
  console.log('\n🔐 인증 API 테스트 중...');
  
  for (const account of testAccounts) {
    console.log(`\n테스트 계정: ${account.type} (${account.id})`);
    
    const result = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: account.id,
        password: account.password
      })
    });
    
    if (result.success) {
      console.log('✅ 로그인 성공');
      console.log('토큰:', result.data.token ? '발급됨' : '없음');
      console.log('사용자 정보:', result.data.user);
      
      // 토큰이 있으면 다른 API도 테스트
      if (result.data.token) {
        await testOtherAPIs(result.data.token, account.type);
      }
    } else {
      console.log('❌ 로그인 실패:', result.error);
    }
  }
}

// 다른 API 테스트
async function testOtherAPIs(token, userType) {
  console.log(`\n📱 ${userType} API 테스트 중...`);
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  if (userType === '케어기버') {
    // 케어기버 홈 API 테스트
    const homeResult = await makeRequest('/caregiver/home', { headers });
    console.log('홈 API:', homeResult.success ? '✅ 성공' : '❌ 실패');
    
    // 출근 체크 API 테스트
    const checkInResult = await makeRequest('/caregiver/attendance/checkin', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        location: { latitude: 37.5665, longitude: 126.9780 },
        timestamp: new Date().toISOString()
      })
    });
    console.log('출근 체크:', checkInResult.success ? '✅ 성공' : '❌ 실패');
    
  } else if (userType === '가디언') {
    // 가디언 홈 API 테스트
    const homeResult = await makeRequest('/guardian/home', { headers });
    console.log('홈 API:', homeResult.success ? '✅ 성공' : '❌ 실패');
    
    // 리포트 목록 API 테스트
    const reportsResult = await makeRequest('/guardian/reports', { headers });
    console.log('리포트 목록:', reportsResult.success ? '✅ 성공' : '❌ 실패');
  }
}

// AI API 테스트
async function testAIAPI() {
  console.log('\n🤖 AI API 테스트 중...');
  
  // 먼저 로그인해서 토큰 얻기
  const loginResult = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'CG001',
      password: 'password123'
    })
  });
  
  if (loginResult.success && loginResult.data.token) {
    const headers = {
      'Authorization': `Bearer ${loginResult.data.token}`
    };
    
    // AI 리포트 생성 API 테스트
    const aiResult = await makeRequest('/ai/generate-report', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        seniorId: 'test-senior-123',
        reportType: 'daily',
        dateRange: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        includeChecklist: true,
        includeCareNotes: true
      })
    });
    
    console.log('AI 리포트 생성:', aiResult.success ? '✅ 성공' : '❌ 실패');
    if (aiResult.success) {
      console.log('리포트 ID:', aiResult.data.reportId);
    }
  }
}

// 메인 테스트 함수
async function runAllTests() {
  console.log('🚀 백엔드 API 연결 테스트 시작\n');
  
  // 1. 서버 연결 테스트
  const serverConnected = await testServerConnection();
  
  if (!serverConnected) {
    console.log('\n❌ 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    return;
  }
  
  // 2. 인증 API 테스트
  await testAuthAPI();
  
  // 3. AI API 테스트
  await testAIAPI();
  
  console.log('\n🎉 모든 테스트 완료!');
}

// 테스트 실행
runAllTests().catch(console.error); 