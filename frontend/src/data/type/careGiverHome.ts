export interface Session {
    senior_id: number;
    status: string;
    id: number;
    caregiver_id: number;
    start_time: string;
    end_time: string;
    created_at: string;
}

export interface Today_Session {
    time: string;            // 예: '오전 9:00'
    name: string;            // 시니어 이름
    round: string;           // 회차 정보 (예: '1회차')
    condition: string;       // 컨디션 텍스트 (예: '양호')
    progress: number;        // 진행률 등 숫자 값이 들어갈 수 있음 (현재 컴포넌트에선 사용 안됨)
    color: 'blue' | 'gray';  // 카드 배경 색상 결정용
}


export interface Senior {
    name: string;
    age: number;
    gender: string;
    id: number;
    photo: string;
    nursing_home_id: number;
    caregiver_id: number;
    guardian_id: number;
    created_at: string;
}

export interface Notification {
    title: string;
    content: string;
    type: string;
    id: number;
    sender_id: number;
    receiver_id: number;
    data: any;
    is_read: boolean;
    read_at: string;
    created_at: string;
}

export interface CaregiverDashboardResponse {
    caregiver_name: string;
    today_sessions: Session[];
    seniors: Senior[];
    notifications: Notification[];
}
