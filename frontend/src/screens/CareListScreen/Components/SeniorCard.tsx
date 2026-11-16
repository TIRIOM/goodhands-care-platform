import React, { useState } from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScheduleItem } from '../../../data/seniorCareList.tsx';
import SeniorProfile from '../../../components/SeniorProfile.tsx';
import {borderRadiusSizes} from "../../../styles/globalStyles.tsx";
import AttendanceModal from '../../../components/Tab/AttendanceModal.tsx';

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2); // '25'
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const date = today.getDate().toString().padStart(2, '0');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const day = days[today.getDay()];
    return `${year}.${month}.${date} (${day})`;
}

interface SeniorCardProps {
    seniors: any[];
}

const SeniorCard: React.FC<SeniorCardProps> = ({ seniors }) => {
    const navigation = useNavigation();
    const todayStr = getTodayString();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [attendanceTitle, setAttendanceTitle] = useState('');
    
    const todaySenior = seniors.length > 0 ? seniors[0] : null;
    
    let schedulesToShow: ScheduleItem[] = [];
    if (todaySenior) {
        schedulesToShow = todaySenior.schedules || [];
    }

    const handleStartCarePress = () => {
        setAttendanceTitle('출근 완료');
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <View style={[styles.detailContainer]}>
                {todaySenior ? (
                    <SeniorProfile
                        name={todaySenior.name}
                        gender={todaySenior.gender}
                        age={todaySenior.age}
                        schedules={schedulesToShow}
                        todayStr={todayStr}
                        onStartCarePress={handleStartCarePress}
                        onDetailPress={() => navigation.navigate('CareDetail' as never, { senior: todaySenior } as never)}
                    />
                ) : (
                    <View style={styles.profileCard}>
                        <Text style={styles.noSeniorText}>오늘의 시니어가 없습니다</Text>
                    </View>
                )}
            </View>

            <AttendanceModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                attendanceTitle={attendanceTitle}
            />
        </>
    );
};

export default SeniorCard;

const styles = StyleSheet.create({
    detailContainer: {
        borderBottomColor: '#4fabfd',
        borderStyle: 'dotted',
    },
    profileCard: {
        //backgroundColor: colorPallet.subColor,
        borderRadius: borderRadiusSizes.large,
        padding: 16,
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal: 19,
    },
    noSeniorText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
    },
});

