export const careNoteChecklist = [
    {
        id: 'specialMoment',
        question: '이번주 어르신과의 특별한 순간은?',
        type: 'text',
        guide: [
            '웃으셨던 순간, 좋아하신 것들',
            '감동적인 대화, 활기찬 모습 등'
        ]
    },
    {
        id: 'missFamily',
        question: '어르신이 가족에 대해 표현하신 감정은?',
        type: 'text',
        guide: [
            '가족 보고 싶다는 언급',
            '가족 사진을 보며 하신 말씀 등'
        ]
    },
    {
        id: 'emotionToday',
        question: '오늘 어르신의 기분은 어땠나요?',
        type: 'checkbox',
        options: [
            '밝음, 기쁨, 즐거움',
            '평온함, 안정적',
            '그리움, 아쉬움',
            '피곤함, 무기력',
            '불안함, 걱정',
            '외로움, 쓸쓸함'
        ],
        extra: '추가 관찰'
    },
    {
        id: 'conversation',
        question: '기억에 남는 대화나 자주 하신 말씀이 있다면?',
        type: 'text',
        guide: [
            '과거 이야기, 고마운 말, 걱정거리 등'
        ]
    },
    {
        id: 'unusualChange',
        question: '평소와 다른 변화나 특이사항이 있었나요?',
        type: 'checkbox',
        options: [
            '말씀을 많이/적게 하심',
            '활기차거나 조용하심',
            '새로운 관심사나 행동',
            '컨디션의 변화',
            '기타 특이사항'
        ],
        extra: '간단 입력'
    },
    {
        id: 'careEpisode',
        question: '돌봄 중 있었던 따뜻한 순간이나 에피소드가 있다면?',
        type: 'text',
        guide: [
            '감사 표현, 함께 웃은 순간',
            '어르신의 배려 등'
        ]
    }
];
