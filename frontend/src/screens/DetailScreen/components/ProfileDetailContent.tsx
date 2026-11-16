import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import { fonts } from '../../../styles/fonts';
import { Senior } from '../../../types/database';

const ProfileDetailContent = ({ senior }: { senior: Senior }) => {
    // Senior 타입에서 필요한 데이터를 추출하고 기본값 설정
    const location = senior.nursing_home?.address || '가톨릭대학 서울성모병원 F동 105호';
    const contact = senior.nursing_home?.phone || '02-3716-6190';
    const age = senior.age ? `${senior.age}세` : '76세';
    
    // 성별 변환 (백엔드 형식에 맞춤)
    const getGenderDisplay = (gender?: string) => {
      if (!gender) return '여자';
      switch (gender) {
        case 'male':
        case '남성':
          return '남자';
        case 'female':
        case '여성':
          return '여자';
        default:
          return '여자';
      }
    };
    const gender = getGenderDisplay(senior.gender);
    
    // 질병 정보 (diseases 배열에서 추출)
    const illnesses = senior.diseases?.map(disease => disease.disease_type) || ['고혈압', '치매', '욕창'];
    const illnessText = illnesses.join(', ');
    
    // AI 키워드 (기본값 사용)
    const keywords = ['고혈압', '치매', '욕창', '외로움'];
    
    // AI 요약 (기본값 사용)
    const summary = '혼자 있는 작은 딸을 걱정하는 엄마';

    return (
        <View style={styles.detailContainer}>
            <View style={styles.detailItemWrapper}>
                <Text style={styles.detailLabel}>장소</Text>
                <Text style={styles.detailValue}>
                    {location}
                </Text>
            </View>


            <View style={styles.detailItemWrapper}>
                <Text style={styles.detailLabel}>요양원 연락처</Text>
                <Text style={styles.detailValue}>{contact}</Text>
            </View>


            <View style={styles.detailRowGroup}>
                <View style={styles.detailItemWrapper}>
                    <Text style={styles.detailLabel}>나이</Text>
                    <Text style={styles.detailValue}>{age}</Text>
                </View>
                <View style={styles.detailItemWrapper}>
                    <Text style={styles.detailLabel}>성별</Text>
                    <Text style={styles.detailValue}>{gender}</Text>
                </View>
                <View style={[styles.detailItemWrapper,{flex:1}]}>
                    <Text style={styles.detailLabel}>지병</Text>
                    <Text style={styles.detailValue}>
                        {illnessText}
                    </Text>
                </View>
            </View>


            <View style={styles.detailItemWrapper}>
                <Text style={styles.detailLabel}>AI 추천 키워드</Text>
                <View style={styles.keywordContainer}>
                    {keywords.map((keyword: string, index: number) => (
                        <Text key={index} style={styles.keywordChip}>
                            {keyword}
                        </Text>
                    ))}
                </View>
            </View>


            <View style={styles.detailItemWrapper}>
                <Text style={styles.detailLabel}>AI 추천 요약</Text>
                <View style={styles.summaryBox}>
                    <Image
                        source={require('../../../../assets/images/icons/conditionIcon.png')}
                        style={{width:15,height:15}}
                        resizeMode="contain"
                    />
                    <Text style={styles.summaryText}>
                        {summary}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    detailContainer:{
        backgroundColor: '#E9F2FF',
        paddingHorizontal: 19,
    },
    detailItemWrapper: { marginBottom: 20 },
    detailLabel: {
        fontSize: 14,
        fontFamily:fonts.medium,
        color: '#26252C',
        marginBottom: 4,
    },
    detailValue: {
        fontFamily:fonts.bold,
        fontSize: 14,
        color: '#444',
    },
    detailRowGroup: {
        gap:30,
        marginBottom: 8,
        flexDirection:'row',
    },
    keywordContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    keywordChip: {
        backgroundColor: '#ffffff',
        borderRadius: 6,
        paddingHorizontal: 17,
        paddingVertical: 6,

        alignItems:'center',
        fontSize: 12,
        flexDirection:'row',
        lineHeight:12,
        marginRight: 6,
        marginBottom: 6,
        color: '#333',
    },
    summaryBox: {
        flexDirection:"row",
        backgroundColor: '#ffffff',
        alignItems:'center',
        gap:5,
        padding: 6,
        borderRadius: 6,
        marginTop: 6,
        paddingHorizontal:10,
        alignSelf:'flex-start',
    },
    summaryText: {
        lineHeight:13,
        fontSize: 13,
    },
});

export default ProfileDetailContent;
