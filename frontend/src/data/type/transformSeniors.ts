
export interface SeniorCare {
    name: string;
    gender: string;
    age: string;
    schedules: ScheduleItem[];
}

interface ScheduleItem {
    date: string;
    time: string;
    start_time: string; // start_time 추가
    gray?: boolean;
    isToday?: boolean; // 오늘 날짜 여부 추가
}

interface CareSchedule {
    id: number;
    senior_id: number;
    senior_name: string;
    senior_photo: string;
    care_date: string;
    start_time: string;
    end_time: string;
    status: string;
    is_today: boolean;
    nursing_home_name: string;
    nursing_home_address: string;
    notes: string;
}

interface CareSchedulesData {
    today_schedules: CareSchedule[];
    past_schedules: CareSchedule[];
    upcoming_schedules: CareSchedule[];
    this_week_schedules: CareSchedule[];
    next_week_schedules: CareSchedule[];
}

export const transformSeniors = (rawSeniors: any[], careSchedules?: CareSchedulesData): SeniorCare[] => {
    // 오늘 날짜 구하기
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // "2025-07-27" 형식
    
    return rawSeniors.map((senior) => {
        // 해당 시니어의 스케줄 찾기
        let seniorSchedules: ScheduleItem[] = [];
        
        if (careSchedules) {
            // 모든 스케줄을 하나의 배열로 합치기
            const allSchedules = [
                ...careSchedules.today_schedules,
                ...careSchedules.past_schedules,
                ...careSchedules.upcoming_schedules,
                ...careSchedules.this_week_schedules,
                ...careSchedules.next_week_schedules
            ];
            
            // 해당 시니어의 스케줄만 필터링
            const seniorCareSchedules = allSchedules.filter(
                schedule => schedule.senior_id === senior.id
            );
            
            // 중복 제거 (id 기준으로 중복 제거)
            const uniqueSchedules = seniorCareSchedules.filter((schedule, index, self) => 
                index === self.findIndex(s => s.id === schedule.id)
            );
            
            // 오늘 이후의 스케줄만 필터링하고 ScheduleItem 형태로 변환
            seniorSchedules = uniqueSchedules
                .filter(schedule => {
                    // care_date가 오늘 이후인지 확인
                    return schedule.care_date >= todayString;
                })
                .map(schedule => {
                    // start_time이 "14:00:00" 형식이므로 "14:00" 형식으로 변환
                    const timeString = schedule.start_time.includes('T') 
                        ? schedule.start_time.split('T')[1].substring(0, 5) // "14:00:00Z" -> "14:00"
                        : schedule.start_time.substring(0, 5); // "14:00:00" -> "14:00"
                    
                    const isToday = schedule.care_date === todayString;
                    
                    return {
                        date: schedule.care_date,
                        time: timeString,
                        start_time: schedule.start_time, // 원본 start_time 추가
                        gray: schedule.status === 'completed', // 완료된 스케줄만 회색
                        isToday: isToday // 오늘 날짜 여부
                    };
                })
                .sort((a, b) => {
                    // 날짜순으로 정렬 (오늘 -> 내일 -> 모레 순)
                    return a.date.localeCompare(b.date);
                });
        }
        
        // 과거 스케줄도 포함하여 히스토리 데이터 생성
        const pastSchedules = careSchedules?.past_schedules
            ?.filter(schedule => schedule.senior_id === senior.id)
            ?.map(schedule => {
                const timeString = schedule.start_time.includes('T') 
                    ? schedule.start_time.split('T')[1].substring(0, 5)
                    : schedule.start_time.substring(0, 5);
                
                return {
                    date: schedule.care_date,
                    time: timeString,
                    start_time: schedule.start_time,
                    gray: schedule.status === 'completed',
                    isToday: schedule.care_date === todayString
                };
            })
            ?.sort((a, b) => a.date.localeCompare(b.date)) || [];

        return {
            name: senior.name,
            gender: senior.gender,
            age: senior.age.toString(),
            schedules: seniorSchedules,
            past_schedules: pastSchedules
        };
    });
};
