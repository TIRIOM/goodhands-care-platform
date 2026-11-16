export interface ScheduleItem {
    date: string;
    time: string;
}

export interface SeniorType {
    name: string;
    gender: string;
    age: string;
    schedules: ScheduleItem[];
    past_schedules?: ScheduleItem[];
} 