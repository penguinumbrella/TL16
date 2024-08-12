import React from 'react';
import { format, parseISO } from 'date-fns';

const formatCustomTooltipTime = (timeString) => {
    const parsedDate = parseISO(timeString);
    if (!isNaN(parsedDate)) {
        return format(parsedDate, 'yyyy MMM dd HH:mm');
    } else {
        // Handle the non-ISO format "11 August, 2024 20:00"
        const dateParts = timeString.split(' ');
        const day = dateParts[0];
        const month = dateParts[1].slice(0, 3); // First 3 letters of the month
        const year = dateParts[2].replace(',', ''); // Remove the comma from the year
        const time = dateParts[3];

        return `${year} ${month} ${day} ${time}`;
    }
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div className="tooltip" style={{ backgroundColor: '#000000', opacity: 0.7, padding: '10px', whiteSpace: 'nowrap' }}>
                {payload.map((ele, index) => {
                    const formattedTime = formatCustomTooltipTime(ele.payload.name);
                    return (
                        <div key={index}>
                            <p>{`Time: ${formattedTime}`}</p>
                            <p>{`Vehicles: ${ele.payload['Vehicles']}`}</p>
                            {Object.keys(ele.payload).map((key) => (
                                key !== 'name' && key !== 'Vehicles' ? (
                                    <p key={key}>{`${key}: ${ele.payload[key]}`}</p>
                                ) : null
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
