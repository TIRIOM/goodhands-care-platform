import {ScrollView, StyleSheet, View} from "react-native";
import Header from "../../components/Header/Header.tsx";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import React from "react";


const TemplateTab=()=>{
    return (
        <>
            <View style={styles.container}>
                <Header title="상세정보" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>

                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default TemplateTab;

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