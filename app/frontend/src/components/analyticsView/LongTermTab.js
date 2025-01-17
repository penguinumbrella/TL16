import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Checkbox,
  Button
} from "@mui/material";

import './analyticsView.css';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import Diagram from '../diagrams/Diagram.js';
import CustomTooltip from "./customToolTip.jsx";

import ForcastComponent from "../forcastComponent/ForcastComponent.js";
import LoadingAnimationComp from "../loading_Animation/LoadingAnimationComp.js";
import { getAuthToken } from '../../getAuthToken.js';

import "./LongTermTab.css";

const PARKADE_OPTIONS = [
  'Thunderbird', 'North', 'West', 'Health Sciences', 'Fraser', 'Rose', 'University Lot Blvd'
];

const DATA_CATEGORY_OPTIONS = [
  'Parkade Occupancy', 'Accessibility Occupancy'
];

const LongTermTab = ({ renderParkadeSelection }) => {
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const THREE_WEEKS_MS = 3 * 7 * 24 * 60 * 60 * 1000;
  const [dataCategory, setDataCategory] = useState(DATA_CATEGORY_OPTIONS[0]);

  const [selectedParkadesForcast, setSelectedParkadesForcast] = useState([]);
  const [selectAllCheckedForcast, setSelectAllCheckedForcast] = useState(false);
  const [forcastResults, setForcastResults] = useState("");

  const [longForecastDate, setLongForecastDate] = useState(formatDate(new Date()));
  const [longForecastResults, setLongForecastResults] = useState('');
  const [showLongForecastResults, setShowLongForecastResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

    // Function to set the time to 12:00:00
  const getStartOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  // Initialize the start time to today at 12:00:00
  const initialStartTime = getStartOfDay(new Date());

  // Initialize the end time to tomorrow at 12:00:00
  const initialEndTime = new Date(initialStartTime);
  initialEndTime.setDate(initialEndTime.getDate() + 1);

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedParkades, setSelectedParkades] = useState([]);
  const [generateChecked, setGenerateChecked] = useState(false);
  const [results, setResults] = useState("");

  const TABLES = {
    'Fraser': 725,
    'North': 990,
    'West': 1232,
    'Health Sciences': 1189,
    'Thunderbird': 1634,
    'University Lot Blvd': 216,
    'Rose': 807,
  };

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAllChecked(checked);
    if (checked) {
      setSelectedParkades(PARKADE_OPTIONS);
    } else {
      setSelectedParkades([]);
    }
  };

  const handleSelectAllChangeForcast = (event) => {
    const checked = event.target.checked;
    setSelectAllCheckedForcast(checked);
    if (checked) {
      setSelectedParkadesForcast(PARKADE_OPTIONS);
    } else {
      setSelectedParkadesForcast([]);
    }
  };

  useEffect(() => {
    console.log("loading changed to:", loading);
  }, [loading]);
  

  const handleGenerateClickForcast = async () => {
    if (selectedParkadesForcast.length === 0) {
      alert('Please pick at least one parkade');
      return;
    }
    try {
      // Set loading state to true
      setIsLoading(true);
      console.log("Setting loading to true");
      
      // Await the async operation
      await onClickLGBM(formatDate(startTime), formatDate(endTime), selectedParkadesForcast);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

// Debugging loading state changes
useEffect(() => {
  console.log("loading state updated to:", isLoading);
}, [isLoading]);



  const onClickLGBM = (startDate, endDate, parkades) => {
    const requestBody = {
      startDate,
      endDate,
      parkades
    };

    console.log(requestBody);
    fetch('/api/LGBM_longterm_predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Received data:', data);
      setForcastResults(Object.keys(data).map((parkade) => {
        return (
          <Diagram
            key={parkade}
            type={'LINE'}
            height={'30%'}
            width={'90%'}
            title={parkade}
            dataOverride={data[parkade]}
            customToolTip={CustomTooltip}
            capacity={TABLES[parkade]}
            dataKeyY="Vehicles"
            prediction_type="prediction"
          />
        );
      }));
    })
    .catch(error => {
      console.error('Error in onClickLGBM:', error);
    })
    .finally(() => {
      setIsLoading(false);
      console.log("Setting loading to false");
    });
  };

  return (
    <div className="longTermView">
      <div className="lhs">
      <h3>TIME FRAME</h3>

      <div className="timeframe" style={{ display: 'flex', alignItems: 'center', paddingBottom:`50px`}}>
          <div className='timeframe-from' style={{paddingRight: `50px`}}>
          <Typography style={{ color: '#9C9FBB' }}>From</Typography>
        <DateTimePicker
          onChange={(date) => {
            if (date) {
              setStartTime(date);
              setEndTime(new Date(date.getTime() + 24 * 60 * 60 * 1000));
            }
          }}
          value={startTime}
          format="y-MM-dd"
          minDate={new Date()}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        />
        </div>
        <div className='timeframe-to'>
          <Typography style={{ color: '#9C9FBB' }}>To</Typography>
          <DateTimePicker
          onChange={(date) => {
            if (date > startTime) {
              if (date - startTime > THREE_WEEKS_MS) {
                alert("The time range must be within three weeks.");
              } else {
                setEndTime(date);
              }
            } else {
              alert(`Must select a time greater than ${startTime}`);
            }
          }}
          value={endTime}
          format="y-MM-dd"
          minDate={new Date()}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        />
      </div>
      </div>

      <div className='forecast-parkade-options-div'>
        <h3>PARKADE OPTIONS</h3>
        <div style={{width: "15%", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Checkbox style={{color: '#323551'}} checked={selectAllCheckedForcast} onChange={handleSelectAllChangeForcast}></Checkbox>
          <h4 style={{margin : '10px'}}>Select All</h4>
        </div>
        {renderParkadeSelection(PARKADE_OPTIONS, '+ Select', selectedParkadesForcast, setSelectedParkadesForcast, setSelectAllCheckedForcast)}
      </div>

      <div className='generate-container'>
        <Button variant="contained" color="primary" onClick={handleGenerateClickForcast} style={{width: "150px"} } disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate!'}
        </Button>
      </div>
      </div>

      <div className="results">
        {forcastResults}
      </div>  
    </div>
  );
};

export default LongTermTab;
