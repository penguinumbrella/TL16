import React from 'react';
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';

const LineGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY="value", capacity, redx1="", redx2="", yellowx1="", yellowx2="", greenx1="", greenx2=""}) => {
  console.log(capacity);
  console.log("red, yellow, green", redx1, redx2, yellowx1, yellowx2, greenx1, greenx2)
  return (
    <ResponsiveContainer width={width} height={height} style={{ display: 'flex', flexDirection: 'column', margin: '20px 0 50px 0' }}>
      <LineChart data={data}>
        <XAxis dataKey={"name"} tick={{ fill: 'white' }} style={{ fontSize: "10px" }} />
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
            label={{ position: 'top', value: 'Capacity', fill: 'white', dy: +10 }} 
            stroke="red" 
            strokeDasharray="3 3" 
          />
        )}
        <Tooltip content={customToolTip} />
        <Legend />
        <Line type="monotone" dataKey={dataKeyY} stroke="#8884d8" activeDot={{ r: 4 }} />
      </LineChart>
      <text style={{ textAlign: 'center' }}>{title}</text>
    </ResponsiveContainer>
  );
};

export default LineGraphComponent;
