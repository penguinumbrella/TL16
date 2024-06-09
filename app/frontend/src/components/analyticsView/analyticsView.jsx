import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Checkbox
} from "@mui/material";
import DateTimePicker from 'react-datetime-picker';
import { useEffect, useState } from "react";
import './analyticsView.css'
import { BsXCircleFill } from 'react-icons/bs';

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
    data = data.filter((item) => selected.indexOf(item) == -1)
  }
  return data.map((item, key) => {
    return (
      <MenuItem
      onClick={() => {
        setValue(item);
      }}
      style={{ display: "block" }}
      key={key}
      value={item}
      >
        <Typography>{item}</Typography>
      </MenuItem>
    )
  })
}

const renderForm = (data, value, setValue) => {
  return (
    <FormControl sx={{ width: "300px", backgroundColor: "#323551", color: "#9C9FBB", margin: "10px 0 10px 0", borderRadius: "5px"}}>
        <Select sx={{ color: "#9C9FBB" }}
          size="small"
          value={value}
        >
          {menuItems(data, value, setValue)}
        </Select>
      </FormControl>
  );
}

const renderSelectedParkades = (selectedParkades, setSelectedParkades, setChecked) => {
  return selectedParkades.map((item) => {
    return (
      <div style={{ width: "fit-content", height: "30px", backgroundColor: "#323551", color: "#9C9FBB", margin: "10px 2% 10px 0", borderRadius: "5px",
        display: "flex", alignItems: 'center', padding: '5px'
      }} key={item}>
        <div style={{display: 'flex', alignItems: 'center', 'justifyContent': 'space-evenly'}}>
          {item}
          <BsXCircleFill className='cross' id={item} style={{marginLeft: '7px', }} onClick={(event) => {
            const el = event.target.tagName == 'svg' ? event.target : event.target.parentNode;
            const parkade = el.id;
            const tempSelectedParkades = [...selectedParkades];
            tempSelectedParkades.splice(tempSelectedParkades.indexOf(parkade), 1);
            setSelectedParkades(tempSelectedParkades);
            setChecked(false);
          }}></BsXCircleFill>
        </div>
      </div>
    )
  })
}

const renderParkadeSelection = (data, label, selectedParkades, setSelectedParkades, setChecked) => {
  return (
  <div style={{display:'flex', alignItems:'flex-start'}}>
    {renderSelectedParkades(selectedParkades, setSelectedParkades, setChecked)}
    <FormControl sx={{ width: "120px", backgroundColor: "#323551", color: "#9C9FBB", margin: "10px 0 10px 0", borderRadius: "5px"}}>
        <InputLabel>{'+ Select'}</InputLabel>
        <Select sx={{ color: "#9C9FBB" }} displayEmpty
          size="small"
          value=''
          renderValue={() => {
              return <p>{label}</p>;
          }}
        >
          {menuItems(data, '', (item) => {
            if(selectedParkades.indexOf(item) == -1) {
              const tempSelectedParkades = [...selectedParkades];
              tempSelectedParkades.push(item);
              setSelectedParkades(tempSelectedParkades);
            }
          }, true, selectedParkades)}
        </Select>
      </FormControl>
  </div>
  );
}

const AnalyticsView = () => {
  const [dataCategory, setDataCategory] = useState(DATA_CATEGORY_OPTIONS[0]);
  const [visualizationFormat, setVisualizationFormat] = useState(VISUALIZATION_OPTIONS[0]);
  const [periodicity, setPeriodicity] = useState(PERIODICITY_OPTIONS[0]);
  const [avgPeak, setAvgPeak] = useState(AVG_PEAK[0]);
  const [selectedParkades, setSelectedParkades] = useState([])
  const [checked, setChecked] = useState(false);

  return (
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
          <Checkbox style={{color: '#323551'}} checked={checked} onChange={(event) => {
            const checked = event.target.checked;
            if (checked) {
              setChecked(checked);
              setSelectedParkades(PARKADE_OPTIONS);
            }
          }}></Checkbox>
          <h3>Select All</h3>
        </div>
        {renderParkadeSelection(PARKADE_OPTIONS, '+ Select', selectedParkades, setSelectedParkades, setChecked)}
      </div>
    </div>
  )
}

export default AnalyticsView