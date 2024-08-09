import React, { useState, useEffect } from 'react';
import Diagram from '../diagrams/Diagram.js';
import CustomTooltip from "./customToolTip.jsx";
import "./LongTermTab.css";
import { getAuthToken } from '../../getAuthToken.js';

const ShortTermTab = () => { 
  const [loading, setLoading] = useState(true);
  const [forecastResults, setForecastResults] = useState("");


  const TABLES = {
    'Fraser': 725,
    'North': 990,
    'West': 1232,
    'Health Sciences': 1189,
    'Thunderbird': 1634,
    'University Lot Blvd': 216,
    'Rose': 807,
  };
  // Fetch short-term forecast data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading state to true

        // Fetch short-term forecast results from the API
        const response = await fetch('/api/LGBM_shortterm_predict_csv', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Received data:', data);

        // Handle response data and display results
        setForecastResults(Object.keys(data).map((parkade) => (
          <Diagram
            key={parkade}
            type={'LINE'}
            height={'30%'}
            width={'90%'}
            title={parkade}
            dataOverride={data[parkade]}
            customToolTip={CustomTooltip}
            capacity= {TABLES[parkade]}
            dataKeyY="Vehicles"
            isShortTerm={true}
          />
        )));
      } catch (error) {
        console.error('Error fetching short-term forecast:', error);
        alert('Failed to generate report');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="forecastView">
      {loading ? <p>Loading...</p> : <div className="results">{forecastResults}</div>}
    </div>
  );
};

export default ShortTermTab;