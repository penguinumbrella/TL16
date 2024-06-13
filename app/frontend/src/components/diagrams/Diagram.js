import React, { useEffect, useState } from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';
import axios from 'axios';

const Diagram = ({type, width, height, title='', query='', dataTransformer=()=>[], dataOverride=[], customToolTip}) => {

  const [diagData, setDiagData] = useState([]);

  const DATA = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
        { name: 'Group E', value: 1000}
    ] // sample data - to be replaced by API calls

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#0FA122']; // TBD

  let toRender;

  useEffect(() => {
    const getData = async () => {
      try {
        const data = (await axios.get(`/executeQuery?query=${query}`)).data;
        const toDisplay = dataTransformer(data);
        setDiagData(toDisplay);
      } catch (e) {
        console.log(e)
      }
    }
    if (dataOverride.length == 0)
      getData();
  }, []);
  
  switch(type) {
    case 'PIE': 
        toRender = <>
            <PieChartComponent data={dataOverride.length != 0 ? dataOverride : diagData} colors={COLORS} height={height} width={width} title={title}></PieChartComponent>
        </>
        break;
    case 'LINE':
        toRender = <>
          <LineGraphComponent data={dataOverride.length != 0 ? dataOverride : diagData} height={height} width={width} title={title} customToolTip={customToolTip}></LineGraphComponent>
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