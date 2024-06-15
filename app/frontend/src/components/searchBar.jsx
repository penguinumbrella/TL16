import React from 'react';
import { Divider, Icon } from '@chakra-ui/react';
import { FaHome, FaMap, FaChartPie, FaChartLine, FaCog, FaUserCircle } from 'react-icons/fa';
import './searchBar.css';

const SearchBar = ({ activeView, onIconClick }) => {
  const handleIconClick = (view, event) => {
    onIconClick(view);
  };

  const isIconActive = (icon) => activeView === icon; // Function to check if the icon is active

  const handleMouseEnter = (icon) => {
    setHoveredIcon(icon);
  };

  const handleMouseLeave = () => {
    setHoveredIcon(null);
  };

  return (
    <div className='searchBar'>
      <div className='blurredCircle1'></div> {/* Blurred Circle */}
      <div className='blurredCircle2'></div> {/* Blurred Circle */}
      {/* Your other content here */}

      <div className='topIcon'>
        <img src="./ubcdark.png" alt="" />
      </div>

      <Divider className='separator' />

      <div className='navIcons'>
        <div className='navicon-container'>
          <Icon
            as={FaHome}
            onClick={(event) => handleIconClick('dashboard', event)}
            color={isIconActive('dashboard') ? 'black' : '#9C9FBB'} // Change color based on active state
            className={isIconActive('dashboard') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('dashboard') ? {} : { display: 'none' }}></div>
          {hoveredIcon == 'dashboard' ? <div className="hover-text">Home</div> : ''}
        </div>
        
        <div className='navicon-container'>
          <Icon
            as={FaMap}
            onClick={(event) => handleIconClick('map', event)}
            color={isIconActive('map') ? 'black' : '#9C9FBB'} // Change color based on active state
            className={isIconActive('map') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('map') ? {} : { display: 'none' }}></div>
          {hoveredIcon == 'map' ? <div className="hover-text">Map</div> : ''}
        </div>
        
        <div className='navicon-container'>
          <Icon
            as={FaChartPie}
            onClick={(event) => handleIconClick('live', event)}
            color={isIconActive('live') ? 'black' : '#9C9FBB'} // Change color based on active state
            className={isIconActive('live') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('live') ? {} : { display: 'none' }}></div>
          {hoveredIcon == 'live' ? <div className="hover-text">Live</div> : ''}
        </div>
        
        <div className='navicon-container'>
          <Icon
            as={FaChartLine}
            onClick={(event) => handleIconClick('analytics', event)}
            color={isIconActive('analytics') ? 'black' : '#9C9FBB'}
            className={isIconActive('analytics') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('analytics') ? {} : { display: 'none' }}></div>
          {hoveredIcon == 'analytics' ? <div className="hover-text">Analytics</div> : ''}
        </div>
      </div>

      <div className='bottomIcons'>
        <Icon as={FaCog} />
        <Icon as={FaUserCircle} />
      </div>
    </div>
  );
};

export default SearchBar;
