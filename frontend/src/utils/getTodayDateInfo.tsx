export function getTodayDateInfo(): {
    date: string;
    dayOfWeek: string;
} {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const daysKor = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)'];
    const dayOfWeek = daysKor[today.getDay()];

    const date = `${month}/${day}`;

    return { date, dayOfWeek };
}

