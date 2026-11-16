import {ScrollView, StyleSheet, View} from "react-native";
import Header from "../../components/Header/Header.tsx";
import {GlobalStyles} from "../../styles/globalStyles.tsx";
import React from "react";
import InputTextPage from "../../components/InputTextPage.tsx";


const GuardianRequestPageScreen=()=>{
    return (
        <>
            <View style={styles.container}>
                <Header title="상세정보" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={GlobalStyles.screenMargin}>
                        <InputTextPage
                            title={"요청사항"}
                            subTitle={"요청사항을 남겨주시면 관리자가 확인 후에\n" +
                                "다음 주 케어 시에 해결해 드립니다."}
                            placeholder={"요청사항을 작성해 보세요."}
                        />

                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default GuardianRequestPageScreen;

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