import {CareSchedule} from "./type/CareSchedules.tsx";

const todayCareSchedules: CareSchedule[] = [
    {
        time: '14:00',
        name: '김옥자',
        round: '5회차 돌봄',
        condition: '케어기버를 딸로 착각함',
        color: "blue",
        buttonText: '돌봄시작',
        progress: ' '
    },
    {
        time: '15:00',
        name: '이미자',
        round: '5회차 돌봄',
        condition: '땅콩 알러지 보유',
        color: "gray",
        buttonText: '돌봄시작',
        progress: ' '
    },
];

export default todayCareSchedules;
