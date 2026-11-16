import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { getAddressFromCoords } from '../../api/getAddressFromCoords'; // 너가 만든 API 요청 함수

const CurrentLocation = ({ style }: { style?: any }) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // 권한 요청 함수
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: '위치 권한 요청',
              message: '이 앱은 위치 정보를 사용합니다.',
              buttonPositive: '허용',
              buttonNegative: '거부',
              buttonNeutral: '나중에',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('위치 권한이 없습니다.');
        return;
      }

      Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ latitude, longitude });

            const result = await getAddressFromCoords(latitude, longitude);
            setAddress(result || '주소를 가져올 수 없음');
          },
          (error) => {
            console.error(error);
            setError('위치를 가져올 수 없습니다.');
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
      );
    })();
  }, []);

  if (error) return <Text style={style}>🚫 {error}</Text>;
  if (!coords || !address) return <ActivityIndicator size="small" color="#4fabfd" />;

  return (
      <View>
        <Text style={[styles.addressText, style]}>{address}</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  addressText: {
    fontSize: 14,
    color: '#333',
  },
});

export default CurrentLocation;
