import React, { useEffect, useState } from 'react';
import './liveView.css';
import { WarningTwoIcon } from '@chakra-ui/icons';
import Diagram from '../diagrams/Diagram';
import axios from 'axios';
import { formatUnixTimestamp } from '../../time';

const TABLES = {
  'Fraser Parkade': 'FraserParkade',
  'North Parkade': 'NorthParkade',
  'West Parkade': 'WestParkade',
  'Health Sciences Parkade': 'HealthSciencesParkade',
  'Thunderbird Parkade': 'ThunderbirdParkade',
  'University West Blvd': 'UnivWstBlvdParkade',
  'Rose Garden Parkade': 'RoseGardenParkade'
};

const transformData = (data) => {
  const available = data[0]['Capacity'] - data[0]['Vehicles'] 
  const occupied = Math.ceil(0.5 * data[0]['Vehicles'])

  return [
    { name: 'Available', value: available},
    { name: 'Occupied', value: occupied},
  ];
};

const LiveView = ({ theme }) => {
  const [lastUpdateNorth, setLastUpdateNorth] = useState('');
  const [lastUpdateWest, setLastUpdateWest] = useState('');
  const [lastUpdateThunderbird, setLastUpdateThunderbird] = useState('');
  const [lastUpdateFraser, setLastUpdateFraser] = useState('');
  const [lastUpdateHealth, setLastUpdateHealth] = useState('');
  const [lastUpdateUnivWst, setLastUpdateUnivWst] = useState('');
  const [lastUpdateRose, setLastUpdateRose] = useState('');

  const stateMap = {
    'Fraser Parkade': [lastUpdateFraser, setLastUpdateFraser],
    'North Parkade': [lastUpdateNorth, setLastUpdateNorth],
    'West Parkade': [lastUpdateWest, setLastUpdateWest],
    'Health Sciences Parkade': [lastUpdateHealth, setLastUpdateHealth],
    'Thunderbird Parkade': [lastUpdateThunderbird, setLastUpdateThunderbird],
    'University West Blvd': [lastUpdateUnivWst, setLastUpdateUnivWst],
    'Rose Garden Parkade': [lastUpdateRose, setLastUpdateRose]
  };

  useEffect(() => {
    const getLastUpdated = async (parkadeName) => {
      const response = await axios.get(`executeQuery?query=SELECT top 1 TimestampUnix FROM ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`);
      const data = response.data;
      stateMap[parkadeName][1](data[0]['TimestampUnix']);
    };
    Object.keys(stateMap).forEach((parkade) => {
      getLastUpdated(parkade);
    });
  }, []);

  const isRecentUpdate = (timestamp) => {
    const currentTime = Date.now();
    const updateTime = timestamp * 1000;
    const timeDifference = currentTime - updateTime;
    return timeDifference < 15 * 60 * 1000;
  };

  const generateChartBox = (parkadeName, lastUpdate) => {
    const showWarning = !isRecentUpdate(lastUpdate);

    return (
      <div className='chart-box'>
        <div className='chart-header'>
          <span className='parkade-name'>{parkadeName}</span>
          {showWarning && (
            <div className='warning-sign'>
              <WarningTwoIcon color='#FFD583' boxSize={30} />
              <div className='warning-tooltip'>{`Not updated for more than 15 minutes, since: ${formatUnixTimestamp(lastUpdate)}`}</div>
            </div>
          )}
        </div>
        <div className='chart-content'>
          <div className='occupancy-chart'>
            <Diagram className='occupancy-pie' type={'OCCUPANCY_PIE'} height="100%" width="100%" title="Occupancy" hasLegend={false}
              query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData} mapView={false}/>
          </div>
          <div className='compliance-chart'>
            <Diagram className='compliance-pie' type={'COMPLIANCE_PIE'} height="100%" width="100%" title="Compliance" hasLegend={false}
              query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData} mapView={false}/>
          </div>
        </div>
        <div className='last-update'>
          <span style={{ fontSize: '15px' }}>{`Last Updated: ${formatUnixTimestamp(lastUpdate)}`}</span>
        </div>
      </div>
    );
  };

  return (
    <div className='liveView'>
      <div className='charts'>
        {generateChartBox('North Parkade', lastUpdateNorth)}
        {generateChartBox('West Parkade', lastUpdateWest)}
        {generateChartBox('Rose Garden Parkade', lastUpdateRose)}
        {generateChartBox('Health Sciences Parkade', lastUpdateHealth)}
        {generateChartBox('Fraser Parkade', lastUpdateFraser)}
        {generateChartBox('Thunderbird Parkade', lastUpdateThunderbird)}
        {generateChartBox('University West Blvd', lastUpdateUnivWst)}
      </div>
      <div className='keys'>
        <div className='key'>
          <span className='key-label'>Occupancy:</span>
          <div className='key-list'>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#E697FF' }}></span>
              <span className='key-description'>undergraduate</span>
            </div>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#76A5FF' }}></span>
              <span className='key-description'>graduate</span>
            </div>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#FFA5CB' }}></span>
              <span className='key-description'>faculty</span>
            </div>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#82F0FF' }}></span>
              <span className='key-description'>transient</span>
            </div>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#323551' }}></span>
              <span className='key-description'>available</span>
            </div>
          </div>
        </div>

        <div className='key'>
          <span className='key-label'>Compliance:</span>
          <div className='key-list'>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#FFD583' }}></span>
              <span className='key-description'>pay station</span>
            </div>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#BAEFFF' }}></span>
              <span className='key-description'>honk</span>
            </div>
            <div className='key-item'>
              <span className='key-circle' style={{ backgroundColor: '#F765A3' }}></span>
              <span className='key-description'>violation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveView;
