import React, { useEffect, useState } from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';
import BarGraphComponent from './BarGraph/BarGraphComponent';
import axios from 'axios';

const Diagram = ({type, width, height, title='', query=''}) => {

  const [diagData, setDiagData] = useState([]);

  const DATA = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
        { name: 'Group E', value: 1000}
    ] // sample data - to be replaced by API calls

    const BAR_DATA = [
      { name: 'Group A', value_1: 400, value_2: 300, value_3: 300},
      { name: 'Group B', value_1: 300, value_2: 800, value_3: 300 },
      { name: 'Group C', value_1: 300, value_2: 600, value_3: 300 },
      { name: 'Group D', value_1: 200, value_2: 300, value_3: 300 },
      { name: 'Group E', value_1: 1000, value_2: 200, value_3: 300}
  ] // sample

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#0FA122']; // TBD

  const getData = (query) => {
    const data = axios.get(`/executeQuery?query=${query}`);
    console.log(query);
    return DATA;
  }

  let toRender;

  useEffect(() => {
    const getData = async () => {
      const data = (await axios.get(`/executeQuery?query=${query}`)).data;
      console.log(data[0]['Capacity'])
      setDiagData([
        {name: 'Available', value: data[0]['Capacity'] - data[0]['Vehicles']},
        {name: 'Occupied', value: data[0]['Vehicles']}
      ]);
    }
    getData();
  }, [])
  
  switch(type) {
    case 'PIE': 
        toRender = <>
            <PieChartComponent data={diagData} colors={COLORS} height={height} width={width} title={title}></PieChartComponent>
        </>
        break;
    case 'LINE':
        toRender = <>
          <LineGraphComponent data={DATA} height={height} width={width} title={title}></LineGraphComponent>
        </>
        break;
    case 'BAR':
      toRender = <>
          <BarGraphComponent data={BAR_DATA} height={height} width={width} title={title}></BarGraphComponent>
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