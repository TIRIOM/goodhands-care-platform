import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { fonts } from '../../../styles/fonts';
import ProfileDetailContent from '../../DetailScreen/components/ProfileDetailContent.tsx'
import {DownIcon, UpIcon} from "../../../styles/images.tsx";
import {borderRadiusSizes, paddingSizes} from "../../../styles/globalStyles.tsx";
import SeniorScheduleList from "../../../components/SeniorScheduleList.tsx";



const ProfileCard = ({ senior }: { senior: any }) => {
    const [showDetail, setShowDetail] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;

    // 오늘 날짜 문자열 생성
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear().toString().slice(2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const date = today.getDate().toString().padStart(2, '0');
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const day = days[today.getDay()];
        return `${year}.${month}.${date} (${day})`;
    };

    const todayStr = getTodayString();



    const toggleDetail = () => {
        if (showDetail) {
            Animated.parallel([
                Animated.timing(animatedHeight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: false,
                }),
            ]).start(() => setShowDetail(false));
        } else {
            setShowDetail(true); // 보여지게 먼저 세팅
            Animated.parallel([
                Animated.timing(animatedHeight, {
                    toValue: contentHeight,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    };



    if (!senior) return null;

    return (
        <View>
            <View style={styles.detailContainer}>
                <View style={styles.profileInfo}>
                    <View style={styles.profileImage} />
                    <View style={styles.profileDetails}>
                        <Text style={styles.name}>{senior.name}</Text>
                        <Text style={styles.label}>돌봄일정</Text>
                        <SeniorScheduleList 
                            schedules={senior.schedules || []} 
                            todayStr={todayStr} 
                        />
                    </View>
                </View>

            </View>
            <Animated.View style={{ height: animatedHeight, overflow: 'hidden', opacity: animatedOpacity }}>
                <View
                    onLayout={(e) => {
                        if (contentHeight === 0) {
                            const h = e.nativeEvent.layout.height;
                            setContentHeight(h);
                            animatedHeight.setValue(showDetail ? h : 0);
                        }
                    }}
                >
                    <ProfileDetailContent senior={senior} />
                </View>
            </Animated.View>

            <View style={{ opacity: 0, position: 'absolute'             }} onLayout={(e) => {
                if (contentHeight === 0) {
                    setContentHeight(e.nativeEvent.layout.height);
                }
            }}>
                <ProfileDetailContent senior={senior} />
            </View>
            
            <TouchableOpacity style={styles.detailLink} onPress={toggleDetail}>
                <Text style={styles.detailLinkText}>상세 프로필</Text>
                <View style={styles.chevronDownWrapper}>
                    {showDetail ? (
                        <>
                            <Text style={styles.chevronDown}>접기</Text>
                            <UpIcon size={12} />
                        </>
                    ) : (
                        <>
                            <Text style={styles.chevronDown}>확인하기</Text>
                            <DownIcon size={12} />
                        </>
                    )}
                </View>

            </TouchableOpacity>
        </View>
    );
};

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
    scheduleContainer: {
        gap: 4,
    },
    scheduleItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 4,

        padding: 1,
        flexDirection:"row",
        justifyContent:'space-between',
        paddingHorizontal:8,
    },
    scheduleText: {
        fontSize: 13,
        color: '#333',
        fontFamily:fonts.medium,
    },
    scheduleTime:{
        fontSize: 13,
        color: '#333',
        fontFamily:fonts.bold,
    },
    detailLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderStyle:'solid',

        borderWidth:1,
        borderRadius:12,

        borderTopWidth:0,
        borderTopLeftRadius:0,
        borderTopRightRadius:0,
        borderColor:'#CDD5DB',
    },
    detailLinkText: {
        fontSize: 14,
        color: '#26252C',
        marginRight: 5,
        fontFamily:fonts.medium,
    },
    chevronDownWrapper:{
        flexDirection:'row',
        alignItems:'center',
        gap:4,
    },
    chevronDown: {
        fontSize: 14,
        fontFamily:fonts.medium,
        color: '#26252C',
    },
    detailBox: {
        justifyContent: 'center',
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#222',
        padding: 16,
        paddingBottom: 0,
    },
    detailItem: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
        paddingHorizontal: 16,
    },
});

export default ProfileCard; 