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

        setForecastResults(Object.keys(data).map((parkade) => {
          const lastDate = data[parkade][data[parkade].length - 1]?.name;  // Safely access the first element's name
          console.log(`last row name for ${parkade}:`, lastDate);

          let greenx1, greenx2, yellowx1, yellowx2, redx1, redx2;
          greenx2 = data[parkade][data[parkade].length - 1]?.name;
          const date_range_length = data[parkade].length;

          
          if (data[parkade].length < 168 - 24) {
            greenx1 = data[parkade][0]?.name;
          }
          else if (data[parkade].length < 168 - 4) {
            greenx1 = data[parkade][date_range_length-1-(24*6)]?.name;
            yellowx2 = data[parkade][date_range_length-1-(24*6)]?.name;
            yellowx1 = data[parkade][0]?.name;
          } else {
            redx1 = data[parkade][0]?.name;
            redx2 = data[parkade][date_range_length-1-(24*6)-20]?.name;
            yellowx1 = data[parkade][date_range_length-1-(24*6)-20]?.name;
            yellowx2 = data[parkade][date_range_length-1-(24*6)]?.name;
            greenx1 = data[parkade][date_range_length-1-(24*6)]?.name;
          }

          console.log(redx1, redx2, yellowx1, yellowx2, greenx1, greenx2);

          
      
          return (
              <Diagram
                  key={parkade}
                  type={'LINE'}
                  height={'30%'}
                  width={'90%'}
                  title={parkade}
                  dataOverride={data[parkade]}
                  customToolTip={CustomTooltip}
                  capacity={TABLES[parkade]}
                  dataKeyY="Vehicles"
                  redx1={redx1}
                  redx2={redx2}
                  yellowx1={yellowx1}
                  yellowx2={yellowx2}
                  greenx1={greenx1}
                  greenx2={greenx2}
              />
            );
        }));
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