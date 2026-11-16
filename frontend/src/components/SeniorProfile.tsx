import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../styles/fonts.tsx';
import type { SeniorCare } from '../data/seniorCareList.tsx';
import SeniorScheduleList from './SeniorScheduleList';
import {borderRadiusSizes, paddingSizes} from "../styles/globalStyles.tsx";

interface SeniorProfileProps extends SeniorCare {
    todayStr: string;
    leftButtonText?: string | null;
    rightButtonText?: string | null;
    onDetailPress?: () => void;
    onStartCarePress: () => void;
}

const SeniorProfile = (props: SeniorProfileProps) => {
    const {
        name,
        schedules,
        todayStr,
        leftButtonText = '상세정보',
        rightButtonText = '돌봄시작',
        onDetailPress,
        onStartCarePress,
    } = props;

    return (
        <View style={styles.detailContainer}>
            <View style={styles.profileInfo}>
                <View style={styles.profileImage} />
                <View style={styles.profileDetails}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.label}>돌봄일정</Text>
                    <SeniorScheduleList schedules={schedules} todayStr={todayStr} />
                </View>
            </View>
            <View style={styles.profileSideBar}>
                {leftButtonText && (
                    <TouchableOpacity style={[styles.profileBtn,{borderColor: '#CDD5DB',}]} onPress={onDetailPress}>
                        <Text style={styles.profileBtnText}>{leftButtonText}</Text>
                    </TouchableOpacity>
                )}
                {rightButtonText && (
                    <TouchableOpacity style={[styles.profileBtn, {borderColor: '#4FABFD', backgroundColor: '#4FABFD'}]} onPress={onStartCarePress}>
                        <Text style={[styles.profileBtnText,{ color:'#fff'}]}>{rightButtonText}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default SeniorProfile;

const styles = StyleSheet.create({
    detailContainer: {
        borderBottomColor: '#4fabfd',
    },
    profileInfo: {
        backgroundColor: '#E9F2FF',
        borderRadius: borderRadiusSizes.large,
        borderBottomLeftRadius:0,
        borderBottomRightRadius:0,
        gap:13,

        padding: 16,
        paddingHorizontal: paddingSizes.medium,
        flexDirection: 'row',
        alignContent:'space-around',
    },
    profileImage: {
        aspectRatio:1,
        backgroundColor: '#cdd5db',
        borderRadius: 10,
    },
    profileDetails: {
        flex: 9,
        flexDirection:'column',
        justifyContent:'flex-start',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        lineHeight:20,
    },
    label: {
        fontSize: 14,
        marginBottom: 10,
        marginTop:3,
        fontFamily:fonts.medium,
    },
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