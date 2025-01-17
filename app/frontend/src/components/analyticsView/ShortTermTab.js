import React, { useState, useEffect } from 'react';
import Diagram from '../diagrams/Diagram.js';
import CustomTooltip from "./customToolTip.jsx";
import { getAuthToken } from '../../getAuthToken.js';
import "./LongTermTab.css";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
          const lastDate = data[parkade][data[parkade].length - 1]?.name;
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
            <div className='graph'>
              <Diagram
                  key={parkade}
                  type={'LINE'}
                  height={'100%'} // Updated height for taller graphs
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
                  prediction_type="prediction"
              />
            </div>
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
    <div className="shortTermView">
      <div className="intro-section">
        <h2>Short-Term Parking Occupancy Predictions</h2>
        <p>Welcome to the parking occupancy predictions section. Here you will find the latest forecast data for various parkades. Scroll down to explore the detailed predictions for each location.</p>
      </div>

      <hr className="divider" />

      <div id="resultsSection" className="results">
        {loading ? <p>Loading...</p> : forecastResults}
      </div>
    </div>
  );
};

export default ShortTermTab;
