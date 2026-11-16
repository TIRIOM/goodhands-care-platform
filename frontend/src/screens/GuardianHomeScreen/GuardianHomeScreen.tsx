import React from 'react';
import { ScrollView, View } from 'react-native';
//import SeniorCareListSection from './components/SeniorCareListSection.tsx';
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import NoticeHeader from "../../components/NoticeHeader.tsx";
import TheWeekCareNote from "./Components/TheWeekCareNote.tsx";
import todayCareSchedules from "../../data/todayCareSchedules.tsx";

const GuardianHomeScreen: React.FC = () => {

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff'}} contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
            <View style={GlobalStyles.headerMargin}></View>
            <View style={[GlobalStyles.screenMargin]}>
                <NoticeHeader message="공지사항 내용이 적히는 영역이에요." progressNum=" " />
                <TheWeekCareNote mySeniorCard={todayCareSchedules}/>
            </View>
        </ScrollView>
    );
};

export default GuardianHomeScreen;