// 시니어별 월별 돌봄기록 더미데이터
export interface CareRecordItemData {
  date: string;
  day: string;
  recordNumber: string;
  specialNote?: string;
}

export const careRecords: Record<string, Record<string, CareRecordItemData[]>> = {
  '김옥자': {
    '2025-06': [
      { date: '12', day: '목요일', recordNumber: '6회차 돌봄기록' },
      { date: '05', day: '수요일', recordNumber: '5회차 돌봄기록' },
    ],
    '2025-05': [
      { date: '20', day: '월요일', recordNumber: '1회차 돌봄기록' },
      { date: '25', day: '토요일', recordNumber: '2회차 돌봄기록', specialNote: '2회차 특이사항: 혈압이 높음, 추가 관찰 필요' },
    ],
  },
  '이미자': {
    '2025-06': [
      { date: '10', day: '화요일', recordNumber: '1회차 돌봄기록' },
      { date: '11', day: '수요일', recordNumber: '2회차 돌봄기록' },
    ],
    '2025-05': [
      { date: '15', day: '수요일', recordNumber: '3회차 돌봄기록' },
    ],
  },
}; 