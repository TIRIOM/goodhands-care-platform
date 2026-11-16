import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderAlarmButton from './HeaderAlarmButton.tsx';
import { fonts } from '../../styles/fonts.tsx';

interface DetailHeaderProps {
    title: string;
    style?: any;
    recordNumber:string;
}

const CheckListHeader: React.FC<DetailHeaderProps> = ({ title, recordNumber }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack()
    };

    return (
        <>
            <ImageBackground
                source={require('../../../assets/images/checkListBackGround.png')}
                resizeMode="cover" >
                <View style={{height:30,}} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Image
                            source={require('../../../assets/images/icons/BackIcon.png')}
                            style={styles.backIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>{title}</Text>
                    <HeaderAlarmButton />
                </View>
                <View style={{height:160,}} />
            </ImageBackground>
            <View style={{position:"absolute",flexDirection:"row",alignItems:"flex-end", top:150, left:90,}}>
                <Text style={[styles.recordText,{lineHeight: 50,}]}>{parseInt(recordNumber)}</Text>
                <Text style={[styles.recordText,{fontSize: 25,fontFamily: fonts.medium,lineHeight: 35,}]}>회차</Text>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',

        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
        borderStyle:'solid',
        borderWidth:1,
        borderColor:'#EBEEF1',
        backgroundColor:"#fff",
        borderRadius:40,
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
        //backgroundColor:'#a22424',
    },
    backIcon:{
        width:19,
        height:19,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    recordText:{
        fontSize:55,
        fontFamily:fonts.bold,
        color:"#fff",
        lineHeight:50,
    },

});

export default CheckListHeader;