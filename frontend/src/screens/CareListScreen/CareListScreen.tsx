import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import MainHeader from "../../components/Header/MainHeader.tsx";
import SeniorCard from "./Components/SeniorCard.tsx";
import {useNavigation} from "@react-navigation/native";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import SeniorCareCardList from "../../components/SeniorCardList/SeniorCareCardList.tsx";
import {transformSeniors} from "../../data/type/transformSeniors.ts";
import TodaySeniorSchedules from "../../components/TodaySeniorSchedules.tsx";
import {fetchCaregiverHome} from "../../api/caregiver.ts";
import { getToken } from '../../utils/tokenManager';

const CareListScreen = () => {
    const navigation = useNavigation();
    const [seniors, setSeniors] = useState<any[]>([]);
    const [, setTodaySchedules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 토큰 가져오기
                const token = await getToken();
                console.log("Token:", token);
                if(!token){
                    throw new Error("token없음")
                }
                // 백엔드에서 데이터 가져오기
                const response = await fetchCaregiverHome(token);
                console.log('백엔드 응답:', response);

                // 응답 데이터 구조 확인 및 처리
                const { seniors: rawSeniors, care_schedules } = response;
                if (!rawSeniors) {
                    throw new Error('시니어 데이터를 가져올 수 없습니다.');
                }

                console.log('care_schedules 데이터:', care_schedules);

                const transformedSeniors = transformSeniors(rawSeniors, care_schedules);
                setSeniors(transformedSeniors);

                // 오늘 날짜와 일치하는 스케줄만 필터링
                const todaySchedulesData = transformedSeniors
                    .map(senior => {
                        const todaySchedule = senior.schedules?.find((schedule: any) => {
                            const scheduleDate = schedule.date;
                            const today = new Date().toISOString().split('T')[0];
                            return scheduleDate === today;
                        });

                        return {
                            ...senior,
                            todaySchedule: todaySchedule || null
                        };
                    })
                    .filter(senior => senior.todaySchedule !== null);

                setTodaySchedules(todaySchedulesData);

            } catch (error) {
                console.error('데이터 로드 실패:', error);
                setError(error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다.');

                setSeniors([]);
                setTodaySchedules([]);

            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleDetail = (senior: any) => {
        navigation.navigate('Detail' as never, { 
            senior: {
                ...senior,
                schedules: senior.schedules, // 오늘 이후의 스케줄 데이터 포함
                past_schedules: senior.past_schedules // 과거 스케줄 데이터 포함
            }
        } as never);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, color: '#666' }}>데이터를 불러오는 중...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
                    {error}
                </Text>
                <Text
                    style={{ color: '#007AFF', textDecorationLine: 'underline' }}
                    onPress={() => {
                        setSeniors([]);
                        setTodaySchedules([]);
                        setError(null);
                        setIsLoading(true);
                    }}
                >
                    다시 시도
                </Text>
            </View>
        );
    }

    return (
        <View style={GlobalStyles.mainContainer}>
            <MainHeader title="돌봄리스트" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={GlobalStyles.screenMargin}>
                    <View>
                        <Text style={[GlobalStyles.sectionTitle]}>오늘의 시니어</Text>
                        <TodaySeniorSchedules seniors={seniors}>
                            {todaySchedules => (
                                <SeniorCard seniors={todaySchedules}/>
                            )}
                        </TodaySeniorSchedules>
                    </View>
                    <View>
                        <Text style={GlobalStyles.sectionTitle}>시니어 리스트</Text>
                        <SeniorCareCardList
                            seniors={seniors}
                            onDetail={handleDetail}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default CareListScreen;

const styles = StyleSheet.create({
    scrollView: {
        marginBottom: 10,
        flex: 1,
    },
});
