import {ScrollView, StyleSheet, Text, View} from "react-native";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import React from "react";
import MainHeader from "../../components/Header/MainHeader.tsx";


const SubScreen=()=>{
    return (
        <>
            <View style={GlobalStyles.mainContainer}>
                <MainHeader title="챌린지" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>
                        <View>
                            <Text style={[GlobalStyles.sectionTitle]}>리스트</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default SubScreen;

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