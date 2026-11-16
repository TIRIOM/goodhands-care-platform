import React, { useState } from 'react';
import RecordSectionUI from '../../../components/RecordSectionUI.tsx';
import type { SeniorType } from '../../../dto/common/SeniorType';

function getMonthLabel(year: number, month: number) {
    return `${year}.${month.toString().padStart(2, '0')}`;
}

const RecordSection = ({ senior, caregiverId }: { senior: SeniorType; caregiverId?: number }) => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1); // 1~12

    const handlePreviousMonth = () => {
        if (month === 1) {
            setYear(year - 1);
            setMonth(12);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setYear(year + 1);
            setMonth(1);
        } else {
            setMonth(month + 1);
        }
    };

    return (
        <RecordSectionUI
            monthLabel={getMonthLabel(year, month)}
            onPrevMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            senior={senior}
            caregiverId={caregiverId}
        />
    );
};

export default RecordSection; 