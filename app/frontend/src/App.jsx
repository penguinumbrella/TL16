import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/searchBar';
import MapView from './components/mapView/mapView';
import DashboardView from './components/dashboardView/dashboardView';
import LiveView from './components/liveView/liveView';
import AnalyticsView from './components/analyticsView/analyticsView';

function App() {
  // State to track the active view
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' is the default view

  // Function to handle clicking on the icons
  const handleIconClick = (view) => {
    setActiveView(view); // Set the active view to the clicked view
  };

  // Ensure the default theme is 'dark'
  const initialTheme = localStorage.getItem('theme') || 'dark';
  const [theme, setTheme] = useState(initialTheme);

  const setNewTheme = (newTheme) => {
    console.log(`Setting new theme: ${newTheme}`);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className="container">
      <SearchBar activeView={activeView} onIconClick={handleIconClick} setNewTheme={setNewTheme} />
      {/* Render appropriate view based on activeView state */}
      {activeView === 'map' ? <MapView /> : 
      activeView === 'dashboard' ? <DashboardView onIconClick={handleIconClick}/> :
      activeView === 'live' ? <LiveView /> :
      <AnalyticsView />}
    </div>
  );
}

export default App;
