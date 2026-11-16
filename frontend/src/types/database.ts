// 백엔드 DB 스키마에 맞춘 프론트엔드 타입 정의
// 작성일: 2025년 7월 17일
// 버전: 2.1 (백엔드 스키마 기반)

// =============================================================================
// 1. 사용자 기본 타입 (users 테이블)
// =============================================================================
export interface User {
  id: number;
  user_code: string;                    // CG001, GD001, AD001 등
  user_type: 'caregiver' | 'guardian' | 'admin';
  email?: string;                       // NULL 허용
  password_hash: string;                // 프론트엔드에서는 사용하지 않음
  is_active: boolean;
  created_at: string;                   // ISO 8601 형식
  updated_at: string;
}

// =============================================================================
// 2. 케어기버 프로필 타입 (caregivers 테이블)
// =============================================================================
export interface Caregiver {
  id: number;
  user_id: number;
  name: string;
  phone?: string;
  profile_image?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  user?: User;
}

// =============================================================================
// 3. 가디언 프로필 타입 (guardians 테이블)
// =============================================================================
export interface Guardian {
  id: number;
  user_id: number;
  name: string;
  phone?: string;
  country?: string;
  relationship_type?: string;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  user?: User;
}

// =============================================================================
// 4. 관리자 프로필 타입 (admins 테이블)
// =============================================================================
export interface Admin {
  id: number;
  user_id: number;
  name: string;
  permissions?: Record<string, any>;    // JSONB
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  user?: User;
}

// =============================================================================
// 5. 요양원 정보 타입 (nursing_homes 테이블)
// =============================================================================
export interface NursingHome {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  contact_person?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// 6. 시니어 질병 정보 타입 (senior_diseases 테이블)
// =============================================================================
export interface SeniorDisease {
  id: number;
  senior_id: number;
  disease_type: string;                 // 치매, 당뇨, 고혈압 등
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// 7. 시니어 정보 타입 (seniors 테이블)
// =============================================================================
export interface Senior {
  id: number;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | '남성' | '여성';  // 백엔드 형식 지원
  photo?: string;
  nursing_home_id?: number;
  caregiver_id?: number;
  guardian_id: number;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  nursing_home?: NursingHome;
  caregiver?: Caregiver;
  guardian?: Guardian;
  diseases?: SeniorDisease[];
}

// =============================================================================
// 8. 돌봄 세션 타입 (care_sessions 테이블)
// =============================================================================
export interface CareSession {
  id: number;
  caregiver_id: number;
  senior_id: number;
  start_time: string;                   // ISO 8601 형식
  end_time?: string;                    // NULL 가능
  status: 'active' | 'completed' | 'cancelled';
  start_location?: string;
  end_location?: string;
  start_photo?: string;
  end_photo?: string;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  caregiver?: Caregiver;
  senior?: Senior;
  attendance_logs?: AttendanceLog[];
  checklist_responses?: ChecklistResponse[];
  care_notes?: CareNote[];
  ai_report?: AIReport;
}

// =============================================================================
// 9. 출근/퇴근 로그 타입 (attendance_logs 테이블)
// =============================================================================
export interface AttendanceLog {
  id: number;
  care_session_id: number;
  type: 'checkin' | 'checkout';
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  photo?: string;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  care_session?: CareSession;
}

// =============================================================================
// 10. 체크리스트 응답 타입 (checklist_responses 테이블)
// =============================================================================
export interface ChecklistResponse {
  id: number;
  care_session_id: number;
  question_key: string;                 // memory_check, medication_taken 등
  question_text?: string;
  answer: any;                          // JSONB - Boolean, String, Number 등
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  care_session?: CareSession;
}

// =============================================================================
// 11. 돌봄노트 타입 (care_notes 테이블)
// =============================================================================
export interface CareNote {
  id: number;
  care_session_id: number;
  question_type: 'special_moments' | 'family_longing' | 'emotional_state' | 'conversation' | 'changes' | 'care_episodes';
  question_text?: string;
  content: string;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  care_session?: CareSession;
}

// =============================================================================
// 12. AI 리포트 타입 (ai_reports 테이블)
// =============================================================================
export interface AIReport {
  id: number;
  care_session_id: number;
  keywords?: string[];                  // JSONB 배열
  content: string;
  ai_comment?: string;
  status: 'generated' | 'read' | 'reviewed';
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  care_session?: CareSession;
  feedbacks?: Feedback[];
}

// =============================================================================
// 13. 피드백 타입 (feedbacks 테이블)
// =============================================================================
export interface Feedback {
  id: number;
  ai_report_id: number;
  guardian_id: number;
  message: string;
  requirements?: string;
  status: 'pending' | 'reviewed' | 'implemented';
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  ai_report?: AIReport;
  guardian?: Guardian;
}

// =============================================================================
// 14. 알림 타입 (notifications 테이블)
// =============================================================================
export interface Notification {
  id: number;
  sender_id: number;
  receiver_id: number;
  type: 'report' | 'feedback' | 'announcement' | 'session_started' | 'session_completed' | 'emergency_alert' | 'reminder';
  title: string;
  content: string;
  data?: Record<string, any>;           // JSONB
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  
  // 관계 데이터
  sender?: User;
  receiver?: User;
}

// =============================================================================
// API 요청/응답 타입들
// =============================================================================

// 로그인 요청
export interface LoginRequest {
  user_code: string;
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_type: 'caregiver' | 'guardian' | 'admin';
  user_code: string;
  name: string;
  expires_in: number;
}

// 출근 체크 요청
export interface CheckInRequest {
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  photo?: string;
}

// 퇴근 체크 요청
export interface CheckOutRequest {
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  photo?: string;
}

// 체크리스트 제출 요청
export interface ChecklistRequest {
  care_session_id: number;
  responses: {
    question_key: string;
    question_text?: string;
    answer: any;
    notes?: string;
  }[];
}

// 돌봄노트 제출 요청
export interface CareNoteRequest {
  care_session_id: number;
  notes: {
    question_type: 'special_moments' | 'family_longing' | 'emotional_state' | 'conversation' | 'changes' | 'care_episodes';
    question_text?: string;
    content: string;
  }[];
}

// AI 리포트 생성 요청
export interface GenerateReportRequest {
  care_session_id: number;
  report_type?: 'daily' | 'weekly' | 'monthly';
}

// 피드백 제출 요청
export interface FeedbackRequest {
  ai_report_id: number;
  message: string;
  requirements?: string;
}

// 회원가입 요청
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  userType: 'caregiver' | 'guardian';
}

// 회원가입 응답
export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    userType: 'caregiver' | 'guardian';
  };
}

// =============================================================================
// API 응답 래퍼 타입
// =============================================================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =============================================================================
// 페이지네이션 타입
// =============================================================================
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =============================================================================
// 케어기버 홈 화면 응답 타입
// =============================================================================
export interface CaregiverHomeResponse {
  today_sessions: CareSession[];
  attendance_status: 'checked-in' | 'checked-out' | 'not-checked';
  total_seniors: number;
  completed_tasks: number;
  recent_notes: CareNote[];
}

// =============================================================================
// 가디언 홈 화면 응답 타입
// =============================================================================
export interface GuardianHomeResponse {
  seniors: Senior[];
  recent_reports: AIReport[];
  notifications: Notification[];
  unread_count: number;
} 