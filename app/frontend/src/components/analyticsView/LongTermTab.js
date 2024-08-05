import React, { useState, useEffect, useCallback } from 'react';
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
import "./LongTermTab.css";

import ForcastComponent from "../forcastComponent/ForcastComponent.js";
import LoadingAnimationComp from "../loading_Animation/LoadingAnimationComp.js";

const PARKADE_OPTIONS = [
  'Thunderbird', 'North', 'West', 'Health Sciences', 'Fraser', 'Rose', 'University Lot Blvd'
];

const DATA_CATEGORY_OPTIONS = [
  'Parkade Occupancy', 'Accessibility Occupancy'
];


const LongTermTab = ({ renderParkadeSelection}) => { 
const [loading, setLoading] = useState(false);


// Forcast states and functions-----------------------------------------------------------
  const formatDate = (date) =>{
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month is zero-indexed
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
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedParkades, setSelectedParkades] = useState([]);
  const [generateChecked, setGenerateChecked] = useState(false);
  const [results, setResults] = useState("");

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

  const handleGenerateClickForcast = async () => {
    // Check if any required field is empty or missing
    if (selectedParkadesForcast.length === 0) {
      // If any required field is missing, don't generate anything
      alert('Please pick at least one parkade');
      return;
    }
    try {
      setLoading(true); // Set loading state to true
  
      // Make the request to the backend to fetch the CSV data
      onClickLGBM(formatDate(startTime), formatDate(endTime), selectedParkadesForcast);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  const onClickLGBM = (startDate, endDate, parkades) => {
    // Construct the request body
    const requestBody = {
      startDate,
      endDate,
      parkades
    };
  
    console.log(requestBody);
    fetch('/api/LGBM_longterm_predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Received data:', data);
      // Handle response data
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
          />
        )
      }));
    })
    .catch(error => {
      console.error('Error in onClickLGBM:', error);
    });
  };
  

  //-------------------------------------------------------------------------



    return (
        <div className="forecastView">
          <div className="lhs"> 
            <h4>TIME FRAME</h4>
            <div className="timeframe" style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Typography style={{ color: '#9C9FBB' }}>From</Typography>
                <DateTimePicker
                    onChange={(date) => {
                      if (date) {
                      
                            setStartTime(date);
                            // Automatically set endTime to one day after startTime
                            setEndTime(new Date(date.getTime() + 24 * 60 * 60 * 1000));
                      }
                  }}
                    value={startTime}
                    format="y-MM-dd"
                    minDate={new Date()}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                    
                />
                <Typography style={{ color: '#9C9FBB' }}>To</Typography>
                <DateTimePicker
                  onChange={(date) => {
                    if (date > startTime) {
                      // Check if the time range is within three weeks
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
                  maxDate = {new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                />
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
                        <Button variant="contained" color="primary" onClick={handleGenerateClickForcast} style={{width: "150px"}}>
                            {loading ? 'Generating...' : 'Generate!'}
                        </Button>
                    </div>

          </div>

          <div className="results" >
                {forcastResults}
            </div>  
        </div>
    )
};

export default LongTermTab