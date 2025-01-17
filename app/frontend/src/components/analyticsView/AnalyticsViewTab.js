
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
import './analyticsView.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import axios from 'axios';
import { getQueries, PERIODICITY_STEP } from "./queryHelper";
import Diagram from '../diagrams/Diagram';
import { formatUnixTimestamp, formatDateString  } from "../../time";
import CustomTooltip from "./customToolTip";

import { addDays, addWeeks } from "date-fns";
import { getTimezoneOffset } from 'date-fns-tz'
import { getAuthToken } from "../../getAuthToken";

import {genCSVhelperParkades, genCSVhelperAccessibilty} from './csvFunctions';



const DATA_CATEGORY_OPTIONS = [
    'Parkade Occupancy', 'Accessibility Occupancy'
  ];
  
  const VISUALIZATION_OPTIONS = [
    'Line Graph', 'Bar Graph'
  ];
  
  const PERIODICITY_OPTIONS = [
    'Hourly', 'Daily', 'Weekly', 'Monthly',  
  ];
  
  const AVG_PEAK = [
    'Average', 'Peak'
  ];
  
  const PARKADE_OPTIONS = [
    'Thunderbird', 'North', 'West', 'Health Sciences', 'Fraser River', 'Rose Garden', 'University West Blvd'
  ];

  const ACCESSIBILITY_MENU_OPTIONS = [
    'Management', 'History', 'Overall Statistics'
  ]
  
  const RESULT_LIMIT = 24*21;
  

