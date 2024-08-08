import React, { useState , PureComponent} from 'react';
import {BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, CartesianGrid, ReferenceLine, Cell, Rectangle} from 'recharts';


const BarGraphComponent = ({ data, width, height, title='', customToolTip, dataKeyY = 'value', capacity }) => {

    const [activeBar, setActiveBar] = useState(null);
    
    
    const handleMouseEnter = (data,index) => {
        setActiveBar(index);
    };
    
    const handleMouseLeave = () => {
        setActiveBar(null);
    };

    console.log(capacity);  
    return (
    <ResponsiveContainer width={width} height={height} style={{display: 'flex', flexDirection: 'column', margin: '20px 0 50px 0'}}>
        <BarChart data={data} >
            <Bar dataKey={dataKeyY} onMouseEnter={(data, index) => handleMouseEnter(index)} onMouseLeave={handleMouseLeave} fill="#8884d8" activeBar={<Rectangle fill="white" stroke="white" />} maxBarSize={10}></Bar>
            <XAxis dataKey={"name"} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/>
            {capacity ? <YAxis dataKey={dataKeyY} domain={[0, capacity]} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/> : <YAxis dataKey={dataKeyY} tick={{ fill: 'white' }} style={{fontSize: "10px"}}/>}
            <Tooltip content={customToolTip} cursor={{fill: 'transparent'}}/>
            {capacity && <ReferenceLine y={capacity} label="Capacity" stroke="red" strokeDasharray="3 3" />}
            <Legend/>
        </BarChart>
        <text style={{textAlign: 'center'}}>{title}</text>
    </ResponsiveContainer>
  )};

export default BarGraphComponent
