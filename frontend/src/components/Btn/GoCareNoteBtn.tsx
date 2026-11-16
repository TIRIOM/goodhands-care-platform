import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import React from "react";
import {fonts} from "../../styles/fonts.tsx";

interface BtnProps {
    style?:ViewStyle | ViewStyle[];
}

const GoCareNoteBtn=(_props:BtnProps)=>{


    const handleGoCareNoteBtn = () =>{

    };

    return (
        <>
            <TouchableOpacity style={styles.Btn} onPress={handleGoCareNoteBtn}>
                <Text style={styles.Btn}>돌봄노트 확인하기</Text>
            </TouchableOpacity>
        </>
    );
};

export default GoCareNoteBtn;

const styles = StyleSheet.create({
    Btn: {
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    BtnText: {
        fontSize: 14,
        color: '#26252c',
        fontFamily: fonts.medium,

    },

});


