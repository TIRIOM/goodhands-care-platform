// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { fonts } from './fonts'; // 이미 있다면 import

export const fontSizes = {
    small: 12,
    s_medium:14,
    medium: 16,
    m_large: 18,
    large: 20,
    xlarge: 26,
};

export const paddingSizes = {
    small: 8,
    s_medium: 12,
    medium: 15,
    m_large:20,
    large: 24,
};

export const borderRadiusSizes={
    medium:8,
    large:12,
    xlarge:14,
}

export const marginSizes = {
    small: 8,
    s_medium:12,
    medium: 16,
    large: 24,
};

export const gapSizes={
    small:4,
    medium:22,
};

export const colorPallet = {
    defaultText : "#26252C",
    defaultDesText : "rgba(38,37,44,0.83)",
    mainColor:"#E9F2FF",
    subColor:"#F4F6F6",
    secondaryColor:"#CDD5DB",
    blueColor:"#0A85FB",
    skyblueColor:"#70BAFB",
    des:"#7b7983",


};

export const GlobalStyles = StyleSheet.create({
    Tab:{
        marginHorizontal:10,
    },
    Title: {
        fontSize: fontSizes.large,
        fontWeight: 'bold',
        marginBottom: 15,
        color:'#5B5A64',
    },
    XTitle:{
        fontSize: fontSizes.xlarge,
        fontFamily: fonts.bold,
    },
    SubTitle:{
        fontSize:fontSizes.medium,
        fontFamily:fonts.medium,
        color:'#5B5A64',
    },
    screenMargin:{
        marginHorizontal:17,
        gap:gapSizes.medium,
        marginVertical:gapSizes.medium,
    },
    titleOfGap:{//첫번째 타이틀 위에 사이즈
        //height:gapSizes.medium,
    },
    headerMargin:{
        height:20,
        backgroundColor: '#fff',
    },
    mainContainer:{
        paddingTop: 20,
        flex: 1,
        backgroundColor: '#fff',
    },
    cardGap:{
        gap:14
    },
    mainSectionTitle:{
        fontSize: fontSizes.xlarge,
        fontFamily: fonts.bold,
        marginBottom:marginSizes.s_medium,
    },
    sectionTitle:{
        fontSize: 20,
        fontFamily: fonts.bold,
        color: colorPallet.defaultText,
        marginBottom:marginSizes.s_medium,
    },
    titleBottom:{
        marginBottom:marginSizes.s_medium,
    },
    careCardListWrapper: {
        flexDirection: 'row',
        justifyContent : 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    }
});
