import {ScrollView, StyleSheet, Text, View} from "react-native";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import React from "react";
import MySeniorCheckList from "./Components/MySeniorCheckList.tsx";
import MainHeader from "../../components/Header/MainHeader.tsx";

const GuardianCareListScreen = () => {
    // const route = useRoute();
    // // @ts-ignore
    // const { senior } = route.params || {};
    return (
        <>
            <View style={GlobalStyles.mainContainer}>
                <MainHeader title="돌봄노트" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} >
                    <View style={GlobalStyles.screenMargin}>
                        <View>
                            <Text style={GlobalStyles.sectionTitle}>나의 시니어</Text>
                            <MySeniorCheckList/>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default GuardianCareListScreen

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