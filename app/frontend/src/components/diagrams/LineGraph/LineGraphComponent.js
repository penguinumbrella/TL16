import React from 'react';
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';

const LineGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY="value", capacity, isShortTerm = false}) => {
  console.log(capacity);
  return (
    <ResponsiveContainer width={width} height={height} style={{ display: 'flex', flexDirection: 'column', margin: '20px 0 50px 0' }}>
      <LineChart data={data}>
        <XAxis dataKey={"name"} tick={{ fill: 'white' }} style={{ fontSize: "10px" }} />
        {capacity ? 
          <YAxis dataKey={dataKeyY} domain={[0, capacity]} tick={{ fill: 'white' }} style={{ fontSize: "10px" }} /> 
          : 
          <YAxis dataKey={dataKeyY} tick={{ fill: 'white' }} style={{ fontSize: "10px" }} />
        }
        <Tooltip content={customToolTip} />
        <Legend />
        <Line type="monotone" dataKey={dataKeyY} stroke="#8884d8" activeDot={{ r: 4 }} />
        {capacity && <ReferenceLine y={capacity} label="Capacity" stroke="red" strokeDasharray="3 3" />}

        {/* Conditional Reference Areas */}
        {isShortTerm && (
          <>
            <ReferenceArea x1={0} x2={4} strokeOpacity={0.3} fill="blue" />
            <ReferenceArea x1={4} x2={24} strokeOpacity={0.3} fill="green" />
            <ReferenceArea x1={24} x2={168} strokeOpacity={0.3} fill="orange" />
          </>
        )}
      </LineChart>
      <text style={{ textAlign: 'center' }}>{title}</text>
    </ResponsiveContainer>
  );
};

export default LineGraphComponent;
