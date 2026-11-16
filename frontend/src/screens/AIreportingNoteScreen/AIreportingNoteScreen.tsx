import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import ReportHeader from "../../components/Header/reportHeader.tsx";
import {useRoute} from "@react-navigation/native";
import {AICareNoteDummyData} from "../../dto/AIreportDto.tsx";
import {borderRadiusSizes, colorPallet, fontSizes, GlobalStyles, marginSizes} from "../../styles/globalStyles.tsx";
import {fonts} from "../../styles/fonts.tsx";
import {SubmitIcon} from "../../styles/images.tsx";
import {RenderTrendAnalysis} from "../../components/RenderTrendAnalsis.tsx";


const AIreportingNoteScreen=()=>{
    const route = useRoute();
    // @ts-ignore
    const { senior, recordNumber } = route.params || {};
    const [text, setText] = useState('');

    const noteData = AICareNoteDummyData.find((item)=>item.seniorName==senior.name && item.careCount==parseInt(recordNumber))

    return (
        <>
            <View style={styles.container}>
                <ReportHeader title={""} careCount={recordNumber} seniorName={noteData?.seniorName || ""} aiSummary={noteData?.aiSummary || ""} todayMessage={noteData?.todayMessage || ""}/>
                <ScrollView>
                    {noteData ? (
                        <>
                            <View style={GlobalStyles.screenMargin}>
                                <View>
                                    <Text style={styles.reportTitle}>오늘의 질문</Text>
                                    <Text style={styles.qDes}>어르신과 함께 했던 따듯했던 에피소드를 들려주세요.</Text>
                                    <View style={styles.textInput}>
                                        <TextInput
                                            value={text}
                                            onChangeText={setText}
                                            style={{
                                                backgroundColor:"rgba(255,255,255,0)",
                                                padding: 10,
                                                borderRadius: 8,
                                                flex:1,
                                            }}
                                        />
                                        <TouchableOpacity style={styles.submitIcon}>
                                            <SubmitIcon/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.trendSection}>
                                    <Text style={styles.reportTitle}>상세 추이 분석</Text>
                                    <View style={styles.categoryRow}>
                                        {noteData.trendAnalysis.map((trend, index) => (
                                            <TouchableOpacity 
                                                key={index} 
                                                style={[
                                                    styles.categoryButton,
                                                    { backgroundColor: index === 0 ? colorPallet.skyblueColor : colorPallet.subColor }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.categoryButtonText,
                                                    { color: index === 0 ? '#fff' : '#26252C', fontFamily: index ===0 ? fonts.bold : fonts.regular }
                                                ]}>
                                                    {trend.category}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {RenderTrendAnalysis(noteData.trendAnalysis)}
                                </View>
                            </View>
                        </>
                    ) : (
                        <Text>리포트 데이터를 찾을 수 없습니다.</Text>
                    )}
                </ScrollView>
            </View>
        </>
    );
}

export default AIreportingNoteScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    reportTitle:{
        fontSize:fontSizes.m_large,
        fontFamily:fonts.bold,
    },
    qDes:{
        color:colorPallet.des,
    },
    textInput:{
        backgroundColor:colorPallet.subColor,
        borderRadius: borderRadiusSizes.large,
        marginTop:marginSizes.s_medium,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingHorizontal:5,
    },
    submitIcon:{
        backgroundColor:"#fff",
        width:40,
        height:30,
        justifyContent:"center",
        borderRadius:borderRadiusSizes.medium,
        alignItems:"center",
    },
    trendSection: {
        marginTop: marginSizes.large,
    },
    categoryRow: {
        flexDirection: 'row',
        marginBottom: marginSizes.s_medium,
        justifyContent: 'flex-start',
    },
    categoryButton: {
        paddingVertical: marginSizes.small,
        paddingHorizontal: marginSizes.s_medium,
        borderRadius: 50,
        alignItems: 'center',
    },
    categoryButtonText: {
        fontSize: fontSizes.s_medium,
    },
});