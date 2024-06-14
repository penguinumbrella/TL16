import React, { useState , PureComponent} from 'react';
import {BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, CartesianGrid} from 'recharts';


const BarGraphComponent = ({ data, width, height, title='', colour_list }) => {

    colour_list= {
        "value_1" : ["#acf141", '#8ddf0f'],
        "value_2" : ["#60eae7", '#15d2ce'],
        "value_3" : ["#f164a3", '#ea247d'],
        "value_4" : ['#f34e62', '#e0132b'],
        "value_5" : ['#85f4eb', '#13e0d0'],
        "value_6" : ['#f1a055', '#e07513'],
        "value_7" : ['#db6ff0', '#bf13e0']
    }

    const [activeBar, setActiveBar] = useState(null);
    
    
    const handleMouseEnter = (data,index) => {
        setActiveBar(index);
    };
    
    const handleMouseLeave = () => {
        setActiveBar(null);
    };

    const customShape = (props, defaultColor, highlightedColour) => {
        const { x, y, width, height } = props;
        return (
        <rect
            x={activeBar === props.index ? x + 9  : x + 10}
            y={activeBar === props.index ? y - 1 : y}
            height={activeBar === props.index ? height + 1 : height }
            width={activeBar === props.index ? width -18 : width -20 }
            
            fill={activeBar === props.index ? highlightedColour : defaultColor }

            // x={x}
            // y={y}
            // height={height}
            // width={width -20}
        />
        );
    }

      
    return (
    <ResponsiveContainer width={width} height={height} style={{display: 'flex', flexDirection: 'column'}}>
        <BarChart data={data} >
            <CartesianGrid />
            {/* <Bar dataKey={"value_1"} fill="purple" stackId="a" barSize={activeBar} /> */}
            {/* <Bar dataKey={"value_2"} fill="cyan" stackId="a" barSize={activeBar}/> */}

            {
                Object.keys(data[0]).slice(1).map(item =>{
                return(
                <Bar                
                    dataKey={item}
                    fill={colour_list[item][0]}
                    stackId="a"
                    shape={(props)=>customShape(props,colour_list[item][0], colour_list[item][1])}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
                
                )})
            }

            <XAxis dataKey={"name"}  />
            <YAxis />
            {(activeBar !== null) && <Tooltip cursor={{fill: 'transparent'}} isAnimationActive={false}/>}
            <Legend/>
        </BarChart>
        <text style={{textAlign: 'center'}}>{title}</text>
    </ResponsiveContainer>
  )};

export default BarGraphComponent
