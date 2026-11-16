import { View } from "react-native";
import {GlobalStyles} from "../../../styles/globalStyles.tsx";
import SeniorProfile from "../../../components/SeniorProfile.tsx";
import React from "react";
import seniorCareList from "../../../data/seniorCareList.tsx";
import {useNavigation} from "@react-navigation/native";

const MySeniorCheckList = () =>{
    const navigation = useNavigation()
    return (
        <>
            <View>
                <View style={GlobalStyles.cardGap}>
                    {seniorCareList.map((senior, idx) => (
                        <SeniorProfile
                            key={idx}
                            {...senior}
                            name={senior.name}
                            schedules={senior.schedules}
                            leftButtonText={"요청사항 남기기"}
                            rightButtonText={"돌봄노트 확인하기"}
                            todayStr={""} // 필요시 전달
                            onDetailPress={()=>navigation.navigate('Request' as never)}
                            onStartCarePress={()=>navigation.navigate('CareNoteDetail' as never, { senior } as never)}
                        />
                    ))}
                </View>
            </View>
        </>
    );

};

export default MySeniorCheckList