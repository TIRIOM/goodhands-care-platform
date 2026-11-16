import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header/Header.tsx';
import RecordSection from './../DetailScreen/components/RecordSection.tsx';
import CareListProfileCard from "./Components/CareListProfileCard.tsx";
import {GlobalStyles} from "../../styles/globalStyles.tsx";

const CareListDetail = () => {
    const route = useRoute();
    // @ts-ignore
    const { senior } = route.params || {};
    return (
        <>
            <View style={styles.container}>
                <Header title="상세정보" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>
                        <CareListProfileCard senior={senior}/>
                        <RecordSection senior={senior}/>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

    },
    scrollView: {
        marginBottom: 10,
        flex: 1,
    },
});

export default CareListDetail;
