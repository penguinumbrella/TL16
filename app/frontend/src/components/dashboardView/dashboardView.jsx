import './dashboardView.css';
import { FaUserCircle } from 'react-icons/fa'; // Importing an icon from react-icons
import mapImage from '../../icons/mapdashboard.png';
import liveImage from "../../icons/liveviewdashboard.svg";
import analyticsImage from "../../icons/analyticsviewdashboard.svg";
import { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';


const DashboardView = ({ onIconClick, theme }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    const nameSetup = async () => {
      const attributes = await fetchUserAttributes();
      setName(attributes.name);
    }
    nameSetup();
  }, []);

  return (
    <div className='dashboardView'>
      <div className='headerContainer'>
        <div className='welcomeMessage'>{`WELCOME BACK, ${name.toUpperCase()}!`}</div>
        <div className='userInfo'>
          <FaUserCircle className='userIcon' />
          <span>{`${name.toUpperCase()}`}</span>
        </div>
      </div>
      <div className='viewsContainer'>
        <div className='topViews'>
          <div className='firstview' onClick={() => onIconClick('map')} theme={theme}>
            <span>Map View</span>
            <img src={mapImage} alt="Map View" className='viewImage'/>
          </div>
          <div className='secondview' onClick={() => onIconClick('live')} theme={theme}>
            <span>Live View</span>
            <img src={liveImage} alt="Live View" className='viewImage'/>
          </div>
        </div>
        <div className='bottomView'>
          <div className='thirdview' onClick={() => onIconClick('analytics')}>
            <span>Analytics View</span>
            <img src={analyticsImage} alt="Analytics View" className='viewImage'/>
          </div> 
        </div> 
      </div>
    </div>
  );
}


export default DashboardView;