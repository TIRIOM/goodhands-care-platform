import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { fonts } from '../../../styles/fonts';
import { useNavigation } from '@react-navigation/native';
import CareStartBtn from "../../../components/Btn/CareStartBtn.tsx";
import { getUserRole, getToken } from '../../../utils/tokenManager';
import {borderRadiusSizes, colorPallet} from "../../../styles/globalStyles.tsx";
import type { SeniorType } from '../../../dto/common/SeniorType.ts';

interface CareRecordItemProps {
    date: string;
    day: string;
    recordNumber: string;
    senior: SeniorType;
    isToday?: boolean;
    caregiverId?: number;
    onPress?: () => void;
}

const CareRecordItem: React.FC<CareRecordItemProps> = ({ date, day, recordNumber, senior, isToday = false, caregiverId: propCaregiverId, onPress }) => {
    const navigation = useNavigation();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [localCaregiverId, setLocalCaregiverId] = useState<number>(1);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const role = await getUserRole();
                setUserRole(role);
                
                // props로 받은 caregiverId가 있으면 사용, 없으면 토큰에서 추출
                if (propCaregiverId) {
                    setLocalCaregiverId(propCaregiverId);
                } else {
                    const token = await getToken();
                    if (token) {
                        setLocalCaregiverId(1); // 기본값
                    }
                }
            } catch (error) {
                console.error('사용자 데이터 로드 실패:', error);
            }
        };
        loadUserData();
    }, [propCaregiverId]);

    const handleChecklist = (recordNumber: string) => {
        console.log('현재 사용자 역할:', userRole);
        navigation.navigate('CheckList' as never, { recordNumber } as never);
    };

    const handleCareNote = (recordNumber: string) => {
        if (userRole === 'caregiver') {
            navigation.navigate('CareNote' as never,{ recordNumber } as never);
        } else if (userRole === 'guardian') {
            navigation.navigate('CareNoteDetailEach' as never, { senior, recordNumber } as never);
        }
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={[styles.container, isToday && styles.todayContainer]}>
                <View style={styles.dateSection}>
                    <Text style={styles.date}>{parseInt(date, 10)}</Text>
                    <Text style={styles.day}>{day}</Text>
                </View>
                <View style={[styles.contentSection,{gap:8,}]}>
                    <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                        <Text style={styles.recordNumber}>{recordNumber}회차 돌봄기록</Text>
                        {userRole === 'caregiver' && (
                            <CareStartBtn 
                                caregiverId={localCaregiverId}
                                location={"string"}
                                attendance_status={"true"}
                                style={{
                                    borderWidth:1,
                                    borderColor:colorPallet.blueColor,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                }}
                            />
                        )}

                    </View>

                    
                    <View style={styles.buttonContainer}>
                        {userRole === 'caregiver' && (
                            <TouchableOpacity style={styles.button} onPress={()=>handleChecklist(recordNumber)}>
                                <Text style={styles.buttonText}>체크리스트</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.button} onPress={()=>handleCareNote(recordNumber)}>
                            <Text style={styles.buttonText}>이주의 노트</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F4F6F6',
        borderRadius: 12,
        padding: 15,

        justifyContent:'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    todayContainer: {
        backgroundColor: '#e9f2ff',
        borderWidth: 2,
        borderColor: '#0084FF',
    },
    dateSection: {
        alignItems: 'center',
        marginRight: 20,
        flex:1,
    },
    date: {
        fontSize: 30,
        fontFamily:fonts.bold,
    },
    day: {
        fontSize: 14,
        marginTop: 2,
        fontFamily:fonts.bold,
    },
    contentSection: {
        flex: 4,
    },
    recordNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        //backgroundColor:'red'
    },
    button: {
        backgroundColor: '#ffffff',
        borderRadius: borderRadiusSizes.medium,
        justifyContent:'center',
        flex:1,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily:fonts.medium,
        color: '#26252c',
        fontSize: 14,
    },
});

export default CareRecordItem; 