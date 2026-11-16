import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../styles/fonts.tsx';
import type { ScheduleItem } from '../data/seniorCareList.tsx';

interface SeniorScheduleItemProps {
    item: ScheduleItem;
    isToday: boolean;
}

const SeniorScheduleItem = ({ item, isToday }: SeniorScheduleItemProps) => (
    <View style={[styles.scheduleItem, isToday && { borderColor: '#4fabfd' }] }>
        <Text style={styles.scheduleText}>{item.date}</Text>
        <Text style={styles.scheduleTime}>{item.time}</Text>
    </View>
);

const styles = StyleSheet.create({
    scheduleItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 4,
        padding: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    scheduleText: {
        fontSize: 13,
        color: '#333',
        fontFamily: fonts.medium,
    },
    scheduleTime: {
        fontSize: 13,
        color: '#333',
        fontFamily: fonts.bold,
    },
});

export default SeniorScheduleItem; 