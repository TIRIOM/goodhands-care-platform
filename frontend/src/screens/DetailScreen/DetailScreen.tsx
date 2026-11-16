import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header/Header.tsx';
import ProfileCard from './components/ProfileCard';
import RecordSection from './components/RecordSection';
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import { fonts } from '../../styles/fonts';

const DetailScreen = () => {
    const route = useRoute();
    
    // @ts-ignore
    const { senior, caregiverId } = route.params || {};

    return (
        <>
            <View style={styles.container}>
                <Header title="상세정보" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>
                        <View>
                            <Text style={[GlobalStyles.sectionTitle]}>프로필</Text>
                            <ProfileCard senior={senior} />
                        </View>
                        <View>
                            <Text style={[GlobalStyles.sectionTitle]}>돌봄기록</Text>
                            <RecordSection senior={senior} caregiverId={caregiverId} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginBottom: 10,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    scheduleSection: {
        marginTop: 10,
    },
    scheduleItem: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scheduleItemGray: {
        backgroundColor: '#f4f6f6',
        borderColor: '#d0d0d0',
    },
    scheduleItemToday: {
        borderColor: '#0084FF',
        borderWidth: 2,
        backgroundColor: '#e9f2ff',
    },
    scheduleDate: {
        fontSize: 16,
        color: '#26252c',
        fontFamily: fonts.medium,
    },
    scheduleTime: {
        fontSize: 16,
        color: '#26252c',
        fontFamily: fonts.bold,
    },
    noScheduleText: {
        fontSize: 14,
        color: '#999',
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default DetailScreen;
