import React from 'react';
import { View, StyleSheet } from 'react-native';
import SeniorCareCard from './SeniorCareCard.tsx';
import {SeniorCare} from "../../data/type/transformSeniors.ts";


interface SeniorCareCardListProps {
    seniors: SeniorCare[];
    onDetail?: (senior: SeniorCare) => void;
}

const SeniorCareCardList: React.FC<SeniorCareCardListProps> = ({ seniors, onDetail }) => (
    <View style={styles.albumLayout}>
        {seniors.map((senior, idx) => (
            <View key={idx} style={styles.cardWrapper}>
                <SeniorCareCard {...senior} onDetail={() => onDetail?.(senior)} />
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    albumLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cardWrapper: {
        width: '48%', // 앨범형식 2열 배치를 위한 너비
    },
});

export default SeniorCareCardList; 