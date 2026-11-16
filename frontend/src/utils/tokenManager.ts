import AsyncStorage from '@react-native-async-storage/async-storage';

// 토큰 저장 키
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const USER_ROLE_KEY = 'user_role';

// 토큰 저장
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('✅ 토큰 저장 완료');
  } catch (error) {
    console.error('❌ 토큰 저장 실패:', error);
    throw error;
  }
};

// 토큰 조회
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('🔑 getToken:', token);
    return token;
  } catch (error) {
    console.error('❌ 토큰 조회 실패:', error);
    return null;
  }
};

// 토큰 삭제
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('✅ 토큰 삭제 완료');
  } catch (error) {
    console.error('❌ 토큰 삭제 실패:', error);
    throw error;
  }
};

// 사용자 역할 저장
export const saveUserRole = async (role: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_ROLE_KEY, role);
    console.log('✅ 사용자 역할 저장 완료:', role);
  } catch (error) {
    console.error('❌ 사용자 역할 저장 실패:', error);
    throw error;
  }
};

// 사용자 역할 조회
export const getUserRole = async (): Promise<string | null> => {
  try {
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);
    console.log('👤 getUserRole:', role);
    return role;
  } catch (error) {
    console.error('❌ 사용자 역할 조회 실패:', error);
    return null;
  }
};

// 사용자 역할 삭제
export const removeUserRole = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_ROLE_KEY);
    console.log('✅ 사용자 역할 삭제 완료');
  } catch (error) {
    console.error('❌ 사용자 역할 삭제 실패:', error);
    throw error;
  }
};

// 사용자 데이터 저장
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    console.log('✅ 사용자 데이터 저장 완료');
  } catch (error) {
    console.error('❌ 사용자 데이터 저장 실패:', error);
    throw error;
  }
};

// 사용자 데이터 조회
export const getUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ 사용자 데이터 조회 실패:', error);
    return null;
  }
};

// 사용자 데이터 삭제
export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    console.log('✅ 사용자 데이터 삭제 완료');
  } catch (error) {
    console.error('❌ 사용자 데이터 삭제 실패:', error);
    throw error;
  }
};

// 로그아웃 (토큰, 사용자 데이터, 역할 모두 삭제)
export const logout = async (): Promise<void> => {
  try {
    await Promise.all([removeToken(), removeUserData(), removeUserRole()]);
    console.log('✅ 로그아웃 완료');
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    throw error;
  }
};

// 토큰 유효성 검사 (간단한 형식 검사)
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // JWT 토큰은 3개의 부분으로 구성되어 있음 (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3;
  } catch (error) {
    return false;
  }
};

// 사용자 인증 상태 확인 (토큰과 역할 모두 있는지)
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const [token, role] = await Promise.all([getToken(), getUserRole()]);
    return !!(token && role);
  } catch (error) {
    console.error('❌ 인증 상태 확인 실패:', error);
    return false;
  }
};

// 사용자 역할 타입 정의
export type UserRole = 'caregiver' | 'guardian' | 'admin';

// 역할별 권한 확인 함수들
export const isCaregiver = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'caregiver';
};

export const isGuardian = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'guardian';
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'admin';
}; 