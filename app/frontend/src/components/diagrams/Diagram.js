import React, { useEffect, useState } from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';
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
    default:
        toRender = <>
            <h1>NOT SET</h1>
        </>
  }

  return (toRender)
}

export default Diagram