import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  useEffect( () => {
    const fetchData = async () => {
      const res = await fetch('/api');
      console.log(await res.json());
    };
  fetchData();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
