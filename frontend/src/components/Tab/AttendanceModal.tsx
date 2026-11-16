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
import TodayString from "../TodayString.tsx";

interface AttendanceModalProps {
    onClose: () => void;
    attendanceTitle: string,
    visible: boolean;
}

//근태 모달
const AttendanceModal = ({ onClose, visible, attendanceTitle }: AttendanceModalProps) => {
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
                            <Text style={styles.titleText}>{attendanceTitle}</Text>
                            <View>
                                <TodayString format={"YY.MM.DD (요일) HH:MM"} style={{fontSize:18,fontFamily:fonts.regular}}/>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.closeBtn]}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.locationGPS} />
                    <View style={styles.locationWrapper}>
                        <Text style={styles.locationTitleText}>접속위치</Text>
                    </View>
                    {/*<CurrentLocation/>*/}
                    <Btn
                        text={"확인"}
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default AttendanceModal;

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
        gap:20,
    },
    titleDescWrapper:{
        justifyContent:'space-between'
    },
    closeBtn: {
        fontSize:18,
    },
    locationGPS:{
        backgroundColor:"gray",
        height:218,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color:'#26252C',
    },
    locationWrapper:{
        flexDirection:'column',
        gap:4,
    },
    descText: {
        color:'#26252C',
        fontSize:18,
    },
    locationTitleText: {
        color:'#26252C',
        fontSize:18,
        fontFamily:fonts.bold
    },
    locationText:{
        fontFamily:fonts.medium,
        color:'#26252C',
    },
});
