import HomeScreen from "../HomeScreen/HomeScreen.tsx";
import DetailScreen from "../DetailScreen/DetailScreen.tsx";
import CheckListScreen from "../CheckListScreen/CheckListScreen.tsx";
import CreateCareNoteScreen from "../CreateCareNoteScreen/CreateCareNoteScreen.tsx";
import * as React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import CareListScreen from "../CareListScreen/CareListScreen.tsx";
import CareListDetail from "../CareListScreen/CareListDetail.tsx";
import mypage from "../mypage/mypage.tsx";

const Stack = createStackNavigator();


//케어기버 메인화면
export function CareGiverMainStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="메인" component={HomeScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="CheckList" component={CheckListScreen} />
            <Stack.Screen name="CareNote" component={CreateCareNoteScreen} />
        </Stack.Navigator>
    );
}


//돌봄노트
export function CareGiverCareNoteStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CareList" component={CareListScreen} />
            <Stack.Screen name="CareDetail" component={CareListDetail} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="CheckList" component={CheckListScreen} />
            <Stack.Screen name="CareNote" component={CreateCareNoteScreen} />
        </Stack.Navigator>
    );
}

//돌봄노트
export function CareGiverMyPageStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CaregiverMypage" component={mypage} />
        </Stack.Navigator>
    );
}