// 토큰 문제 진단 스크립트
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function debugTokenIssue() {
  console.log('🔍 토큰 문제 진단 시작...\n');
  
  try {
    // 1. 로그인하여 토큰 받기
    console.log('1️⃣ 로그인 시도...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      user_code: 'CG001',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ 로그인 성공');
    console.log('🔐 받은 토큰:', token);
    console.log('📏 토큰 길이:', token.length);
    console.log('');
    
    // 2. 토큰으로 API 호출 테스트
    console.log('2️⃣ 토큰으로 API 호출 테스트...');
    
    const testEndpoints = [
      '/caregiver/home',
      '/guardian/home',
      '/admin/dashboard'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 테스트: ${endpoint}`);
        
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        console.log(`✅ 성공 (${response.status}): ${endpoint}`);
        console.log('📄 응답:', JSON.stringify(response.data, null, 2));
        console.log('');
        
      } catch (error) {
        console.log(`❌ 실패: ${endpoint}`);
        console.log('   상태 코드:', error.response?.status);
        console.log('   에러 메시지:', error.response?.data?.detail || error.message);
        console.log('   요청 헤더:', error.config?.headers);
        console.log('');
      }
    }
    
    // 3. 토큰 없이 API 호출 테스트
    console.log('3️⃣ 토큰 없이 API 호출 테스트...');
    
    try {
      const response = await axios.get(`${BASE_URL}/caregiver/home`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log('✅ 토큰 없이도 성공 (이상함)');
      console.log('📄 응답:', response.data);
      
    } catch (error) {
      console.log('❌ 토큰 없이 실패 (정상)');
      console.log('   상태 코드:', error.response?.status);
      console.log('   에러 메시지:', error.response?.data?.detail || error.message);
    }
    
    // 4. 잘못된 토큰으로 테스트
    console.log('\n4️⃣ 잘못된 토큰으로 테스트...');
    
    const wrongTokens = [
      'invalid_token',
      'Bearer invalid_token',
      'test_token_12345',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    ];
    
    for (const wrongToken of wrongTokens) {
      try {
        console.log(`🔍 테스트: ${wrongToken.substring(0, 20)}...`);
        
        const response = await axios.get(`${BASE_URL}/caregiver/home`, {
          headers: {
            'Authorization': `Bearer ${wrongToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        console.log(`✅ 성공 (이상함): ${wrongToken.substring(0, 20)}...`);
        
      } catch (error) {
        console.log(`❌ 실패 (정상): ${wrongToken.substring(0, 20)}...`);
        console.log('   상태 코드:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.log('❌ 로그인 실패:', error.response?.data || error.message);
  }
  
  console.log('\n💡 진단 결과:');
  console.log('1. 백엔드에서 토큰 검증이 제대로 작동하지 않을 수 있음');
  console.log('2. 임시 토큰 "test_token_12345..."가 실제로 검증되지 않음');
  console.log('3. 백엔드 개발자에게 토큰 검증 로직 확인 요청 필요');
}

// 스크립트 실행
debugTokenIssue().catch(console.error); 