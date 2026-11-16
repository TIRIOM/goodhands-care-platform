import React from 'react';
import {TouchableOpacity, View, Image} from 'react-native';
import { logout } from '../../utils/tokenManager';
import { useRefresh } from '../../../App';

const HeaderAlarmButton = () => {
    const { refreshApp } = useRefresh();
    
    const handleAlarmPress = async () => {
        try {
            // 토큰과 사용자 데이터 모두 제거
            await logout();
            // 앱 새로고침하여 상태 업데이트
            refreshApp();
            console.log('로그아웃 완료 - 앱이 새로고침되어 로그인 화면으로 전환됩니다.');
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        }
    };

    return (
        <TouchableOpacity onPress={handleAlarmPress}>
            <View style={{
                width: 36,
                height: 36,
                backgroundColor: '#e9f2ff',
                borderRadius: 4,
                alignItems :"center",
                justifyContent:"center", }}>
                <Image
                    source={require('../../../assets/images/icons/Bell.png')}
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                />
            </View>
        </TouchableOpacity>
    );
};

export default HeaderAlarmButton;
