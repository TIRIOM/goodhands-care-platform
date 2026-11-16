// // 백엔드 500 에러 진단 스크립트
// const axios = require('axios');
//
// const BASE_URL = 'http://10.0.2.2:8000/api';
//
// async function testBackend() {
//   console.log('🔍 백엔드 API 테스트 시작...\n');
//
//   try {
//     // 1. 서버 연결 테스트
//     console.log('1️⃣ 서버 연결 테스트...');
//     const healthResponse = await axios.get('http://10.0.2.2:8000/');
//     console.log('✅ 서버 연결 성공:', healthResponse.status);
//     console.log('📄 응답:', healthResponse.data);
//     console.log('');
//
//   } catch (error) {
//     console.log('❌ 서버 연결 실패:', error.message);
//     return;
//   }
//
//   try {
//     // 2. 로그인 API 테스트
//     console.log('2️⃣ 로그인 API 테스트...');
//     const loginData = {
//       user_code: 'CG001',
//       password: 'password123'
//     };
//
//     console.log('📤 요청 데이터:', loginData);
//     console.log('🌐 요청 URL:', `${BASE_URL}/auth/login`);
//
//     const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData, {
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000
//     });
//
//     console.log('✅ 로그인 성공:', loginResponse.status);
//     console.log('📄 응답:', loginResponse.data);
//
//   } catch (error) {
//     console.log('❌ 로그인 실패:');
//     console.log('   상태 코드:', error.response?.status);
//     console.log('   상태 메시지:', error.response?.statusText);
//     console.log('   응답 데이터:', error.response?.data);
//     console.log('   에러 메시지:', error.message);
//
//     if (error.response?.status === 500) {
//       console.log('\n🔧 500 에러 원인 분석:');
//       console.log('   • 서버 내부 오류');
//       console.log('   • 데이터베이스 연결 문제');
//       console.log('   • 코드 실행 오류');
//       console.log('   • 백엔드 로그 확인 필요');
//       console.log('\n💡 해결 방법:');
//       console.log('   1. 백엔드 서버 로그 확인');
//       console.log('   2. 데이터베이스 연결 상태 확인');
//       console.log('   3. 테스트 계정이 데이터베이스에 존재하는지 확인');
//     }
//   }
//
//   try {
//     // 3. 다른 계정으로 테스트
//     console.log('\n3️⃣ 다른 계정 테스트...');
//     const testAccounts = [
//       { user_code: 'GD001', password: 'password123' },
//       { user_code: 'AD001', password: 'admin123' },
//       { user_code: 'caregiver001', password: 'password123' }
//     ];
//
//     for (const account of testAccounts) {
//       try {
//         console.log(`   테스트: ${account.user_code}`);
//         const response = await axios.post(`${BASE_URL}/auth/login`, account, {
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           timeout: 5000
//         });
//         console.log(`   ✅ 성공: ${account.user_code}`);
//       } catch (error) {
//         console.log(`   ❌ 실패: ${account.user_code} - ${error.response?.status || '네트워크 오류'}`);
//       }
//     }
//
//   } catch (error) {
//     console.log('❌ 계정 테스트 실패:', error.message);
//   }
// }
//
// testBackend();