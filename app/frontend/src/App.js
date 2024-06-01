import { useEffect } from 'react';
import logo from './logo.svg';
// import './App.css';
import Map from './Map.js';

const UBC_lat = 49.262141;
const UBC_lng = -123.247360;

function App() {
  const center = { lat: UBC_lat, lng: UBC_lng }; 
  const zoom = 14;

  useEffect( () => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api');
        console.log(await res.json());
      } catch (err) {
        console.log("Frontend Only")
      }
    };
  fetchData();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo}  className="App-logo" alt="logo" /> */}
        <div>
      <Map center={center} zoom={zoom}/>
    </div>
      </header>
    </div>
  );
}

export default App;
