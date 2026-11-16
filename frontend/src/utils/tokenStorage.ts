import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// 토큰 저장
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
};

// 토큰 조회
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('토큰 조회 실패:', error);
    return null;
  }
};

// 토큰 삭제
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
    throw error;
  }
};

// 사용자 정보 저장
export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('사용자 정보 저장 실패:', error);
    throw error;
  }
};

// 사용자 정보 조회
export const getUser = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return null;
  }
};

// 사용자 정보 삭제
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('사용자 정보 삭제 실패:', error);
    throw error;
  }
};

// 로그아웃 (토큰과 사용자 정보 모두 삭제)
export const logout = async (): Promise<void> => {
  try {
    await Promise.all([removeToken(), removeUser()]);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
}; 