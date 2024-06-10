import React, { useState } from "react";
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

import Diagram from "../diagrams/Diagram";

const DATA_CATEGORY_OPTIONS = [
  'Parkade Occupancy', 'Accessibility Occupancy'
];

const VISUALIZATION_OPTIONS = [
  'Line Graph', 'Bar Graph'
];

const PERIODICITY_OPTIONS = [
  'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly' 
];

const AVG_PEAK = [
  'Average', 'Peak'
];

const PARKADE_OPTIONS = [
  'Thunderbird', 'North', 'West', 'Health Sciences', 'Fraser River', 'Rose Garden'
];

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

const renderForm = (data, value, setValue) => (
  <FormControl sx={{ width: "300px", backgroundColor: "#323551", color: "#9C9FBB", margin: "10px 0", borderRadius: "5px"}}>
    <Select sx={{ color: "#9C9FBB" }}
      size="small"
      value={value}
    >
      {menuItems(data, value, setValue)}
    </Select>
  </FormControl>
);

const renderSelectedParkades = (selectedParkades, setSelectedParkades, setChecked) => (
  selectedParkades.map((item) => (
    <div style={{ width: "fit-content", height: "30px", backgroundColor: "#323551", color: "#9C9FBB", margin: "10px 2% 10px 0", borderRadius: "5px",
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
  <div style={{display:'flex', alignItems:'flex-start'}}>
    {renderSelectedParkades(selectedParkades, setSelectedParkades, setChecked)}
    <FormControl sx={{ width: "120px", backgroundColor: "#323551", color: "#9C9FBB", margin: "10px 0", borderRadius: "5px"}}>
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
  const [queryView, setQueryView] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const handleGenerateClick = async () => {
    // Check if any required field is empty or missing
    if (!dataCategory || !visualizationFormat || !periodicity || !avgPeak || selectedParkades.length === 0) {
      // If any required field is missing, don't generate anything
      alert('Please fill out all required fields');
      return;
    }

    try {
      setLoading(true); // Set loading state to true
      const PORT = 8080;
      
      const response = await axios.get(`http://localhost:${PORT}/parking/linegraph/${periodicity}/${avgPeak}`, {
        params: {
          startTime: startTime,
          endTime: endTime,
          ...selectedParkades.reduce((acc, parkade) => ({ ...acc, [parkade]: true }), {})
        }
      });
      
      //alert('Report generated successfully');
      console.log(response);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false); // Set loading state to false when done
      setQueryView(false); // Set queryView to false regardless of success or failure
    }
  };

  const handleReturn = () => {
    // Set queryView to false
    setQueryView(true);
  };


  return queryView ? (
    <div className='analyticsView'>
      <div className='analytics-options-div'>
        <h3>DATA CATEGORY</h3>
        {renderForm(DATA_CATEGORY_OPTIONS, dataCategory, setDataCategory)}
      </div>
      <div className='analytics-options-div'>
        <h3>VISUALIZATION FORMAT</h3>
        {renderForm(VISUALIZATION_OPTIONS, visualizationFormat, setVisualizationFormat)}
      </div>
      <div className='analytics-options-div'>
        <h3>TIME FRAME</h3>
        <div className="timeframe" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography style={{ color: '#9C9FBB' }}>FROM</Typography>
          <DateTimePicker onChange={setStartTime} value={startTime} />
          <Typography style={{ color: '#9C9FBB' }}>TO</Typography>
          <DateTimePicker onChange={setEndTime} value={endTime} />
        </div>
      </div>


      <div className='analytics-options-div'>
        <div style={{display: 'flex', alignItems: 'flex-start'}}>
            <div style={{marginRight: '25%'}}>
              <h3>PERIODICITY</h3>
              {renderForm(PERIODICITY_OPTIONS, periodicity, setPeriodicity)}
            </div>
            <div>
              <h3>Average/Peak</h3>
              {renderForm(AVG_PEAK, avgPeak, setAvgPeak)}
            </div>
        </div>
      </div>
      <div className='analytics-options-div'>
        <h3>PARKADE OPTIONS</h3>
        <div style={{width: "15%", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Checkbox style={{color: '#323551'}} checked={selectAllChecked} onChange={handleSelectAllChange}></Checkbox>
          <h3>Select All</h3>
        </div>
        {renderParkadeSelection(PARKADE_OPTIONS, '+ Select', selectedParkades, setSelectedParkades, setSelectAllChecked)}
      </div>
      <div className='generate-button-div'>
        <Button variant="contained" color="primary" onClick={handleGenerateClick}>
          {loading ? 'Generating...' : 'Generate!'}
        </Button>
      </div>
      <div className='generate-checkbox-div'>
        <Checkbox style={{color: '#323551'}} checked={generateChecked} onChange={handleGenerateChange}></Checkbox>
        <Typography>Generate CSV</Typography>
      </div>
    </div>
  ) : (
    <div className='visualizationView'>
      <button onClick={handleReturn} style={{ position: 'absolute', top: '10px', left: '10px' }}>Return</button>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Diagram type={'LINE'} height={200} width={200} title="Occupancy" className="large-placeholder"/>
      </div>
    
    </div>
  );
}

export default AnalyticsView;
