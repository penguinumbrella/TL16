import React from 'react'
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip } from 'recharts'

const LineGraphComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="20%" height={300}>
        <LineChart data={data}>
            <XAxis dataKey={"name"} style={{fontSize: "10px"}}/>
            <YAxis dataKey={"value"} style={{fontSize: "10px"}}/>
            <Tooltip/>
            <Legend/>
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
    </ResponsiveContainer>
  )
}

export default LineGraphComponent