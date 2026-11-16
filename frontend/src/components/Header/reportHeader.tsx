import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderAlarmButton from './HeaderAlarmButton.tsx';
import { fontSizes, marginSizes } from "../../styles/globalStyles.tsx";
import { fonts } from '../../styles/fonts.tsx';
import {AIstarIcon} from "../../styles/images.tsx";
import Btn from "../Btn/Btn.tsx";

interface ReportHeaderProps {
    title: string;
    style?: any;
    careCount:string;
    seniorName:string;
    todayMessage:string;
    aiSummary: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ title, careCount, seniorName, aiSummary }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack()
    };

    return (
        <>
            <ImageBackground
                source={require('../../../assets/images/AIreportingHeader.png')}
                style={{ aspectRatio: 1,justifyContent:"space-between" }}
                resizeMode="cover"
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Image
                            source={require('../../../assets/images/icons/BackIcon.png')}
                            style={styles.backIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>{title}</Text>
                    <HeaderAlarmButton />
                </View>

                {/* 텍스트 섹션 */}
                <View style={{ marginTop: 20,paddingHorizontal: 20, paddingTop: 40}}>
                    <Text style={styles.careTitle}>{seniorName}님 돌봄 노트</Text>

                    <View style={styles.careCountWrapper}>
                        <Text style={styles.careCountNumber}>{parseInt(careCount)}</Text>
                        <Text style={styles.careCountUnit}>회차</Text>
                    </View>



                    {/* AI 요약 */}
                    <View style={styles.aireportSummaryWrapper}>
                        <View style={{gap:5, flex:1,}}>
                            <View style={{flexDirection:"row",alignContent:"center"}}>
                                <AIstarIcon/>
                                <Text style={styles.aireportSummaryTitle}>AI 리포트 요약</Text>
                            </View>
                            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
                                <Text style={styles.aireportSummaryContent}>{aiSummary}</Text>
                                <View>
                                    <Btn style={{borderRadius:30,paddingHorizontal:15,paddingVertical:9,}} text={"상세보기"} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>

        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:35,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
        borderStyle:'solid',
        borderWidth:1,
        borderColor:'#EBEEF1',
        backgroundColor:"#fff",
        borderRadius:40,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
        //backgroundColor:'#a22424',
    },
    backIcon:{
        width:19,
        height:19,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    recordText:{
        fontSize:55,
        fontFamily:fonts.bold,
        color:"#fff",
        lineHeight:50,
    },
    careTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: fonts.medium,
        marginBottom: 4,
    },
    careCountWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    careCountNumber: {
        fontSize: 50,
        color: '#fff',
        fontFamily: fonts.bold,
        lineHeight: 60,
    },
    careCountUnit: {
        fontSize: 24,
        color: '#fff',
        fontFamily: fonts.medium,
        marginLeft: 4,
        marginBottom: 5,
    },
    todayMessageBubble: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        marginTop: 8,
    },
    todayMessageText: {
        fontSize: 14,
        color: '#000',
        marginRight: 8,
    },
    todayMessageProgress: {
        fontSize: 14,
        color: '#4FABFD',
        fontFamily: fonts.bold,
    },
    aireportSummaryWrapper: {
        backgroundColor: 'rgba(36,95,231,0.69)',
        borderRadius: 12,

        marginVertical:marginSizes.large,
        paddingHorizontal:20,
        paddingVertical:marginSizes.medium,

        justifyContent:"space-between",
        alignItems:"flex-start",
        flexShrink:1,
        flexDirection:"row",
    },
    aireportSummaryTitle: {
        color: '#fff',
        fontSize: fontSizes.m_large,
        fontFamily: fonts.bold,
        lineHeight:14,
    },
    aireportSummaryContent: {
        width:"70%",
        color: '#fff',
        fontSize: 15,
        flexShrink:1,
        fontFamily: fonts.regular,
    },

});

export default ReportHeader;