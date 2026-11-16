import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../styles/fonts.tsx';

interface SeniorProfileCardProps {
    name: string;
    schedules: ReactNode;
}

const SeniorProfileCard = ({ name, schedules }: SeniorProfileCardProps) => (
    <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
            <View style={styles.profileImage} />
            <View style={styles.profileDetails}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.label}>돌봄일정</Text>
                <View style={styles.scheduleContainer}>
                    {schedules}
                </View>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    profileCard: {
        backgroundColor: '#E9F2FF',
        borderRadius: 12,
        borderBottomLeftRadius:0,
        borderBottomRightRadius:0,
        padding: 16,
        paddingHorizontal: 19,
    },
    profileInfo: {
        flexDirection: 'row',
        alignContent:'flex-start',
    },
    profileImage: {
        aspectRatio:1,
        width: 110,
        backgroundColor: '#cdd5db',
        borderRadius: 10,
        marginRight: 16,
    },
    profileDetails: {
        flex: 1,
        paddingRight:50,
        flexDirection:'column',
        justifyContent:'flex-start',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        lineHeight:20,
    },
    label: {
        fontSize: 14,
        marginBottom: 10,
        marginTop:3,
        fontFamily:fonts.medium,
    },
    scheduleContainer: {
        gap: 4,
    },
});

export default SeniorProfileCard; 