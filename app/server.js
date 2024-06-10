const express = require("express");
const path = require("path");
const cors = require("cors");

//const timeSlider = require("routes")
const fs = require('fs');

const PORT = 8080;

const app = express();

app.use(cors());

app.use(express.static(path.resolve(__dirname, './frontend/build')));
// app.use(express.static(path.resolve(__dirname, './frontend/public')));



app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });

  });

app.get('/weather', (req, res) => {
    const { time } = req.query;
  
    // Parse the time parameter
    const requestTime = new Date(time);
  
    // Dummy weather data - you should replace this with actual weather data logic
    const weatherData = {
      timeOfDay: requestTime.getHours() >= 6 && requestTime.getHours() < 18 ? 'day' : 'night',
      temperature: 25,
      condition: 'Partly Cloudy',
    };
  
    res.json(weatherData);
  });

  // Whenever the page is refreshed fetch data from the database
// Then update the json file "markerData.json"
app.get('/api/data', (req, res) => {
  fs.readFile('frontend/src/markerData.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
          return;
      }
      // console.log("data = ", data);
      res.json(data);
  });
});

const PERIODICITY_OPTIONS = [
  'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly' 
];

const AVG_PEAK = [
  'Average', 'Peak'
];

app.get('/parking/linegraph/:periodicity/:avgpeak', (req, res) => {
  const { periodicity, avgpeak } = req.params;
  const { startTime, endTime, ...parkadeOptions } = req.query;

  if (avgpeak = 'Average') {
    // query over average
  } else {
    // query over peak
  }

  switch(periodicity) {
    case 'Hourly':
      // query by hour
      break;
    case 'Daily':
      // query by day
      break;
    case 'Weekly':
      // query by week
      break;
    case 'Monthly':
      // query by month
      break;
    case 'Yearly':
      // query by year
      break;
    // Add cases for other periodicity options as needed
    default:
      res.status(400).send({ error: 'Invalid periodicity' });
      return;
  }

  // Extract all selected parkade options
  const selectedParkades = Object.keys(parkadeOptions);

  // Construct your query based on the received parameters
  const query = {
    periodicity,
    avgpeak,
    startTime,
    endTime,
    selectedParkades
  };

  // return a different query for each parkade

  // Your logic to handle the query and generate the line graph

  // Send back the response
  res.status(200).send({ message: 'Line graph generated successfully', query });
});

// more endpoints for other types of queries

app.get('/parking/barchart', (req, res) => {
  res.status(200).send({ message: 'barchart generated successfully', query });
});
app.get('/accessibility/linegraph', (req, res) => {
  res.status(200).send({ message: 'barchart generated successfully', query });
});
app.get('/accessibility/barchart', (req, res) => {
  res.status(200).send({ message: 'barchart generated successfully', query });
});

  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});