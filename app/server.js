const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");

//const timeSlider = require("routes")
const fs = require('fs');

const PORT = 8080;

const app = express();

const config = {
  "user": process.env.DB_USERNAME, // Database username
  "password": process.env.DB_PASSWORD, // Database password
  "server": process.env.DB_SERVER, // Server address
  "database": process.env.DB_NAME, // Database name
  "options": {
    trustServerCertificate: true
  }
}

const executeQuery = async (query) => {
  const result = await sql.query(query);
  return result.recordsets[0]; 
}

sql.connect(config, async err => {
  if (err) {
      throw err;
  }
  console.log("Connection Successful!");
});


app.use(cors());

app.use(express.static(path.resolve(__dirname, './frontend/build')));
// app.use(express.static(path.resolve(__dirname, './frontend/public')));



app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/executeQuery", async (req, res) => {
  let query = req.query.query;
  res.json(await executeQuery(query));
});

app.get("/executeQuery", async (req, res) => {
  let query = req.query.query;
  res.json(await executeQuery(query));
});

app.get('/weatherquery', (req, res) => {
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

  
  app.get('/weather', async (req, res) => {
    try {
        const { time } = req.query;

        // Parse the time parameter
        const requestTime = new Date(time);

        // Convert the requestTime to a Unix timestamp
        const unixTimestamp = Math.floor(requestTime.getTime() / 1000);

        // Determine if it's day or night
        const timeOfDay = requestTime.getHours() >= 6 && requestTime.getHours() < 18 ? 'day' : 'night';

        // Construct the SQL query
        let query = `
            SELECT [weather_main], [weather_desc], [temp]
            FROM [Parking].[dbo].[actual_weather]
            WHERE [dt] = ${unixTimestamp}
        `;

        // Execute the query
        const weatherData = await executeQuery(query);

        // If no data found for the specified time, return a not found response
        if (weatherData.length === 0) {
            return res.status(404).json({ error: 'No weather data found for the specified time' });
        }

        // Return the weather data
        res.json({ ...weatherData[0], timeOfDay });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});