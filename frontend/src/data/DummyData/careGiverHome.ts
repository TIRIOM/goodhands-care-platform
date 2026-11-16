
export const careGiverHome = {
    caregiver_name: "홍길동",
    caregiver_id: 5,
    today_sessions: [
        {
            senior_id: 1,
            status: "active",
            id: 101,
            caregiver_id: 5,
            start_time: "2025-07-27T09:00:00Z",
            end_time: "2025-07-27T10:00:00Z",
            created_at: "2025-07-27T07:03:46.900Z"
        }
    ],
    seniors: [
        {
            name: "김옥자",
            age: 85,
            gender: "여",
            id: 1,
            photo: "https://via.placeholder.com/100",
            nursing_home_id: 10,
            caregiver_id: 5,
            guardian_id: 2,
            created_at: "2025-07-27T07:03:46.900Z"
        }
    ],
    notifications: [
        {
            title: "건강 체크",
            content: "혈압 수치가 높습니다.",
            type: "alert",
            id: 301,
            sender_id: 0,
            receiver_id: 5,
            data: { additionalProp1: {} },
            is_read: false,
            read_at: null,
            created_at: "2025-07-27T07:03:46.900Z"
        }
    ],
    care_schedules: {
        today_schedules: [
            {
                id: 1001,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-07-27",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "active",
                is_today: true,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            }
        ],
        past_schedules: [
            {
                id: 1000,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-07-26",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "done",
                is_today: false,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            }
        ],
        upcoming_schedules: [
            {
                id: 1002,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-07-28",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "scheduled",
                is_today: false,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            }
        ],
        this_week_schedules: [
            {
                id: 1003,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-07-29",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "scheduled",
                is_today: false,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            },
            {
                id: 1004,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-07-30",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "scheduled",
                is_today: false,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            }
        ],
        next_week_schedules: [
            {
                id: 1005,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-08-03",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "scheduled",
                is_today: false,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            },
            {
                id: 1006,
                senior_id: 1,
                senior_name: "김옥자",
                senior_photo: "https://via.placeholder.com/100",
                care_date: "2025-08-04",
                start_time: "09:00:00Z",
                end_time: "10:00:00Z",
                status: "scheduled",
                is_today: false,
                nursing_home_name: "효사랑요양원",
                nursing_home_address: "서울시 용산구 어르신로 123",
                notes: "혈압 측정 및 아침 식사 보조"
            }
        ]
    },
    total_assigned_seniors: 1,
    completed_sessions_this_week: 3,
    pending_schedules_today: 1
};

