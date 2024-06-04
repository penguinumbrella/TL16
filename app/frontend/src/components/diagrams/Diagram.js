import React from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';

const Diagram = ({type, width, height, title=''}) => {
  const DATA = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
        { name: 'Group E', value: 1000}
    ] // sample data - to be replaced by API calls

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#0FA122']; // TBD

  let toRender;
  
  switch(type) {
    case 'PIE': 
        toRender = <>
            <PieChartComponent data={DATA} colors={COLORS} height={height} width={width} title={title}></PieChartComponent>
        </>
        break;
    case 'LINE':
        toRender = <>
          <LineGraphComponent data={DATA} height={height} width={width} title={title}></LineGraphComponent>
        </>
        break;
    default:
        toRender = <>
            <h1>NOT SET</h1>
        </>
  }

  return (toRender)
}

export default Diagram