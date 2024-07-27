import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerClusterer } from '@react-google-maps/api';
import MarkerWithInfoWindow from './MarkerWithInfoWindow/MarkerWithInfoWindow';
import mapMarkers from './coordinates.json';
import initialMarkerData from '../../../markerData.json';
import './map.css'; // Add a CSS file to handle the styling

import checkIsOutOfBounds from './outOfBounds.js'
import mapStyleDark from './mapStyleDark.json'
import getMapCenterPixels from './getMapCenterPixels.js'



const Map = ({ selectedOption, setActiveIndex , zoom, center, timestamp, accOccupancyStatus, map_key}) => { // Accept setActiveIndex as a prop
  const [activeIndex, setActiveIndexState] = useState('');
  const [markerData, setMarkerDataData] = useState(initialMarkerData);
  const [markerPosition, setMarkerPosition] =  useState(center);
  const [map, setMap] = useState(null);

  // Callback to handle map center changes
  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);

    // // Add a listener to log the center when it changes
    // mapInstance.addListener('center_changed', () => {
    //   const center = mapInstance.getCenter();
    //   // console.log('New center:', center.toJSON()); // Convert to JSON for better readability
    // });
  }, []);



  if(activeIndex){
    setTimeout(() =>{
      // map.panTo(markerPosition)
      const projection = map.getProjection();
      // const bounds = map.getBounds();
      // console.log('projection and bounds:')
      // console.log(projection)
      // console.log(bounds)
      // const newPosition = checkIsOutOfBounds(map.getCenter().toJSON(), projection);
      const newPosition = checkIsOutOfBounds(map.getCenter().toJSON(), projection, map.getZoom());
      
      map.panTo(newPosition)
         
    }, 500);
    
  }

  var { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: map_key,
    libraries: ['geometry', 'drawing'],
  });

  // defaultCenter = { lat: 49.262141, lng: -123.247360 };
  // if(isLoaded){
  //   // console.log(`isLoaded : ${isLoaded}`)
  //   // console.log(center)

  // }
    
  

  
  const mapOptions = {
    // center: mapCenter,
    // zoom: zoom,
    draggable: true,
    zoomControl: false,
    disableDoubleClickZoom: true,
    disableDefaultUI: true,
    scrollwheel: true,
    streetViewControl: false,
    styles: mapStyleDark // doesnt seem to work with free api key
  };

  // Get the accessibilty stalls information
  let accLookup = {};
  if(selectedOption === 'accessibility'){
    accOccupancyStatus.forEach(obj => {
      accLookup[obj.stall_name] = {
        status : obj.status,
        payload_timestamp : obj.payload_timestamp
      }
    });
  }

  const getMarkerData = (option, name) => {
    const indexedObject = markerData[option].reduce((acc, obj) => {
      acc[obj.name] = obj;
      return acc;
    }, {});
    return indexedObject[name].data;
  };

  useEffect(() => {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => {
        setMarkerDataData(JSON.parse(data));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    setActiveIndexState(''); // Reset local state when selectedOption changes
    setActiveIndex(''); // Reset parent state when selectedOption changes
  }, [selectedOption, setActiveIndex]);

  const TABLES = {
    'Fraser Parkade': 'FraserParkade',
    'North Parkade': 'NorthParkade',
    'West Parkade': 'WestParkade',
    'Health Sciences Parkade': 'HealthSciencesParkade',
    'Thunderbird Parkade': 'ThunderbirdParkade',
    'University West Blvd': 'UnivWstBlvdParkade',
    'Rose Garden Parkade': 'RoseGardenParkade'
  }
  return (
      <div className="map-container">
        {isLoaded && <GoogleMap mapContainerStyle={{position: 'fixed', top: 0, right: 0, width: '100%', height: '100%' }} options={mapOptions} center={center} zoom={zoom} onLoad={onMapLoad}>
        {((selectedOption === 'accessibility'  )  && <MarkerClusterer
                  gridSize={50}
                  maxZoom={17}
                  averageCenter={true}
                  // minClusterSize={5}
                  zoomOnClick={true}          
                  >
                  {
                  (clusterer) => 
                  // Loop through every parkade / accessibility spot / loading zone (depending on event.target.value) 
                  // and render markers for them
                  
                  mapMarkers[selectedOption].map(item => {
                    return (<MarkerWithInfoWindow
                      selectedOption = {selectedOption}
                      key={item.name}
                      position={item.location}
                      content={item.name}
                      infoWindowShown={activeIndex === item.name}
                      showInfoWindow={() => setActiveIndexState(item.name)}
                      exit={() => setActiveIndexState('')}
                      iconImage={selectedOption}
                      data={getMarkerData(selectedOption, item.name)}
                      // mapCenter={mapCenter}
                      // setMapCenter={setMapCenter} // Ensure setMapCenter is passed
                      clusterer={clusterer}
                      setMarkerPosition ={setMarkerPosition}

                      // Right now there are stalls missing so they are undefined
                      // for these stalls they are set to occupied and right now a string that says [stall data is missing]
                      // although we can put a random place holder timestamp 
                      vacant={(accLookup[item.name] == undefined) ? false : accLookup[item.name].status === "vacant" }
                      payload_timestamp = {(accLookup[item.name] == undefined) ? " [stall data is missing]" : accLookup[item.name].payload_timestamp}

                    />)})
                } 
                </MarkerClusterer> )
                || 
                // These 2 options don't need marker clusters 
                (
                mapMarkers[selectedOption].map(item => {
                    return ((selectedOption ==='parkades' || selectedOption ==='loading_zones' ||selectedOption ==='_empty_' ) 
                    &&  <MarkerWithInfoWindow
                    selectedOption = {selectedOption}
                    key={item.name}
                    position={item.location}
                    content={item.name}
                    infoWindowShown={activeIndex === item.name}
                    showInfoWindow={() => setActiveIndexState(item.name)}
                    exit={() => setActiveIndexState('')}
                    iconImage={selectedOption}
                    data={getMarkerData(selectedOption, item.name)}
                    timestamp = {timestamp}
                    setMarkerPosition ={setMarkerPosition}
                    // mapCenter={mapCenter}
                    // setMapCenter={setMapCenter} // Ensure setMapCenter is passed
                  />)}))
                }
        </GoogleMap>}
      </div>
  );
};

export default Map;


//gm-style-iw-chr