import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Checkbox,
  Button
} from "@mui/material";
import DateTimePicker from 'react-datetime-picker';
import { BsXCircleFill } from 'react-icons/bs';
import './analyticsView.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import axios from 'axios';
import { getQueries, PERIODICITY_STEP } from "./queryHelper";
import Diagram from '../diagrams/Diagram';
import { formatUnixTimestamp, formatDateString } from "../../time";
import CustomTooltip from "./customToolTip";

import Tabs from '../tabComponent/Tabs.js';
import ForcastComponent from "../forcastComponent/ForcastComponent.js";
import LoadingAnimationComp from "../loading_Animation/LoadingAnimationComp.js";
import { addDays, addWeeks } from "date-fns";
import { getTimezoneOffset } from 'date-fns-tz'


const DATA_CATEGORY_OPTIONS = [
  'Parkade Occupancy', 'Accessibility Occupancy'
];

const VISUALIZATION_OPTIONS = [
  'Line Graph', 'Bar Graph'
];

const PERIODICITY_OPTIONS = [
  'Hourly', 'Daily', 'Weekly', 'Monthly' 
];

const AVG_PEAK = [
  'Average', 'Peak'
];

const PARKADE_OPTIONS = [
  'Thunderbird', 'North', 'West', 'Health Sciences', 'Fraser River', 'Rose Garden', 'University West Blvd'
];

const RESULT_LIMIT = 24*21;

const menuItems = (data, value, setValue=()=>{}, hideSelected=false, selected) => {
  if (hideSelected) {
    data = data.filter((item) => selected.indexOf(item) === -1)
  }
  return data.map((item, key) => (
    <MenuItem
      onClick={() => setValue(item)}
      style={{ display: "block" }}
      key={key}
      value={item}
    >
      <Typography>{item}</Typography>
    </MenuItem>
  ));
}

