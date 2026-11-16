import {Text, View} from "react-native";
import {GlobalStyles} from "../../../styles/globalStyles.tsx";
import React from "react";
import CareNoteSummaryCard from "../../../components/Card/CareNoteSummaryCard.tsx";
import {CareSchedule} from "../../../data/type/CareSchedules.tsx";
import {useNavigation} from "@react-navigation/native";

interface TheWeekCareNoteProps {
    mySeniorCard?: CareSchedule[];
}

const TheWeekCareNote:React.FC<TheWeekCareNoteProps>=({mySeniorCard})=>{
    const navigation = useNavigation<any>()
    
    const handleCardPress = (item: CareSchedule) => {
        navigation.navigate('CareNoteDetail', { senior: item });
    };
    
    // mySeniorCard가 없거나 빈 배열인 경우 처리
    if (!mySeniorCard || mySeniorCard.length === 0) {
        return (
            <View>
                <Text style={GlobalStyles.mainSectionTitle}>이번주 돌봄노트</Text>
                <View style={GlobalStyles.cardGap}>
                    <Text style={{ textAlign: 'center', color: '#666', padding: 20 }}>
                        이번주 돌봄노트가 없습니다.
                    </Text>
                </View>
            </View>
        );
    }
    
    return (
        <View>
            <Text style={GlobalStyles.mainSectionTitle}>이번주 돌봄노트</Text>
            <View style={GlobalStyles.cardGap}>
                {mySeniorCard.map((item, idx) => (
                    <CareNoteSummaryCard
                        key={idx}
                        {...item}
                        onPress={() => handleCardPress(item)}
                        buttonOnPress={() => handleCardPress(item)}
                        customButtonText="바로가기"
                    />
                ))}
            </View>
        </View>
    );
}

export default TheWeekCareNote;