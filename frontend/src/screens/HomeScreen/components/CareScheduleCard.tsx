import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import { fonts } from '../../../styles/fonts';
import CareStartBtn from "../../../components/Btn/CareStartBtn.tsx";
import {borderRadiusSizes, fontSizes, paddingSizes} from "../../../styles/globalStyles.tsx";
import {Today_Session} from "../../../data/type/careGiverHome.ts";


interface CareScheduleCardProps extends Today_Session {
    schedules: any[];
    index?: number;
    caregiverId?: number;
}

const CareScheduleCard: React.FC<CareScheduleCardProps> = ({
                                                               name,
                                                               schedules,
                                                               index = 0,
                                                               caregiverId,
                                                           }) => (
    <>
        <View style={[styles.careScheduleCard, index === 0 ? styles.gray : styles.blue]}>
            <View style={{flex:1, aspectRatio:1}}>
                <Image
                    source={
                        index === 0 
                            ? require('../../../../assets/images/imageGrand2.png')
                            : require('../../../../assets/images/imageGrand.png')
                    }
                    style={styles.profileImage}
                />
            </View>
            <View style={styles.scheduleInfoContainer}>
                <View style={styles.scheduleInfo}>
                    <View style={styles.timeInfo}>
                        <Text style={styles.timeText}>{name}</Text>
                    </View>
                    <CareStartBtn 
                        caregiverId={caregiverId || 1}
                        location={"string"}
                        attendance_status={"true"}
                        style={{alignSelf: 'flex-start'}}
                    />
                </View>
                <Text style={styles.careDesText}>돌봄일정</Text>
                <View style={styles.conditionProgress}>
                    {schedules.length > 0 ? (
                        schedules.slice(0, 2).map((item, idx) => {
                            const dateParts = item.date.split('-');
                            const formattedDate = dateParts.length >= 3 ? `${dateParts[1]}.${dateParts[2]}` : item.date;

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
            </View>
        </View>
    </>
);

const styles = StyleSheet.create({
    careScheduleCard: {
        flexDirection: 'row',
        //alignItems: 'stretch',
        borderRadius: borderRadiusSizes.large,
        gap:13,
        padding: paddingSizes.medium,
    },
    profileImage: {
        width:100,
        height:100,
        flex:1,
        aspectRatio:1,
        borderRadius: 10,
    },
    scheduleInfoContainer:{
        flexDirection: 'column',
        flex: 11,
        gap:4,
        //backgroundColor:'#ff0000',
    },
    blue: {
        backgroundColor: '#e9f2ff',
    },
    gray: {
        backgroundColor: '#f4f6f6',
    },
    scheduleInfo: {
        justifyContent : 'space-between',
        flexDirection : "row",
    },
    timeInfo: {
        flexDirection: 'column',
        alignItems:'flex-start',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#26252c',
        lineHeight:24,
        fontFamily: fonts.bold,
    },
    seniorRoundWrapper: {
        flexDirection:'row',
        flexWrap:'wrap',
        gap:5,
        //backgroundColor:'red',
    },
    seniorName: {
        fontSize: fontSizes.medium,
        fontWeight: '400',
        color: '#26252c',
        fontFamily: fonts.bold,
    },
    round: {
        fontSize: fontSizes.medium,
        fontWeight: '500',
        color: '#26252c',
        fontFamily: fonts.medium,
    },
    startBtn: {
        backgroundColor: '#fff',
        borderRadius: 9,
        paddingVertical: 6,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        //shadowColor: '#000',
        //shadowOffset: { width: 0, height: 1 },
        //shadowOpacity: 0.04,
        //shadowRadius: 4,
        //elevation: 1,
    },
    startBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#26252c',
        fontFamily: fonts.medium,
    },
    careDesText:{
        fontFamily:fonts.bold,
        fontSize:fontSizes.s_medium
    },
    conditionProgress: {
        flexDirection: 'column',
        borderRadius: 4,
    },
    conditionImageWrapper:{
        gap: 4,
        flexDirection:'row',
        alignItems:'center',
    },
    conditionText: {
        color: '#26252c',
        fontSize: fontSizes.small,

        lineHeight:13,
        fontFamily: fonts.medium,
        justifyContent : 'center',
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
        borderRadius:4,
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
    noScheduleText: {
        fontSize: 12,
        color: '#999',
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },

});

export default CareScheduleCard;