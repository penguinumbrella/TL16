import React, { useEffect, useState } from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';
import BarGraphComponent from './BarGraph/BarGraphComponent';
import axios from 'axios';

const Diagram = ({type, width, height, title='', query='', hasLegend, dataTransformer=()=>[], dataOverride=[], customToolTip, dataKeyY="value", capacity, theme, mapView}) => {

  const [diagData, setDiagData] = useState([]);
  const [occupancyPercentage, setOccupancyPercentage] = useState('');
  const [compliancePercentage, setCompliancePercentage] = useState('');

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

  const COLORS = ['#787878', '#007ae6', '#00b392', '#e69d00', '#ff661a', '#0FA122']; // TBD

  const getData = (query) => {
    const data = axios.get(`/executeQuery?query=${query}`);
    // console.log(query);
    return DATA;
  }


  useEffect(() => {
    const getData = async () => {
      
      const data = (await axios.get(`/executeQuery?query=${query}`)).data;
      // console.log(data[0]['Capacity'])
      // Calculate capacity and occupied values
      const capacity = data[0]['Capacity'];
      const occupied = data[0]['Vehicles'];
    
      // Calculate occupancy percentage
      const occupancyPercentage = ((occupied / capacity) * 100).toFixed(0);
      setDiagData([
        {name: 'Available', value: data[0]['Capacity'] - data[0]['Vehicles']},
        {name: 'Occupied', value: data[0]['Vehicles']}
      ]);
      // Update state with occupancy percentage
      setOccupancyPercentage(`${occupancyPercentage}%`);
      setCompliancePercentage(`87%`);
    }
    if (dataOverride.length == 0)
      getData();
  
  }, []);

  const options = {
    plugins: {
      legend: {
        display: false, // This will hide the legend
      },
    },
  };
  
  let toRender;


  let innerRadius_1 = mapView ? 85 : "85%";
  let innerRadius_2 = mapView ? 50 : "85%";
  let outerRadius_1 = mapView ? 90 : "95%";
  let outerRadius_2 = mapView ? 55 : "95%";


  switch(type) {
      case 'OCCUPANCY_PIE': 
        toRender = <>
            <PieChartComponent 
              mapView = {mapView}
              base_font_size={25}
              data={dataOverride.length != 0 ? dataOverride : diagData}
              colors={COLORS} 
              height={height} 
              width={width} 
              title={title} 
              innerRadius={innerRadius_1}
              outerRadius={outerRadius_1}
              percentageCenter={occupancyPercentage}
              startAngle={90}
              endAngle={450}
              startColor="#888"
              className='pie-chart'
              theme={theme}>
            </PieChartComponent>
            </>
        break;
      case 'COMPLIANCE_PIE': 
        toRender = <>
            <PieChartComponent 
              mapView = {mapView}
              base_font_size={15}
              data={dataOverride.length != 0 ? dataOverride : diagData} 
              colors={COLORS} 
              height={height} 
              width={width} 
              title={title} 
              innerRadius={innerRadius_2}
              outerRadius={outerRadius_2}
              percentageCenter={occupancyPercentage}
              startAngle={90}
              endAngle={450}
              startColor="#888"
              theme={theme}>
            </PieChartComponent>
            </>
        break;
    case 'LINE':
        toRender = <>
          <LineGraphComponent data={dataOverride.length != 0 ? dataOverride : diagData} height={height} width={width} title={title} customToolTip={customToolTip} dataKeyY={dataKeyY} capacity={capacity}></LineGraphComponent>
        </>
        break;
    case 'BAR':
      toRender = <>
          <BarGraphComponent data={dataOverride.length != 0 ? dataOverride : diagData} height={height} width={width} title={title} customToolTip={customToolTip} dataKeyY={dataKeyY} capacity={capacity}></BarGraphComponent>
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
