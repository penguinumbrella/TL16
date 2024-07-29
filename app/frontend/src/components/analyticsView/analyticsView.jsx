
import React, { useState, useEffect } from "react";
import { BsXCircleFill } from 'react-icons/bs';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Checkbox,
  Button
} from "@mui/material";

import Tabs from '../tabComponent/Tabs.js';
import ForecastTab from './NewForecastTab.js';
import AnalyticsViewTab from './AnalyticsViewTab.js';

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
  const tabs = [
    {
      title: 'REAL VALUES',
      content :
      <AnalyticsViewTab renderParkadeSelection = {renderParkadeSelection} menuItems={menuItems}/>
    },{
      title: 'FORECAST',
      content: 
      <ForecastTab renderParkadeSelection = {renderParkadeSelection}/>
    }];


  return (
      <div className='fullView' >
          <Tabs tabs={tabs} />
      </div>
    )
}

export default AnalyticsView;
