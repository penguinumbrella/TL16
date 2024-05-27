import { useEffect } from 'react';
import './App.css';
import Diagram from './components/diagrams/Diagram';

function App() {


  useEffect( () => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api');
        console.log(await res.json());
      } catch (err) {
        console.log("Error fetching requested resource")
      }
    };
  fetchData();
  }, [])

  return (
    <div className="App">
      <Diagram type='PIE'></Diagram>
      <Diagram type='LINE'></Diagram>
    </div>
  );
}

export default App;
