// src/data/seniorCareList.ts

export interface ScheduleItem {
    date: string;
    time: string;
}

export interface SeniorCare {
    name: string;
    gender: string;
    age: string;
    schedules: ScheduleItem[];
}

const seniorCareList = [
    {
        name: '김옥자',
        gender: '여',
        age: "76",
        schedules: [
            { date: '25.07.22 (화)', time: '14:00' },
            { date: '25.09.13 (금)', time: '15:00' },
            { date: '25.07.27 (토)', time: '09:00' }, // 오늘 날짜 추가
        ],
    },
    {
        name: '이미자',
        gender: '여',
        age: "80",
        schedules: [
            { date: '25.09.12 (목)', time: '15:00' },
            { date: '25.09.28 (월)', time: '15:00' },
            { date: '25.07.27 (토)', time: '10:00' }, // 오늘 날짜 추가
        ],
    },
];

export default seniorCareList;
