const express = require("express");
const path = require("path");
const cors = require("cors");

//const timeSlider = require("routes")

const PORT = 8080;

const app = express();

app.use(cors());

app.use(express.static(path.resolve(__dirname, './frontend/build')));

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

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});