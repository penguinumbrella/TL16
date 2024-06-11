import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import MarkerWithInfoWindow from './MarkerWithInfoWindow/MarkerWithInfoWindow';
import mapMarkers from './coordinates.json';
import initialMarkerData from '../../../markerData.json';
import './map.css'; // Add a CSS file to handle the styling

import mapStyleDark from './mapStyleDark.json'

const Map = ({ selectedOption, setActiveIndex }) => { // Accept setActiveIndex as a prop
  const [activeIndex, setActiveIndexState] = useState('');
  const [markerData, setMarkerDataData] = useState(initialMarkerData);

  const defaultCenter = { lat: 49.262141, lng: -123.247360 };

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const zoom = 15;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_MAPS_KEY,
    libraries: ['geometry', 'drawing'],
  });

  const mapOptions = {
    center: mapCenter,
    zoom: zoom,
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

  return (
      <div className="map-container">
        {isLoaded && <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} options={mapOptions} center={mapCenter} zoom={zoom}>
          {mapMarkers[selectedOption].map(item => (
            <MarkerWithInfoWindow
              key={item.name}
              position={item.location}
              content={item.name}
              infoWindowShown={activeIndex === item.name}
              showInfoWindow={() => setActiveIndexState(item.name)}
              exit={() => setActiveIndexState('')}
              iconImage={selectedOption}
              data={getMarkerData(selectedOption, item.name)}
              mapCenter={mapCenter}
              setMapCenter={setMapCenter} // Ensure setMapCenter is passed
            />
          ))}
        </GoogleMap>}
      </div>
  );
};

export default Map;
