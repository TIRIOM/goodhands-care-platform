import GuardianHomeScreen from "../GuardianHomeScreen/GuardianHomeScreen.tsx";
import * as React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import CareListDetail from "../CareListScreen/CareListDetail.tsx";
import GuardianCareListScreen from "../GuardianCareListScreen/GuardianCareListScreen.tsx";
import GuardianRequestPageScreen from "../GuardianRequestPage/GuardianRequestPageScreen.tsx";
import GuardianCareNoteDetail from "../GuardianCareNoteDetail/GuardianCareNoteDetail.tsx";
import GuardianCareNoteDetailEach from "../GuardianCareNoteDetailEach/GuardianCareNoteDetailEach.tsx";
import ChallengeScreen from "../ChallengeScreen/ChallengeScreen.tsx";
import LoginScreen from "../LoginScreen.tsx";
import mypage from "../mypage/mypage.tsx";
import AIreportingNoteScreen from "../AIreportingNoteScreen/AIreportingNoteScreen.tsx";

const Stack = createStackNavigator();


//가디언 메인화면
export function GuardianMainStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GuardianHome" component={GuardianHomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="CareNoteDetailEach" component={GuardianCareNoteDetailEach} />
            <Stack.Screen name="CareNoteDetail" component={GuardianCareNoteDetail} />
            <Stack.Screen name="Request" component={GuardianRequestPageScreen} />
            <Stack.Screen name="CareList" component={GuardianCareListScreen} />
        </Stack.Navigator>
    );
}

export function GuardianCareNoteStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GuardianCareList" component={GuardianCareListScreen} />
            <Stack.Screen name="CareDetail" component={CareListDetail} />
            <Stack.Screen name="CareNoteDetailEach" component={AIreportingNoteScreen} />
            <Stack.Screen name="CareNoteDetail" component={GuardianCareNoteDetail} />
            <Stack.Screen name="Request" component={GuardianRequestPageScreen} />
            <Stack.Screen name="CareList" component={GuardianCareListScreen} />
        </Stack.Navigator>
    );
}

export function GuardianChallengeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="챌린지" component={ChallengeScreen} />
            <Stack.Screen name="CareDetail" component={CareListDetail} />
            <Stack.Screen name="CareNoteDetailEach" component={AIreportingNoteScreen} />
            <Stack.Screen name="CareNoteDetail" component={GuardianCareNoteDetail} />
            <Stack.Screen name="Request" component={GuardianRequestPageScreen} />
            <Stack.Screen name="CareList" component={GuardianCareListScreen} />
        </Stack.Navigator>
    );
}

export function GuardianMyPageStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="guardianMypage" component={mypage} />
        </Stack.Navigator>
    );
}

