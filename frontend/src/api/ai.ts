import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// AI 리포트 생성 요청 타입
export interface GenerateReportRequest {
  seniorId: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  includeChecklist: boolean;
  includeCareNotes: boolean;
}

// AI 리포트 생성 응답 타입
export interface GenerateReportResponse {
  reportId: string;
  status: 'generating' | 'completed' | 'failed';
  estimatedCompletionTime?: string;
  message?: string;
}

// AI 리포트 조회 응답 타입
export interface ReportDetailResponse {
  id: string;
  title: string;
  seniorName: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  content: {
    summary: string;
    healthStatus: {
      overall: 'good' | 'normal' | 'attention' | 'warning';
      details: string[];
    };
    activities: Array<{
      date: string;
      activities: string[];
      mood: 'good' | 'normal' | 'bad';
    }>;
    recommendations: string[];
    nextSteps: string[];
  };
  generatedAt: string;
}

// 체크리스트 분석 요청 타입
export interface AnalyzeChecklistRequest {
  checklistData: Array<{
    itemId: string;
    itemName: string;
    completed: boolean;
    notes?: string;
    timestamp: string;
  }>;
  seniorId: string;
  date: string;
}

// 체크리스트 분석 응답 타입
export interface AnalyzeChecklistResponse {
  analysis: {
    completionRate: number;
    missedItems: string[];
    recommendations: string[];
    healthIndicators: Array<{
      indicator: string;
      status: 'good' | 'normal' | 'attention' | 'warning';
      description: string;
    }>;
  };
  insights: string[];
}

// AI 리포트 생성
export const generateReport = async (data: GenerateReportRequest, token: string) => {
  return apiClient.post<GenerateReportResponse>(
    API_ENDPOINTS.AI.GENERATE_REPORT,
    data,
    token
  );
};

// AI 리포트 조회
export const getReport = async (reportId: string, token: string) => {
  return apiClient.get<ReportDetailResponse>(
    //`${API_ENDPOINTS.AI.GET_REPORT}/${reportId}`,
    token
  );
};

// 체크리스트 분석
export const analyzeChecklist = async (data: AnalyzeChecklistRequest, token: string) => {
  return apiClient.post<AnalyzeChecklistResponse>(
    API_ENDPOINTS.AI.ANALYZE_CHECKLIST,
    data,
    token
  );
}; 