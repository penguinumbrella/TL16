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
  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});