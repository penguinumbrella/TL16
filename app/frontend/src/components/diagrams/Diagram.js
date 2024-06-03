import React from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';

const Diagram = ({type}) => {
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
            <PieChartComponent data={DATA} colors={COLORS}></PieChartComponent>
        </>
        break;
    case 'LINE':
        toRender = <>
          <LineGraphComponent data={DATA}></LineGraphComponent>
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