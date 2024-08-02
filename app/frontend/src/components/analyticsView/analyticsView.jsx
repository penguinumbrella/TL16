
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

const MAX_OPTIONS = 5;

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

const renderSelectedZones = (selectedZones, setSelectedZones) => (
  selectedZones.map((item) => (
    <div style={{ width: "fit-content", height: "35px", backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 2% 5px 0", borderRadius: "5px",
      display: "flex", alignItems: 'center', padding: '5px'
    }} key={item}>
      <div style={{display: 'flex', alignItems: 'center', 'justifyContent': 'space-evenly'}}>
        {item}
        <BsXCircleFill className='cross' id={item} style={{marginLeft: '7px', }} onClick={(event) => {
          const el = event.target.tagName === 'svg' ? event.target : event.target.parentNode;
          const zone = el.id;
          const tempSelectedZones = [...selectedZones];
          tempSelectedZones.splice(tempSelectedZones.indexOf(zone), 1);
          setSelectedZones(tempSelectedZones);
        }} />
      </div>
    </div>
  ))
);

const renderZoneSelection = (data, label, selectedZones, setSelectedZones) => (
  <div style={{display:'flex', alignItems:'flex-start', flexWrap: 'wrap'}}>
    {renderSelectedZones(selectedZones, setSelectedZones)}
    <FormControl sx={{ width: "120px", height: '35px', backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 0", borderRadius: "5px"}}>
      <InputLabel>{'+ Select'}</InputLabel>
      <Select sx={{ color: "#9C9FBB" }} displayEmpty
        size="small"
        value=''
        renderValue={() => <p>{label}</p>}
      >
        {menuItems(data, '', (item) => {
          if (selectedZones.length >= MAX_OPTIONS && item !== 'All Zones') {
            alert('Maximum number of options selected. Unselect some or select All Zones');
          } else {
            if(selectedZones.indexOf(item) === -1) {
              if (item == 'All Zones')
                setSelectedZones(['All Zones'])
              else {
                const tempSelectedZones = [...selectedZones];
                tempSelectedZones.push(item);
                if (tempSelectedZones.indexOf('All Zones') != -1)
                  tempSelectedZones.splice(tempSelectedZones.indexOf('All Zones'), 1);
                setSelectedZones(tempSelectedZones);
              }
            }
          }
        }, true, selectedZones)}
      </Select>
    </FormControl>
  </div>
);

const renderSelectedStalls = (selectedStalls, setSelectedStalls) => (
  selectedStalls.map((item) => (
    <div style={{ width: "fit-content", height: "35px", backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 2% 5px 0", borderRadius: "5px",
      display: "flex", alignItems: 'center', padding: '5px'
    }} key={item}>
      <div style={{display: 'flex', alignItems: 'center', 'justifyContent': 'space-evenly'}}>
        {item}
        <BsXCircleFill className='cross' id={item} style={{marginLeft: '7px', }} onClick={(event) => {
          const el = event.target.tagName === 'svg' ? event.target : event.target.parentNode;
          const stall = el.id;
          const tempSelectedStalls = [...selectedStalls];
          tempSelectedStalls.splice(tempSelectedStalls.indexOf(stall), 1);
          setSelectedStalls(tempSelectedStalls);
        }} />
      </div>
    </div>
  ))
);

const renderStallSelection = (data, label, selectedStalls, setSelectedStalls) => (
  <div style={{display:'flex', alignItems:'flex-start', flexWrap: 'wrap'}}>
    {renderSelectedStalls(selectedStalls, setSelectedStalls)}
    <FormControl sx={{ width: "120px", height: '35px', backgroundColor: "#323551", color: "#9C9FBB", margin: "5px 0", borderRadius: "5px"}}>
      <InputLabel>{'+ Select'}</InputLabel>
      <Select sx={{ color: "#9C9FBB" }} displayEmpty
        size="small"
        value=''
        renderValue={() => <p>{label}</p>}
      >
        {menuItems(data, '', (item) => {
          if (selectedStalls.length >= MAX_OPTIONS && item !== 'All Stalls') {
            alert('Maximum number of options selected. Unselect some or select All Stalls');
          } else {
            if(selectedStalls.indexOf(item) === -1) {
              if (item == 'All Stalls')
                setSelectedStalls(['All Stalls'])
              else {
                const tempSelectedStalls = [...selectedStalls];
                tempSelectedStalls.push(item);
                if (tempSelectedStalls.indexOf('All Stalls') != -1)
                  tempSelectedStalls.splice(tempSelectedStalls.indexOf('All Stalls'), 1);
                setSelectedStalls(tempSelectedStalls);
              }
            }
          }
        }, true, selectedStalls)}
      </Select>
    </FormControl>
  </div>
);


const AnalyticsView = () => {  
  const tabs = [
    {
      title: 'REAL VALUES',
      content :
      <AnalyticsViewTab renderParkadeSelection = {renderParkadeSelection} menuItems={menuItems} renderStallSelection={renderStallSelection} renderZoneSelection={renderZoneSelection}/>
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
