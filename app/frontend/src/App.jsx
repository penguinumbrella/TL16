import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/searchBar';
import MapView from './components/mapView/mapView';
import DashboardView from './components/dashboardView/dashboardView';
import LiveView from './components/liveView/liveView';
import AnalyticsView from './components/analyticsView/analyticsView';

function App() {
  // Ensure the default theme is 'dark'
  const initialTheme = localStorage.getItem('theme') || 'dark';
  const [theme, setTheme] = useState(initialTheme);

  // State to track the active view
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' is the default view

  // Function to handle clicking on the icons
  const handleIconClick = (view) => {
    setActiveView(view); // Set the active view to the clicked view
  };

  const [map_key, setMap_key] = useState('');

  useEffect(() => {
    fetch('/api/maps_key')
      .then(response => response.json())
      .then(data => {
        setMap_key(data.map_key);
      })
      .catch(error => console.error('!!Key problem:', error));
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const setNewTheme = (newTheme) => {
    console.log(`Setting new theme: ${newTheme}`);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className={`container ${theme}`}>
      <SearchBar activeView={activeView} onIconClick={handleIconClick} theme={theme} setNewTheme={setNewTheme} />
      {/* Render appropriate view based on activeView state */}
      {activeView === 'map' ? <MapView theme={theme} map_key={map_key} activeView={activeView} /> : 
      activeView === 'dashboard' ? <DashboardView onIconClick={handleIconClick} theme={theme} /> :
      activeView === 'live' ? <LiveView theme={theme} /> :
      <AnalyticsView theme={theme} />}
    </div>
  );
}

export default App;
