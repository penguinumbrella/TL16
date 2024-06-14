import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerClusterer } from '@react-google-maps/api';
import MarkerWithInfoWindow from './MarkerWithInfoWindow/MarkerWithInfoWindow';
import mapMarkers from './coordinates.json';
import initialMarkerData from '../../../markerData.json';
import './map.css'; // Add a CSS file to handle the styling

import mapStyleDark from './mapStyleDark.json'

const Map = ({ selectedOption, setActiveIndex , zoom, center, timestamp}) => { // Accept setActiveIndex as a prop
  const [activeIndex, setActiveIndexState] = useState('');
  const [markerData, setMarkerDataData] = useState(initialMarkerData);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_MAPS_KEY,
    libraries: ['geometry', 'drawing'],
  });

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
        {isLoaded && <GoogleMap mapContainerStyle={{position: 'fixed', top: 0, right: 0, width: '100%', height: '100%' }} options={mapOptions} center={center} zoom={zoom} >
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
                      clusterer={clusterer }
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
                    // mapCenter={mapCenter}
                    // setMapCenter={setMapCenter} // Ensure setMapCenter is passed
                  />)}))
                }






        </GoogleMap>}
      </div>
  );
};

export default Map;
