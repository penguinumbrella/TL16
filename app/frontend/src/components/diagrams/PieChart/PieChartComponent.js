import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Legend, Label } from 'recharts';

const PieChartComponent = ({ data, colors, width, height, 
  title='', innerRadius, outerRadius , percentageCenter, 
  startAngle, endAngle, theme, mapView, base_font_size }) => {

  const [ activeIndex, setActiveIndex ] = useState(-1);

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
    toDisplayValue = `${percent.toFixed(1)*100}%`;

    return (
      <g>
        <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke={colors[index % colors.length]} 
          fill="none" 
        />
        <circle cx={ex} cy={ey} r={2} fill={colors[index % colors.length]} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 4} y={ey} dy={5} textAnchor={textAnchor} fill="#999" fontSize='1em'>
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



  const ResponsiveContainer_width = {
    true : width,
    false : '100%'
  }
  const ResponsiveContainer_height = {
    true : height,
    false : '100%'
  }

  const text_x = {
    true : width / 2,
    false : '50%'
  }

  const text_y_1 = {
    true : height / 2 - 10,
    false : '40%'
  }

  const text_y_2 = {
    true : height / 2 + base_font_size - 5,
    false : '55%'
  }

  const text_fontsize_1 =  {
    true :  base_font_size,
    false: '100%'
  }

  const text_fontsize_2 =  {
    true :  base_font_size + 10,
    false: '100%'
  }




  return (
    <ResponsiveContainer width={ResponsiveContainer_width[mapView]} height={ResponsiveContainer_height[mapView]} style={{display: 'flex', flexDirection: 'column'}}>
      <PieChart width={'100%'} height={'100%'}>
        <Pie 
          data={data} 
          options = {options}
          label={renderCustomizedLabel} 
          labelLine={false} 
          activeIndex={activeIndex}
          activeShape={renderActiveShape} 
          onMouseEnter={(_, index) => setActiveIndex(index)}
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
          x={text_x[mapView]} 
          y={text_y_1[mapView]}  // Adjusted to place the title above the percentage
          textAnchor="middle" 
          fill="#AFF"  // Use textColor based on theme
          style={{ textAlign: 'center' }} 
          className='chart-title'
          fontSize={text_fontsize_1[mapView]}
        >
          {title}
        </text>
        {/* Percentage Occupancy */}
        <text
          x={ text_x[mapView]} 
          y={text_y_2[mapView]}  // Adjusted to place the percentage below the title
          dy={8} 
          textAnchor="middle" 
          fill="#FFF"  // Use textColor based on theme
          style={{ textAlign: 'center'}} 
          className='percentage-center'
          fontSize={text_fontsize_2[mapView]}
        >
          {percentageCenter}
        </text>
      </PieChart>
      
    </ResponsiveContainer>
  )
}

export default PieChartComponent
