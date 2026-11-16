import React from 'react';
import { View } from 'react-native';
import SeniorScheduleItem from './SeniorScheduleItem';
import type { ScheduleItem } from '../data/seniorCareList.tsx';

interface SeniorScheduleListProps {
    schedules?: ScheduleItem[];
    todayStr: string;
}

const SeniorScheduleList = ({ schedules = [], todayStr }: SeniorScheduleListProps) => (
    <View style={{ gap: 5 }}>
        {schedules.slice(0,2).map((item, idx) => (
            <SeniorScheduleItem key={idx} item={item} isToday={item.date === todayStr} />
        ))}
    </View>
);

export default SeniorScheduleList;