import React from 'react';
import { Divider, Icon } from '@chakra-ui/react';
import { FaHome, FaMap, FaChartPie, FaChartLine, FaCog, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './searchBar.css';
import { signOut } from 'aws-amplify/auth';
import { getAuthToken } from '../getAuthToken';

const SearchBar = ({ activeView, onIconClick, theme, setNewTheme }) => {
  const handleIconClick = (view, event) => {
    onIconClick(view);
  };
  
  const handleLogout = async (event) => {
    console.log('Signing out!')
    await signOut();
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setNewTheme(newTheme);
  };

  const isIconActive = (icon) => activeView === icon;

  const logoSrc = theme === 'light' ? './ubclight.png' : './ubcdark.png';

  return (
    <div className={`searchBar ${theme}`}>
      <div className='blurredCircle1'></div>
      <div className='blurredCircle2'></div>
      <div className='topIcon'>
        <img src={logoSrc} alt="UBC logo" />
      </div>

      <div className='navIcons'>
        <div className='navicon-container'>
          <Icon
            as={FaHome}
            onClick={(event) => handleIconClick('dashboard', event)}
            color={isIconActive('dashboard') ? 'black' : '#9C9FBB'}
            className={isIconActive('dashboard') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('dashboard') ? {} : { display: 'none' }}></div>
        </div>
        <div className='navicon-container'>
          <Icon
            as={FaMap}
            onClick={(event) => handleIconClick('map', event)}
            color={isIconActive('map') ? 'black' : '#9C9FBB'}
            className={isIconActive('map') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('map') ? {} : { display: 'none' }}></div>
        </div>
        <div className='navicon-container'>
          <Icon
            as={FaChartPie}
            onClick={(event) => handleIconClick('live', event)}
            color={isIconActive('live') ? 'black' : '#9C9FBB'}
            className={isIconActive('live') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('live') ? {} : { display: 'none' }}></div>
        </div>
        <div className='navicon-container'>
          <Icon
            as={FaChartLine}
            onClick={(event) => handleIconClick('analytics', event)}
            color={isIconActive('analytics') ? 'black' : '#9C9FBB'}
            className={isIconActive('analytics') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('analytics') ? {} : { display: 'none' }}></div>
        </div>
      </div>

      <Divider className='separator' />

      <div className='bottomIcons'>
        <div className="theme-toggle" onClick={toggleTheme}>
          <span className={`theme-label theme-label-dark ${theme === 'dark' ? 'active' : ''}`}>Dark</span>
          <span className={`theme-label theme-label-light ${theme === 'light' ? 'active' : ''}`}>Light</span>
        </div>
        <Icon as={FaCog} className='chakra-icon' />
        <Icon as={FaUserCircle} className='chakra-icon' />
        <Icon as={FaSignOutAlt} onClick={handleLogout}></Icon>
      </div>
    </div>
  );
};

export default SearchBar;
