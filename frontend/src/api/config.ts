// API 설정
// 서버 주소. Android 에뮬레이터에서 10.0.2.2는 개발 PC의 localhost입니다.
// 실제 기기나 다른 서버로 붙을 때는 이 값을 바꾸세요.
export const API_BASE_URL = 'http://10.0.2.2:10007/api';

// 카카오 로컬 API REST 키 (좌표→주소 변환). 비워 두면 주소 대신 좌표를 표시합니다.
// 키는 저장소에 커밋하지 마세요.
export const KAKAO_REST_API_KEY = '';

// 백엔드 API 사용 여부
export const USE_BACKEND_API = true; // 백엔드 API 사용

// API 엔드포인트
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
  },
  CAREGIVER: {
    HOME: '/caregiver/home',
    SENIORS: '/caregiver/seniors',
    CHECK_IN: '/caregiver/attendance/checkin',
    CHECK_OUT: '/caregiver/attendance/checkout',
    CHECKLIST: '/caregiver/checklist',
    CARE_NOTE: '/caregiver/care-note',
    CARE_SCHEDULE: '/caregiver/care-schedule/{senior_id}',
  },
  GUARDIAN: {
    HOME: '/guardian/home',
    SENIORS: '/guardian/seniors',
    REPORTS: '/guardian/reports',
    FEEDBACK: '/guardian/feedback',
  },
  AI: {
    GENERATE_REPORT: '/ai/generate-report',
    ANALYZE_CHECKLIST: '/ai/analyze-checklist',
  },
  SESSIONS: {
    CREATE: '/sessions/create',
    UPDATE: '/sessions/update',
    DELETE: '/sessions/delete',
  },
  NOTIFICATIONS: {
    LIST: '/notifications/list',
    MARK_READ: '/notifications/mark-read',
  },
};

// 기본 헤더 설정
export const getDefaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 