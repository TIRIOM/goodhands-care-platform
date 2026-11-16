import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { fonts } from '../../styles/fonts.tsx';
import {paddingSizes} from "../../styles/globalStyles.tsx";
import {SeniorImage1} from "../../styles/images.tsx";

interface ScheduleItem {
    date: string;
    time: string;
    start_time: string;
    gray?: boolean;
    isToday?: boolean;
}

interface SeniorCareCardProps {
    name: string;
    gender: string;
    age: string;
    schedules: ScheduleItem[];
    onDetail?: () => void;
}

const SeniorCareCard: React.FC<SeniorCareCardProps> = ({ name, gender, age, schedules, onDetail }) => {
    // gender 값을 한글로 변환
    const getGenderText = (gender: string) => {
        switch (gender.toLowerCase()) {
            case 'female':
                return '여';
            case 'male':
                return '남';
            default:
                return gender;
        }
    };

    return (
        <View style={styles.seniorCareCard}>
            <View style={styles.genderAgeWrapper}>
                <View>
                    <SeniorImage1 style={styles.profileImageSmall}/>
                </View>
                <View style={styles.nameAge}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.genderAgeWrapper}>
                        <Text style={styles.gender}>{getGenderText(gender)}</Text>
                        <Text style={styles.name}>.</Text>
                        <Text style={styles.age}>{age}세</Text>
                    </View>
                </View>
            </View>
        <View style={styles.scheduleList}>
            <Text style={styles.scheduleTitle}>돌봄일정</Text>
            {schedules.length > 0 ? (
                schedules.slice(0, 2).map((item, idx) => {
                    // 날짜 형식을 "7월 28일" 형태로 변환
                    const dateParts = item.date.split('-');
                    let formattedDate = item.date;
                    if (dateParts.length >= 3) {
                        const month = parseInt(dateParts[1]);
                        const day = parseInt(dateParts[2]);
                        formattedDate = `${month}월 ${day}일`;
                    }

                    return (
                        <View key={idx} style={[
                            styles.scheduleChip, 
                            idx === 0 && styles.scheduleChipGray, // 첫 번째 요소는 회색
                            item.gray && styles.scheduleChipGray,
                            item.isToday && styles.scheduleChipToday
                        ]}>
                            <Text style={styles.scheduleDate}>{formattedDate}</Text>
                            <Text style={styles.scheduleTime}>{item.time}</Text>
                        </View>
                    );
                })
            ) : (
                <Text style={styles.noScheduleText}>돌봄일정이 없습니다</Text>
            )}
        </View>
        <View style={styles.detailBtnWrapper}>
            <TouchableOpacity style={styles.detailBtn} onPress={onDetail}>
                <Text style={styles.detailBtnText}>상세정보</Text>
            </TouchableOpacity>
        </View>
    </View>
    );
};

const styles = StyleSheet.create({
    seniorCareCard: {
        flex:1,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#cdd5db',

        padding: paddingSizes.s_medium,
        gap:10,

        flexDirection: 'column',
        alignItems: 'center',
    },
    genderAgeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageSmall: {
        width: 50,
        height: 50,
        backgroundColor: '#cdd5db',
        borderRadius: 8,
        marginRight: 8,
    },
    nameAge: {
        flexDirection: 'column',
        alignItems:'flex-start',
        flex:1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#26252c',
        fontFamily:fonts.medium,
    },
    gender: {
        fontSize: 14,
        fontWeight: '400',
        color: '#26252c',
        fontFamily:fonts.medium,
    },
    age: {
        fontSize: 14,
        fontWeight: '400',
        color: '#26252c',
        fontFamily:fonts.medium,
    },
    scheduleList: {
        width: '100%',
        marginBottom: 8,
        flex:1,
    },
    scheduleTitle: {
        fontSize: 14,
        marginBottom: 4,
        color: '#26252c',
        fontFamily: fonts.bold,
    },
    scheduleChip: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 4,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        paddingVertical: 2,
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    scheduleChipGray: {
        backgroundColor: '#f4f6f6',
        borderWidth: 0,
    },
    scheduleChipToday: {
        borderColor: '#0084FF',
        borderWidth: 2,
        backgroundColor: '#e9f2ff',
    },
    scheduleDate: {
        lineHeight:14,
        fontSize: 14,
        color: '#26252c',
        fontFamily:fonts.medium,
    },
    scheduleTime: {
        fontSize: 15,
        color: '#26252c',
        fontFamily:fonts.bold,
    },
    detailBtnWrapper: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    detailBtn: {
        backgroundColor: '#e9f2ff',
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    detailBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#26252c',
        fontFamily:fonts.medium
    },
    noScheduleText: {
        fontSize: 12,
        color: '#999',
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },
});

export default SeniorCareCard;