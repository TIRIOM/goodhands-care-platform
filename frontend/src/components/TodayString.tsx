import React from 'react';
import { Text, TextStyle } from "react-native";

interface TodayStringProps {
  format?:
      | 'YY.MM.DD (요일)'
      | 'YYYY-MM-DD'
      | 'YYYY.MM.DD'
      | 'YY.MM.DD (요일) HH:MM'
      | 'YYYY.MM.DD HH:MM';
  style?: TextStyle;
}

function getTodayString(format: TodayStringProps['format'] = 'YY.MM.DD (요일)') {
  const today = new Date();
  const year = today.getFullYear();
  const shortYear = year.toString().slice(2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const date = today.getDate().toString().padStart(2, '0');
  const hours = today.getHours().toString().padStart(2, '0');
  const minutes = today.getMinutes().toString().padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[today.getDay()];

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${date}`;
    case 'YYYY.MM.DD':
      return `${year}.${month}.${date}`;
    case 'YYYY.MM.DD HH:MM':
      return `${year}.${month}.${date} ${hours}:${minutes}`;
    case 'YY.MM.DD (요일) HH:MM':
      return `${shortYear}.${month}.${date} (${day}) ${hours}:${minutes}`;
    case 'YY.MM.DD (요일)':
    default:
      return `${shortYear}.${month}.${date} (${day})`;
  }
}

const TodayString: React.FC<TodayStringProps> = ({ format, style }) => (
    <Text style={style}>{getTodayString(format)}</Text>
);

export default TodayString;
