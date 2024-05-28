import './weatherIcon.css';
import { FaCloudMoon} from 'react-icons/fa'; // Example with Font Awesome
import {Cloud} from 'react-icons/fa'; // Example with Font Awesome
import {FaSun, FaCloudSun, FaCloudRain, FaCloudShowersHeavy, FaWind} from 'react-icons/fa'; // Example with Font Awesome



const WeatherIcon = ({ currTime, temperature, condition }) => {
  let iconComponent;

  switch (currTime) {
    case 'day':
      iconComponent = <FaCloudRain className='weatherIconImg' />;
      break;
    case 'night':
      iconComponent = <FaCloudRain me='weatherIconImg' />;
      break;
    default:
      iconComponent = null;
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
