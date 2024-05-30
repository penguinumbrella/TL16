// import { useEffect } from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {

//   useEffect( () => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('/api');
//         console.log(await res.json());
//       } catch (err) {
//         console.log("Error fetching requested resource")
//       }
//     };
//   fetchData();
//   }, [])

//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import Map from './Map.js';



const App = () => {
  const center = { lat: 49.262141, lng: -123.247360 }; 
  const zoom = 14;

  return (
    <div>
      <Map center={center} zoom={zoom}/>
    </div>
  );
};



export default App;
