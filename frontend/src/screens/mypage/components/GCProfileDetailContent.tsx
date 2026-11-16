import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../../styles/fonts';


interface bankAccount {
    bank:string;
    number:string;
}

// 더 유연한 인터페이스 정의
interface ProfileDetailProps {
    careGiver: {
        id: number;
        name: string;
        gender?: string;
        age?: number;
        address?: string;
        guardian_id: number;
        created_at: string;
        updated_at: string;
        phoneNumber:string;
        email:string;
        salaryAccount : bankAccount;
    };
}

const GCProfileDetailContent: React.FC<ProfileDetailProps> = ({ careGiver: careGiver }) => {
    // 데이터 추출 및 기본값 설정
    const age = careGiver.age ? `${careGiver.age}세` : '76세';

    // 성별 변환 (다양한 형식 지원)
    const getGenderDisplay = (gender?: string) => {
        if (!gender) return '여자';
        switch (gender.toLowerCase()) {
            case 'male':
            case '남성':
            case '남':
                return '남자';
            case 'female':
            case '여성':
            case '여':
                return '여자';
            default:
                return '여자';
        }
    };
    const gender = getGenderDisplay(careGiver.gender);

    return (
        <View style={styles.detailContainer}>
            <View style={styles.detailItemWrapper}>
                <Text style={styles.detailLabel}>전화번호</Text>
                <Text style={styles.detailValue}>
                    {careGiver.phoneNumber}
                </Text>
            </View>

            <View style={styles.detailItemWrapper}>
                <Text style={styles.detailLabel}>이메일</Text>
                <Text style={styles.detailValue}>{careGiver.email}</Text>
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
                    <Text style={styles.detailLabel}>급여계좌</Text>
                    <Text style={styles.detailValue}>
                        {careGiver.salaryAccount.bank} {careGiver.salaryAccount.number}
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

export default GCProfileDetailContent;
