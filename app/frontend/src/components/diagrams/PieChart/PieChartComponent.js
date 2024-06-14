import React, { useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Legend, Label } from 'recharts';

const PieChartComponent = ({data, colors, width, height, title='', innerRadius, outerRadius , percentageCenter, startAngle, endAngle}) => {

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
    const ex = mx + (cos >= 0 ? 1 : -1) * 9;
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
        <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} dy={5} textAnchor={textAnchor} fill="#999" fontSize={16}>
        {`${toDisplayValue}`}
        </text>
      </g>
    );
  };

  // https://recharts.org/en-US/examples/CustomActiveShapePieChart
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
        {/* <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke={fill} 
          fill="none" 
        /> */}
        {/* <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
          {'text'}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text> */}
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

  return (
    <ResponsiveContainer width={width} height={height} style={{display: 'flex', flexDirection: 'column'}}>
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
          x={width / 2} 
          y={height / 2 - 20} 
          textAnchor="middle" 
          fill="#888" 
          style={{ textAlign: 'center' }} 
          className='chart-title'
        >
          {title}
        </text>
        {/* Percentage Occupancy */}
        <text
          x={width / 2} 
          y={height / 2} 
          dy={8} 
          textAnchor="middle" 
          fill="#FFF" 
          className='percentage-center'
        >
          {percentageCenter}
        </text>
      </PieChart>
      
    </ResponsiveContainer>
  )
}

export default PieChartComponent