import React from 'react';
import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript} from '@react-google-maps/api';

import MarkerWithInfoWindow from './MarkerWithInfoWindow';
import mapMarkers from './coordinates.json';
import initialMarkerData from './markerData.json';



const Map = ({ center, zoom }) => {

  // hared state between map markers for the infoWindow, only one infoWindow can 
  // be active at a time and the value of the state is the name of the marker 
  const [activeIndex, setActiveIndex] = useState('');

  // the initial value of markerData is that of the current data in the file
  const [markerData, setMarkerDataData] = useState(initialMarkerData);

  const mapOptions = {
    center: center,
    zoom: zoom,
    draggable: true,
    zoomControl: false,
    disableDoubleClickZoom: true,
    disableDefaultUI: true,
    scrollwheel: true,
    streetViewControl: false,
  };


// Default view is parkades
const [selectedOption, setSelectedOption] = useState('parkades');


  // Event handler for picking the category 
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);

    // Reset the state for the infoWindow
    setActiveIndex("");
  };


  // Get the data from the object containing all current marker data
  const getMarkerData = (option, name) =>{
    
    const indexedObject = markerData[option].reduce((acc, obj) => {
      acc[obj.name] = obj;
      return acc;}, {});
      return indexedObject[name].data;
  }

  
  // If the file frontend/src/markerData.json is updated and the page is refreshed 
  // this hook will fetch the new file  and update markerData
  // 
  useEffect(() => {
        fetch('/api/data')
            .then(response => response.json())
            .then(data => {
              setMarkerDataData(JSON.parse(data)); 
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);



  return (
    // Select the category for the map. Default option is parkade
    <LoadScript googleMapsApiKey={process.env.REACT_APP_MAPS_KEY}>
      <div>
        <form>
          <input type="radio" id="parkades" name="options" value="parkades"  defaultChecked onChange={handleOptionChange} />
          <label >Parkades</label><br/>

          <input type="radio" id="loading_zones" name="options" value="loading_zones" onChange={handleOptionChange}/>
          <label >Loading Zones</label><br/>

          <input type="radio" id="accessibility" name="options" value="accessibilty"  onChange={handleOptionChange}/>
          <label >Accessibility</label><br/>
        </form>
      </div>

    <div style={{ position: 'fixed', top: 0, right: 0, width: '35%', height: '100%' }}>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} options={mapOptions} center={center} zoom={zoom}>
        {
          // Loop through every parkade / accessibility spot / loading zone (depending on event.target.value) 
          // and render markers for them
          mapMarkers[selectedOption].map(item => {
            return (<MarkerWithInfoWindow position={item.location} 
                                          content={item.name}  
                                          infoWindowShown={activeIndex === item.name}  
                                          showInfoWindow={() => setActiveIndex(item.name)} 
                                          exit={() => setActiveIndex('')} iconImage={selectedOption} 

                                          // 5 is just just a placeholder 
                                          data={getMarkerData(selectedOption, item.name)}
                                          />)
          })
    
        }
           
      </GoogleMap>

    </div>
  </LoadScript>
  );
};



export default Map;




