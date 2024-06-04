import React from 'react'
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip } from 'recharts'

const LineGraphComponent = ({ data, width, height, title='' }) => {
  return (
    <ResponsiveContainer width={width} height={height} style={{display: 'flex', flexDirection: 'column'}}>
        <LineChart data={data}>
            <XAxis dataKey={"name"} style={{fontSize: "10px"}}/>
            <YAxis dataKey={"value"} style={{fontSize: "10px"}}/>
            <Tooltip/>
            <Legend/>
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
        <text style={{textAlign: 'center'}}>{title}</text>
    </ResponsiveContainer>
  )
}

export default LineGraphComponent