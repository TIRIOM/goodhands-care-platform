import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {fonts} from "../../styles/fonts.tsx";
import {fontSizes, paddingSizes} from "../../styles/globalStyles.tsx";
import {FireIcon} from "../../styles/images.tsx";
import {CareSchedule} from "../../data/type/CareSchedules.tsx";
import Btn from "../Btn/Btn.tsx";

interface CareNoteSummaryCardProps extends CareSchedule {
    onPress: () => void;
    customButtonText?: string;
    buttonOnPress?: () => void;
}

const CareNoteSummaryCard: React.FC<CareNoteSummaryCardProps> = ({ 
    name, 
    condition, 
    color, 
    onPress, 
    buttonText,
    customButtonText,
    buttonOnPress 
}) => {
    return (
        <View style={[styles.cardContainer, color === 'blue' ? styles.blue : styles.gray]}>
            <View style={styles.profileImage} />
            <View style={styles.scheduleInfoContainer}>
                <View style={styles.scheduleInfo}>
                    <Text style={styles.name}>{name}</Text>
                    <Btn 
                        text={customButtonText || buttonText || "바로가기"} 
                        onPress={buttonOnPress || onPress} 
                    />
                </View>
                <Text style={styles.des}>특별사항</Text>
                <View style={styles.conditionProgress}>
                    <View style={styles.conditionImageWrapper}>
                        <FireIcon />
                        <Text style={styles.conditionText}>{condition}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default CareNoteSummaryCard;

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        //alignItems: 'stretch',

        borderRadius: 14,
        gap:13,
        padding: paddingSizes.medium,
    },
    scheduleInfoContainer:{
        flexDirection: 'column',
        flex: 9,
        //backgroundColor:'#ff0000',
    },
    blue: {
        backgroundColor: '#e9f2ff',
    },
    gray: {
        backgroundColor: '#f4f6f6',
    },
    profileImage: {
        aspectRatio:1,


        backgroundColor: '#cdd5db',
        borderRadius: 10,
    },
    scheduleInfo: {
        justifyContent : 'space-between',
        flexDirection : "row",
        flex: 1,
    },
    name: {
        fontSize: fontSizes.large,
        fontWeight: '600',
        color: '#26252c',
        lineHeight:24,
        fontFamily: fonts.bold,
    },
    des:{
        fontSize: fontSizes.medium,
        fontFamily: fonts.medium,
    },
    seniorRoundWrapper: {
        flexDirection:'row',
        flexWrap:'wrap',
        gap:5,
        //backgroundColor:'red',
    },
    seniorName: {
        fontSize: fontSizes.medium,
        fontWeight: '400',
        color: '#26252c',
        fontFamily: fonts.bold,
    },
    round: {
        fontSize: fontSizes.medium,
        fontWeight: '500',
        color: '#26252c',
        fontFamily: fonts.medium,
    },
    startBtn: {
        backgroundColor: '#fff',
        borderRadius: 9,
        paddingVertical: 6,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        //shadowColor: '#000',
        //shadowOffset: { width: 0, height: 1 },
        //shadowOpacity: 0.04,
        //shadowRadius: 4,
        //elevation: 1,
    },
    startBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#26252c',
        fontFamily: fonts.medium,
    },
    conditionProgress: {
        flexDirection: 'row',
        //justifyContent: 'space-between',
        //flex: 1,

        alignItems: 'flex-start',
        backgroundColor: '#fff',

        borderRadius: 4,

        paddingVertical: 8,
        paddingHorizontal: 8,
        marginTop: 8,
        fontSize: 13,
    },
    conditionImageWrapper:{
        gap: 4,
        flexDirection:'row',
        alignItems:'center',
    },
    conditionText: {
        color: '#26252c',
        fontSize: fontSizes.s_medium,

        lineHeight:13,
        fontFamily: fonts.medium,
        justifyContent : 'center',
    },


});

