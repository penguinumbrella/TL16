import React, { useState, useEffect } from 'react';
import './mapView.css';
import WeatherIcon from './weatherIcon/weatherIcon/weatherIcon';
import TimeSlider from './timeSlider/timeSlider';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Map from './map/Map.js';


import axios from 'axios';

const MapView = ({map_key, theme}) => {
  const PORT = 8080;


  const [iconsVisible, setIconsVisible] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedOption, setSelectedOption] = useState('parkades');
  const [activeIndex, setActiveIndex] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date(2024, 5, 0, 12, 0, 0, 0)); // Changed for video

  const [accOccupancyStatus, setAccOccupancyStatus] = useState('');

  const toggleIconsVisibility = () => {
    console.log(selectedOption)
    setIconsVisible(!iconsVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api');
        // console.log(await res.json());
      } catch (err) {
        console.log("Frontend Only");
      }
    };
    fetchData();
  }, []);

  const fetchWeatherData = async (time) => {
    try {
      const response = await axios.get(`/weather?time=${time.toISOString()}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    fetchWeatherData(currentTime);
  }, [currentTime]);

  const handleOptionChange = (event) => {
    if(event.target.value === 'accessibility'){
      fetch(`/api/elevenX`)
      .then(response => response.json())
      .then(data => {
        setSelectedOption(event.target.value);
        setActiveIndex(''); // Reset the active index
        setAccOccupancyStatus(data);
      })
      .catch(error => {
        console.error('Error in api/elevenX:', error);
      });
      
    } else{
      setSelectedOption(event.target.value);
      setActiveIndex(''); // Reset the active index

    }
  };

  const handleTimeChange = (newTime) => {
    setCurrentTime(newTime);
  };
  
  const defaultCenter = { lat: 49.262141, lng: -123.247360 };
  const zoom = 15;

  return (
    <div className='mapView'>
      <div className='mapViewContent'>
        {/* Content of MapView */}
        {iconsVisible && weatherData && (
          <>
            <WeatherIcon
              currTime={weatherData.timeOfDay}
              temperature={weatherData.temp}
              condition={weatherData.weather_main}
              description={weatherData.weather_desc}
            />
            <TimeSlider onTimeChange={handleTimeChange} />
            <div class="currentTimesTampBox"> {currentTime.toLocaleString()} </div>
          </>
        )}

        <button className="eyeButton" onClick={toggleIconsVisibility}>
          {iconsVisible ? <HiOutlineEye /> : <HiOutlineEyeOff />} {/* Use eye icons */}
        </button>

        {iconsVisible && (
         <div className="form-container">
         <form className="map-form">
           <div className="form-group">
             <input
               type="radio"
               id="parkades"
               name="options"
               value="parkades"
               checked={"parkades" === selectedOption} 
               onChange={handleOptionChange}
             />
             <label htmlFor="parkades" style={{ color: 'red' }}>Parkades</label>
           </div>
           <div className="form-group">
             <input
               type="radio"
               id="loading_zones"
               name="options"
               value="loading_zones"
               checked={"loading_zones" === selectedOption}
               onChange={handleOptionChange}
             />
             <label htmlFor="loading_zones">Loading Zones</label>
           </div>
           <div className="form-group">
             <input
               type="radio"
               id="accessibility"
               name="options"
               value="accessibility"
               checked={"accessibility" === selectedOption}
               onChange={handleOptionChange}
             />
             <label htmlFor="accessibility">Accessibility</label>
           </div>
         </form>
         <div className="labels">
           <div className="label-item">Parking</div>
           <div className="label-item">Loading Zones</div>
           <div className="label-item">Accessibility Stalls</div>
         </div>
       </div>
        
        )}

        <Map selectedOption={selectedOption} setActiveIndex={setActiveIndex} zoom={zoom} center={defaultCenter} timestamp={currentTime} accOccupancyStatus={accOccupancyStatus}
        map_key = {map_key} theme={theme}/>
      </div>
      
    </div>
  );
};

export default MapView;
