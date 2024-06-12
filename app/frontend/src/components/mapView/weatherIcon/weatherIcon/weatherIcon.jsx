import './weatherIcon.css';
import { FaCloudMoon, FaCloudSun, FaCloudRain, FaCloudShowersHeavy, FaWind, FaSun, FaCloud, FaSmog, FaSnowflake, FaBolt } from 'react-icons/fa'; // Example with Font Awesome

const WeatherIcon = ({ currTime, temperature, condition, description }) => {
  let iconComponent;

  // Determine the icon based on time and condition
  if (currTime === 'day') {
    switch (condition) {
      case 'Clear':
        iconComponent = <FaSun className='weatherIconImg' />;
        break;
      case 'Clouds':
        iconComponent = <FaCloudSun className='weatherIconImg' />;
        break;
      case 'Drizzle':
        iconComponent = <FaCloudRain className='weatherIconImg' />;
        break;
      case 'Dust':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Fog':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Haze':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Mist':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Rain':
        iconComponent = <FaCloudShowersHeavy className='weatherIconImg' />;
        break;
      case 'Smoke':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Snow':
        iconComponent = <FaSnowflake className='weatherIconImg' />;
        break;
      case 'Thunderstorm':
        iconComponent = <FaBolt className='weatherIconImg' />;
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
      case 'Clouds':
        iconComponent = <FaCloudMoon className='weatherIconImg' />;
        break;
      case 'Drizzle':
        iconComponent = <FaCloudRain className='weatherIconImg' />;
        break;
      case 'Dust':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Fog':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Haze':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Mist':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Rain':
        iconComponent = <FaCloudShowersHeavy className='weatherIconImg' />;
        break;
      case 'Smoke':
        iconComponent = <FaSmog className='weatherIconImg' />;
        break;
      case 'Snow':
        iconComponent = <FaSnowflake className='weatherIconImg' />;
        break;
      case 'Thunderstorm':
        iconComponent = <FaBolt className='weatherIconImg' />;
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
      <div className='temperature'>{(temperature - 273.15).toFixed(1)}&deg;C</div>
      <div className='condition'>{description}</div>
    </div>
  );
}

export default WeatherIcon;
