import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import Diagram from '../../../diagrams/Diagram'
import styles from './MarkerWithInfoWindow.css'
import './extraStyling.css'

import FutureDiagram from '../../../diagrams/FutureDiagram';
import axios from 'axios';


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

import parkadeIcon_25 from './../../../../assets/parkadeIcon_25.png'
import parkadeIcon_50 from './../../../../assets/parkadeIcon_50.png'
import parkadeIcon_75 from './../../../../assets/parkadeIcon_75.png'
import parkadeIcon_100 from './../../../../assets/parkadeIcon_100.png'

function updateCSSVariables(varName, primaryColor) {
  document.documentElement.style.setProperty(varName, primaryColor);
}

    const theme_vars =[
      '--info-window-contents_h2_color',
      '--info-window-contents_background-color',
      '--gm-style_gm-style-iw-c_background-color',
      '--gm-style_gm-style-iw-tc__after_background',
      '--info-window-diagrams_h3'
    ]

    const theme_colors ={
      'dark' : ['#fff','#000','#000','#000', '#9c9fbb'],
      'light': ['#000','#8d8e9e','#8d8e9e','#8d8e9e', '#fff'],
    }
// Example usage


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
  setMarkerPosition,
  timestamp,
  vacant,
  payload_timestamp,
  theme
  
}) => {
    


    // Define icon sizes
    const smallIconSize = new window.google.maps.Size(25, 25);
    const largeIconSize = new window.google.maps.Size(30, 30);


    

    const TABLES = {
      'Fraser River': 'FraserParkade',
      'North': 'NorthParkade',
      'West': 'WestParkade',
      'Health Sciences': 'HealthSciencesParkade',
      'Thunderbird': 'ThunderbirdParkade',
      'University West Blvd': 'UnivWstBlvdParkade',
      'Rose Garden': 'RoseGardenParkade'
    }


    const COMPLIANCE_MAP = {
      'Fraser River': 'Fraser',
      'North': 'North',
      'West': 'West',
      'Health Sciences': 'HealthSciences',
      'Thunderbird': 'Thunderbird',
      'University West Blvd': 'UnivWstBlvd',
      'Rose Garden': 'Rose'
    }



    const formatTimestampToUnix = (date) => {
      // Convert the date to Unix timestamp in seconds
      const unixTimestamp = Math.floor(date.getTime() / 1000);
      // console.log(unixTimestamp);
      return unixTimestamp;
    };


    // We want to change the parakde icon based on the current occupancy green -> yellow -> orange -> red
    // where each colour is 25%
    const [currentParkadeIcon, setCurrentParkadeIcon] = useState(parkadeIcon);

    useEffect(() => {
      const printOccupancy = async ()=>{

        if(iconImage == 'parkades'){
          // Get the current occupancy and max capacity of the current parkade
          console.log('timestamp in marker: ' + timestamp);
          let query=`select TOP 1 * from ${TABLES[content]}_Occupancy WHERE TimestampUnix <= ${formatTimestampToUnix(timestamp)} ORDER BY TimestampUnix DESC`
          let data = (await axios.get(`/executeQuery?query=${query}`)).data;
          let capacity = data[0]['Capacity'];
          let occupied = data[0]['Vehicles'];

          let occupancyPercentage = ((occupied / capacity) * 100).toFixed(0);

          if(occupancyPercentage <= 25)
            setCurrentParkadeIcon(parkadeIcon_25);

          else if(occupancyPercentage <= 50)
            setCurrentParkadeIcon(parkadeIcon_50);

          else if(occupancyPercentage <= 75)
            setCurrentParkadeIcon(parkadeIcon_75);

          else if(occupancyPercentage <= 100)
            setCurrentParkadeIcon(parkadeIcon_100);

          else 
            setCurrentParkadeIcon(parkadeIcon);

          // console.log(`${content} : ${occupancyPercentage}`);
        
        
        }
      }
      // Whenever the user changes the timestamp using the time slider 
      // update the occupancy
      if(timestamp){
        printOccupancy();
      }

      if(infoWindowShown){
        // console.log("infoWindowShown changed")
        if(infoWindowShown === true)
          setMarkerPosition(position)
      }
      
      if(theme){
          for(let i = 0; i<theme_vars.length; i++)
            updateCSSVariables(theme_vars[i],theme_colors[theme][i]);
      }
      
    
    }, [timestamp, infoWindowShown, theme]);




  // Define icon paths
  const iconPaths = {
    parkades: { icon: currentParkadeIcon, pickedIcon: parkadeIconPicked },
    accessibility: { icon: (vacant ? accessibilityIcon : accessibilityIconOccupied), pickedIcon: accessibilityIconPicked },
    loading_zones: { icon: loadingZoneIcon, pickedIcon: loadingZoneIconPicked },
  };

  // Select icon based on iconImage
  const { icon, pickedIcon } = iconPaths[iconImage] || iconPaths.parkades;


  
  let formattedTimestamp;
  // Usage
  if (selectedOption == "parkades") {
    formattedTimestamp = formatTimestampToUnix(timestamp); 
  }

  // const thresholdDate = new Date('2024-06-06T13:00:00Z');
  // const isTimestampPastThreshold = timestamp >= thresholdDate;
 

  const transformData = (data) => {
    return [
      {name: 'Available', value: data[0]['Capacity'] - data[0]['Vehicles']},
      {name: 'Occupied', value: data[0]['Vehicles']}
    ];
  }

  console.log(`TABLES[content] = ${TABLES[content]}`)


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

              <div className='parkadeWindow' >
                 { 
                  <>
                      <div className='occupancy-chart'>
                        <Diagram
                          mapView={true}
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
                          mapView={true}
                          className='compliance-pie' 
                          
                          type={'COMPLIANCE_PIE'}
                          height={150}
                          width={150}
                          title="Compliance"
                          hasLegend={true}
                          query={`select * from CurrentCompliance where ParkadeName = '${COMPLIANCE_MAP[content]}'`}
                          dataTransformer={transformData}
                        />
                      </div>
                    </>
                  }
              </div>}
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