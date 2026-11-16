import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MonthNavigator from './MonthNavigator';
import CareRecordItem from '../screens/DetailScreen/components/CareRecordItem.tsx';
import type { SeniorType } from '../dto/common/SeniorType.ts';

interface RecordSectionUIProps {
    monthLabel: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    senior: SeniorType;
    caregiverId?: number;
}

const RecordSectionUI: React.FC<RecordSectionUIProps> = ({ monthLabel, onPrevMonth, onNextMonth, senior, caregiverId }) => {
    // 오늘 날짜 구하기
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // "2025-07-27" 형식
    
    // monthLabel에서 년도와 월 추출 (예: "2025.07" -> year: 2025, month: 7)
    const [yearStr, monthStr] = monthLabel.split('.');
    const currentYear = parseInt(yearStr);
    const currentMonth = parseInt(monthStr);
    
    // senior.schedules와 past_schedules에서 모든 히스토리 데이터 수집
    const allSchedules = [
        ...(senior.schedules || []),
        ...(senior.past_schedules || [])
    ];
    
    // 전체 히스토리에서 날짜순으로 정렬
    const sortedAllSchedules = allSchedules.sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
    );
    
    // 현재 월에 해당하는 스케줄만 필터링
    const currentMonthSchedules = sortedAllSchedules.filter((schedule: any) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.getFullYear() === currentYear && 
               scheduleDate.getMonth() + 1 === currentMonth;
    });
    
    // 전체 히스토리에서의 인덱스를 찾아서 recordNumber 생성
    const careDateItems = currentMonthSchedules.map((schedule: any) => {
        // 전체 히스토리에서 해당 스케줄의 인덱스 찾기
        const globalIndex = sortedAllSchedules.findIndex((s: any) => s.date === schedule.date);
        const recordNumber = (globalIndex + 1).toString();
        const day = new Date(schedule.date).getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayOfWeek = days[new Date(schedule.date).getDay()];
        const isToday = schedule.date === todayString;
        
        return {
            date: day.toString(),
            day: dayOfWeek,
            recordNumber: recordNumber, // 전체 히스토리 기준 인덱스 사용
            isToday: isToday
        };
    });

    return (
        <View style={styles.container}>
            <MonthNavigator
                monthLabel={monthLabel}
                onPrev={onPrevMonth}
                onNext={onNextMonth}
            />
            {careDateItems.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>해당 월의 기록이 없습니다.</Text>
            ) : (
                careDateItems.map((item, idx) => (
                    <View key={idx} style={{ marginBottom: idx !== careDateItems.length - 1 ? 10 : 0 }}>
                        <CareRecordItem
                            date={item.date}
                            day={item.day}
                            recordNumber={item.recordNumber}
                            senior={senior}
                            isToday={item.isToday}
                            caregiverId={caregiverId}
                        />
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
});

export default RecordSectionUI; 