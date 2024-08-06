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
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import Diagram from '../diagrams/Diagram.js';
import CustomTooltip from "./customToolTip.jsx";

import ForcastComponent from "../forcastComponent/ForcastComponent.js";
import LoadingAnimationComp from "../loading_Animation/LoadingAnimationComp.js";
import { getAuthToken } from '../../getAuthToken.js';

const PARKADE_OPTIONS = [
  'Thunderbird', 'North', 'West', 'Health Sciences', 'Fraser River', 'Rose Garden', 'University West Blvd'
];


const ForecastTab = ({ renderParkadeSelection}) => { 
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

  const [selectedParkadesForcast, setSelectedParkadesForcast] = useState([]);
  const [selectAllCheckedForcast, setSelectAllCheckedForcast] = useState(false);
  const [forcastResults, setForcastResults] = useState("");

  const [longForecastDate, setLongForecastDate] = useState(formatDate(new Date()));
  const [longForecastResults, setLongForecastResults] = useState('');
  const [showLongForecastResults, setShowLongForecastResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectAllChangeForcast = (event) => {
    const checked = event.target.checked;
    setSelectAllCheckedForcast(checked);
    if (checked) {
      setSelectedParkadesForcast(PARKADE_OPTIONS);
    } else {
      setSelectedParkadesForcast([]);
    }
  };

  const onClickLGBM = (queryParams) => {
    fetch(`/api/LGBM_short?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
      .then(response => response.json())
      .then(data => {
        // Log the response data
        console.log('Fetched data:', data);
  
        // Handle response data
        setForcastResults(Object.keys(data).map((parkade) => {
          return (
            <Diagram type={'LINE'} height={'30%'} width={'90%'} title={parkade} dataOverride={data[parkade]} customToolTip={CustomTooltip}/>
          );
        }));
      })
      .catch(error => {
        console.error('Error in onClickLGBM:', error);
      });
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
      const queryParams = new URLSearchParams({
        parkades: selectedParkadesForcast
        
      });
      onClickLGBM(queryParams);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const onClickLongForecast = (queryParams) =>{
    // console.log(queryParams);
    fetch(`/api/baseline_predict?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json()}
      )
      .then(data => {
        // Handle response data
        // console.log(data);
        setIsLoading(false);
        setLongForecastResults (()=>{
          setShowLongForecastResults(true);
          return(
            <div>                
              {data["long_term_results"].map((dataObj) => {
                return (
                  <><h4>  {dataObj.name} : &emsp; {dataObj.value}  </h4> <br/></>       
                )})}
            </div>
          )} 
        )})
      .catch(error => {
        console.error('onClickLongForecast Error:', error);
      });
  };

  const handleLongForcastClick = ()=>{
    // longForecastDate
    // Check if any required field is empty or missing
    if (selectedParkadesForcast.length === 0) {
      // If any required field is missing, don't generate anything
      alert('Please pick at least one parkade');
      return;
    }
    try {
      setShowLongForecastResults(false);
      setIsLoading(true); // Set loading state to true

      // Make the request to the backend to fetch the CSV data
      const queryParams = new URLSearchParams({
        parkades: selectedParkadesForcast,
        date : longForecastDate
      });
      onClickLongForecast(queryParams);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  const handleCloseLongResults = ()=>{
    setShowLongForecastResults(false);
  };


  //-------------------------------------------------------------------------



    return (
        <div className="forecastView">
            <div className="forecast-options">
                <div className='forecast-parkade-options-div'>
                    <h3>PARKADE OPTIONS</h3>
                    <div style={{width: "15%", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Checkbox style={{color: '#323551'}} checked={selectAllCheckedForcast} onChange={handleSelectAllChangeForcast}></Checkbox>
                    <h4 style={{margin : '10px'}}>Select All</h4>
                    </div>
                    {renderParkadeSelection(PARKADE_OPTIONS, '+ Select', selectedParkadesForcast, setSelectedParkadesForcast, setSelectAllCheckedForcast)}
                </div>
                <br/>
                <div className="forecast-shortTerm">
                    <h3>SHORT TERM PREDICTION </h3><br/>

                    <div className='generate-container'>
                        <Button variant="contained" color="primary" onClick={handleGenerateClickForcast} style={{width: "150px"}}>
                            {loading ? 'Generating...' : 'Generate!'}
                        </Button>
                    </div>
                </div>
                <br/>
                <br/>
                <div className="forecast-longTerm">
                <h3>LONG TERM PREDICTION </h3><br/>
                <h4>Please enter a date </h4><br/>
                <ForcastComponent date={longForecastDate} setDate={setLongForecastDate}/>
                <br/>
                <div className='generate-container'>
                    <Button variant="contained" color="primary" onClick={handleLongForcastClick} style={{width: "150px"}}>
                    {loading ? 'Generating...' : 'go'}
                    </Button>
                </div>
                <div className="longResults" style={{ backgroundColor: (showLongForecastResults ? '#323551' : '#100D1D'), borderRadius: "5px", padding: "15px", width : "220px", marginTop : (showLongForecastResults ? "20px" : "0%"), marginBottom : (showLongForecastResults ? "20px" : "0%")}}>
                    {showLongForecastResults && <button class="close-button" aria-label="Close" onClick={handleCloseLongResults}>× </button>}
                    {showLongForecastResults && longForecastResults }
                    {isLoading && <LoadingAnimationComp/>}
                </div>
                </div>
            </div>
            <div className="results" >
                {forcastResults}
            </div>  
        </div>
    )
};

export default ForecastTab