import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from './config';
import { getToken, removeToken } from '../utils/tokenManager';

// axios 인스턴스 생성
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
  async (config) => {
    console.log('🚀 API 요청:', config.method?.toUpperCase(), config.url);
    
    // 토큰이 있으면 자동으로 헤더에 추가
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 토큰 자동 추가됨');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API 응답:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ 응답 오류:', error.response?.status, error.response?.data);
    
    // 401 Unauthorized 에러 시 토큰 삭제
    if (error.response?.status === 401) {
      console.log('🔐 인증 오류: 토큰 삭제');
      await removeToken();
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 