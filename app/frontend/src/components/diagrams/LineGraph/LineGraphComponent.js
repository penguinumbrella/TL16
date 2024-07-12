import React from 'react'
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip, ReferenceLine } from 'recharts'

const LineGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY="value", capacity}) => {
  console.log(capacity);
  return (
    <ResponsiveContainer width={width} height={height} style={{display: 'flex', flexDirection: 'column',
      marginBottom: '20px'
    }}>
        <LineChart data={data}>
            <XAxis dataKey={"name"} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/>
            {capacity ? <YAxis dataKey={dataKeyY} domain={[0, capacity]} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/> : <YAxis dataKey={dataKeyY} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/>}
            <Tooltip content={customToolTip}/>
            <Legend/>
            <Line type="monotone" dataKey={dataKeyY} stroke="#8884d8" activeDot={{ r: 4 }} />
            {capacity && <ReferenceLine y={capacity} label="Capacity" stroke="red" strokeDasharray="3 3" />}
        </LineChart>
        <text style={{textAlign: 'center'}}>{title}</text>
    </ResponsiveContainer>
  )
}

export default LineGraphComponent