import {StyleSheet, Text, TextInput, View} from "react-native";
import {borderRadiusSizes, GlobalStyles} from "../styles/globalStyles.tsx";
import {useState} from "react";
import Btn from "./Btn/Btn.tsx";

interface InputTextPageProps {
    title:string,
    subTitle:string,
    placeholder:string
}

const InputTextPage=({title,subTitle,placeholder}:InputTextPageProps)=>{
    const [inputValue, setInputValue] = useState('');

    return (
      <View style={GlobalStyles.Tab}>
          <View style={{marginBottom:22,}}>
              <Text style={GlobalStyles.Title}>{title}</Text>
              <Text style={[GlobalStyles.SubTitle, styles.subTitle]}>{subTitle}</Text>
          </View>
          <TextInput
              style={styles.inputBox}
              multiline
              numberOfLines={6}
              placeholder={placeholder}
              value={inputValue}
              onChangeText={setInputValue}
              textAlignVertical="top"
          />
          <View style={{flexDirection:"row", justifyContent:"flex-end", marginTop:10}}>
              <Btn style={styles.btn} textStyle={styles.textBtn} text={"완료"}/>
          </View>
      </View>
    );
}

export default InputTextPage;

const styles = StyleSheet.create({
    textBtn:{
        color:'#fff',
    },
    btn:{
        backgroundColor:'#4FABFD',
        paddingVertical: 7,
        borderRadius:20,
        width:70
    },
    subTitle:{
        marginTop:-5,
    },
    inputBox: {
        borderRadius: borderRadiusSizes.large,
        padding: 16,
        fontSize: 16,
        height: 350, // 크게
        backgroundColor: '#f4f6f6',
    },
});