import React, { useState, useEffect } from 'react';
import './mapView.css';
import WeatherIcon from './weatherIcon/weatherIcon/weatherIcon';
import TimeSlider from './timeSlider/timeSlider';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons from react-icons/fa
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'; // Import eye icons from Chakra UI

const MapView = () => {

  const PORT = 8080;

  const [iconsVisible, setIconsVisible] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

  const toggleIconsVisibility = () => {
    setIconsVisible(!iconsVisible);
  };

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
    // Fetch initial weather data
    fetchWeatherData(new Date());
  }, []);

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
      </div>
    </div>
  );
}

export default MapView;
