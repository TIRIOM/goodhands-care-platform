import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HeaderAlarmButton from "./Header/HeaderAlarmButton.tsx";
import { fonts } from '../styles/fonts.tsx';

interface NoticeHeaderProps {
    message: string;
    progressNum: string;
}

const NoticeHeader: React.FC<NoticeHeaderProps> = ({ message, progressNum }) => (
    <View style={styles.noticeHeader}>
        <View style={styles.noticeBanner}>
            <Text style={styles.noticeMessage}>{message}</Text>
            <Text style={styles.progressNum}>{progressNum}</Text>
        </View>
        <HeaderAlarmButton />
    </View>
);

const styles = StyleSheet.create({
    noticeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noticeBanner: {
        backgroundColor: '#4fabfd',
        borderRadius: 4,
        flex:1,
        marginRight:15,


        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,

        height: 36,
        minWidth: 280,
    },
    noticeMessage: {
        flex: 1,
        color: '#fefbfb',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: fonts.medium,
        letterSpacing: -0.35,
    },
    progressNum: {
        marginLeft: 12,
        color: '#2c2725',
        fontWeight: '600',
        fontSize: 14,
        fontFamily: fonts.medium,
    },
    notification: {
    },
});

export default NoticeHeader;