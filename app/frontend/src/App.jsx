import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/searchBar';
import MapView from './components/mapView/mapView';
import DashboardView from './components/dashboardView/dashboardView';
import LiveView from './components/liveView/liveView';
import AnalyticsView from './components/analyticsView/analyticsView';
import { Amplify } from 'aws-amplify';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import LoginView from './components/loginView/loginView';

Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION,
      userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      allowGuestAccess: false
    }
  }
});

function App() {
  // Ensure the default theme is 'dark'
  const initialTheme = localStorage.getItem('theme') || 'dark';
  const [theme, setTheme] = useState(initialTheme);
  console.log(theme)

  // State to track the active view
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard'); // 'map' is the default view

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
      
  // Event listener for auth
  Hub.listen('auth', ({ payload }) => {
    switch(payload.event) {
      case 'signedIn':
        setIsSignedIn(true)
        break;
      case 'signedOut':
        setIsSignedIn(false)
        break;
    }
  });

  useEffect(() => {
    const checkSignedIn = async () => {
      try {
        await getCurrentUser();
        setIsSignedIn(true);
      } catch (e) {
        setIsSignedIn(false);
      }
    }
    checkSignedIn();
  }, []);

  return ( isSignedIn ?
    <div className="container">
      <SearchBar activeView={activeView} onIconClick={handleIconClick} />
      {/* Render appropriate view based on activeView state */}
      {activeView === 'map' ? <MapView /> : 
       activeView === 'dashboard' ? <DashboardView onIconClick={handleIconClick}/> :
       activeView === 'live' ? <LiveView /> :
       <AnalyticsView />}
    </div> : 
    <div className='container-login'>
        <LoginView></LoginView>
    </div>
  )  
}

export default App;
