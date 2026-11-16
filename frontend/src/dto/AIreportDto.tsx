interface TrendItem {
    category: '고혈압' | '식사/영양상태' | '우울증' | string;
    changeAmount: string;        // 예: "+7점"
    chartData: number[];         // 예: [120, 122, 125, 127, 130]
    iconType: 'positive' | 'negative' | 'neutral'; // 이모지 상태 구분용
}

export interface AICareNoteDetailDto {
    seniorName: string;           // 어르신 이름 (예: 김옥자님)
    careCount: number;           // 회차 (예: 6)
    todayMessage: string;        // 오늘 메시지 (예: 오늘 따님을 보고 싶어 하셨어요)
    aiSummary: string;           // AI 리포트 요약 (예: 산책 횟수가 늘어나시면서...)

    questionOfToday?: string;     // 오늘의 질문 (예: 어르신과 함께 했던 따뜻한 에피소드...)

    trendAnalysis: TrendItem[];  // 상세 추이 분석 리스트
    reaction?: string;           // 반응 입력값
}
//get
export const AICareNoteDummyData:AICareNoteDetailDto[] = [
    {
        "seniorName": "김옥자",
        "careCount": 6,
        "todayMessage": "오늘 따님을 보고 싶어 하셨어요.",
        "aiSummary": "김옥자님이 산책 횟수가 늘어나시면서 고혈압이 많이 안정되셨어요.",
        "questionOfToday": "어르신과 함께 했던 따뜻했던 에피소드를 들려주세요.",
        "trendAnalysis": [
            {
                "category": "고혈압",
                "changeAmount": "+7Hg",
                "chartData": [120, 121, 122, 127],
                "iconType": "negative"
            },
            {
                "category": "식사/영양상태",
                "changeAmount": "+7Hg",
                "chartData": [120, 121, 122, 127],
                "iconType": "negative"
            }
        ],
        "reaction": ""
    },
    {
        "seniorName": "박영희",
        "careCount": 3,
        "todayMessage": "오늘은 식사가 잘 넘어가셨습니다.",
        "aiSummary": "식사량이 안정적으로 유지되고 있습니다.",
        "questionOfToday": "가장 좋아하는 반찬은 무엇인가요?",
        "trendAnalysis": [
            {
                "category": "식사/영양상태",
                "changeAmount": "유지",
                "chartData": [3, 3, 3, 3],
                "iconType": "neutral"
            }
        ],
        "reaction": ""
    },
    {
        "seniorName": "이말순",
        "careCount": 5,
        "todayMessage": "요즘 감정이 좀 우울해 보이세요.",
        "aiSummary": "우울 지수가 소폭 상승했습니다. 산책 등 야외 활동을 권장합니다.",
        "questionOfToday": "기분이 좋아지는 순간은 언제인가요?",
        "trendAnalysis": [
            {
                "category": "우울증",
                "changeAmount": "+2점",
                "chartData": [3, 4, 4, 5],
                "iconType": "negative"
            }
        ],
        "reaction": ""
    }
];
