import React, { useEffect, useState } from 'react'
import PieChartComponent from './PieChart/PieChartComponent'
import LineGraphComponent from './LineGraph/LineGraphComponent';
import BarGraphComponent from './BarGraph/BarGraphComponent';
import TableComponent from './Table/TableComponent';
import axios from 'axios';
import { getAuthToken } from '../../getAuthToken';

const Diagram = ({type, width, height, title='', query='', hasLegend, dataTransformer=()=>[], dataOverride=[], customToolTip, dataKeyY="value", capacity, theme, mapView, rows, columns, activePieChartPercentName, redx1, redx2, yellowx1, yellowx2, greenx1, greenx2, prediction_type}) => {

  // console.log("Data override: ", dataOverride);

  const [diagData, setDiagData] = useState([]);
  const [occupancyPercentage, setOccupancyPercentage] = useState('');
  const [compliancePercentage, setCompliancePercentage] = useState('');

  const COLORS = ['#787878', '#007ae6', '#00b392', '#e69d00', '#ff661a', '#0FA122']; // TBD

  useEffect(() => {
    const getData = async () => {

        const data = (await axios.get(`/executeQuery?query=${query}`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        })).data;
        if (type == 'COMPLIANCE_PIE') {
          const total = data[0]['TotalPlates'];
          const payStation = data[0]['PayStation'];
          const honkApp = data[0]['HonkApp'];
          const violations = data[0]['Violation'];
          const permit = data[0]['Permit'];
          console.log(data);
          setDiagData([
            {name: 'Pay station', value: payStation},
            {name: 'Honk', value: honkApp},
            {name: 'Permit', value: permit},
            {name: 'Violations', value: violations}
          ]);

          const compliancePercentage = 100 - ((violations / total) * 100).toFixed(0);
          setOccupancyPercentage(`${compliancePercentage}%`);
        }
        else {
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
      }
    if (dataOverride.length == 0 && type !== 'TABLE')
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
              theme={theme}
              activePieChartPercentName={activePieChartPercentName}>
            </PieChartComponent>
            </>
        break;
      case 'COMPLIANCE_PIE': 
        toRender = <>
            <PieChartComponent 
              mapView = {mapView}
              base_font_size={15}
              data={dataOverride.length != 0 ? dataOverride : diagData} 
              colors={['#FFD583', '#BAEFFF', '#00D583', '#F765A3']} 
              height={height} 
              width={width} 
              title={title} 
              innerRadius={innerRadius_2}
              outerRadius={outerRadius_2}
              percentageCenter={occupancyPercentage}
              startAngle={90}
              endAngle={450}
              startColor="#888"
              theme={theme}
              activePieChartPercentName={activePieChartPercentName}
              diagData={diagData}>
            </PieChartComponent>
            </>
        break;
    case 'LINE':
        toRender = <>
          <LineGraphComponent data={dataOverride.length != 0 ? dataOverride : diagData} height={height} width={width} title={title} customToolTip={customToolTip} dataKeyY={dataKeyY} capacity={capacity} redx1={redx1} redx2={redx2} yellowx1={yellowx1} yellowx2={yellowx2} greenx1={greenx1} greenx2={greenx2} prediction_type={prediction_type}></LineGraphComponent>
        </>
        break;
    case 'BAR':
      toRender = <>
          <BarGraphComponent data={dataOverride.length != 0 ? dataOverride : diagData} height={height} width={width} title={title} customToolTip={customToolTip} dataKeyY={dataKeyY} capacity={capacity}></BarGraphComponent>
        </>
        break;
    case 'TABLE':
      toRender = <>
          <TableComponent rows={rows} columns={columns}></TableComponent>
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
