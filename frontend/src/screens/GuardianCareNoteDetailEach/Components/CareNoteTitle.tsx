import {StyleSheet, Text, View} from "react-native";
import { fonts } from "../../../styles/fonts";
import {borderRadiusSizes, fontSizes} from "../../../styles/globalStyles.tsx";

interface CareNoteTitleProps{
    name:string,

}

const CareNoteTitle=({name}:CareNoteTitleProps)=>{
    return (
        <>
            <View style={styles.container}>
                <View style={styles.profileImage}></View>
                <View>
                    <Text style={styles.name}>{name}님</Text>
                    <Text style={styles.title}>이번주의 돌봄노트</Text>
                </View>
            </View>
        </>
    );
}

export default CareNoteTitle;

const styles = StyleSheet.create({
    container:{
        flexDirection:"row",
        gap:10,
    },
    profileImage:{
        width:130,
        aspectRatio:1,
        backgroundColor:"#F4F6F6",
        borderRadius:borderRadiusSizes.medium,
    },
    name:{
        fontFamily:fonts.bold,
        fontSize:fontSizes.large
    },
    title:{
        fontFamily:fonts.regular,
        fontSize:fontSizes.large
    }

});