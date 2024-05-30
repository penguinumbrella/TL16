import React from 'react';
import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript} from '@react-google-maps/api';

import MarkerWithInfoWindow from './MarkerWithInfoWindow';



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

  const mapMarkers = {
        "parkades":   [
                          {
                              "name": "North",
                              "location":{ "lat": 49.26927494156756, "lng": -123.25087736976562 }
                          },
                          {
                              "name": "West",
                              "location":{ "lat": 49.2624487, "lng": -123.2564363 }
                          },
                          {
                              "name": "Health Sciences",
                              "location":{ "lat": 49.2630144, "lng": -123.2475049 }
                          },
                          {
                              "name": "Thunderbird",
                              "location":{ "lat": 49.2615983, "lng": -123.2430367 }
                          },
                          {
                              "name": "Fraser River",
                              "location":{ "lat": 49.2660428, "lng": -123.2606111 }
                          },
                          {
                              "name": "Rose Garden",
                              "location":{ "lat": 49.2695067, "lng": -123.2591884 }
                          }
                      ],

        "accessibilty":[{
          "name": "Rose Garden Accessibilty",
          "location":{ "lat": 49.2695067, "lng": -123.2591884 }
        }],


        "loading_zones":[{
          "name": "Fraser River Loading Zone",
          "location":{  "lat": 49.2660428, "lng": -123.2606111}
        }],




}


const [jsonData, setJsonData] = useState(null);
const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./coordinates.json'); // Path to your local JSON file
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setJsonData(data);
        console.log("mapMarkers")

      } catch (error) {
        setError(error.message);
        console.log(error.message)
      }
    };

    fetchData();
  }, []);


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




