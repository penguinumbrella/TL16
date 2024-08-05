import React, {useState, useEffect, useRef } from 'react';
import DateTimePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ReactComponent as PopupWindow } from '../../../icons/slider-popup.svg';
import './timeSlider.css';

import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';



const TimeSlider = ({ onSliderRelease, 
  currentTime, setCurrentTime, 
  sliderValue, setSliderValue,
  startDateLeft, setStartDateLeft,
  startDateRight, setStartDateRight, }) => {


  const [boundedPosition, setBoundedPosition] = useState(5);


  useEffect(()=>{
    if(currentTime)
      console.log('currentTime ' + currentTime);
  },[currentTime]);
  

  const actualTime = new Date(2024, 5, 0, 12, 0, 0, 0);
  const sliderRef = useRef(null);

  const handleSliderChange = (event) => {
    const value = parseFloat(event.target.value);
    const newTime = new Date(startDateLeft);

    newTime.setHours(newTime.getHours() + value); // Adjust hours based on slider value
    setCurrentTime(newTime);
    setSliderValue(value);

  };

  const handleSliderRelease = (event) => {
    const value = parseFloat(event.target.value);
    const newTime = new Date(startDateLeft);

    newTime.setHours(newTime.getHours() + value); // Adjust hours based on slider value
    setCurrentTime(newTime);
    setSliderValue(value);

    onSliderRelease(newTime);
  };

  const getRange = (ev) => {
    setSliderValue(ev.target.value);
  };

  const handleCombinedChange = (event) => {
    handleSliderChange(event);
    getRange(event);
  };

  const calculateGradient = () => {
    const progress = (sliderValue / maxSliderValue) * 100; // Calculate progress based on slider value and max value

    // Calculate the color stops for the gradient
    const colorStop1 = `#37A7E5`;
    const colorStop2 = `#BF46D2 ${progress}%`;
    const colorStop3 = `#323551 ${progress}%`;

    return `linear-gradient(to right, ${colorStop1}, ${colorStop2}, ${colorStop3})`;
  };

  const handleThumbHover = () => {
    document.querySelector('label').classList.add('active');
  };

  const handleThumbLeave = () => {

    document.querySelector('label').classList.remove('active');
  };

  // useEffect(() => {
  //   const rangeLinePadding = 16;
  //   const calcStep = (sliderRef.current.offsetWidth - rangeLinePadding) / sliderRef.current.max;
  // }, []);



  // Calculate the difference in hours between startDateLeft and startDateRight
  const hoursDifference = (startDateRight - startDateLeft) / (1000 * 60 * 60);
  const maxSliderValue = hoursDifference;
  const sliderStep = 1; // Use 1 day step if difference is more than 2 days, otherwise 1 hour

  useEffect(()=>{
    const sliderWidth = sliderRef.current.offsetWidth;
    const bubblePosition = (sliderValue / maxSliderValue) * sliderWidth; // Calculate the bubble position

    // Ensure the bubble stays within the slider bounds
    setBoundedPosition(Math.min(Math.max(0, bubblePosition), sliderWidth))
  },[currentTime, sliderRef.current]);



  const calculateMarkerPosition = () => {


    if (actualTime >= startDateLeft && actualTime <= startDateRight && sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const actualTimeDifference = (actualTime - startDateLeft) / (1000 * 60 * 60);
      const markerPosition = (actualTimeDifference / hoursDifference) * sliderWidth;

      return {
        left: `${(markerPosition / sliderWidth) * 99.4}%`,
        display: 'block'
      };
    }
    return {
      display: 'none'
    };
  };

  return (
    <div className='timeSlider'>
      <div className='dateBoxContainer'>
        <div className='dateBoxLeft'>
          <DateTimePicker
            selected={startDateLeft} // Use selected prop instead of value
            onChange={(date) => {
              if (date < startDateRight) {
                setStartDateLeft(date);
              } else {
                alert(`Must select a time lesser than ${startDateRight}`)
              }
            }}
            minDate={new Date('01-01-2018')}
            maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())}
            showTimeSelect // Enable time selection
            timeIntervals={60} // Set time intervals to 60 minutes (1 hour)
            timeFormat="HH:mm" // Use military time format
            dateFormat="MM/dd/yyyy HH:mm" // Include both date and time
          />
        </div>
        <div className='dateBoxRight'>
          <DateTimePicker
            selected={startDateRight} // Use selected prop instead of value
            onChange={(date) => {
              if (date > startDateLeft) {
                setStartDateRight(date);
              } else {
                alert(`Must select a time greater than ${startDateLeft}`)
              }
            }}
            minDate={new Date('01-01-2018')}
            maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())}
            showTimeSelect
            timeIntervals={60} // Set time intervals to 60 minutes (1 hour)
            timeFormat="HH:mm" // Use military time format
            dateFormat="MM/dd/yyyy HH:mm" // Include both date and time
          />
        </div>
      </div>

      <div className='sliderContainer'>

        <div className='sliderOnly'>
          <input
            type="range"
            id="range"
            min='0'
            max={hoursDifference}
            step={sliderStep}
            value={sliderValue}
            onChange={handleCombinedChange}
            onMouseEnter={handleThumbHover}
            onMouseLeave={handleThumbLeave}
            onTouchStart={handleThumbHover}
            onTouchEnd={handleThumbLeave}
            onMouseUp={handleSliderRelease}
            className='customSlider'
            style={{ background: calculateGradient() }}
            ref={sliderRef}
          />
          <label
            htmlFor="range"
            className="slider-label"
            style={{
              transform: `translateX(${boundedPosition}px)`
            }}
          >
            <span>{currentTime.toLocaleTimeString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            <div className='windowContainer'>
              <PopupWindow />
            </div>
          </label>
          <div
            className='marker'
            style={{
              position: 'absolute',
              top: '0px',
              height: '20px',
              width: '2px',
              background: 'white',
              border: '1px solid #000',
              ...calculateMarkerPosition(),
            }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default TimeSlider;