// OfficePopup.tsx
import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Btn from "../Btn/Btn.tsx";
import { fonts } from '../../styles/fonts.tsx';
import {useNavigation} from "@react-navigation/native";

interface OfficePopupProps {
    onClose: () => void;
    visible: boolean;
}

//퇴근실패 모달
const OfficePopup = ({ onClose, visible }: OfficePopupProps) => {
    const navigation = useNavigation();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popupBox}>
                    <View style={{flexDirection:'row', alignContent:'flex-start', justifyContent:'space-between'}}>
                        <View style={styles.titleDescWrapper}>
                            <Text style={styles.title}>퇴근 실패</Text>
                            <Text style={styles.desc}>아직 작성해야 하는 기록이 있어요.</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.closeBtn]}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <Btn
                        text={
                            <View style={{flexDirection:'row',gap:6}}>
                                <Text style={{fontWeight:500,fontFamily:fonts.bold,fontSize:16}}>체크리스트</Text>
                                <Text style={{fontWeight:500, fontFamily:fonts.medium,fontSize:16}}>확인하기</Text>
                            </View>
                        }
                        onPress={() => navigation.navigate('CheckList' as never)}
                        />
                    <Btn
                        text={
                            <View style={{flexDirection:'row',gap:6}}>
                                <Text style={{fontWeight:500,fontFamily:fonts.bold,fontSize:16}}>돌봄노트</Text>
                                <Text style={{fontWeight:500, fontFamily:fonts.medium,fontSize:16}}>확인하기</Text>
                            </View>
                        }
                        onPress={() => navigation.navigate('CareNote' as never)}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default OfficePopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupBox: {
        backgroundColor: '#E9F2FF',
        padding: 24,
        borderRadius: 12,
        width: '85%',
        position: 'relative',
    },
    titleDescWrapper:{
        justifyContent:'space-between'
    },
    closeBtn: {
        fontSize:18,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    desc: {
        marginBottom: 16,
        color: '#333',
    },
    checkBtn: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
});
