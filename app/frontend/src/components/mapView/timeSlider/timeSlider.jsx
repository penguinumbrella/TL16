import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ReactComponent as ClockHistoryIcon } from '../../../icons/clock-history.svg';
import { ReactComponent as PopupWindow } from '../../../icons/slider-popup.svg';
import './timeSlider.css';

const TimeSlider = () => {

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set time to 12:00 AM

  const actualCurrentDate = new Date();

  // Calculate the hour difference rounded down from the time at 12:00 AM
  const startingHourDifference = Math.floor((actualCurrentDate - currentDate) / (1000 * 60 * 60));
    
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1); // Get the next day
  nextDay.setHours(0, 0, 0, 0); // Set time to 12:00 AM
    
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sliderValue, setSliderValue] = useState(startingHourDifference);
  const [showTime, setShowTime] = useState(false);
  const [thumbPosition, setThumbPosition] = useState({ left: 0, top: 0 });
  const [startDateLeft, setStartDateLeft] = useState(currentDate);
  const [startDateRight, setStartDateRight] = useState(nextDay);
  const [showCalendarLeft, setShowCalendarLeft] = useState(false);
  const [showCalendarRight, setShowCalendarRight] = useState(false);

  const sliderRef = useRef(null);
  const [step, setStep] = useState(0);

  const handleSliderChange = (event) => {
    const value = parseFloat(event.target.value);
    console.log(value)
    const newTime = new Date(startDateLeft);
    
    newTime.setHours(newTime.getHours() + value); // Adjust hours based on slider value
    console.log(newTime)
    setCurrentTime(newTime);
    setSliderValue(value);
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
    const stepPercentage = (1 / maxSliderValue) * 100; // Calculate the percentage of one step
    
    // Calculate the color stops for the gradient
    const colorStop1 = `#37A7E5`;
    const colorStop2 = `#BF46D2 ${progress}%`;
    const colorStop3 = `#323551 ${progress}%`;
    
    return `linear-gradient(to right, ${colorStop1}, ${colorStop2}, ${colorStop3})`;
  };
  

  const handleThumbHover = (event) => {
    const thumbRect = event.target.getBoundingClientRect();
    setThumbPosition({
      left: thumbRect.left + thumbRect.width / 2,
      top: thumbRect.top - 40, // Adjust the offset as needed
    });
    setShowTime(true);

    document.querySelector('label').classList.add('active');
  };

  const handleThumbLeave = () => {
    setShowTime(false);

    document.querySelector('label').classList.remove('active');
  };

  useEffect(() => {
    const rangeLinePadding = 16;
    const calcStep = (sliderRef.current.offsetWidth - rangeLinePadding) / sliderRef.current.max;
    setStep(calcStep);
  }, []);

  const handleDateLeftClick = () => {
    setShowCalendarLeft(!showCalendarLeft);
  };

  const handleDateRightClick = () => {
    setShowCalendarRight(!showCalendarRight);
  };

  const handleDateLeftChange = (date) => {
    if (date.getTime() + 4 * 60 * 60 * 1000 <= startDateRight.getTime()) {
      setStartDateLeft(date);
    }
  };

  const handleDateRightChange = (date) => {
    if (startDateLeft.getTime() + 4 * 60 * 60 * 1000 <= date.getTime()) {
      setStartDateRight(date);
    }
  };

  // Calculate the difference in hours between startDateLeft and startDateRight
    const hoursDifference = (startDateRight - startDateLeft) / (1000 * 60 * 60);

    // Set the min, max, and step values for the slider
    const minSliderValue = 0;
    const maxSliderValue = hoursDifference;
    const sliderStep = 1;

    const calculateBubblePosition = () => {
        if (sliderRef.current) {
          const sliderWidth = sliderRef.current.offsetWidth;
          const sliderMax = sliderRef.current.max;
          const stepPercentage = (sliderWidth / sliderMax) * 100; // Calculate the percentage of one step
          const bubblePosition = (sliderValue / maxSliderValue) * sliderWidth; // Calculate the bubble position
      
          // Ensure the bubble stays within the slider bounds
          const boundedPosition = Math.min(Math.max(0, bubblePosition), sliderWidth);
      
          return {
            transform: `translateX(${boundedPosition}px)`,
          };
        } else {
          return {};
        }
      };


      
      
      
  

  return (
    <div className='timeSlider'>
      <div className='dateBoxContainer'>
        <div className='dateBoxLeft' onClick={handleDateLeftClick}>
          {startDateLeft.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className='datePickerContainer'>
          {showCalendarLeft && (
            <DatePicker
              selected={startDateLeft}
              onChange={handleDateLeftChange}
              onClickOutside={() => setShowCalendarLeft(false)}
              showTimeSelect
              timeIntervals={60} // Set the time intervals to 1 hour (60 minutes)
              dateFormat="MM/dd/yyyy h:mm aa"
              inline
              className="customDatePicker"
            />
          )}
        </div>
      </div>
      <div className='dateBoxContainer'>
        <div className='dateBoxRight' onClick={handleDateRightClick}>
          {startDateRight.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className='datePickerContainer'>
          {showCalendarRight && (
            <DatePicker
              selected={startDateRight}
              onChange={handleDateRightChange}
              onClickOutside={() => setShowCalendarRight(false)}
              showTimeSelect
              timeIntervals={60} // Set the time intervals to 1 hour (60 minutes)
              dateFormat="MM/dd/yyyy h:mm aa"
              inline
              className="customDatePicker"
            />
          )}
        </div>
      </div>

      <div className='sliderContainer'>
        <div className='clock'>
          <Icon as={ClockHistoryIcon} boxSize={20} />
        </div>
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
          className='customSlider'
          style={{ background: calculateGradient() }}
          ref={sliderRef}
        />
        <label
            htmlFor="range"
            className="slider-label"
            style={{
                ...calculateBubblePosition(),
            }}
            >
          <span>{currentTime.toLocaleTimeString('en-US', {  month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <div className='windowContainer'>
            <PopupWindow />
          </div>
        </label>
      </div>
    </div>
  );
};

export default TimeSlider;
