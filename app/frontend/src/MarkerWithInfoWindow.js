import React from 'react';
import {MarkerF , InfoWindowF} from '@react-google-maps/api';
import { useState } from 'react';
import Diagram from './components/diagrams/Diagram'
import './MarkerWithInfoWindow.css'



// This does not work consistantly 
// import * as imagePaths from './imagePaths.js';

// Right now this works consistantly 
import parkadeIcon from "./assets/parkadeIcon.png"
import parkadeIconPicked from './assets/parkadeIconPicked.png'
import accessibilityIcon from './assets/accessibilityIcon.png'
import accessibilityIconPicked from './assets/accessibilityIconPicked.png'
import loadingZoneIcon from './assets/loadingZoneIcon.png'
import loadingZoneIconPicked from './assets/loadingZoneIconPicked.png'




/*
position: object with lat and lng values e.g. { "lat": 49.26927494156756, "lng": -123.25087736976562 }

showInfoWindow: function that sets the state of the infoWindow to the marker 

infoWindowShown: boolean, true if this marker's infoWindow is shown false otherwise 

content: the name of the marker 

exit: function that resets the state to '' (meaning no infoWindow is currently shown or no marker is currently selected)

iconImage: string for the marker type, either "parkades", "accessibilty" or "loading_zones"

data: data to be shown right now it's just a number or a string
*/

const MarkerWithInfoWindow = ({ position, 
                                showInfoWindow,
                                infoWindowShown,
                                content,
                                exit,
                                iconImage,
                                data
                                })=>{
  
  // let markerIcon  = imagePaths.parkadeIcon;
  // let markerIconPicked = imagePaths.parkadeIconPicked;

  // if(iconImage === 'parkades') {
  //   markerIcon = imagePaths.parkadeIcon;
  //   markerIconPicked = imagePaths.parkadeIconPicked;

  // } else if(iconImage === 'accessibilty'){
  //   markerIcon = imagePaths.accessibilityIcon;
  //   markerIconPicked = imagePaths.accessibilityIconPicked;

  // } else if (iconImage === 'loading_zones'){
  //   markerIcon = imagePaths.loadingZoneIcon;
  //   markerIconPicked = imagePaths.loadingZoneIconPicked;
  // }    
  

  // Default icon is parkade because that's what the default option is 
  let markerIcon  = parkadeIcon; 
  let markerIconPicked = parkadeIconPicked;

  if(iconImage === 'parkades') {
    markerIcon = parkadeIcon;
    markerIconPicked = parkadeIconPicked;

  } else if(iconImage === 'accessibilty'){
    markerIcon = accessibilityIcon;
    markerIconPicked = accessibilityIconPicked;

  } else if (iconImage === 'loading_zones'){
    markerIcon = loadingZoneIcon;
    markerIconPicked = loadingZoneIconPicked;
  }   

  let small_icon_size = new window.google.maps.Size(20, 20) ;
  let large_icon_size = new window.google.maps.Size(25, 25);

  return (<MarkerF
                icon = {{
                  // if picked change the icon size and color
                  url: infoWindowShown ? markerIconPicked : markerIcon,
                  scaledSize: infoWindowShown ?  large_icon_size : small_icon_size
                }}

                // animation={infoWindowShown ? window.google.maps.Animation.BOUNCE : null}
                position={position}
                onMouseOver={showInfoWindow}>
                {infoWindowShown &&<InfoWindowF onCloseClick={exit} className='info-window'>
                  <div className='info-window-contents'>
                      <h2 style={{paddingBottom: '20px'}}>{content}</h2>
                      <div className='info-window-diagrams'>
                        <Diagram type={'PIE'} height={200} width={200} title='Occupancy'></Diagram>
                        <Diagram type={'LINE'} height={200} width={200} title='Violations'></Diagram>
                      </div>
                  </div>    
                </InfoWindowF>}
            </MarkerF>)
}

export default MarkerWithInfoWindow