import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState } from 'react';
import Diagram from '../../../diagrams/Diagram'
import './MarkerWithInfoWindow.css'
import './extraStyling.css'

import FutureDiagram from '../../../diagrams/FutureDiagram';


// This does not work consistantly 
// import * as imagePaths from './imagePaths.js';

// Right now this works consistantly 

import parkadeIcon from './../../../../assets/parkadeIcon.png'
import parkadeIconPicked from './../../../../assets/parkadeIconPicked.png'
import accessibilityIcon from './../../../../assets/accessibilityIcon.png'
import accessibilityIconPicked from './../../../../assets/accessibilityIconPicked.png'
import accessibilityIconOccupied from './../../../../assets/accessibilityIconOccupied.png'
import loadingZoneIcon from './../../../../assets/loadingZoneIcon.png'
import loadingZoneIconPicked from './../../../../assets/loadingZoneIconPicked.png'



/*
position: object with lat and lng values e.g. { "lat": 49.26927494156756, "lng": -123.25087736976562 }

showInfoWindow: function that sets the state of the infoWindow to the marker 

infoWindowShown: boolean, true if this marker's infoWindow is shown false otherwise 

content: the name of the marker 

exit: function that resets the state to '' (meaning no infoWindow is currently shown or no marker is currently selected)

iconImage: string for the marker type, either "parkades", "accessibility" or "loading_zones"

data: data to be shown right now it's just a number or a string
*/

const MarkerWithInfoWindow = ({
  selectedOption,
  key,
  position,
  showInfoWindow,
  infoWindowShown,
  content,
  exit,
  iconImage,
  data,
  // mapCenter, // New prop to pass the map's center
  // setMapCenter, // Function to update the map's center
  clusterer,
  timestamp,
  vacant,
  payload_timestamp
}) => {
  // Define icon paths
  const iconPaths = {
    parkades: { icon: parkadeIcon, pickedIcon: parkadeIconPicked },
    accessibility: { icon: (vacant ? accessibilityIcon : accessibilityIconOccupied), pickedIcon: accessibilityIconPicked },
    loading_zones: { icon: loadingZoneIcon, pickedIcon: loadingZoneIconPicked },
  };

  // Select icon based on iconImage
  const { icon, pickedIcon } = iconPaths[iconImage] || iconPaths.parkades;

  // Define icon sizes
  const smallIconSize = new window.google.maps.Size(20, 20);
  const largeIconSize = new window.google.maps.Size(25, 25);

  const TABLES = {
    'Fraser River': 'FraserParkade',
    'North': 'NorthParkade',
    'West': 'WestParkade',
    'Health Sciences': 'HealthSciencesParkade',
    'Thunderbird': 'ThunderbirdParkade',
    'University West Blvd': 'UnivWstBlvdParkade',
    'Rose Garden': 'RoseGardenParkade'
  }

  const formatTimestampToUnix = (date) => {
    // Convert the date to Unix timestamp in seconds
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    console.log(unixTimestamp);
    return unixTimestamp;
  };
  
  let formattedTimestamp;
  // Usage
  if (selectedOption == "parkades") {
    formattedTimestamp = formatTimestampToUnix(timestamp); 
  }

  const thresholdDate = new Date('2024-06-06T13:00:00Z');
  const isTimestampPastThreshold = timestamp >= thresholdDate;
 

  const transformData = (data) => {
    return [
      {name: 'Available', value: data[0]['Capacity'] - data[0]['Vehicles']},
      {name: 'Occupied', value: data[0]['Vehicles']}
    ];
  }


  return (
    <MarkerF
      icon={{
        url: infoWindowShown ? pickedIcon : icon,
        scaledSize: infoWindowShown ? largeIconSize : smallIconSize,
      }}
      //animation={infoWindowShown ? window.google.maps.Animation.BOUNCE : null}
      position={position}
      onMouseOver={showInfoWindow}
      clusterer={clusterer}
    >
      {infoWindowShown && (
        <InfoWindowF
        options={{
          disableAutoPan: true
          // pixelOffset: new window.google.maps.Size(0, -30), // Adjust vertical offset as needed
        }}
          onCloseClick={() => {
            exit();
            // Ensure mapCenter remains unchanged when the InfoWindow is closed
            // setMapCenter(mapCenter);
          }}
          className="info-window"
          style={{ backgroundColor: '#123674', border: '2px solid #ccc', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="info-window-contents">
            <h2 style={{ paddingBottom: '20px' }}>{`${content}`}</h2>
            <div className="info-window-diagrams">
              {selectedOption === "parkades" &&

              <div className='parkadeWindow'>
                 {!isTimestampPastThreshold ? (
                    <>
                      <div className='occupancy-chart'>
                        <Diagram
                          className='occupancy-pie'
                          
                          type={'OCCUPANCY_PIE'}
                          height={300}
                          width={300}
                          title="Occupancy"
                          hasLegend={true}
                          query={`select TOP 1 * from ${TABLES[content]}_Occupancy WHERE TimestampUnix <= ${formatTimestampToUnix(timestamp)} ORDER BY TimestampUnix DESC`}
                          dataTransformer={transformData}
                        />
                      </div>
                      <div className='compliance-chart'>
                        <Diagram
                          className='compliance-pie'
                          
                          type={'COMPLIANCE_PIE'}
                          height={150}
                          width={150}
                          title="Compliance"
                          hasLegend={true}
                          query={`select TOP 1 * from ${TABLES[content]}_Occupancy WHERE TimestampUnix <= ${formatTimestampToUnix(timestamp)} ORDER BY TimestampUnix DESC`}
                          dataTransformer={transformData}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='occupancy-chart'>
                        <FutureDiagram
                          className='occupancy-pie'
                          timestamp={timestamp}
                          parkade={content}
                          type={'OCCUPANCY_PIE'}
                          height={300}
                          width={300}
                          title="Occupancy"
                          hasLegend={true}
                          
                          dataTransformer={transformData}
                        />
                      </div>
                      <div className='compliance-chart'>
                        <FutureDiagram
                          className='compliance-pie'
                          timestamp={timestamp}
                          parkade={content}
                          type={'COMPLIANCE_PIE'}
                          height={150}
                          width={150}
                          title="Compliance"
                          hasLegend={true}
                          query={`select TOP 1 * from ${TABLES[content]}_Occupancy WHERE TimestampUnix <= ${formatTimestampToUnix(timestamp)} ORDER BY TimestampUnix DESC`}
                          dataTransformer={transformData}
                        />
                      </div>
                    </>
                  )}
              </div>
              }
              {
                (iconImage === 'accessibility') &&  <h3 > {vacant ? `Last occupied : ${payload_timestamp}` : `Occupied since : ${payload_timestamp}`}</h3>
              }
            </div>
          </div>
        </InfoWindowF>
      )}
    </MarkerF>
  );
};

export default MarkerWithInfoWindow;