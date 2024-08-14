import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Legend, Label } from 'recharts';
import {convertToPercentages} from './convertToPercentages'

const PieChartComponent = ({ data, colors, width, height, 
  title='', innerRadius, outerRadius , percentageCenter, 
  startAngle, endAngle, theme, mapView, base_font_size, 
  activePieChartPercentName, diagData}) => {
  
  let copliance_percentage = {
    'Pay station' : 0,
    'Honk' : 0,
    'Violations' : 0,
    'Permit' : 0
  }

  if(diagData){
    let perc = []
    let total = 0;
    for(let i = 0; i <diagData.length ; i++){
      total += diagData[i].value;
      copliance_percentage[diagData[i].name] = diagData[i].value;
    }

    for(let i = 0; i <diagData.length ; i++){
      perc.push(copliance_percentage[diagData[i].name] / total);
    }
    // console.log(convertToPercentages(perc))
    perc = convertToPercentages(perc);
    for(let i = 0; i < diagData.length ; i++){
      copliance_percentage[diagData[i].name] = perc[i];
    }
    
  }
    

  function updateRectangle() {
      try{
        // Select the text and rectangle elements
        const textElement = document.getElementById(`pieChartSectionPercentage_${activePieChartPercentName}`);
        const rectElement = document.getElementById(`boundingBoxBackground_${activePieChartPercentName}`);

        // Get the bounding box of the text element
        const bbox = textElement.getBBox();
  
        // Update the rectangle's attributes
        rectElement.setAttribute('x', (bbox.x) - 2 );
        rectElement.setAttribute('y', (bbox.y) - 2);
        rectElement.setAttribute('width', 1.1 * (bbox.width));
        rectElement.setAttribute('height', 1.1 * (bbox.height));
      }catch(e){
        console.log('could not updateRectangle');
        console.log('error : ' + e);
      }
    }

  const [ activeIndex, setActiveIndex ] = useState(-1);

  useEffect(()=>{
    if(activeIndex !== -1){
      updateRectangle()
    }
  },[activeIndex])

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
        
    if (index !== activeIndex) {
      return null;
    }
      
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 2) * cos;
    const sy = cy + (outerRadius + 2) * sin;
    const mx = cx + (outerRadius + 6) * cos;
    const my = cy + (outerRadius + 6) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 6;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    let toDisplayName;
    let toDisplayValue;
    toDisplayName = data[index].name;
    

    // console.log(`toDisplayValue = ${toDisplayValue}`);
    // console.log(`toDisplayName = ${toDisplayName}`);

    if(diagData)
      toDisplayValue = `${copliance_percentage[toDisplayName]}%`;
    else
      toDisplayValue = `${Math.round(percent * 100) }%`;

    let percentFontSize = mapView ? '2em' : '1.5em' ;

    return (
      <g>
        <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke={colors[index % colors.length]} 
          fill="none" 
        />
        <circle cx={ex} cy={ey} r={2} fill={colors[index % colors.length]} stroke="none" />
        <rect id={`boundingBoxBackground_${activePieChartPercentName}`} x={ex + (cos >= 0 ? 1 : -1) * 4} y={ey} width="30px" height="30px" fill="#000" rx="5" ry="5"/>
        <text id={`pieChartSectionPercentage_${activePieChartPercentName}`} x={ex + (cos >= 0 ? 1 : -1) * 4} y={ey} dy={5} textAnchor={textAnchor} fill={colors[index % colors.length]} fontSize={percentFontSize}>
        {`${toDisplayValue}`}
        </text>
      </g>
    );
  };

  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 5) * cos;
    const my = cy + (outerRadius + 5) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 1}
          outerRadius={outerRadius + 1}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff" // Add stroke to maintain white border
          strokeWidth={1}
        />
      </g>
    );
  };

  const options = {
    plugins: {
      legend: {
        display: false, // This will hide the legend
      },
    },
  };



  let ResponsiveContainer_width = mapView ? width : '100%';
  let ResponsiveContainer_height = mapView ? height : '100%';
  let text_x = mapView ? width / 2 : '50%';
  let text_y_1 = mapView ? (height / 2) - 10 : '40%';
  let text_y_2 = mapView ? (height / 2) + base_font_size - 5 : '55%';
  let text_fontsize_1 = mapView ? base_font_size : '100%';
  let text_fontsize_2 = mapView ? base_font_size + 10 : '100%';



  return (
    <ResponsiveContainer width={ResponsiveContainer_width} height={ResponsiveContainer_height} style={{display: 'flex', flexDirection: 'column'}}>
      <PieChart width={'100%'} height={'100%'}>
        <Pie 
          data={data} 
          options = {options}
          label={renderCustomizedLabel} 
          labelLine={false} 
          activeIndex={activeIndex}
          activeShape={renderActiveShape} 
          onMouseEnter={(_ , index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(-1)}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <text 
          x={text_x} 
          y={text_y_1}  // Adjusted to place the title above the percentage
          textAnchor="middle" 
          fill="#AFF"  // Use textColor based on theme
          style={{ textAlign: 'center' }} 
          className='chart-title'
          fontSize={text_fontsize_1}
        >
          {title}
        </text>
        {/* Percentage Occupancy */}
        <text
          x={text_x} 
          y={text_y_2}  // Adjusted to place the percentage below the title
          dy={8} 
          textAnchor="middle" 
          fill="#FFF"  // Use textColor based on theme
          style={{ textAlign: 'center'}} 
          className='percentage-center'
          fontSize='150%'
        >
          {percentageCenter}
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PieChartComponent
