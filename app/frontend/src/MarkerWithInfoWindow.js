import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState } from 'react';

import * as imagePaths from './imagePaths.js';
import newimage from "./assets/accessibility.png"

const MarkerWithInfoWindow = ({ position, 
                                showInfoWindow,
                                infoWindowShown,
                                content,
                                exit,
                                iconImage})=>{
  
           

  let markerIcon  = newimage;
  let markerIconPicked = imagePaths.parkadeIconImagePicked;

  if(iconImage === 'parkades') {
    // markerIcon = imagePaths.parkadeIconImage;
    // markerIconPicked = imagePaths.parkadeIconImagePicked;

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
                    <h3>{content}</h3>
                </InfoWindowF>}
            </MarkerF>)

}

export default MarkerWithInfoWindow