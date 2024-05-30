import React from 'react';
import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript} from '@react-google-maps/api';

import MarkerWithInfoWindow from './MarkerWithInfoWindow';
import mapMarkers from './coordinates.json';


const Map = ({ center, zoom }) => {

  const [activeIndex, setActiveIndex] = useState('');

  const mapOptions = {
    center: center,
    zoom: zoom,
    draggable: false,
    zoomControl: false,
    disableDoubleClickZoom: true,
    disableDefaultUI: true,
    scrollwheel: false,
    streetViewControl: false,
  };



const [selectedOption, setSelectedOption] = useState('parkades');


  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };


  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_MAPS_KEY}>
      <div>
        <form>
          <input type="radio" id="parkades" name="options" value="parkades"  defaultChecked onChange={handleOptionChange} />
          <label for="parkades">Parkades</label><br/>

          <input type="radio" id="loading_zones" name="options" value="loading_zones" onChange={handleOptionChange}/>
          <label for="loading_zones">Loading Zones</label><br/>

          <input type="radio" id="accessibility" name="options" value="accessibilty"  onChange={handleOptionChange}/>
          <label for="option3">Accessibility</label><br/>
        </form>
      </div>

    <div style={{ position: 'fixed', top: 0, right: 0, width: '35%', height: '100%' }}>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} options={mapOptions} center={center} zoom={zoom}>


        {
          mapMarkers[selectedOption].map(item => {
            return (<MarkerWithInfoWindow position={item.location} 
                                          content={item.name}  
                                          infoWindowShown={activeIndex === item.name}  
                                          showInfoWindow={() => setActiveIndex(item.name)} 
                                          exit={() => setActiveIndex('')} iconImage={selectedOption}  />)
          })
    
        }
           
      </GoogleMap>

    </div>
  </LoadScript>
  );
};



export default Map;




