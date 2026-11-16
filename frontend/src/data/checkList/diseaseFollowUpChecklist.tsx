export const diseaseFollowUpChecklist = [
    {
        id: 'common',
        title: '식사 및 영양 상태',
        questions:[
            {
                id: 'meal',
                question: '어르신의 오늘 식사는 어떠셨나요?',
                options: ['매우 드심', '보통 정도 \n드심', '적게 드심', '거의 \n안 드심'],
                type: 'radio',
                extra: '특이사항'
            }

        ]
    },
    {
        id: 'dementia',
        title: '치매/알츠하이머',
        questions: [
            {
                id: 'memory',
                question: '오늘 기억력과 인지 상태는 어떠셨나요?',
                options: ['평소처럼 기억 잘 하심', '가끔 혼란 있어도 기억하심', '자주 기억 \n혼란 있으심', '거의 기억하지 못하심'],
                type: 'radio',
                extra: '특이사항'
            },
            {
                id: 'recognition',
                question: '가족이나 주변 사람들을 얼마나 잘 알아보셨나요?',
                options: ['모든 사람을 잘 알아보심', '가족은 알아보지만 가끔 헷갈림', '가족도 가끔 못 알아보심', '대부분 알아보지 못하심'],
                type: 'radio',
                extra: '언급하신 가족'
            },
            {
                id: 'behavior',
                question: '평소와 다른 행동이나 감정 변화가 있었나요?',
                options: ['평상시와 같이 안정적', '약간 불안하거나 초조해하심', '자주 동요하거나 반복 행동', '심하게 흥분하거나 공격적'],
                type: 'radio',
                extra: '구체적 행동'
            },
            {
                id: 'dailyLiving',
                question: '일상생활(화장실, 옷 입기 등)은 어떻게 하셨나요?',
                options: ['혼자서 대부분 잘 하심', '약간의 도움이 필요하심', '많은 도움이 필요하심', '거의 모든 것에 도움 필요'],
                type: 'radio',
                extra: '특히 어려워하는 부분'
            }
        ]
    },
    {
        id: 'diabetes',
        title: '당뇨병',
        questions: [
            {
                id: 'bloodSugar',
                question: '혈당 관리는 어떻게 하고 계신가요?',
                options: [
                    '규칙적 측정 잘 하심',
                    '가끔 측정, 안정적 유지',
                    '자주 측정 깜빡하심',
                    '측정 자체 어려워하심'
                ],
                type: 'radio',
                extra: '오늘 혈당'
            },
            {
                id: 'medication',
                question: '당뇨 약물이나 인슐린 관리는 어떠셨나요?',
                options: [
                    '시간 맞춰 잘 복용함',
                    '가끔 늦지만 복용함',
                    '자주 복용 빼먹으심',
                    '도움 없인 복용 어려움'
                ],
                type: 'radio',
                extra: '특이사항'
            },
            {
                id: 'footStatus',
                question: '발 상태나 상처는 어떠신가요?',
                options: [
                    '깨끗하고 문제 없음',
                    '건조하거나 굳은살 있음',
                    '작은 상처나 물집 있음',
                    '심한 상처나 염증 있음'
                ],
                type: 'radio',
                extra: '상처 위치/상태'
            },
            {
                id: 'diet',
                question: '당뇨식 관리나 단 음식 조절은 어떠셨나요?',
                options: [
                    '당뇨식 잘 지키심',
                    '가끔 단 음식 드심',
                    '단 음식 자주 드심',
                    '식이 조절 어려움'
                ],
                type: 'radio',
                extra: '특이사항'
            }
        ]
    },
    {
        id: 'hypertension',
        title: '고혈압',
        questions: [
            {
                id: 'bpSymptoms',
                question: '혈압 상태나 관련 증상은 어떠셨나요?',
                options: [
                    '증상 없이 안정적',
                    '두통 어지러움 가끔 있음',
                    '머리 자주 아프심',
                    '숨참 가슴 답답함 있음'
                ],
                type: 'radio',
                extra: '혈압 수치'
            },
            {
                id: 'bpMeds',
                question: '혈압약 복용은 어떻게 하고 계신가요?',
                options: [
                    '매일 규칙적 복용함',
                    '가끔 빼먹지만 복용함',
                    '자주 복용 거부하심',
                    '부작용으로 복용 어려움'
                ],
                type: 'radio',
                extra: '부작용/문제'
            },
            {
                id: 'saltIntake',
                question: '짠 음식 조절이나 생활습관은 어떠셨나요?',
                options: [
                    '저염식 잘 지키심',
                    '가끔 짠 음식 드심',
                    '짠 음식 자주 선호',
                    '식이 조절 어려움'
                ],
                type: 'radio',
                extra: '특이사항'
            },
            {
                id: 'swelling',
                question: '몸의 부종이나 체중 변화는 어떠신가요?',
                options: [
                    '부종 특별히 없음',
                    '발목 약간 부으심',
                    '부종 크거나 체중 증가',
                    '심한 부종 불편함'
                ],
                type: 'radio',
                extra: '부종 위치'
            }
        ]
    },
    {
        "id": "parkinsons",
        "title": "파킨슨병",
        "questions": [
            {
                "id": "tremor",
                "question": "떨림이나 근육 경직은 어떠셨나요?",
                "options": [
                    "평소와 같음",
                    "조금 더 심해지심",
                    "떨림 경직 심해지심",
                    "일상 불편할 정도"
                ],
                "type": "radio",
                "extra": "특히 심한 부위"
            },
            {
                "id": "walking",
                "question": "걸음걸이나 균형감각은 어떠셨나요?",
                "options": [
                    "잘 걸으심",
                    "느리지만 혼자 걸음",
                    "비틀거리며 도움 필요",
                    "걷기 거의 어려움"
                ],
                "type": "radio",
                "extra": "넘어지거나 위험한 순간"
            },
            {
                "id": "medEffect",
                "question": "파킨슨 약물 효과는 어떠신가요?",
                "options": [
                    "약 효과 매우 좋음",
                    "약간 호전됨",
                    "효과 잘 모르겠음",
                    "효과 적고 부작용 있음"
                ],
                "type": "radio",
                "extra": "약 복용 시간"
            },
            {
                "id": "mood",
                "question": "기분이나 수면, 일상 의욕은 어떠셨나요?",
                "options": [
                    "밝고 의욕적",
                    "조금 우울하거나 무기력",
                    "자주 우울하고 무기력",
                    "심하게 우울하거나 불면"
                ],
                "type": "radio",
                "extra": "특이사항"
            }
        ]
    },
    {
        id: "stroke",
        title: "뇌졸중 후유증",
        questions: [
            {
                id: "paralysis",
                question: "마비된 부위의 움직임은 어떠신가요?",
                options: ["조금씩 호전 중", "현상 유지 중", "조금 악화된 듯", "불편함 큼"],
                type: "radio",
                extra: "마비 부위"
            },
            {
                id: "speech",
                question: "말씀하시거나 의사소통은 어떠셨나요?",
                options: ["말씀 명확하심", "조금 불분명하지만 가능", "전달 자주 어려움", "소통 거의 어려움"],
                type: "radio",
                extra: "소통 방법"
            },
            {
                id: "swallow",
                question: "삼키기나 식사는 어떻게 하셨나요?",
                options: ["잘 드심", "가끔 사레 있으나 괜찮음", "기침 많고 삼킴 어려움", "삼킴 위험, 도움 필요"],
                type: "radio",
                extra: "음식 형태"
            },
            {
                id: "rehab",
                question: "재활 운동이나 치료 의지는 어떠신가요?",
                options: ["재활 적극 참여", "권유 시 노력함", "귀찮지만 참여함", "재활 거부 또는 무기력"],
                type: "radio",
                extra: "오늘 한 재활"
            }
        ]
    },
    {
        id: "arthritis",
        title: "관절염",
        questions: [
            {
                id: "pain",
                question: "관절 통증은 어떠셨나요?",
                options: ["덜 아프심", "평소와 같음", "더 아프심", "심하게 아파하심"],
                type: "radio",
                extra: "통증 부위"
            },
            {
                id: "movement",
                question: "움직이거나 활동은 어떠셨나요?",
                options: ["잘 움직이심", "조금 아파도 활동 가능", "통증으로 활동 제한", "거의 못 움직임"],
                type: "radio",
                extra: "가장 어려운 동작"
            },
            {
                id: "meds",
                question: "진통제나 약 복용은 어떠셨나요?",
                options: ["약 효과 좋음", "아플 때만 복용함", "효과 별로 없음", "부작용 있어 어려움"],
                type: "radio",
                extra: "복용한 약"
            },
            {
                id: "care",
                question: "찜질이나 마사지는 어떠셨나요?",
                options: ["찜질 마사지 도움됨", "가끔 도움됨", "효과 거의 없음", "관리 안 하심"],
                type: "radio",
                extra: "오늘 한 관리"
            }
        ]
    },
    {
        id: "copd",
        title: "만성폐쇄성폐질환",
        questions: [
            {
                id: "breath",
                question: "호흡이나 숨쉬기는 어떠셨나요?",
                options: ["편안하심", "조금 숨 참", "숨차고 힘드심", "가만히 있어도 숨참"],
                type: "radio",
                extra: "특히 힘든 시간"
            },
            {
                id: "cough",
                question: "기침이나 가래는 어떠셨나요?",
                options: ["평소와 같음", "기침 조금 많아짐", "기침 가래 많음", "기침 심하고 가래 탁함"],
                type: "radio",
                extra: "가래 색깔"
            },
            {
                id: "oxygen",
                question: "산소치료나 호흡기 약물 사용은?",
                options: ["잘 사용하심", "사용 가끔 번거로움", "사용 자주 깜빡함", "효과 적어 자주 사용"],
                type: "radio",
                extra: "오늘 사용량"
            },
            {
                id: "condition",
                question: "전체적인 컨디션은 어떠셨나요?",
                options: ["평소와 같음", "조금 피곤해 보임", "기력 없음", "응급 고려할 정도"],
                type: "radio",
                extra: "특이사항"
            }
        ]
    },
    {
        id: "heartDisease",
        title: "심장질환",
        questions: [
            {
                id: "chest",
                question: "가슴 증상은 어떠셨나요?",
                options: ["편안하심", "가슴 가끔 답답함", "가슴 자주 불편함", "가슴 통증 심함"],
                type: "radio",
                extra: "증상 시간"
            },
            {
                id: "activityBreath",
                question: "활동 중 숨쉬기는 어땠나요?",
                options: ["평상시처럼 편안함", "빠르게 걷다 숨참", "조금만 움직여도 숨참", "누워도 숨참"],
                type: "radio",
                extra: "가장 힘든 활동"
            },
            {
                id: "meds",
                question: "심장약 복용은 어떠셨나요?",
                options: ["규칙적으로 복용함", "가끔 빼먹음", "자주 깜빡하거나 거부", "부작용으로 조절 필요"],
                type: "radio",
                extra: "복용 중인 약"
            },
            {
                id: "swelling",
                question: "다리/발 부종은 어떠셨나요?",
                options: ["특별한 부종 없음", "저녁에 약간 붓음", "붓기 심해 불편함", "신발 못 신을 정도"],
                type: "radio",
                extra: "부종 정도"
            }
        ]
    },
    {
        id: "osteoporosis",
        title: "골다공증",
        questions: [
            {
                id: "pain",
                question: "허리나 관절 통증은?",
                options: ["특별한 통증 없음", "가끔 통증 있음", "자주 통증 호소", "심한 통증 힘드심"],
                type: "radio",
                extra: "통증 부위"
            },
            {
                id: "balance",
                question: "걸음걸이와 균형감각은?",
                options: ["잘 걸으심", "조심스럽게 걸음", "비틀거리며 불안정", "넘어질 위험 높음"],
                type: "radio",
                extra: "위험한 순간"
            },
            {
                id: "supplements",
                question: "칼슘/비타민D 복용 상태는?",
                options: ["규칙적으로 복용함", "가끔 빼먹음", "자주 깜빡함", "복용 안 하심"],
                type: "radio",
                extra: "복용 중인 보충제"
            },
            {
                id: "activity",
                question: "활동량이나 운동은?",
                options: ["적절한 활동과 운동을 하심", "가벼운 활동만 하심", "조심하여 활동 피함", "거의 안 움직이심"],
                type: "radio",
                extra: "오늘 한 활동"
            }
        ]
    },
    {
        id: "mentalHealth",
        title: "우울증/정신질환",
        questions: [
            {
                id: "mood",
                question: "기분이나 정서는 어땠나요?",
                options: ["밝고 안정적", "조금 우울함", "자주 무기력함", "심하게 우울함"],
                type: "radio",
                extra: "기분 변화 시간"
            },
            {
                id: "sleep",
                question: "수면과 식욕은 어땠나요?",
                options: ["수면 식욕 좋음", "잠 부족 식욕 저하", "수면 식욕 모두 저하", "수면 식사 모두 거부"],
                type: "radio",
                extra: "수면 시간"
            },
            {
                id: "meds",
                question: "정신과 약 복용은?",
                options: ["규칙적으로 복용함", "가끔 빼먹음", "거부나 깜빡 잦음", "부작용으로 조절 필요"],
                type: "radio",
                extra: "복용 상태"
            },
            {
                id: "risk",
                question: "위험한 생각/행동은 없었나요?",
                options: ["특별한 문제 없음", "가끔 부정 표현", "자주 자살 언급", "자해 시도 등 위험"],
                type: "radio",
                extra: "즉시 보고 필요"
            }
        ]
    }
    // 더 많은 질병 추가 가능
];
