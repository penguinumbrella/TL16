import React, { useState } from 'react';
import './mapView.css';
import WeatherIcon from './weatherIcon/weatherIcon/weatherIcon';
import TimeSlider from './timeSlider/timeSlider';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons from react-icons/fa
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'; // Import eye icons from Chakra UI

const MapView = () => {
  const [iconsVisible, setIconsVisible] = useState(true);

  const toggleIconsVisibility = () => {
    setIconsVisible(!iconsVisible);
  };

  return (
    <div className='mapView'>
      <div className='mapViewContent'>
        {/* Content of MapView */}
        {iconsVisible && (
          <>
            <WeatherIcon 
              currTime="day"
              temperature={25}
              condition="Partly Cloudy"
            />
            <TimeSlider />
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
