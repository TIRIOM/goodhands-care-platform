import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { getAddressFromCoords } from '../../api/getAddressFromCoords';

interface LocationProps {
  latitude: number;
  longitude: number;
  style?: any;
}

export default function Location({ latitude, longitude, style }: LocationProps) {
  const [address, setAddress] = React.useState('');

  useEffect(() => {
    (async () => {
      if (latitude && longitude) {
        const result = await getAddressFromCoords(latitude, longitude);
        setAddress(result || '주소 없음');
      }
    })();
  }, [latitude, longitude]);

  return (
    <View>
      <Text style={style}>{address}</Text>
    </View>
  );
}
