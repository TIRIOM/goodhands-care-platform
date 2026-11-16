import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CheckListHeader from '../../components/Header/CheckListHeader.tsx';
import { diseaseFollowUpChecklist } from '../../data/checkList/diseaseFollowUpChecklist.tsx';
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

const CareListScreen = () => {
    const [selected, setSelected] = useState<{ [key: string]: string }>({});
    const route = useRoute();
    // @ts-ignore
    const { recordNumber } = route.params || {};


    return (
        <View style={styles.container}>
            <CheckListHeader title={"체크리스트"} recordNumber={recordNumber}/>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={{gap:20,marginVertical:30,}}>
                    {diseaseFollowUpChecklist
                        .filter(disease => disease.id === 'common' || seniorDiseases.includes(disease.id))
                        .map(disease => (
                            <View key={disease.id} style={{ marginBottom: 10, gap:10,}}>
                                <Text style={styles.diseaseTitle}>{disease.title}</Text>
                                {disease.questions.map((q, index) => (
                                    <View key={q.id} style={styles.questionContainer}>
                                        <Text style={styles.qTitle}>
                                            <Text style={styles.qNumber}>{String(index + 1).padStart(2, '0')}. </Text>
                                            {q.question}
                                        </Text>
                                        <View style={styles.qOptionMap}>
                                            {q.options.map(opt => {
                                                const isSelected = selected[q.id] === opt;
                                                return (
                                                    <TouchableOpacity
                                                        key={opt}
                                                        style={[styles.qOption, isSelected && styles.qOptionSelected]}
                                                        onPress={() => setSelected(prev => ({ ...prev, [q.id]: opt }))}
                                                    >
                                                        <Text style={[styles.qOptionText, isSelected && styles.qOptionTextSelected]}>
                                                            {opt}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                </View>
                <View style={styles.btnWrapper}>
                    <Btn text={"완료하기"} style={styles.submitBtn} textStyle={{ color: '#fff' }} />
                </View>
            </ScrollView>
        </View>
    );
};

export default CareListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginHorizontal: 24,
        flex: 1,
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
        marginVertical:60,
    }
});
