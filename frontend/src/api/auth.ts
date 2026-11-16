import axiosClient from './axiosClient';
import { API_ENDPOINTS } from './config';
import { saveUserData, getToken, removeToken } from '../utils/tokenManager';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/database';


// 로그인 API
export const loginWithAxios = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const backendResponse = response.data;
    
    // 토큰 저장
    // await saveToken(backendResponse.access_token);
    //
    const userData = {
      user_code: backendResponse.user_code,
      userType: backendResponse.user_type,
      name: `사용자_${backendResponse.user_code}`,
    };

    await saveUserData(userData);
    return backendResponse;
  } catch (error: any) {
    console.error('❌ 로그인 실패:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || error.message || '로그인에 실패했습니다.');
  }
};

// 토큰 검증 API
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    if (!token) {
      return false;
    }
    
    // 토큰이 있으면 유효하다고 가정 (실제로는 백엔드에서 검증)
    return true;
  } catch (error) {
    console.error('❌ 토큰 검증 실패:', error);
    return false;
  }
};

// 로그아웃
export const logout = async (): Promise<void> => {
  try {
    await removeToken();
    console.log('✅ 로그아웃 완료');
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    throw error;
  }
};

// 회원가입 API
export const register = async (userData: RegisterRequest) => {
  return axiosClient.post<RegisterResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    userData
  );
}; 