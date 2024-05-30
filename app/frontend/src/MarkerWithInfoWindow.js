import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState } from 'react';

import * as imagePaths from './imagePaths.js';

const MarkerWithInfoWindow = ({ position, 
                                showInfoWindow,
                                infoWindowShown,
                                key,
                                exit,
                                iconImage})=>{
  
           

  let markerIcon  = imagePaths.parkadeIconImage;
  let markerIconPicked = imagePaths.parkadeIconImagePicked;

  if(iconImage === 'parkades') {
    markerIcon = imagePaths.parkadeIconImage;
    markerIconPicked = imagePaths.parkadeIconImagePicked;

  } else if(iconImage === 'accessibilty'){
    markerIcon = imagePaths.accessibilityIconImage;
    markerIconPicked = imagePaths.accessibilityIconImagePicked;

  } else if (iconImage === 'loading_zones'){
    markerIcon = imagePaths.loadingZoneIconImage;
    markerIconPicked = imagePaths.loadingZoneIconImagePicked;
  }    



  return (<MarkerF
                icon = {{
                  url: infoWindowShown ? markerIconPicked : markerIcon,
                  scaledSize: infoWindowShown ? new window.google.maps.Size(25, 25) : new window.google.maps.Size(20, 20) 
                }}

                // animation={infoWindowShown ? window.google.maps.Animation.BOUNCE : null}
                position={position}
                onMouseOver={showInfoWindow}>
                {infoWindowShown &&<InfoWindowF onCloseClick={exit} >
                    <h3>{key}</h3>
                </InfoWindowF>}
            </MarkerF>)

}

export default MarkerWithInfoWindow