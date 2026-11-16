import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text, TextInput,
    View
} from 'react-native';
import CheckListHeader from '../../components/Header/CheckListHeader.tsx';
import { fonts } from '../../styles/fonts.tsx';
import {colorPallet, fontSizes} from '../../styles/globalStyles.tsx';
import Btn from "../../components/Btn/Btn.tsx";
import {useRoute} from "@react-navigation/native";

export const seniorDiseases: string[] = [
    'dementia',
    'diabetes',
    'hypertension',
    'parkinsons',
    'stroke',
    'arthritis',
    'copd',
    'heartDisease',
    'osteoporosis',
    'mentalHealth',
];

const CreateCareNoteScreen = () => {
    const route = useRoute();
    // @ts-ignore
    const { recordNumber } = route.params || {};

    return (
        <View style={styles.container}>
            <CheckListHeader title={'돌봄노트'} recordNumber={recordNumber}/>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={{gap:20,marginVertical:30,}}>
                    <View style={{ gap:20,}}>
                        <View style={styles.desc}>
                            <Text style={styles.diseaseTitle}>🎉 이번주 특별한 순간</Text>
                            <Text>어르신과 함께한 시간 중 가장 인상 깊었던 순간이나 따뜻했던 에피소드가 있다면?</Text>
                            <View style={{borderLeftWidth:2,borderColor:"#a3b5ce"}}>
                                <Text style={{fontFamily:fonts.bold,color:"#666375"}}>  💡 작성 가이드</Text>
                                <Text style={{color:colorPallet.des}}>   - 어르신이 웃으셨던 순간{"\n"}   - 특별히 좋아하신 것들{"\n"}   - 감동적이었던 대화나 행동{"\n"}   - 평소와 다르게 활기차셨던 모습</Text>
                            </View>
                        </View>
                        <View style={styles.questionContainer}>
                                <View style={styles.qOptionMap}>
                                    <TextInput
                                        style={{
                                            flex:1,
                                            backgroundColor:colorPallet.subColor,
                                            borderRadius: 8, padding: 12, minHeight: 80,textAlignVertical: 'top' }}
                                        multiline
                                        placeholder="내용을 입력해주세요"
                                        value={''}
                                    />
                                </View>
                            <View style={styles.btnWrapper}>
                                <Btn text={"완료하기"} style={styles.submitBtn} textStyle={{ color: '#fff' }} />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default CreateCareNoteScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginHorizontal: 24,
        flex: 1,
    },
    desc:{
        gap:10,
    },
    diseaseTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSizes.xlarge,
        color:colorPallet.blueColor,
    },
    questionContainer: {
        marginTop: 18,
    },
    qTitle: {
        color:colorPallet.defaultText,
        fontFamily: fonts.bold,
        fontSize: fontSizes.m_large,
        marginBottom: 12,
    },
    qNumber: {
        color: '#A298B7',
        fontFamily: fonts.bold,
        fontSize: fontSizes.xlarge,
    },
    qOptionMap: {
        flexDirection: 'row',
        gap: 8,
    },
    qOption: {
        flex: 1,
        aspectRatio:1,
        backgroundColor: '#F6F6F6',

        paddingVertical: 12,
        borderRadius: 12,

        justifyContent:"center",
        alignContent:"center",
        flexWrap:"wrap",
        alignItems: 'center',
    },
    qOptionSelected: {
        backgroundColor: '#E4EFFF',
    },
    qOptionText: {
        color: '#222',
        fontSize:fontSizes.medium,
        fontFamily: fonts.regular,
        textAlign:"center",
        lineHeight:fontSizes.medium,
        flexWrap:"wrap",
    },
    qOptionTextSelected: {
        color: '#1D3F84',
    },
    extraInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        fontFamily: fonts.regular,
    },
    btnWrapper:{
        alignItems:"flex-end",
    },
    submitBtn:{
        backgroundColor:colorPallet.blueColor,
        borderRadius:40,
        width:100,
        marginVertical:10,
    }
});
