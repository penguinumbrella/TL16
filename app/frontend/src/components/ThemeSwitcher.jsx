import React, { useState, useEffect } from 'react';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const setNewTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const lightStyle = {
    fontSize: '0.75em',
    color: theme === 'light' ? 'black' : '#9C9FBB',
    fontWeight: theme === 'light' ? 'bold' : 'normal'
  };

  const darkStyle = {
    fontSize: '0.75em',
    color: theme === 'dark' ? 'white' : '#9C9FBB',
    fontWeight: theme === 'dark' ? 'bold' : 'normal'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5em', padding: '0.25em', boxSizing: 'border-box', width: '100%' }}>
      <span style={lightStyle} onClick={() => setNewTheme('light')}>Light</span>
      <span style={darkStyle} onClick={() => setNewTheme('dark')}>Dark</span>
    </div>
  );
};

export default ThemeSwitcher;
