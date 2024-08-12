import React from 'react';
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip, ReferenceLine, ReferenceArea, Text } from 'recharts';
import { format, parseISO } from 'date-fns';

const formatXAxis = (tickItem, allSameYear, prediction_type) => {
  console.log("Prediction type:", prediction_type);
  console.log("tickItem: ", tickItem);
  let formatted_date = '';

  if(prediction_type === 'prediction') {
    const date = parseISO(tickItem);
    formatted_date = allSameYear ? format(date, 'MMM dd HH:mm') : format(date, 'yyyy MMM dd HH:mm');
    console.log("inside prediction");
  } else {
    // Parse the date from the tickItem which is in the format "11 August, 2024 20:00"
    const dateParts = tickItem.split(' ');
    const day = dateParts[0];
    const month = dateParts[1].slice(0, 3); // First 3 letters of the month
    const year = dateParts[2].replace(',', ''); // Remove the comma from the year
    const time = dateParts[3];
    
    formatted_date = allSameYear ? `${month} ${day} ${time}` : `${year} ${month} ${day} ${time}`;

    console.log("inside read");
  }

  console.log("Formatted date:", formatted_date);
  return formatted_date;
};



const LineGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY="value", capacity, redx1="", redx2="", yellowx1="", yellowx2="", greenx1="", greenx2="", prediction_type="" /* 'prediction'/'read' */ }) => {
  
  console.log("Data: ", data);

  // Check if all dates are in the same year
  const allSameYear = data.every((item, _, arr) => {
    const baseYear = parseISO(arr[0].name).getFullYear();
    
    let year;
    if (isNaN(baseYear)) {
      // If parseISO fails, fall back to extracting the year from the non-ISO format (e.g., "11 August, 2024 20:00")
      year = new Date(item.name).getFullYear();
    } else {
      year = parseISO(item.name).getFullYear();
    }
    
    return year === baseYear;
  });
  

  // Get the common year if all dates are in the same year
  const commonYear = allSameYear ? parseISO(data[0].name).getFullYear() : null;

  return (
    <ResponsiveContainer width={width} height={height} style={{ display: 'flex', flexDirection: 'column', margin: '20px 0 50px 0' }}>
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          tickFormatter={(tickItem) => formatXAxis(tickItem, allSameYear, prediction_type)} 
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
