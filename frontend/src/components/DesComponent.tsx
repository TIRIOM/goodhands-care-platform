import {StyleSheet, Text, View} from "react-native";
import {borderRadiusSizes, colorPallet, fontSizes, gapSizes, paddingSizes} from "../styles/globalStyles.tsx";
import { fonts } from "../styles/fonts.tsx";
import TagComponent from "./TagComponent.tsx";

interface challengeProps{
    title:string,
    des:string,
}

const DesComponent=({title,des}:challengeProps)=>{
    return(
        <View style={styles.container}>
            <View style={styles.Image} />
            <View style={styles.desWrapper}>
                <View style={styles.titleTagWrapper}>
                    <Text style={styles.ChallengeText}>{title}</Text>
                    <TagComponent text={"#기념일"}/>
                </View>
                <Text style={styles.ChallengeDesText}>{des}</Text>
            </View>
        </View>
    );

};

export default DesComponent;

const styles = StyleSheet.create({
    container:{
        borderRadius:borderRadiusSizes.xlarge,
        borderStyle:"solid",
        borderWidth:1,
        borderColor:colorPallet.secondaryColor,
        flexDirection:"row",
        alignItems:"flex-start",
        padding:paddingSizes.s_medium,
        gap:paddingSizes.s_medium,
    },
    Image:{
        aspectRatio:1,
        flex:3,
        backgroundColor:colorPallet.subColor,
        borderRadius:borderRadiusSizes.medium,
    },
    desWrapper:{
        flex:11,
        flexDirection:"column",
        justifyContent:"space-around",
        flexShrink: 1,
        alignContent:'flex-start',
        gap:gapSizes.small,
    },
    titleTagWrapper:{
        flexDirection:"row",
        justifyContent:'space-between',
    },
    ChallengeText:{
        flexWrap: 'wrap',
        flexShrink: 1,
        fontSize:fontSizes.medium,
        fontFamily:fonts.bold,
    },
    ChallengeDesText:{
        flexWrap: 'wrap',
        flexShrink: 1,
        fontSize:fontSizes.s_medium,
        fontFamily:fonts.medium
    },
});