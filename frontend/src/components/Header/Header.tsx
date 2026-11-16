import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderAlarmButton from './HeaderAlarmButton.tsx';
import {GlobalStyles} from "../../styles/globalStyles.tsx";

interface DetailHeaderProps {
    title: string;
    style?: any;
}

const Header: React.FC<DetailHeaderProps> = ({ title, style }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.goBack()
    };

    return (
        <>
            <View style={GlobalStyles.headerMargin} />
            <View style={[styles.header, style]}>
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
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',

        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
        borderStyle:'solid',
        borderWidth:1,
        borderColor:'#EBEEF1',
        borderRadius:4,
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
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
});

export default Header;