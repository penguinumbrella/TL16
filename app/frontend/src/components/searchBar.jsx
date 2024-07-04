import React from 'react';
import { Divider, Icon } from '@chakra-ui/react';
import { FaHome, FaMap, FaChartPie, FaChartLine, FaCog, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './searchBar.css';
import { signOut } from 'aws-amplify/auth';
import { getAuthToken } from '../getAuthToken';

const SearchBar = ({ activeView, onIconClick }) => {
  const handleIconClick = (view, event) => {
    onIconClick(view);
  };
  
  const handleLogout = async (event) => {
    console.log('Signing out!')
    await signOut();
  }

  const isIconActive = (icon) => activeView === icon; // Function to check if the icon is active

  return (
    <div className='searchBar'>
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
        </div>
        
        <div className='navicon-container'>
          <Icon
            as={FaMap}
            onClick={(event) => handleIconClick('map', event)}
            color={isIconActive('map') ? 'black' : '#9C9FBB'} // Change color based on active state
            className={isIconActive('map') ? 'icon' : ''}
          />
          <div className="circle" style={isIconActive('map') ? {} : { display: 'none' }}></div>
        </div>
        
        <div className='navicon-container'>
          <Icon
            as={FaChartPie}
            onClick={(event) => handleIconClick('live', event)}
            color={isIconActive('live') ? 'black' : '#9C9FBB'} // Change color based on active state
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

      <div className='bottomIcons'>
        <Icon as={FaCog} />
        <Icon as={FaUserCircle} onClick={async () => console.log(await getAuthToken())}/>
        <Icon as={FaSignOutAlt} onClick={handleLogout}></Icon>
      </div>
    </div>
  );
};

export default SearchBar;