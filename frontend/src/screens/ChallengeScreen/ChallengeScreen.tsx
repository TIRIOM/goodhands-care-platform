import {ScrollView, StyleSheet, Text, View} from "react-native";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import React from "react";
import MainHeader from "../../components/Header/MainHeader.tsx";
import DesComponent from "../../components/DesComponent.tsx";


const ChallengeScreen=()=>{
    return (
        <>
            <View style={GlobalStyles.mainContainer}>
                <MainHeader title="챌린지" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>
                        <View>
                            <Text style={[GlobalStyles.sectionTitle]}>리스트</Text>
                            <DesComponent title={"어버이날 기념하기"} des={"어버이날을 맞이해 부모님에게 연락을 드려 보세요."}/>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default ChallengeScreen;

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