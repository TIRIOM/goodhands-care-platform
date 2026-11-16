import {ScrollView, StyleSheet, Text, View} from "react-native";
import Header from "../../components/Header/Header.tsx";
import {
    borderRadiusSizes,
    colorPallet,
    fontSizes,
    GlobalStyles,
    paddingSizes
} from "../../styles/globalStyles.tsx";
import React, { useState } from "react";
import {useRoute} from "@react-navigation/native";
import MonthNavigator from "../../components/MonthNavigator.tsx";
import CareNoteTitle from "./Components/CareNoteTitle.tsx";
import {fonts} from "../../styles/fonts.tsx";
import type { RouteProp } from '@react-navigation/native';
import type { SeniorType } from '../../dto/common/SeniorType.ts';
import { careRecords } from '../../data/careRecords';
import type { CareRecordItemData } from '../../data/careRecords';

export type RootStackParamList = {
    CareNoteDetailEach: { senior: SeniorType, recordNumber: string };
};

const GuardianCareNoteDetailEach=()=>{
    const route = useRoute<RouteProp<RootStackParamList, 'CareNoteDetailEach'>>();
    const { senior, recordNumber } = route.params;

    // 모든 월의 기록을 합쳐서 하나의 배열로 만듦
    const allRecords: CareRecordItemData[] = Object.values(careRecords[senior.name] || {}).flat();
    const initialIdx = allRecords.findIndex(r => r.recordNumber === recordNumber);
    const [recordIdx, setRecordIdx] = useState(initialIdx >= 0 ? initialIdx : 0);
    const currentRecord = allRecords[recordIdx];
    const currentRecordShort = currentRecord ? (currentRecord.recordNumber || '').split(' ')[0] : '회차 없음';
    const specialNote =
        currentRecord?.specialNote != null ? currentRecord.specialNote : '특이사항 없음';


    const handlePrev = () => {
      if (recordIdx > 0) setRecordIdx(recordIdx - 1);
    };
    const handleNext = () => {
      if (recordIdx < allRecords.length - 1) setRecordIdx(recordIdx + 1);
    };

    return (
        <>
            <View style={styles.container}>
                <Header title="돌봄노트 상세" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={[GlobalStyles.screenMargin]}>
                        <MonthNavigator style={{marginBottom:0}}
                            monthLabel={currentRecordShort}
                            onPrev={handlePrev}
                            onNext={handleNext}
                            isPrevDisabled={recordIdx === 0}
                            isNextDisabled={recordIdx === allRecords.length - 1}
                        />
                        <CareNoteTitle name={senior.name} />
                        <View style={GlobalStyles.cardGap}>
                            <View style={styles.specificDesWrapper}>
                                <Text style={styles.specificTitleText}>특이사항</Text>
                                {specialNote ? (
                                  <Text style={styles.specificDesText}>{specialNote}</Text>
                                ) : null}
                            </View>
                            <View style={[styles.specificDesWrapper, {backgroundColor:colorPallet.subColor}]}> 
                                <Text style={styles.specificTitleText}>반응 남기기</Text>
                                <Text style={styles.specificDesText}>반응은 여기 적힐 거예요.</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default GuardianCareNoteDetailEach;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginBottom: 10,
        flex: 1,
    },
    specificDesWrapper:{
        backgroundColor:"#E9F2FF",
        borderRadius:borderRadiusSizes.large,
        paddingHorizontal:paddingSizes.m_large,
        paddingVertical:paddingSizes.m_large,

    },
    specificTitleText:{
        fontSize:fontSizes.m_large,
        fontFamily:fonts.bold,
        color:colorPallet.defaultText,
    },
    specificDesText:{
        fontSize:fontSizes.m_large,
        fontFamily:fonts.regular,
        color:colorPallet.defaultDesText,
    },

});