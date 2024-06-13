import React, { useState } from 'react';
import './liveView.css';
import { WarningTwoIcon } from '@chakra-ui/icons';

import { ReactComponent as PhGraphOccupancy } from '../../icons/placeholder-occ.svg';
import { ReactComponent as PhGraphCompliance } from '../../icons/placeholder-com.svg';

import { ReactComponent as DataOutageCompliance } from '../../icons/data-outage-com.svg';
import { ReactComponent as DataOutageOccupancy } from '../../icons/data-outage-occ.svg';

import Diagram from '../diagrams/Diagram';

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


const generateChartBox = (parkadeName, dataStatus) => {
  return (
    <div className='chart-box'>
      <div className='chart-header'>
        <span className='parkade-name'>{parkadeName}</span>
        {dataStatus && (
          <div className='warning-sign'>
            <WarningTwoIcon color='#FFD583' boxSize={30} />
            <div className='warning-tooltip'>Data Outage</div>
          </div>
        )}
      </div>
      <div className='chart-content'>
        {dataStatus ? (
          <>
            <Diagram type={'PIE'} height={200} width={200} title="Occupancy" className="large-placeholder"
              query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>
            <Diagram type={'PIE'} height={200} width={200} title="Compliance" className="small-placeholder"
              query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>
            {/*<div className='large-placeholder'><DataOutageOccupancy /></div>*/}
            {/*<div className='small-placeholder'><DataOutageCompliance /></div>*/}
          </>
        ) : (
          <>
            <Diagram type={'PIE'} height={200} width={200} title="Occupancy" className="large-placeholder"
              query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>
            <Diagram type={'PIE'} height={200} width={200} title="Compliance" className="small-placeholder"
              query={`select TOP 1 * from ${TABLES[parkadeName]}_Occupancy ORDER BY TimestampUnix DESC`} dataTransformer={transformData}/>
            {/*<div className='large-placeholder'><PhGraphOccupancy /></div>*/}
            {/*<div className='small-placeholder'><PhGraphCompliance /></div>*/}
          </>
        )}
      </div>
    </div>
  );
};




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

  return (
    <div className='liveView'>
      <div className='charts'>
        {generateChartBox('North Parkade', dataStatus.northParkade)}
        {generateChartBox('West Parkade', dataStatus.westParkade)}
        {generateChartBox('Rose Garden Parkade', dataStatus.roseParkade)}
        {generateChartBox('Health Sciences Parkade', dataStatus.healthParkade)}
        {generateChartBox('Fraser Parkade', dataStatus.fraserParkade)}
        {generateChartBox('Thunderbird Parkade', dataStatus.thunderbirdParkade)}
        {generateChartBox('University West Blvd', dataStatus.universityWestBlvd)}
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
