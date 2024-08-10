import React from 'react';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div className="tooltip" style={{ backgroundColor: '#000000', opacity: 0.7, padding: '10px', whiteSpace: 'nowrap' }}>
                {payload.map((ele, index) => {
                    const formattedTime = format(parseISO(ele.payload.name), 'yyyy MMM dd HH:mm');
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