const AnalyticsViewTab = ({renderParkadeSelection, menuItems, renderZoneSelection, renderStallSelection}) =>{
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
  const [accessibilityMenu, setAccessibiltyMenu] = useState(ACCESSIBILITY_MENU_OPTIONS[0]);
  const [startTimeAccessibility, setStartTimeAccessibility] = useState(new Date());
  const [endTimeAccessibility, setEndTimeAccessibility] = useState(new Date());
  const [accessibilityManagementData, setAccessibiltyManagementData] = useState([]); 
  const [selectedZones, setSelectedZones] = useState(["All Zones"]);
  const [selectedStalls, setSelectedStalls] = useState(["All Stalls"]);
  const [mapStallId, setMapStallId] = useState({});

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
    setGenerateChecked(event.target.checked);
  };

  useEffect(()=>{
    // When we change the data category uncheck the CSV box
    if(dataCategory)
      setGenerateChecked(false);
  },[dataCategory]);



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
    const [mm, dd, yyyy] = date.toLocaleDateString().split('/');
    
    // Ensure the month and day are two digits
    const paddedMonth = mm.padStart(2, '0');
    const paddedDay = dd.padStart(2, '0');
    
    return `${yyyy}-${paddedMonth}-${paddedDay}`;
  } 


  const renderResults = async (queries) => {
    if (Object.keys(queries).includes('query')) {
        // Accessibility
        console.log(queries['query']);
        const results = await axios.get(`/executeQuery?query=${queries['query']}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        const columns = [];
        const response = results.data;
        if (response.length > 0) {
            Object.keys(response[0]).forEach((item) => {
                columns.push({
                    field: item,
                    headerName: item.split('_').map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(' '),
                    sortable: false
                });
            });
        }
        response.forEach((item, i) => {
            item.id = i;
        });
        return (
            <Diagram type={'TABLE'} columns={columns} rows={response}></Diagram>
        );
    } else {
        const resultsLocal = {};
        let windowTooLarge = false;
        let windowTooSmall = false;
        const promises = Object.keys(queries).map(async (parkade) => {
            const periodicity = queries[parkade]['periodicity'];
            const cleanData = [];
            if (periodicity === 'Hourly') {
                const step = PERIODICITY_STEP[periodicity];
                for (var i = queries[parkade]['startTime']; i <= queries[parkade]['endTime']; i += step) {
                    cleanData.push({
                        'name': formatUnixTimestamp(i),
                        'Vehicles': null
                    });
                }
                if (cleanData.length > RESULT_LIMIT) {
                    windowTooLarge = true;
                    return;
                }
                else if (cleanData.length === 0) {
                    windowTooSmall = true;
                    return;
                }
                else {
                    const response = await axios.get(`/executeQuery?query=${queries[parkade]['query']}`, {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    });
                    const data = response.data;
                    data.forEach((dataPoint) => {
                        const item = cleanData.find(obj => obj['name'] === formatUnixTimestamp(dataPoint['TimestampUnix']));
                        if (item) {
                            item['Vehicles'] = dataPoint['Vehicles'];
                            item['Capacity'] = dataPoint['Capacity'];
                        }
                    });
                    resultsLocal[parkade] = cleanData;
                }
            } else if (periodicity === 'Daily') {
                const startDate = queries[parkade]['startTime'];
                const endDate = queries[parkade]['endTime'];
                let currentDate = createDate(startDate);
                while (currentDate <= createDate(endDate)) {
                    const localDate = getLocalDate(currentDate);
                    console.log(`Current Date: ${currentDate}`);
                    console.log(`Local Date: ${localDate}`);
                    
                    const formattedName = formatDateString(localDate, '00:00');
                    console.log(`Formatted Name for Daily: ${formattedName}`);
                    
                    cleanData.push({
                        'name': formattedName, // Adding time to daily
                        'Vehicles': null
                    });
                    
                    currentDate = addDays(currentDate, 1);
                }
                console.log(`Clean Data After Daily Formatting: `, cleanData);

                if (cleanData.length > RESULT_LIMIT) {
                    windowTooLarge = true;
                    return;
                }
                else if (cleanData.length === 0) {
                    windowTooSmall = true;
                    return;
                }
                else {
                    const response = await axios.get(`/executeQuery?query=${queries[parkade]['query']}`, {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    });
                    const data = response.data;
                    data.forEach((dataPoint) => {
                        const formattedDate = formatDateString(dataPoint.date.split('T')[0], '00:00');
                        console.log(`Formatted Date from Data Point: ${formattedDate}`);
                        
                        const item = cleanData.find(obj => obj['name'] === formattedDate);
                        if (item) {
                            item['Vehicles'] = queries[parkade]['avgPeak'] === 'Average' ? dataPoint.average_occupancy : dataPoint.peak_occupancy;
                            item['Period Average'] = dataPoint.average_occupancy;
                            item['Period Peak'] = dataPoint.peak_occupancy;
                            item['Peak At'] = formatUnixTimestamp(dataPoint.peak_occupancy_time);
                            item['Capacity'] = dataPoint.Capacity;
                            console.log(`Matched Item: `, item);
                        }
                    });
                    resultsLocal[parkade] = cleanData;
                    console.log(`Results Local for Parkade [${parkade}]: `, resultsLocal[parkade]);
                }
            } else if (periodicity === 'Weekly') {
                const startDate = queries[parkade]['startTime'];
                const endDate = queries[parkade]['endTime'];
                let currentDate = createDate(startDate);
                while (currentDate <= createDate(endDate)) {
                    const from = currentDate;
                    const to = addDays(from, 6);
                    cleanData.push({
                        'name': `${formatDateString(getLocalDate(from), '00:00')} - ${formatDateString(getLocalDate(to), '23:59')}`, // Adding time to weekly
                        'Vehicles': null
                    });
                    currentDate = addWeeks(currentDate, 1);
                }
                if (cleanData.length > RESULT_LIMIT) {
                    windowTooLarge = true;
                    return;
                }
                else if (cleanData.length === 0) {
                    windowTooSmall = true;
                    return;
                }
                else {
                    const response = await axios.get(`/executeQuery?query=${queries[parkade]['query']}`, {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    });
                    const data = response.data;
                    data.forEach((dataPoint) => {
                        const startOfWeek = formatDateString(dataPoint.week_start_date.split('T')[0], '00:00');
                        const endOfWeek = formatDateString(dataPoint.week_end_date.split('T')[0], '23:59');
                        const item = cleanData.find(obj => obj['name'] === `${startOfWeek} - ${endOfWeek}`);
                        if (item) {
                            item['Vehicles'] = queries[parkade]['avgPeak'] === 'Average' ? dataPoint.average_occupancy : dataPoint.peak_occupancy;
                            item['Period Average'] = dataPoint.average_occupancy;
                            item['Period Peak'] = dataPoint.peak_occupancy;
                            item['Peak At'] = formatUnixTimestamp(dataPoint.peak_occupancy_time);
                            item['Capacity'] = dataPoint.Capacity;
                        }
                    });
                    resultsLocal[parkade] = cleanData;
                }
            } else if (periodicity === 'Monthly') {
                // Similar logic can be applied for monthly
            }
        });
        await Promise.all(promises);
        if (windowTooLarge) {
            alert('Time window too big, try reducing the window size or changing the periodicity');
            return null;
        }
        if (windowTooSmall) {
            alert('Time window has 0 data points. Try increasing the window size or changing the periodicity');
            return null;
        }
        return Object.keys(resultsLocal).sort().map((parkade) => {
            console.log(`Final Data Passed to LineGraphComponent for Parkade [${parkade}]: `, resultsLocal[parkade]);
            return (
                <Diagram className='queryResultDiagram' type={queries[parkade]['diagType'] === 'Line Graph' ? 'LINE' : 'BAR'} height={'40%'} width={'95%'} title={parkade} dataOverride={resultsLocal[parkade]} customToolTip={<CustomTooltip></CustomTooltip>} dataKeyY="Vehicles" capacity={resultsLocal[parkade][0]['Capacity']} prediction_type="real" />
            )
        });
    }
}

  

  const handleGenerateClick = async () => {
    // Check if any required field is empty or missing
    if (dataCategory === 'Parkade Occupancy') {
      if (selectedParkades.length === 0) {
        alert('Please fill out all required fields');
        return;
      }
    } else {
      if (selectedStalls.length === 0) {
        alert('Please fill out all required fields');
        return;
      }
    }
  
    try {
      setLoading(true); // Set loading state to true
  
      // Make the request to the backend to fetch the CSV data
      const queries = getQueries(dataCategory, visualizationFormat, periodicity,
        avgPeak, selectedParkades, startTime, endTime, accessibilityMenu, selectedZones, selectedStalls,
        startTimeAccessibility, endTimeAccessibility, mapStallId
      );
      const response = []
      setQueries(queries);



    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getStallList = () => {
    const stalls = [];
    Object.keys(accessibilityManagementData.stalls).forEach(zone => {
      if (selectedZones[0] === 'All Zones' || selectedZones.includes(zone)){
        accessibilityManagementData.stalls[zone].forEach(stall => {
          stalls.push(stall);
        })
      }
    });
    if (selectedZones.length != 0)
      stalls.unshift('All Stalls');
    return stalls;
  }

  useEffect(() => {

    const fetchResults = async () => {
      const renderedResults = await renderResults(queries);
      setResults(renderedResults);
      return new Promise(resolve => {
        resolve(renderedResults)
      });
    };


    fetchResults().then((data)=>{
      if (generateChecked){
        
        if(dataCategory === DATA_CATEGORY_OPTIONS[0]){
          const queryFeatures = {
            dataCategory,
            visualizationFormat,
            periodicity,
            avgPeak,
            selectedParkades,
            startTime,
            endTime
          };
          genCSVhelperParkades(data, queryFeatures);
          
        }
        else if (dataCategory === DATA_CATEGORY_OPTIONS[1])
          genCSVhelperAccessibilty(data, accessibilityMenu);
      }
        
    });

    
  }, [queries]);

  useEffect(() => {
    const fetchAccessibilityManagementData = async () => {
      const query = 'SELECT * FROM x11_management'
      const response = await axios.get(`/executeQuery?query=${query}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      const zones = [];
      const stalls = {};
      response.data.forEach((item) => {
        if (!zones.includes(item.zone_display_name)){
          zones.push(item.zone_display_name);
          stalls[item.zone_display_name] = [];
        }
        stalls[item.zone_display_name].push(`${item.zone_display_name}: ${item.stall_display_name}`);
        // Maps stall name -> {zone id, stall_id}
        const temp = mapStallId;
        temp[`${item.zone_display_name}: ${item.stall_display_name}`] = {'zone': item.zone_id, 'stall': item.stall_id};
        setMapStallId(temp);
      });
      zones.unshift('All Zones');
      setAccessibiltyManagementData({
        data: response.data,
        zones: zones,
        stalls: stalls
      });
    }
    fetchAccessibilityManagementData();
  }, []);

  useEffect(() => {
    const tempStalls = []; 
    selectedStalls.forEach((stall) => {
      // If stall is not within the zone, remove it
      if (selectedZones[0] === 'All Zones')
        tempStalls.push(stall)
      else {
        selectedZones.forEach((zone) => {
          if (accessibilityManagementData.stalls[zone].includes(stall)) {
            tempStalls.push(stall);
            return;
          }
        }); 
      }
      setSelectedStalls(tempStalls);
    })
  }, [selectedZones])

  const renderParkadeOccupancyOptions = () => {
     return <><div className='analytics-options-div'>
            <h4>VISUALIZATION FORMAT</h4>
            {renderForm(VISUALIZATION_OPTIONS, visualizationFormat, setVisualizationFormat)}
          </div>
          <div className='analytics-options-div'>
            <h4>TIME FRAME</h4>
            <div className="timeframe" style={{ display: 'flex', alignItems: 'center'}}>
              <div className='timeframe-from' style={{paddingRight: `100px`}}>
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
                    maxDate={new Date()  
                    }
                />
                </div>
                <div className='timeframe-to'>
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
                  maxDate={new Date()}
                />
                </div>
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
          </>
  }

  const renderAccessibilityOptions = () => {
    return <>
          <div className='analytics-options-div'>
              <h4>OPTIONS</h4>
              {renderForm(ACCESSIBILITY_MENU_OPTIONS, accessibilityMenu, setAccessibiltyMenu)}
          </div>
          <div className='analytics-options-div'>
            <h4>ZONES</h4>
            {renderZoneSelection(accessibilityManagementData.zones, 'Zones', selectedZones, setSelectedZones)}
          </div>
          <div className='analytics-options-div'>
            <h4>STALLS</h4>
            {renderStallSelection(getStallList(), 'Stalls', selectedStalls, setSelectedStalls)}
          </div>
          {accessibilityMenu == 'History' ? <div className='analytics-options-div'>
            <h4>TIME FRAME</h4>
            <div className="timeframe" style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Typography style={{ color: '#9C9FBB' }}>From</Typography>
                <DateTimePicker
                    onChange={(date) => {
                    if (date < endTimeAccessibility) {
                      setStartTimeAccessibility(date);
                    } else {
                      alert(`Must select a time lesser than ${endTimeAccessibility}`)
                    }}}
                    value={startTimeAccessibility}
                    minDate={new Date('01-01-2018')}
                    maxDate={new Date()  
                    }
                />
                <Typography style={{ color: '#9C9FBB' }}>To</Typography>
                <DateTimePicker
                  onChange={(date) => {
                  if (date > startTimeAccessibility) {
                    setEndTimeAccessibility(date);
                  } else {
                    alert(`Must select a time greater than ${startTimeAccessibility}`)
                  }}}
                  value={endTimeAccessibility}
                  minDate={new Date('01-01-2018')}
                  maxDate={new Date()}
                />
            </div>
          </div> : null}
    </>
  }

    return (
        <div className='analyticsView' style={{display: 'flex', alignItems: 'center'}}>
        <div className="queryItems">
          <div className='analytics-options-div'>
            <h4>DATA CATEGORY</h4>
            {renderForm(DATA_CATEGORY_OPTIONS, dataCategory, setDataCategory)}
          </div>
          {dataCategory == 'Parkade Occupancy' ? renderParkadeOccupancyOptions() : renderAccessibilityOptions()}
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
    );
};

export default AnalyticsViewTab;