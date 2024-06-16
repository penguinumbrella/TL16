import React from 'react'
import { Legend, LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip } from 'recharts'

const LineGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY="value" }) => {
  return (
    <ResponsiveContainer width={width} height={height} style={{display: 'flex', flexDirection: 'column',
      marginBottom: '20px'
    }}>
        <LineChart data={data}>
            <XAxis dataKey={"name"} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/>
            <YAxis dataKey={dataKeyY} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/>
            <Tooltip content={customToolTip}/>
            <Legend/>
            <Line type="monotone" dataKey={dataKeyY} stroke="#8884d8" activeDot={{ r: 4 }} />
        </LineChart>
        <text style={{textAlign: 'center'}}>{title}</text>
    </ResponsiveContainer>
  )
}

export default LineGraphComponent