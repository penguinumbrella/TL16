import React, { useEffect, useState } from 'react';
import PieChartComponent from './PieChart/PieChartComponent';
import LineGraphComponent from './LineGraph/LineGraphComponent';
import BarGraphComponent from './BarGraph/BarGraphComponent';
import Papa from 'papaparse';

const FutureDiagram = ({ type, timestamp, parkade, width, height, title = '', hasLegend, dataTransformer = () => [], dataOverride = [], customToolTip }) => {
  const [diagData, setDiagData] = useState([]);
  const [occupancyPercentage, setOccupancyPercentage] = useState('');
  const [compliancePercentage, setCompliancePercentage] = useState('');

  const COLORS = ['#787878', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#0FA122']; // TBD

  const TABLES = {
    'Fraser River': 725,
    'North': 990,
    'West': 1232,
    'Health Sciences': 1189,
    'Thunderbird': 1634,
    'University West Blvd': 216,
    'Rose Garden': 807,
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`/data/${parkade}_predictions.csv`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const csvData = await response.text();

        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            const data = results.data;

            const targetTimestamp = new Date(timestamp).getTime();
            console.log('Target Timestamp:', targetTimestamp, 'Formatted:', new Date(targetTimestamp));

            const matchingData = data.find(entry => {
              const entryTimestamp = new Date(entry.Timestamp.replace(' ', 'T')).getTime();
              console.log('Entry Timestamp:', entryTimestamp, 'Formatted:', new Date(entryTimestamp));
              console.log('Target Timestamp:', targetTimestamp, 'Formatted:', new Date(targetTimestamp));
              return entryTimestamp === targetTimestamp;
            });

            let occupied;

            
            if (!matchingData) {
              console.error('No matching data found for the given timestamp');
              occupied = 50;
              
            } else {
              // Calculate occupancy percentage
            
            occupied = matchingData.Occupancy;
            

            }
            const capacity = TABLES[parkade];
            const occupancyPercentage = ((occupied / capacity) * 100).toFixed(0);

            console.log(matchingData);

            

            setDiagData([
              { name: 'Available', value: capacity - occupied },
              { name: 'Occupied', value: occupied }
            ]);
            setOccupancyPercentage(`${occupancyPercentage}%`);
            setCompliancePercentage(`87%`);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching CSV file:', error);
      }
    };

    if (dataOverride.length === 0) {
      getData();
    }
  }, [parkade, timestamp, dataOverride]);

  const options = {
    plugins: {
      legend: {
        display: false, // This will hide the legend
      },
    },
  };

  let toRender;

  switch (type) {
    case 'PH_OCCUPANCY_PIE':
      toRender = (
        <PieChartComponent
          data={dataOverride}
          colors={COLORS}
          height={height}
          width={width}
          title={title}
          innerRadius={50}
          outerRadius={55}
          percentageCenter={0}
          startAngle={90}
          endAngle={450}
          startColor="#888"
          className="pie-chart"
        />
      );
      break;
    case 'PH_COMPLIANCE_PIE':
      toRender = (
        <PieChartComponent
          data={dataOverride}
          colors={COLORS}
          height={height}
          width={width}
          title={title}
          innerRadius={35}
          outerRadius={40}
          percentageCenter={0}
          startAngle={90}
          endAngle={450}
          startColor="#888"
        />
      );
      break;
    case 'OCCUPANCY_PIE':
      toRender = <>
        <PieChartComponent
          data={dataOverride.length !== 0 ? dataOverride : diagData}
          colors={COLORS}
          height={height}
          width={width}
          title={title}
          innerRadius={85}
          outerRadius={90}
          percentageCenter={occupancyPercentage}
          startAngle={90}
          endAngle={450}
          startColor="#888"
          base_font_size={25}
          className="pie-chart"
          >
          </PieChartComponent>
          </>
      break;
    case 'COMPLIANCE_PIE':
      toRender = <>
        <PieChartComponent
          data={dataOverride.length !== 0 ? dataOverride : diagData}
          colors={COLORS}
          height={height}
          width={width}
          title={title}
          innerRadius={50}
          outerRadius={55}
          percentageCenter={occupancyPercentage}
          startAngle={90}
          endAngle={450}
          base_font_size={15}
          startColor="#888">
          </PieChartComponent>
          </>
      break;
    case 'LINE':
      toRender = (
        <LineGraphComponent
          data={dataOverride.length !== 0 ? dataOverride : diagData}
          height={height}
          width={width}
          title={title}
          customToolTip={customToolTip}
        />
      );
      break;

    default:
      toRender = <h1>NOT SET</h1>;
  }

  return toRender;
};

export default FutureDiagram;
