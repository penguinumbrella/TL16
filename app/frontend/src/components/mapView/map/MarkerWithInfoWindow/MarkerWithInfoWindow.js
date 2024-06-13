import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState } from 'react';
import Diagram from '../../../diagrams/Diagram'
import './MarkerWithInfoWindow.css'



// This does not work consistantly 
// import * as imagePaths from './imagePaths.js';

// Right now this works consistantly 

import parkadeIcon from './../../../../assets/parkadeIcon.png'
import parkadeIconPicked from './../../../../assets/parkadeIconPicked.png'
import accessibilityIcon from './../../../../assets/accessibilityIcon.png'
import accessibilityIconPicked from './../../../../assets/accessibilityIconPicked.png'
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
  position,
  showInfoWindow,
  infoWindowShown,
  content,
  exit,
  iconImage,
  data,
  // mapCenter, // New prop to pass the map's center
  // setMapCenter, // Function to update the map's center
  clusterer
}) => {
  // Define icon paths
  const iconPaths = {
    parkades: { icon: parkadeIcon, pickedIcon: parkadeIconPicked },
    accessibility: { icon: accessibilityIcon, pickedIcon: accessibilityIconPicked },
    loading_zones: { icon: loadingZoneIcon, pickedIcon: loadingZoneIconPicked },
  };

  // Select icon based on iconImage
  const { icon, pickedIcon } = iconPaths[iconImage] || iconPaths.parkades;

  // Define icon sizes
  const smallIconSize = new window.google.maps.Size(20, 20);
  const largeIconSize = new window.google.maps.Size(25, 25);

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
          onCloseClick={() => {
            exit();
            // Ensure mapCenter remains unchanged when the InfoWindow is closed
            // setMapCenter(mapCenter);
          }}
          className="info-window"
        >
          <div className="info-window-contents">
            <h2 style={{ paddingBottom: '20px' }}>{content}</h2>
            <div className="info-window-diagrams">
              <Diagram type={'PIE'} height={200} width={200} title="Occupancy" />
              <Diagram type={'LINE'} height={200} width={200} title="Violations" />
              <Diagram type={'BAR'} height={200} width={400} title='Violations'/>

            </div>
          </div>
        </InfoWindowF>
      )}
    </MarkerF>
  );
};

export default MarkerWithInfoWindow;