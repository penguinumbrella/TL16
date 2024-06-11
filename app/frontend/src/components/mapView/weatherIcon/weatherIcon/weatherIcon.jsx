import './weatherIcon.css';
import { FaCloudMoon, FaCloudSun, FaCloudRain, FaCloudShowersHeavy, FaWind, FaSun, FaCloud } from 'react-icons/fa'; // Example with Font Awesome

const WeatherIcon = ({ currTime, temperature, condition }) => {
  let iconComponent;

  // Determine the icon based on time and condition
  if (currTime === 'day') {
    switch (condition) {
      case 'Sunny':
        iconComponent = <FaSun className='weatherIconImg' />;
        break;
      case 'Partly Cloudy':
        iconComponent = <FaCloudSun className='weatherIconImg' />;
        break;
      case 'Cloudy':
        iconComponent = <FaCloud className='weatherIconImg' />;
        break;
      case 'Rain':
        iconComponent = <FaCloudRain className='weatherIconImg' />;
        break;
      case 'Heavy Rain':
        iconComponent = <FaCloudShowersHeavy className='weatherIconImg' />;
        break;
      case 'Windy':
        iconComponent = <FaWind className='weatherIconImg' />;
        break;
      default:
        iconComponent = <FaCloudSun className='weatherIconImg' />; // Default to partly cloudy
        break;
    }
  } else if (currTime === 'night') {
    switch (condition) {
      case 'Clear':
        iconComponent = <FaCloudMoon className='weatherIconImg' />;
        break;
      case 'Partly Cloudy':
        iconComponent = <FaCloudMoon className='weatherIconImg' />;
        break;
      case 'Cloudy':
        iconComponent = <FaCloud className='weatherIconImg' />;
        break;
      case 'Rain':
        iconComponent = <FaCloudRain className='weatherIconImg' />;
        break;
      case 'Heavy Rain':
        iconComponent = <FaCloudShowersHeavy className='weatherIconImg' />;
        break;
      case 'Windy':
        iconComponent = <FaWind className='weatherIconImg' />;
        break;
      default:
        iconComponent = <FaCloudMoon className='weatherIconImg' />; // Default to clear night
        break;
    }
  }

  return (
    <div className='weatherIcon'>
      <div className='iconContainer'>
        {iconComponent}
      </div>
      <div className='temperature'>{temperature}&deg;C</div>
      <div className='condition'>{condition}</div>
    </div>
  );
}

export default WeatherIcon;
