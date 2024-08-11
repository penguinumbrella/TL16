import React, { useState, useEffect } from 'react';
import './mapView.css';
import WeatherIcon from './weatherIcon/weatherIcon/weatherIcon';
import TimeSlider from './timeSlider/timeSlider';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Map from './map/Map.js';
import axios from 'axios';
import { getAuthToken } from '../../getAuthToken.js';

const MapView = ({ map_key , activeView, theme}) => {
  const defaultCenter = { lat: 49.262141, lng: -123.247360 };
  const zoom = 15;

  const [iconsVisible, setIconsVisible] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

  const [activeIndex, setActiveIndex] = useState('');

  const [accOccupancyStatus, setAccOccupancyStatus] = useState('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [selectedOption, setSelectedOption] = useState('parkades');


  //----------------------------------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------------------------------
  // Timeslider States 

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const actualCurrentDate = new Date();
  actualCurrentDate.setMinutes(0, 0, 0);

  // Calculate the hour difference rounded down from the time at 12:00 AM
  // const startingHourDifference = Math.floor((actualCurrentDate - currentDate) / (1000 * 60 * 60));
  // console.log(`Hours: ${startingHourDifference}`);

  const prevDay = new Date();
  prevDay.setDate(prevDay.getDate() - 1); // Get the previous day
  prevDay.setMinutes(0, 0, 0); 

  const roundedDate = new Date();
  roundedDate.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0


  // currentTime is saved in local storage as an array of strings 
  let defaultCurrentTime =  localStorage.getItem('currentTime') || roundedDate; 
  if(typeof(defaultCurrentTime) !== typeof(new Date())){
    defaultCurrentTime = new Date(defaultCurrentTime)
  }

  let defaultStartDateLeft = localStorage.getItem('startDateLeft') || prevDay;
  let defaultStartDateRight = localStorage.getItem('startDateRight') || actualCurrentDate;

  // sliderValue is saved in local storage as string
  const defaultSliderValue = Number(localStorage.getItem('sliderValue')) || Math.floor((defaultStartDateRight - defaultStartDateLeft)/(1000*60*60));

  if(typeof(defaultStartDateLeft) !== typeof(new Date())){
    defaultStartDateLeft = new Date(defaultStartDateLeft)
    // console.log(defaultStartDateLeft);
    // console.log(typeof(new Date(defaultStartDateLeft)));
  }

  if(typeof(defaultStartDateRight) !== typeof(new Date())){
    defaultStartDateRight = new Date(defaultStartDateRight)
    // console.log(defaultStartDateRight);
    // console.log(typeof(new Date(defaultStartDateRight)));
  }

  const sliderEnd = new Date();
  sliderEnd.setMinutes(0, 0, 0);

  let defaultSliderEndTime = localStorage.getItem('sliderEndTime') || sliderEnd;

  if(typeof(defaultSliderEndTime) !== typeof(new Date())){
    defaultSliderEndTime = new Date(defaultSliderEndTime)
  }

  const [currentTime, setCurrentTime] = useState(defaultCurrentTime);
  const [sliderValue, setSliderValue] = useState(defaultSliderValue);
  const [startDateLeft, setStartDateLeft] = useState(defaultStartDateLeft);
  const [startDateRight, setStartDateRight] = useState(defaultStartDateRight);

  const [sliderEndTime, setSliderEndTime] = useState(defaultSliderEndTime); // new Date()
  // console.log(`currentTime = ${currentTime}`);

  //----------------------------------------------------------------------------------------------------------
  
  const handle_setCurrentTime = (newTime)=>{
    setCurrentTime(newTime);
    localStorage.setItem('currentTime', newTime);
  }

  const handle_setSliderValue = (value)=>{
    setSliderValue(value);
    localStorage.setItem('sliderValue', value);
  }

  const handle_setStartDateLeft = (date)=>{
    setStartDateLeft(date);
    localStorage.setItem('startDateLeft', date);
  }

  const handle_setStartDateRight = (date)=>{
    setStartDateRight(date);
    localStorage.setItem('startDateRight', date);
  }
  
  //----------------------------------------------------------------------------------------------------------


  const toggleIconsVisibility = () => {
    // console.log(selectedOption)
    setIconsVisible(!iconsVisible);
  };

  const fetchWeatherData = async (time) => {
    try {
      const response = await axios.get(`/weather?time=${time.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    console.log("CHANGED ACTIVEVIEW")
    if (activeView === 'map') {
      console.log("ACTIVE VIEW IS MAP")
      // Function to fetch weather data
      const newDate = new Date();

      // Fetch weather data when component mounts
      fetchWeatherData(newDate);
    }
  }, [activeView]);

  useEffect(() => {
    // Fetch weather data whenever the sliderEndTime changes
    fetchWeatherData(sliderEndTime);
  }, [sliderEndTime]); // Dependency on sliderEndTime
  
  const handleOptionChange = (event) => {
    if (event.target.value === 'accessibility') {
      fetch(`/api/elevenX`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      .then(response => response.json())
      .then(data => {
        setSelectedOption(event.target.value);
        setActiveIndex(''); // Reset the active index
        setAccOccupancyStatus(data);

        localStorage.setItem('accOccupancyStatus', data);
      })
      .catch(error => {
        console.error('Error in api/elevenX:', error);
      });
      
    } else{
      setSelectedOption(event.target.value);
      setActiveIndex(''); // Reset the active index
    }
  };


  const handleEndTimeChange = (newTime) => {
    setSliderEndTime(newTime);
    localStorage.setItem('sliderEndTime', newTime);
  };

  



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

            <TimeSlider onSliderRelease={handleEndTimeChange}  
            currentTime={currentTime}   handle_setCurrentTime = {handle_setCurrentTime} 
            sliderValue={sliderValue}   handle_setSliderValue={handle_setSliderValue}
            startDateLeft={startDateLeft} handle_setStartDateLeft={handle_setStartDateLeft}
            startDateRight={startDateRight} handle_setStartDateRight={handle_setStartDateRight}/>


            <div class="currentTimesTampBox"> {sliderEndTime.toLocaleString()} </div>
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

        <Map
          selectedOption={selectedOption}
          setActiveIndex={setActiveIndex}
          zoom={zoom}
          center={mapCenter}
          timestamp={sliderEndTime}
          accOccupancyStatus={accOccupancyStatus}
          map_key={map_key}
          theme ={theme}
          setMapCenter = {setMapCenter}
        />
      </div>
      
    </div>
  );
};

export default MapView;
