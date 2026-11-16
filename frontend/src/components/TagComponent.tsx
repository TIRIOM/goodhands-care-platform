import { Text, View } from "react-native";
import { fonts } from "../styles/fonts";
import {borderRadiusSizes, colorPallet, paddingSizes} from "../styles/globalStyles.tsx";

interface TagProps{
    text:string,
}

const TagComponent=({text}:TagProps)=>{
    return (
        <>
            <View style={{backgroundColor:colorPallet.subColor, paddingVertical:3,paddingHorizontal:paddingSizes.s_medium,borderRadius:borderRadiusSizes.medium}}>
                <Text style={{fontFamily:fonts.regular,color:colorPallet.defaultText}}>{text}</Text>
            </View>
        </>
    );
};

export default TagComponent;


