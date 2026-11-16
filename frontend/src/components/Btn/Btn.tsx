import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import { fonts } from '../../styles/fonts';
import {borderRadiusSizes, fontSizes} from "../../styles/globalStyles.tsx";

interface CheckButtonProps {
    text?: React.ReactNode;
    onPress?: () => void;
    style?:ViewStyle | ViewStyle[];
    textStyle?:TextStyle;
}

const Btn = ({ style,textStyle, text = '버튼', onPress }: CheckButtonProps) => {
    return (
        <TouchableOpacity style={[styles.Btn,style]} onPress={onPress}>
            <Text style={[styles.BtnText,textStyle]}>{text}</Text>
        </TouchableOpacity>
    );
};

export default Btn;

const styles = StyleSheet.create({
    Btn: {
        backgroundColor: '#fff',
        borderRadius: borderRadiusSizes.medium,

        paddingVertical: 10,
        paddingHorizontal: 16,

        alignItems: 'center',
    },
    BtnText: {
        fontSize: fontSizes.medium,
        color: '#333',
        fontFamily:fonts.medium
    },
});
