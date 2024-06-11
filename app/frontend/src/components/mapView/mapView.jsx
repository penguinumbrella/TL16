import React, { useState, useEffect } from 'react';
import './mapView.css';
import WeatherIcon from './weatherIcon/weatherIcon/weatherIcon';
import TimeSlider from './timeSlider/timeSlider';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Map from './map/Map.js';

import parkadeIcon from "./../../assets/parkadeIcon.png"
import parkadeIconPicked from './../../assets/parkadeIconPicked.png'
import accessibilityIcon from './../../assets/accessibilityIcon.png'
import accessibilityIconPicked from './../../assets/accessibilityIconPicked.png'
import loadingZoneIcon from './../../assets/loadingZoneIcon.png'
import loadingZoneIconPicked from './../../assets/loadingZoneIconPicked.png'

const MapView = () => {
  const PORT = 8080;

  const [iconsVisible, setIconsVisible] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedOption, setSelectedOption] = useState('parkades');
  const [activeIndex, setActiveIndex] = useState('');

  const toggleIconsVisibility = () => {
    setIconsVisible(!iconsVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api');
        console.log(await res.json());
      } catch (err) {
        console.log("Frontend Only");
      }
    };
    fetchData();
  }, []);

  const fetchWeatherData = async (currentTime) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/weather?time=${currentTime.toISOString()}`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    fetchWeatherData(new Date());
  }, []);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setActiveIndex(''); // Reset the active index
  };

  return (
    <div className='mapView'>
      <div className='mapViewContent'>
        {/* Content of MapView */}
        {iconsVisible && weatherData && (
          <>
            <WeatherIcon
              currTime={weatherData.timeOfDay}
              temperature={weatherData.temperature}
              condition={weatherData.condition}
            />
            <TimeSlider onTimeChange={fetchWeatherData} />
          </>
        )}

        <button className="eyeButton" onClick={toggleIconsVisibility}>
          {iconsVisible ? <HiOutlineEye /> : <HiOutlineEyeOff />} {/* Use eye icons */}
        </button>

        {iconsVisible &&
        <form className={`map-form`}>
          <input type="radio" id="parkades" name="options" value="parkades" defaultChecked onChange={handleOptionChange} />
          <label htmlFor="parkades">Parkades</label><br />
          <input type="radio" id="loading_zones" name="options" value="loading_zones" onChange={handleOptionChange} />
          <label htmlFor="loading_zones">Loading Zones</label><br />
          <input type="radio" id="accessibility" name="options" value="accessibility" onChange={handleOptionChange} />
          <label htmlFor="accessibility">Accessibility</label><br />
        </form>
        }

        <Map selectedOption={selectedOption} setActiveIndex={setActiveIndex} />
      </div>
    </div>
  );
};

export default MapView;
