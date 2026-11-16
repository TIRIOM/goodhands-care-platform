import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 가디언 홈 화면 응답 타입
export interface GuardianHomeResponse {
  seniors: Array<{
    id: string;
    name: string;
    age: number;
    lastCareDate: string;
    nextSchedule: string;
    status: 'healthy' | 'attention' | 'warning';
  }>;
  recentReports: Array<{
    id: string;
    title: string;
    date: string;
    type: 'daily' | 'weekly' | 'monthly';
  }>;
  notifications: Array<{
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

// 리포트 목록 응답 타입
export interface ReportsResponse {
  reports: Array<{
    id: string;
    title: string;
    seniorName: string;
    date: string;
    type: 'daily' | 'weekly' | 'monthly';
    status: 'generated' | 'pending' | 'failed';
    summary?: string;
  }>;
  totalCount: number;
  hasMore: boolean;
}

// 피드백 제출 요청 타입
export interface FeedbackRequest {
  reportId: string;
  rating: number; // 1-5
  comment?: string;
  category: 'accuracy' | 'usefulness' | 'timeliness' | 'other';
}

// 가디언 홈 화면 조회
export const getGuardianHome = async (token: string) => {
  return apiClient.get<GuardianHomeResponse>(
    API_ENDPOINTS.GUARDIAN.HOME,
    token
  );
};

// 리포트 목록 조회
export const getReports = async (token: string, page: number = 1, limit: number = 10) => {
  const queryParams = `?page=${page}&limit=${limit}`;
  return apiClient.get<ReportsResponse>(
    `${API_ENDPOINTS.GUARDIAN.REPORTS}${queryParams}`,
    token
  );
};

// 피드백 제출
export const submitFeedback = async (data: FeedbackRequest, token: string) => {
  return apiClient.post(
    API_ENDPOINTS.GUARDIAN.FEEDBACK,
    data,
    token
  );
}; 