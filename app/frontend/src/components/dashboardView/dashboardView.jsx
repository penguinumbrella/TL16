import './dashboardView.css';
import { FaUserCircle } from 'react-icons/fa'; // Importing an icon from react-icons
import mapImage from '../../icons/mapdashboard.png';
import liveImage from "../../icons/liveviewdashboard.svg";
import analyticsImage from "../../icons/analyticsviewdashboard.svg";

const DashboardView = ({ onIconClick, theme }) => {
  return (
    <div className='dashboardView'>
      <div className='headerContainer'>
        <div className='welcomeMessage'>WELCOME BACK, JOSE!</div>
        <div className='userInfo'>
          <FaUserCircle className='userIcon' />
          <span>JIMENEZ, JOSE</span>
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