import {StyleSheet, Text, TouchableOpacity, ViewStyle} from "react-native";
import React, {useState} from "react";
import {fonts} from "../../styles/fonts.tsx";
import AttendanceModal from "../Tab/AttendanceModal.tsx";
import {borderRadiusSizes} from "../../styles/globalStyles.tsx";
import {checkIn} from "../../api/caregiver.ts";

interface CareStartBtnProps {
    style?:ViewStyle | ViewStyle[];
    caregiverId: number;
    location?: string;
    attendance_status: string;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
}

const CareStartBtn=({style, caregiverId, location = "string", attendance_status = "true",onSuccess, onError}:CareStartBtnProps)=>{
    const [visible, setVisible] = useState(false);


    const handleCareStart = async () =>{
        setVisible(true);
        const data = {
            "senior_id": caregiverId,
            "location": location,
            "attendance_status": attendance_status,
        }

        try {
            const response = await checkIn(data);
            onSuccess?.(response);
        } catch (error) {
            console.error('체크인 실패:', error);
            onError?.(error);
        }
    };

    return (
        <>
            <TouchableOpacity style={[styles.startBtn,style]} onPress={handleCareStart}>
                <Text style={styles.startBtnText}>돌봄시작</Text>
            </TouchableOpacity>
            <AttendanceModal visible={visible} onClose={() => setVisible(false)}  attendanceTitle={"출근 완료"}/>
        </>
    );
};

export default CareStartBtn;

const styles = StyleSheet.create({
    startBtn: {
        backgroundColor: '#fff',
        borderRadius: borderRadiusSizes.medium,
        height:40,

        alignItems:'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    startBtnText: {
        fontSize: 14,
        color: '#26252c',
        fontFamily: fonts.medium,

    },

});


