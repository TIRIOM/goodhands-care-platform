import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {ScrollView, StyleSheet, Text, View} from "react-native";
import Header from "../../components/Header/Header.tsx";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import RecordSectionUI from "../../components/RecordSectionUI.tsx";
import ProfileCard from "../DetailScreen/components/ProfileCard.tsx";
import seniorCareList from "../../data/seniorCareList.tsx";
import { CareSchedule } from "../../data/type/CareSchedules.tsx";

function getMonthLabel(year: number, month: number) {
    return `${year}.${month.toString().padStart(2, '0')}`;
}

const GuardianCareNoteDetail = () => {
    const route = useRoute();
    // @ts-ignore
    const { senior }: { senior: CareSchedule } = route.params || {};

    const seniorData = seniorCareList.find(s => s.name === senior?.name);

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    const handlePrev = () => {
        if (month === 1) {
            setYear(year - 1);
            setMonth(12);
        } else {
            setMonth(month - 1);
        }
    };
    const handleNext = () => {
        if (month === 12) {
            setYear(year + 1);
            setMonth(1);
        } else {
            setMonth(month + 1);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <Header title="상세정보" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>
                        <View>
                            <Text style={[GlobalStyles.sectionTitle]}>프로필</Text>
                            {seniorData && <ProfileCard senior={seniorData}/>}
                        </View>
                        <View>
                            <Text style={GlobalStyles.sectionTitle}>돌봄기록</Text>
                            {seniorData && (
                                <RecordSectionUI
                                    monthLabel={getMonthLabel(year, month)}
                                    onPrevMonth={handlePrev}
                                    onNextMonth={handleNext}
                                    senior={seniorData}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default GuardianCareNoteDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginBottom: 10,
        flex: 1,
    },

});