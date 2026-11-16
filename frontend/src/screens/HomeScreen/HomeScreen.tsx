import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {getTodayDateInfo} from "../../utils/getTodayDateInfo.tsx";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import NoticeHeader from "../../components/NoticeHeader.tsx";
//API 호출 함수 가져오기
import {fetchCaregiverHome} from "../../api/caregiver.ts";
import {transformSeniors} from "../../data/type/transformSeniors.ts";
import SeniorCareCardList from "../../components/SeniorCardList/SeniorCareCardList.tsx";
import CareScheduleCard from "./components/CareScheduleCard.tsx";
import { fonts } from '../../styles/fonts.tsx';
import TodaySeniorSchedules from '../../components/TodaySeniorSchedules';
import { getToken } from '../../utils/tokenManager';

const { date, dayOfWeek } = getTodayDateInfo()

const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const [seniors, setSeniors] = useState<any[]>([]);
    const [, setTodaySchedules] = useState<any[]>([]);
    const [caregiverId, setCaregiverId] = useState<number>(1);
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
                const { seniors: rawSeniors, care_schedules, caregiver_id } = response;
                if (!rawSeniors) {
                    throw new Error('시니어 데이터를 가져올 수 없습니다.');
                }
                // caregiverId 저장
                if (caregiver_id) {
                    setCaregiverId(caregiver_id);
                }

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
        // transformSeniors에서 변환된 동일한 스케줄 데이터를 전달
        navigation.navigate('Detail' as never, { 
            senior: {
                ...senior,
                schedules: senior.schedules, // 오늘 이후의 스케줄 데이터 포함
                past_schedules: senior.past_schedules // 과거 스케줄 데이터 포함
            },
            caregiverId: caregiverId // caregiverId도 함께 전달
        } as never);
    };

    const handleRefresh = () => {
        setSeniors([]);
        setTodaySchedules([]);
        setError(null);
        setIsLoading(true);
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
                    onPress={handleRefresh}
                >
                    다시 시도
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={{ flex: 1, backgroundColor: '#fff'}}
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={GlobalStyles.headerMargin} />
                <View style={[GlobalStyles.screenMargin]}>
                    <NoticeHeader message="공지사항 내용이 적히는 영역이에요." progressNum=" " />
                    <View>
                        <View style={styles.careHeader}>
                            <Text style={styles.todayDate}>{date}</Text>
                            <Text style={[styles.dayOfWeek]}>{dayOfWeek}</Text>
                            <Text style={styles.todayDateTitle}>오늘의 돌봄일정</Text>
                        </View>
                        <View style={styles.albumLayout}>
                            <View style={GlobalStyles.cardGap}>
                                <TodaySeniorSchedules seniors={seniors}>
                                    {todaySchedules => (
                                        (todaySchedules || []).slice(0, 2).map((item, idx) => (
                                            <CareScheduleCard
                                                key={idx}
                                                time={item.todaySchedule?.time || ''}
                                                name={item.name || ''}
                                                round={`${idx + 1}회차`}
                                                condition="양호"
                                                progress={0}
                                                color="blue"
                                                schedules={item.schedules || []}
                                                index={idx}
                                                caregiverId={caregiverId}
                                            />
                                        ))
                                    )}
                                </TodaySeniorSchedules>
                            </View>
                        </View>
                    </View>
                    <View>
                        <Text style={GlobalStyles.sectionTitle}>돌보고 있는 시니어</Text>
                        <SeniorCareCardList
                            seniors={seniors}
                            onDetail={handleDetail}
                        />
                    </View>
                </View>
            </ScrollView>
        </>
    );
};

export default HomeScreen;


const styles = StyleSheet.create({
    careHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom:10,
    },
    date: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    todayDateWrapper: {
        flexDirection:"column",
        justifyContent: 'flex-end',
        //backgroundColor : '#ff5555',
    },
    dayOfWeek: {
        fontSize: 18,
        color: '#26252c',
        fontFamily: fonts.bold,
    },
    todayDate: {
        fontFamily: fonts.bold,
        fontSize: 50,
        color: '#26252c',
        textAlignVertical: 'bottom',
        lineHeight : 50,
    },
    todayDateTitle:{
        fontSize: 18,
        marginLeft: 6,
        color: '#26252c',
        fontFamily: fonts.bold,
    },
    albumLayout: {
        justifyContent: 'space-between',
        width:"100%",
    },
    cardWrapper: {
        width: '48%', // 앨범형식 2열 배치를 위한 너비
        marginBottom: 10,
    },
});