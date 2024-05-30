import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState } from 'react';

import * as imagePaths from './imagePaths.js';

import  parkadeIconImage from "./assets/parking-sign-1-2209719147.png"
import  parkadeIconImagePicked from './assets/parking-sign-1-2209719147_filter.png'
import  accessibilityIconImage from './/assets/accessibility.png'
import  accessibilityIconImagePicked from './assets/accessibility_filter.png'
import loadingZoneIconImage from './assets/loading_zone.png'
import loadingZoneIconImagePicked from './assets/loading_zone_filter.jpg'

const MarkerWithInfoWindow = ({ position, 
                                showInfoWindow,
                                infoWindowShown,
                                content,
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
                    <h3>{content}</h3>
                </InfoWindowF>}
            </MarkerF>)

}

export default MarkerWithInfoWindow