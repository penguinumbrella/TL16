import React, { useState } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Legend, Label } from 'recharts';

const PieChartComponent = ({data, colors}) => {

  const [ activeIndex, setActiveIndex ] = useState(-1);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
    }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    let toDisplay;
    if (index != activeIndex)
      toDisplay = data[index].value;
    else toDisplay = `${percent.toFixed(1)*100}%`;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${toDisplay}`}
      </text>
    );
  };

  // https://recharts.org/en-US/examples/CustomActiveShapePieChart
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
      <g>
        <text></text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius + 6}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };


  return (
    <ResponsiveContainer width={"20%"} height={300}>
      <PieChart width={400} height={400} >
        <Pie data={data} label={renderCustomizedLabel} labelLine={false} activeIndex={activeIndex}
         activeShape={renderActiveShape} onMouseEnter={(_, index) => setActiveIndex(index)}
         onMouseLeave={() => setActiveIndex(-1)}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Pie>
        <Legend></Legend>
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PieChartComponent