import axios from 'axios';

import { KAKAO_REST_API_KEY } from './config';

export async function getAddressFromCoords(latitude: number, longitude: number) {
    if (!KAKAO_REST_API_KEY) {
        return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
    try {
        const response = await axios.get(
            `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
            {
                headers: {
                    Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
                },
            }
        );

        const address = response.data.documents[0]?.address?.address_name;
        return address || '주소 없음';
    } catch (error) {
        console.error('주소 가져오기 실패:', error);
        //console.error('응답 에러:', error.message || error.response?.data);
        return null;
    }
}
