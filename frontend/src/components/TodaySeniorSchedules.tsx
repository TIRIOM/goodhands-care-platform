import React from 'react';

interface ScheduleItem {
  date: string;
  time: string;
  gray?: boolean;
}

interface Senior {
  name: string;
  gender: string;
  age: string;
  schedules: ScheduleItem[];
  [key: string]: any;
}

interface TodaySeniorSchedulesProps {
  seniors: Senior[];
  children: (todaySchedules: (Senior & { todaySchedule: ScheduleItem })[]) => React.ReactNode;
}

const TodaySeniorSchedules: React.FC<TodaySeniorSchedulesProps> = ({ seniors, children }) => {
  // 오늘 날짜를 여러 형식으로 생성
  const today = new Date();
  const year = today.getFullYear().toString().slice(2); // '25'
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const date = today.getDate().toString().padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[today.getDay()];
  
  // 다양한 날짜 형식
  const todayFormats = [
    `${year}.${month}.${date} (${day})`, // "25.07.27 (토)"
    `${year}-${month}-${date}`, // "25-07-27"
    `${year}.${month}.${date}`, // "25.07.27"
    today.toISOString().split('T')[0], // "2025-07-27"
  ];

  const todaySchedules = seniors
    .map(senior => {
      // 여러 날짜 형식으로 오늘 스케줄 찾기
      const todaySchedule = senior.schedules.find(schedule => 
        todayFormats.some(format => schedule.date.includes(format) || format.includes(schedule.date))
      );
      return todaySchedule
        ? { ...senior, todaySchedule }
        : null;
    })
    .filter(Boolean) as (Senior & { todaySchedule: ScheduleItem })[];

  return <>{children(todaySchedules)}</>;
};

export default TodaySeniorSchedules; 