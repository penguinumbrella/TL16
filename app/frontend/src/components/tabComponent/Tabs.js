import React, { useState, useEffect } from 'react';
import './Tabs.css';


function updateCSSVariables(varName, primaryColor) {
  document.documentElement.style.setProperty(varName, primaryColor);
}

const theme_vars =[
  '--tab-buttons_button',
  '--tab-buttons_button_hover',
  '--tab-buttons_button_active'
]

const theme_colors ={
  'dark' : ['aliceblue','#dddcdc','#a3a3a3'],
  'light': ['black','#605e5e','#3e3a3a'],
}

const Tabs = ({ tabs, theme }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  useEffect(()=>{
    if(theme){
      for(let i = 0; i < theme_vars.length; i++)
        updateCSSVariables(theme_vars[i],theme_colors[theme][i]);
  }
  },[theme]);

  return (
    <div className="tabs">
      <div className="tab-buttons">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={index === activeTab ? 'active' : ''}
          >
            <h4>{tab.title}</h4>
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;
