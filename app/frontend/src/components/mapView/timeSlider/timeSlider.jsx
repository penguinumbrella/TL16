import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@chakra-ui/react';
import DateTimePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ReactComponent as ClockHistoryIcon } from '../../../icons/clock-history.svg';
import { ReactComponent as PopupWindow } from '../../../icons/slider-popup.svg';
import './timeSlider.css';

import { BsXCircleFill } from 'react-icons/bs';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

const TimeSlider = ({ onTimeChange, onSliderRelease }) => {

  //const currentDate = new Date();
  let currentDate = new Date(2024, 5, 0, 12, 0, 0, 0);
  console.log(currentDate);

  currentDate.setHours(0, 0, 0, 0); // Set time to 12:00 AM

  //const actualCurrentDate = new Date();
  const actualCurrentDate = new Date(2024, 5, 0, 12, 0, 0, 0);

  // Calculate the hour difference rounded down from the time at 12:00 AM
  const startingHourDifference = Math.floor((actualCurrentDate - currentDate) / (1000 * 60 * 60));

  //const nextDay = new Date();
  const nextDay = new Date(2024, 5, 0, 12, 0, 0, 0);
  nextDay.setDate(nextDay.getDate() + 1); // Get the next day
  nextDay.setHours(0, 0, 0, 0); // Set time to 12:00 AM

  const roundedDate = new Date(2024, 5, 0, 12, 0, 0, 0);
  //const roundedDate = new Date();
  roundedDate.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0

  const [currentTime, setCurrentTime] = useState(roundedDate);
  const [sliderValue, setSliderValue] = useState(startingHourDifference);
  const [showTime, setShowTime] = useState(false);
  const [thumbPosition, setThumbPosition] = useState({ left: 0, top: 0 });
  const [startDateLeft, setStartDateLeft] = useState(currentDate);
  const [startDateRight, setStartDateRight] = useState(nextDay);
  const [showCalendarLeft, setShowCalendarLeft] = useState(false);
  const [showCalendarRight, setShowCalendarRight] = useState(false);

  const actualTime = new Date(2024, 5, 0, 12, 0, 0, 0);
  //const actualTime = new Date();

  const sliderRef = useRef(null);
  const [step, setStep] = useState(0);

  const handleSliderChange = (event) => {
    const value = parseFloat(event.target.value);
    const newTime = new Date(startDateLeft);

    newTime.setHours(newTime.getHours() + value); // Adjust hours based on slider value
    setCurrentTime(newTime);
    setSliderValue(value);

    onTimeChange(newTime);
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

  // Calculate the difference in days between startDateLeft and startDateRight
  const daysDifference = hoursDifference / 24;

  // Set the min, max, and step values for the slider
  const minSliderValue = 0;
  const maxSliderValue = hoursDifference;
  const sliderStep = 1; // Use 1 day step if difference is more than 2 days, otherwise 1 hour

  const calculateBubblePosition = () => {
    if (sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const sliderMax = sliderRef.current.max;
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

  const calculateMarkerPosition = () => {
    if (actualTime >= startDateLeft && actualTime <= startDateRight && sliderRef.current) {
      const sliderWidth = sliderRef.current.offsetWidth;
      const sliderMax = sliderRef.current.max;
      const actualTimeDifference = (actualTime - startDateLeft) / (1000 * 60 * 60);
      const markerPosition = (actualTimeDifference / hoursDifference) * sliderWidth;

      return {
        left: `${(markerPosition / sliderWidth) * 100}%`,
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
          onMouseUp={handleSliderRelease}
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
            height: '4px',
            width: '2px',
            background: 'black',
            border: '1px dashed #000',
            ...calculateMarkerPosition(),
          }}
        />
      </div>
    </div>
  );
};

export default TimeSlider;
