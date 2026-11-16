import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HeaderAlarmButton from './HeaderAlarmButton.tsx';
import { fonts } from '../../styles/fonts.tsx';

interface DetailHeaderProps {
    title: string;
}

const MainHeader: React.FC<DetailHeaderProps> = ({ title }) => {

    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <HeaderAlarmButton />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,

        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 26,
        fontFamily:fonts.bold,
        color:'#26252C',
        flex: 1,
    },
});

export default MainHeader;