import React from 'react';
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip, ReferenceLine, ReferenceArea, Text } from 'recharts';
import { format, parseISO } from 'date-fns';

const formatXAxis = (tickItem, allSameYear) => {
  const date = parseISO(tickItem);
  return allSameYear ? format(date, 'MMM dd HH:mm') : format(date, 'yyyy MMM dd HH:mm');
};

const LineGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY="value", capacity, redx1="", redx2="", yellowx1="", yellowx2="", greenx1="", greenx2=""}) => {
  // Check if all dates are in the same year
  const allSameYear = data.every((item, _, arr) => {
    const year = parseISO(item.name).getFullYear();
    return year === parseISO(arr[0].name).getFullYear();
  });

  // Get the common year if all dates are in the same year
  const commonYear = allSameYear ? parseISO(data[0].name).getFullYear() : null;

  return (
    <ResponsiveContainer width={width} height={height} style={{ display: 'flex', flexDirection: 'column', margin: '20px 0 50px 0' }}>
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          tickFormatter={(tickItem) => formatXAxis(tickItem, allSameYear)} 
          tick={{ fill: 'white' }} 
          style={{ fontSize: "10px" }} 
        />
        {capacity ? 
          <YAxis dataKey={dataKeyY} domain={[0, capacity]} tick={{ fill: 'white' }} style={{ fontSize: "10px" }} /> 
          : 
          <YAxis dataKey={dataKeyY} tick={{ fill: 'white' }} style={{ fontSize: "10px" }} />
        }

        {/* Conditional Reference Areas */}
        <>
          <ReferenceArea x1={redx1} x2={redx2} strokeOpacity={0.3} fill="#FF6666" />
          <ReferenceArea x1={yellowx1} x2={yellowx2} strokeOpacity={0.3} fill="#FFD700" />
          <ReferenceArea x1={greenx1} x2={greenx2} strokeOpacity={0.3} fill="#90EE90" />
        </>

        {capacity && (
          <ReferenceLine 
            y={capacity} 
            stroke="red" 
            strokeDasharray="3 3"
            label={{ value: 'Capacity', position: 'insideTop', fill: 'white', dy: -10 }} 
          />
        )}
        <Tooltip content={customToolTip} />
        <Legend />
        <Line type="monotone" dataKey={dataKeyY} stroke="#8884d8" activeDot={{ r: 4 }} />

        {commonYear && (
          <text 
            x={-10} 
            y={height - 50} 
            fill="white" 
            textAnchor="end" 
            fontSize={12}
            transform="rotate(0)"
          >
            {`Year: ${commonYear}`}
          </text>
        )}
      </LineChart>
      <text style={{ textAlign: 'center' }}>{title}</text>
    </ResponsiveContainer>
  );
};

export default LineGraphComponent;
