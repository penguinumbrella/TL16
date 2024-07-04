import React, { useEffect, useState } from 'react';
import './liveView.css';
import { WarningTwoIcon } from '@chakra-ui/icons';

import { ReactComponent as PhGraphOccupancy } from '../../icons/placeholder-occ.svg';
import { ReactComponent as PhGraphCompliance } from '../../icons/placeholder-com.svg';

import { ReactComponent as DataOutageCompliance } from '../../icons/data-outage-com.svg';
import { ReactComponent as DataOutageOccupancy } from '../../icons/data-outage-occ.svg';

import Diagram from '../diagrams/Diagram';
import axios from 'axios';
import { formatUnixTimestamp } from '../../time';
import { getAuthToken } from '../../getAuthToken';

const TABLES = {
  'Fraser Parkade': 'FraserParkade',
  'North Parkade': 'NorthParkade',
  'West Parkade': 'WestParkade',
  'Health Sciences Parkade': 'HealthSciencesParkade',
  'Thunderbird Parkade': 'ThunderbirdParkade',
  'University West Blvd': 'UnivWstBlvdParkade',
  'Rose Garden Parkade': 'RoseGardenParkade'
}

const transformData = (data) => {
  return [
    {name: 'Available', value: data[0]['Capacity'] - data[0]['Vehicles']},
    {name: 'Occupied', value: data[0]['Vehicles']}
  ];
}


const LiveView = () => {
  // Define the initial data status for each parkade
  const [dataStatus, setDataStatus] = useState({
    northParkade: false,
    westParkade: true,
    roseParkade: false,
    healthParkade: false,
    fraserParkade: false,
    thunderbirdParkade: false,
    universityWestBlvd: false
  });

  const [lastUpdateNorth, setLastUpdateNorth] = useState('')
  const [lastUpdateWest, setLastUpdateWest] = useState('')
  const [lastUpdateThunderbird, setLastUpdateThunderbird] = useState('')
  const [lastUpdateFraser, setLastUpdateFraser] = useState('')
  const [lastUpdateHealth, setLastUpdateHealth] = useState('')
  const [lastUpdateUnivWst, setLastUpdateUnivWst] = useState('')
  const [lastUpdateRose, setLastUpdateRose] = useState('')

  const stateMap = {
    'Fraser Parkade': [lastUpdateFraser, setLastUpdateFraser],
    'North Parkade': [lastUpdateNorth, setLastUpdateNorth],
    'West Parkade': [lastUpdateWest, setLastUpdateWest],
    'Health Sciences Parkade': [lastUpdateHealth, setLastUpdateHealth],
    'Thunderbird Parkade': [lastUpdateThunderbird, setLastUpdateThunderbird],
    'University West Blvd': [lastUpdateUnivWst, setLastUpdateUnivWst],
    'Rose Garden Parkade': [lastUpdateRose, setLastUpdateRose]
  }

  useEffect(() => {
    const getLastUpdated = async (parkadeName) => {
      const response = await axios.get(`executeQuery?query=SELECT top 1 TimestampUnix FROM ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const data = response.data;
      stateMap[parkadeName][1](data[0]['TimestampUnix'])
    };
    Object.keys(stateMap).forEach((parkade) => {
      getLastUpdated(parkade);
    })
  }, [])

  const generateChartBox = (parkadeName, dataStatus, lastUpdate) => {
    console.log(lastUpdate[parkadeName]);
    return (
      <div className='chart-box'>
        <div className='chart-header'>
          <span className='parkade-name'>{parkadeName}</span>
          {dataStatus && (
            <div className='warning-sign'>
              <WarningTwoIcon color='#FFD583' boxSize={30} />
              <div className='warning-tooltip'>{`Not updated for more than 15 minutes, since: ${formatUnixTimestamp(lastUpdate)}`}</div>
            </div>
          )}
        </div>
        <div className='chart-content'>
          {dataStatus ? (
            <>
                <div className='occupancy-chart'>
                <Diagram className = 'occupancy-pie' type={'OCCUPANCY_PIE'} height={300} width={300} title="Occupancy" hasLegend={false}
                query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>

                               
                  <div className='last-update' style={{padding: '10px'} }>
                    <span style={{ fontSize: '15px' }}>{`Last Updated: ${formatUnixTimestamp(lastUpdate)}`}</span>
                  </div>
                </div>

                
            
                
              
              <div className='compliance-chart'>
                <Diagram className = 'compliance-pie' type={'COMPLIANCE_PIE'} height={150} width={150} title="Compliance" hasLegend={false}
                query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>


              </div>
                
              {/*<div className='large-placeholder'><PhGraphOccupancy /></div>*/}
              {/*<div className='small-placeholder'><PhGraphCompliance /></div>*/}
            </>
          ) : (
            <>
            
                <div className='occupancy-chart'>
                <Diagram className = 'occupancy-pie' type={'OCCUPANCY_PIE'} height={300} width={300} title="Occupancy" hasLegend={false}
                query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>

<div className='last-update' style={{padding: '10px'} }>
<span style={{ fontSize: '15px' }}>{`Last Updated: ${formatUnixTimestamp(lastUpdate)}`}</span>

</div>
                </div>

                <div className='compliance-chart'>
                <Diagram className = 'compliance-pie' type={'COMPLIANCE_PIE'} height={150} width={150} title="Compliance" hasLegend={false}
                query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>
              </div>
              
              {/*<div className='large-placeholder'><PhGraphOccupancy /></div>*/}
              {/*<div className='small-placeholder'><PhGraphCompliance /></div>*/}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='liveView'>
      <div className='charts'>
        {generateChartBox('North Parkade', dataStatus.northParkade, stateMap['North Parkade'][0])}
        {generateChartBox('West Parkade', dataStatus.westParkade, stateMap['West Parkade'][0])}
        {generateChartBox('Rose Garden Parkade', dataStatus.roseParkade, stateMap['Rose Garden Parkade'][0])}
        {generateChartBox('Health Sciences Parkade', dataStatus.healthParkade, stateMap['Health Sciences Parkade'][0])}
        {generateChartBox('Fraser Parkade', dataStatus.fraserParkade, stateMap['Fraser Parkade'][0])}
        {generateChartBox('Thunderbird Parkade', dataStatus.thunderbirdParkade, stateMap['Thunderbird Parkade'][0])}
        {generateChartBox('University West Blvd', dataStatus.universityWestBlvd, stateMap['University West Blvd'][0])}
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
