import {Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {borderRadiusSizes, colorPallet, fontSizes, GlobalStyles, paddingSizes} from "../../styles/globalStyles.tsx";
import React, {useRef, useState} from "react";
import {DownIcon, UpIcon} from "../../styles/images.tsx";
import {fonts} from "../../styles/fonts.tsx";
import GCProfileDetailContent from "./components/GCProfileDetailContent.tsx";
import MainHeader from "../../components/Header/MainHeader.tsx";
import {CareGiverForProfileDto} from "../../dto/mypageDto.tsx";


const MyPage: React.FC = () => {
    const [showDetail, setShowDetail] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;

    // 더미 시니어 데이터
    const careGiver: CareGiverForProfileDto = {
        id: 1,
        name: "김굿손",
        gender: "남",
        age: 45,
        address: "서울시 용산구 어르신로 123",
        guardian_id: 2,
        created_at: "2025-07-27T07:03:46.900Z",
        updated_at: "2025-07-27T07:03:46.900Z",
        phoneNumber: "010-1111-1111",
        email: "goodhands@goodhands.com",
        salaryAccount: {
            bank: "국민",
            number: "102312001-312301"
        },
        totalHours:1004,
        currentMonthHours:45,
    };

    const toggleDetail = () => {
        if (showDetail) {
            // 접기 애니메이션
            Animated.parallel([
                Animated.timing(animatedHeight, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: false,
                }),
            ]).start(() => setShowDetail(false));
        } else {
            // 펼치기 애니메이션
            setShowDetail(true);
            Animated.parallel([
                Animated.timing(animatedHeight, {
                    toValue: contentHeight,
                    duration: 250,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    };

    return (
        <>
            <View style={GlobalStyles.mainContainer}>
                <MainHeader title="내 정보" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={[GlobalStyles.screenMargin,{flexDirection:"column"}]}>
                        <View>
                            <View style={styles.detailContainer}>
                                <Text style={[GlobalStyles.sectionTitle]}>프로필</Text>
                                <View style={styles.profileInfo}>
                                    <View style={styles.profileDetails}>
                                        <Text style={styles.name}>{careGiver.name}</Text>
                                        <Text style={styles.label}>인굿핸즈와 함께한 시간</Text>
                                        <View style={styles.scheduleContainer}>
                                            <View style={styles.time}>
                                                <Text>총</Text>
                                                <Text style={styles.text}>{careGiver.totalHours}시간</Text>
                                            </View>
                                            <View style={styles.time}>
                                                <Text>이번달</Text>
                                                <Text style={styles.text}>{careGiver.currentMonthHours}시간</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.profileImage} />
                                </View>
                            </View>

                            {/* 애니메이션 컨테이너 */}
                            <Animated.View
                                style={{
                                    height: animatedHeight,
                                    overflow: 'hidden',
                                    opacity: animatedOpacity
                                }}
                            >
                                <View
                                    onLayout={(e) => {
                                        if (contentHeight === 0) {
                                            const h = e.nativeEvent.layout.height;
                                            setContentHeight(h);
                                            animatedHeight.setValue(showDetail ? h : 0);
                                        }
                                    }}
                                >
                                    <GCProfileDetailContent careGiver={careGiver}/>
                                </View>
                            </Animated.View>

                            {/* 숨겨진 레이아웃 측정용 */}
                            <View
                                style={{
                                    opacity: 0,
                                    position: 'absolute',
                                    top: -9999
                                }}
                                onLayout={(e) => {
                                    if (contentHeight === 0) {
                                        setContentHeight(e.nativeEvent.layout.height);
                                    }
                                }}
                            >
                                <GCProfileDetailContent careGiver={careGiver}/>
                            </View>

                            <TouchableOpacity style={styles.detailLink} onPress={toggleDetail}>
                                <Text style={styles.detailLinkText}>상세 프로필</Text>
                                <View style={styles.chevronDownWrapper}>
                                    {showDetail ? (
                                        <>
                                            <Text style={styles.chevronDown}>접기</Text>
                                            <UpIcon size={12} />
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.chevronDown}>확인하기</Text>
                                            <DownIcon size={12} />
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.obtionWrapper}>
                            <View style={[styles.obtionTitle,{flex:1}]}>
                                <Text style={styles.title}>이번 달 납부 예정일</Text>
                                <Text style={styles.text}>09/12 (목)</Text>
                            </View>
                            <View style={{flex:1}}>
                                <Text style={styles.title}>예정비용</Text>
                                <Text style={styles.text}>2,000,000원</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default MyPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginBottom: 10,
        flex: 1,
    },
    detailContainer: {
        borderBottomColor: '#4fabfd',
    },
    profileInfo: {
        backgroundColor: '#E9F2FF',
        borderRadius: borderRadiusSizes.large,
        borderBottomLeftRadius:0,
        borderBottomRightRadius:0,
        gap:13,

        padding: 16,
        paddingHorizontal: paddingSizes.medium,
        flexDirection: 'row',
        alignContent:'space-around',
    },
    profileImage: {
        aspectRatio:1,
        backgroundColor: '#cdd5db',
        borderRadius: 10,
    },
    profileDetails: {
        flex: 9,
        flexDirection:'column',
        justifyContent:'flex-start',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        lineHeight:20,
    },
    label: {
        fontSize: 14,
        marginBottom: 10,
        marginTop:3,
        fontFamily:fonts.medium,
    },
    scheduleContainer: {
        gap: 4,
    },
    scheduleItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 4,

        padding: 1,
        flexDirection:"row",
        justifyContent:'space-between',
        paddingHorizontal:8,
    },
    scheduleText: {
        fontSize: 13,
        color: '#333',
        fontFamily:fonts.medium,
    },
    scheduleTime:{
        fontSize: 13,
        color: '#333',
        fontFamily:fonts.bold,
    },
    detailLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        borderStyle:'solid',

        borderWidth:1,
        borderRadius:12,

        borderTopWidth:0,
        borderTopLeftRadius:0,
        borderTopRightRadius:0,
        borderColor:'#CDD5DB',
    },
    detailLinkText: {
        fontSize: 14,
        color: '#26252C',
        marginRight: 5,
        fontFamily:fonts.medium,
    },
    chevronDownWrapper:{
        flexDirection:'row',
        alignItems:'center',
        gap:4,
    },
    chevronDown: {
        fontSize: 14,
        fontFamily:fonts.medium,
        color: '#26252C',
    },
    detailBox: {
        justifyContent: 'center',
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#222',
        padding: 16,
        paddingBottom: 0,
    },
    detailItem: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
        paddingHorizontal: 16,
    },
    obtionTitle:{
        flexDirection:"column",
    },
    title:{
        fontSize:fontSizes.s_medium,
        fontFamily:fonts.regular,
    },
    time:{
        backgroundColor:"#fff",
        flexDirection:"row",
        justifyContent:"space-between",
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    text:{
        fontSize:fontSizes.s_medium,
        fontFamily:fonts.bold,
        color:colorPallet.blueColor,
    },
    obtionWrapper:{
        marginHorizontal:10,
        flexDirection:"row",
        justifyContent:"flex-start",
    },
});