const renderForm = (data, value, setValue, width="300px") => (
  <FormControl sx={{ width: width, height: '35px', backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 0", borderRadius: "5px"}}>
    <Select sx={{ color: "#9C9FBB" }}
      size="small"
      value={value}

  MenuProps={{
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left"
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left"
    },
    getContentAnchorEl: null,
    PaperProps: {
      sx: {
        backgroundColor: "#323551",
        color: "#9C9FBB"
      }
    }
  }}
>
      {menuItems(data, value, setValue)}
    </Select>
  </FormControl>
);

const renderSelectedParkades = (selectedParkades, setSelectedParkades, setChecked) => (
  selectedParkades.map((item) => (
    <div style={{ width: "fit-content", height: "35px", backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 2% 5px 0", borderRadius: "5px",
      display: "flex", alignItems: 'center', padding: '5px'
    }} key={item}>
      <div style={{display: 'flex', alignItems: 'center', 'justifyContent': 'space-evenly'}}>
        {item}
        <BsXCircleFill className='cross' id={item} style={{marginLeft: '7px', }} onClick={(event) => {
          const el = event.target.tagName === 'svg' ? event.target : event.target.parentNode;
          const parkade = el.id;
          const tempSelectedParkades = [...selectedParkades];
          tempSelectedParkades.splice(tempSelectedParkades.indexOf(parkade), 1);
          setSelectedParkades(tempSelectedParkades);
          setChecked(false);
        }} />
      </div>
    </div>
  ))
);

const renderParkadeSelection = (data, label, selectedParkades, setSelectedParkades, setChecked) => (
  <div style={{display:'flex', alignItems:'flex-start', flexWrap: 'wrap'}}>
    {renderSelectedParkades(selectedParkades, setSelectedParkades, setChecked)}
    <FormControl sx={{ width: "120px", height: '35px', backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 0", borderRadius: "5px"}}>
      <InputLabel>{'+ Select'}</InputLabel>
      <Select sx={{ color: "#9C9FBB" }} displayEmpty
        size="small"
        value=''
        renderValue={() => <p>{label}</p>}
      >
        {menuItems(data, '', (item) => {
          if(selectedParkades.indexOf(item) === -1) {
            const tempSelectedParkades = [...selectedParkades];
            tempSelectedParkades.push(item);
            setSelectedParkades(tempSelectedParkades);
          }
        }, true, selectedParkades)}
      </Select>
    </FormControl>
  </div>
);

const AnalyticsView = () => {
  const [dataCategory, setDataCategory] = useState(DATA_CATEGORY_OPTIONS[0]);
  const [visualizationFormat, setVisualizationFormat] = useState(VISUALIZATION_OPTIONS[0]);
  const [periodicity, setPeriodicity] = useState(PERIODICITY_OPTIONS[0]);
  const [avgPeak, setAvgPeak] = useState(AVG_PEAK[0]);
  const [selectedParkades, setSelectedParkades] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [generateChecked, setGenerateChecked] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState({});
  const [results, setResults] = useState("");


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


  const onClickLGBM =(queryParams)=>{
    fetch(`/api/LGBM_short?${queryParams}`)
      .then(response => response.json())
      .then(data => {
        // Handle response data
        // console.log(data);
        setForcastResults (Object.keys(data).map((parkade) => {
          return (
            <Diagram type={'LINE'} height={'30%'} width={'90%'} title={parkade} dataOverride={data[parkade]} customToolTip={CustomTooltip}/>
          )
        }))
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
    fetch(`/api/baseline_predict?${queryParams}`)
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
  
  
  const handleSelectAllChange = (event) => {
    const checked = event.target.checked;
    setSelectAllChecked(checked);
    if (checked) {
      setSelectedParkades(PARKADE_OPTIONS);
    } else {
      setSelectedParkades([]);
    }
  };

  const handleGenerateChange = (event) => {
    const checkedGenCSV = event.target.checked;
    setGenerateChecked(checkedGenCSV);
    if (checkedGenCSV) {
      // Prepare the packet of query features
      const queryFeatures = {
        dataCategory,
        visualizationFormat,
        periodicity,
        avgPeak,
        selectedParkades,
        startTime,
        endTime
      };
      
    }
  };

  const createDate = (dateString) => {
    const timeZone = 'America/Vancouver';
    const date = new Date(dateString);
    const offset = getTimezoneOffset(timeZone, date);
    const adjustedDate = new Date(date.getTime() - offset);
    console.log('Date: ', date)
    console.log('Adjusted: ', adjustedDate);
    return adjustedDate;
  }

  const getLocalDate = (date) => {
    const [ dd, mm, yyyy ] = date.toLocaleDateString().split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  const renderResults = async (queries) => {
    const resultsLocal = {};
    const promises = Object.keys(queries).map(async (parkade) => {
      const periodicity = queries[parkade]['periodicity']
      const cleanData = []
      if (periodicity == 'Hourly') {
        const step = PERIODICITY_STEP[periodicity];
        for (var i = queries[parkade]['startTime']; i<=queries[parkade]['endTime']; i += step)
          cleanData.push({
            'name': formatUnixTimestamp(i),
            'Vehicles': null
          });
        if (cleanData.length > RESULT_LIMIT){
          alert('Time window too big, try reducing the windo size or changing the periodicity');
          return;
        }
        else {
          const response = await axios.get(`/executeQuery?query=${queries[parkade]['query']}`);
          const data = response.data;
          data.forEach((dataPoint) => {
            const item = cleanData.find(obj => obj['name'] == formatUnixTimestamp(dataPoint['TimestampUnix']))
            if (item) {
              item['Vehicles'] = dataPoint['Vehicles']
              item['Capacity'] = dataPoint['Capacity']
            }
          });
          resultsLocal[parkade] = cleanData;
        }
      } else if (periodicity == 'Daily') {
        const startDate = queries[parkade]['startTime'];
        const endDate = queries[parkade]['endTime'];
        let currentDate = createDate(startDate);
        while (currentDate <= createDate(endDate)){
          cleanData.push({
            'name': formatDateString(getLocalDate(currentDate)),
            'Vehicles': null
          });
          currentDate = addDays(currentDate, 1);
        }
        if (cleanData.length > RESULT_LIMIT){
          alert('Time window too big, try reducing the windo size or changing the periodicity');
          return;
        }
        else {
          const response = await axios.get(`/executeQuery?query=${queries[parkade]['query']}`);
          const data = response.data;
          // fix data.date to match cleanData's objects format
          data.forEach((dataPoint) => {
            const item = cleanData.find(obj => obj['name'] == formatDateString(dataPoint.date.split('T')[0]))
            if (item) {
              item['Vehicles'] = queries[parkade]['avgPeak'] === 'Average' ? dataPoint.average_occupancy : dataPoint.peak_occupancy
              item['Period Average'] = dataPoint.average_occupancy;
              item['Period Peak'] = dataPoint.peak_occupancy;
              item['Peak At'] = formatUnixTimestamp(dataPoint.peak_occupancy_time);
              item['Capacity'] = dataPoint.Capacity
            } 
          });
          resultsLocal[parkade] = cleanData;
        }
      } else if (periodicity == 'Weekly') {
        const startDate = queries[parkade]['startTime'];
        const endDate = queries[parkade]['endTime'];
        let currentDate = createDate(startDate);
        while (currentDate <= createDate(endDate)){
          const from = currentDate;
          const to = addDays(from, 6)
          cleanData.push({
            'name': `${formatDateString(getLocalDate(from))} - ${formatDateString(getLocalDate(to))}`,
            'Vehicles': null
          });
          currentDate = addWeeks(currentDate, 1);
        }
        if (cleanData.length > RESULT_LIMIT){
          alert('Time window too big, try reducing the windo size or changing the periodicity');
          return;
        }
        else {
          const response = await axios.get(`/executeQuery?query=${queries[parkade]['query']}`);
          const data = response.data;
          data.forEach((dataPoint) => {
            const item = cleanData.find(obj => obj['name'] == `${formatDateString(dataPoint.week_start_date.split('T')[0])} - ${formatDateString(dataPoint.week_end_date.split('T')[0])}`)
            if (item) {
              item['Vehicles'] = queries[parkade]['avgPeak'] === 'Average' ? dataPoint.average_occupancy : dataPoint.peak_occupancy
              item['Period Average'] = dataPoint.average_occupancy;
              item['Period Peak'] = dataPoint.peak_occupancy;
              item['Peak At'] = formatUnixTimestamp(dataPoint.peak_occupancy_time);
              item['Capacity'] = dataPoint.Capacity;
            } 
          });
          resultsLocal[parkade] = cleanData;
        }
      } else if (periodicity == 'Monthly') {
        // TODO
      }
    });
    await Promise.all(promises);
    return Object.keys(resultsLocal).map((parkade) => {
      return (
        <Diagram className='queryResultDiagram' type={queries[parkade]['diagType'] == 'Line Graph' ? 'LINE' : 'BAR'} height={'40%'} width={'95%'} title={parkade} dataOverride={resultsLocal[parkade]} customToolTip={<CustomTooltip></CustomTooltip>} dataKeyY="Vehicles" capacity={resultsLocal[parkade][0]['Capacity']}/>
      )
    });
  }

  const handleGenerateClick = async () => {
    // Check if any required field is empty or missing
    if (!dataCategory || !visualizationFormat || !periodicity || !avgPeak || selectedParkades.length === 0) {
      // If any required field is missing, don't generate anything
      alert('Please fill out all required fields');
      return;
    }
  
    try {
      setLoading(true); // Set loading state to true
  
      // Make the request to the backend to fetch the CSV data
      const queries = getQueries(dataCategory, visualizationFormat, periodicity, avgPeak, selectedParkades, startTime, endTime)
      const response = []
      setQueries(queries);

      if (generateChecked) {
      const csvData = response.data;
  
      const blob = new Blob([csvData], { type: 'text/csv' });
  
      const url = window.URL.createObjectURL(blob);
  
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'parking_data.csv');
  
      // Simulate a click on the link to initiate the download
      document.body.appendChild(link);
      link.click();
  
      // Clean up by removing the temporary URL and link element
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      }

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      const renderedResults = await renderResults(queries);
      setResults(renderedResults);
    };

    fetchResults();
  }, [queries]);

  
  const tabs = [
    {
      title: 'REAL VALUES',
      content :
      <div className='analyticsView' style={{display: 'flex', alignItems: 'center'}}>
        <div className="queryItems">
          <div className='analytics-options-div'>
            <h4>DATA CATEGORY</h4>
            {renderForm(DATA_CATEGORY_OPTIONS, dataCategory, setDataCategory)}
          </div>
          <div className='analytics-options-div'>
            <h4>VISUALIZATION FORMAT</h4>
            {renderForm(VISUALIZATION_OPTIONS, visualizationFormat, setVisualizationFormat)}
          </div>
          <div className='analytics-options-div'>
            <h4>TIME FRAME</h4>
            <div className="timeframe" style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Typography style={{ color: '#9C9FBB' }}>From</Typography>
                <DateTimePicker
                    onChange={(date) => {
                    if (date < endTime) {
                      setStartTime(date);
                    } else {
                      alert(`Must select a time lesser than ${endTime}`)
                    }}}
                    value={startTime}
                    minDate={new Date('01-01-2018')}
                    maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())  
                    }
                />
                <Typography style={{ color: '#9C9FBB' }}>To</Typography>
                <DateTimePicker
                  onChange={(date) => {
                  if (date > startTime) {
                    setEndTime(date);
                  } else {
                    alert(`Must select a time greater than ${startTime}`)
                  }}}
                  value={endTime}
                  minDate={new Date('01-01-2018')}
                  maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())}
                />
            </div>
          </div>
          <div className='analytics-options-div'>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{marginRight: '20%'}}>
                <h4>PERIODICITY</h4>
                {renderForm(PERIODICITY_OPTIONS, periodicity, setPeriodicity, '150px')}
              </div>
              { periodicity != 'Hourly' ?
                <div>
                  <h4>Average/Peak</h4>
                  {renderForm(AVG_PEAK, avgPeak, setAvgPeak, '150px')}
                </div> : null
              }
            </div>
          </div>
          <div className='analytics-options-div'>
            <h4>PARKADE OPTIONS</h4>
            <div style={{width: "15%", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Checkbox style={{color: '#323551'}} checked={selectAllChecked} onChange={handleSelectAllChange}></Checkbox>
              <h4>Select All</h4>
            </div>
            {renderParkadeSelection(PARKADE_OPTIONS, '+ Select', selectedParkades, setSelectedParkades, setSelectAllChecked)}
          </div>
          <div className='generate-container'>
          <Button variant="contained" color="primary" onClick={handleGenerateClick} style={{width: "150px"}}>
              {loading ? 'Generating...' : 'Generate!'}
            </Button>
            <div className='generate-checkbox-div' style={{width: "15%", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Checkbox style={{color: '#323551'}} checked={generateChecked} onChange={handleGenerateChange}></Checkbox>
              <h4>Generate CSV</h4>
            </div>
          </div>
        </div> 
          <div className="results">
            {results}
          </div>     
      </div>
  },

  {
    title: 'FORECAST',
    content: 
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
  }];


  return (
      <div className='fullView' >
          <Tabs tabs={tabs} />
      </div>
    )
}

export default AnalyticsView;
