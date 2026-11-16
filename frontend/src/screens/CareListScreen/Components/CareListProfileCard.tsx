import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import React from "react";
import SeniorProfileCard from "../../../components/SeniorProfileCard.tsx";
import SeniorScheduleList from "../../../components/SeniorScheduleList.tsx";
import {GlobalStyles} from "../../../styles/globalStyles.tsx";
import {fonts} from "../../../styles/fonts.tsx";
import { getTodayDateInfo } from "../../../utils/getTodayDateInfo.tsx";

interface ScheduleItem {
    date: string;
    time: string;
    gray?: boolean;
}

interface SeniorCare {
    name: string;
    gender: string;
    age: string;
    schedules: ScheduleItem[];
    hospital?: string;
    address?: string;
}

//돌봄노트 상세정보
const CareListProfileCard = ({ senior }: { senior: SeniorCare }) =>{
    if (!senior) return null;
    const { date: todayStr } = getTodayDateInfo();
    return (
        <View>
            <Text style={GlobalStyles.sectionTitle}>프로필</Text>
            <SeniorProfileCard
                name={senior.name}
                schedules={<SeniorScheduleList schedules={senior.schedules} todayStr={todayStr} />}
            />

            <View style={styles.profileSideBar}>
                <TouchableOpacity style={[styles.profileBtn,{borderColor: '#CDD5DB',}]}>
                    <Text style={styles.profileBtnText}>상세정보</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.profileBtn, {borderColor: '#4FABFD', backgroundColor: '#4FABFD'}]}>
                    <Text style={[styles.profileBtnText,{ color:'#fff'}]}>돌봄시작</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CareListProfileCard;

const styles = StyleSheet.create({
    profileSideBar:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderStyle:'solid',
        paddingHorizontal:9,

        borderWidth:1,
        borderRadius:12,

        borderTopWidth:0,
        borderTopLeftRadius:0,
        borderTopRightRadius:0,
        borderColor:'#CDD5DB',
    },
    profileBtn:{
        borderColor:'#0e0e0e',
        paddingVertical:10,
        borderWidth:1,
        flex:1,
        alignItems:'center',
        marginHorizontal: 6,
        justifyContent:'center',
        borderRadius:4,
    },
    profileBtnText: {
        fontFamily:fonts.medium
    },
});