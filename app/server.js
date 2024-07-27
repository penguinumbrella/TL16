const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");

//const timeSlider = require("routes")
const fs = require('fs');
const csv = require('csv-parser');
const { spawn } = require('child_process');

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

const x_11_key = process.env.X_11_KEY;

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
  try {
    let query = req.query.query;
    console.log(query)
    const result = await executeQuery(query);
    console.log(result)
    res.json(result);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

        // If no data found for the specified time, provide a notification and return null values
        if (weatherData.length === 0) {
            console.log(`No weather data found for ${requestTime}`);
            return res.json({ 
                weather_main: null,
                weather_desc: null,
                temp: null,
                timeOfDay
            });
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



//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

// LGBM_short short term prediction 
app.get('/api/LGBM_short',  async (req, res) => {
  try{
    shortTermCutoff = '2024-06-13 12:00:00';

    // the qquery is a string of the parkades seperated by commas
    // convert it to an array of strings
    parkades_list = req.query.parkades.split(',');
    // console.log(parkades_list)

    // Set the return object's properties to the input parkades
    const returnObj = {};
    const returnValue = parkades_list.reduce((acc, curr) => {
      acc[curr] = []; 
      return acc;}, returnObj);
    
    // Read the saved prediction data from the CSV file
    const getCSVData = async (parkade)=>{
      return new Promise((resolve,reject) =>{
      
        filePath = `./LightGBM/predictions/${parkade}_predictions.csv`;

        // Temporary list for the rows
        let streamData = []

        // explained in more detail below
        let breakPoint = 0;

        const dataStream = fs.createReadStream(filePath)

        dataStream.on("close", async (err) => {
          // Remove the unneseccery data (explained in more detail below)
          resolve(streamData.slice(0,breakPoint));          
        })

        dataStream.pipe(csv())
        .on('data',  async (row) => {

          // Each row has 2 properties: Timestamp and Occupancy
          // rename them to 'name' and 'value' so that they can 
          // work with the diagrams
          const newRow = {
            ["name"]: row.Timestamp,
            ["value"]: parseInt(row.Occupancy, 10)
          };
          
          // Add the new row to the temporary list
          streamData.push(newRow);

          // If wereach the cutoff date close the stream
          // breakpoint will represent the length of the array
          // it is needed because dataStream does not read one row at
          // a time instead it reads chunks of data so to prevent adding
          // any unneseccary values we save the length as breakpoint
          if(row.Timestamp === shortTermCutoff && breakPoint == 0){
            breakPoint = streamData.length;
            dataStream.destroy();
          } 
        })

        // this event is only called when the entire file is read
        .on('end', () => {
          console.log('Data length:', streamData.length);
        })
        .on('error', (error) => {
          console.error('Error:', error.message);
          res.status(500).json({ error: 'Internal server error' });
        });
      })
    }

    // Build up the returnValue with the arrays that we got 
    // from the csv 
    for (const parkade of parkades_list){
      returnValue[parkade] = await getCSVData(parkade);
    }
    
    res.json(returnObj);

  }catch(e){
    console.log("Error in LGBM_short");
    res.status(500).json({ error: 'Internal server error' });
  }
  
});

//---------------------------------------------

// Prediction for the long term because there were some missing dates in the lgbm file
app.get('/api/baseline_predict', (req, res) => {
  try{ 
    // the qquery is a string of the parkades seperated by commas
    // convert it to an array of strings
    parkades_list = req.query.parkades.split(',');

    // Run the python script for the baseline model and pass it the date and the parkades
    const pythonProcess = spawn('python', [`Baseline/src/baseline_predict.py`, req.query.date, parkades_list]);
    pythonProcess.stdout.on('data', (data) => {
      try{
        // Return the output of the process
        const outputJSON = JSON.parse(data);
        res.json(outputJSON);

      }catch(e){
        console.error(`Error executing Python script: ${data}`);
        res.status(500).json({ e: 'Internal server error' });
        return;
      }
      
    });
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error executing Python script: ${data}`);
        res.status(500).json({ error: 'Internal server error' });
        return;
    });
    pythonProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

  }catch(e){
    console.log(e);
    console.log("Error in baseline_predict");
    res.status(500).json({ error: 'Internal server error' });

  }
});
//---------------------------------------------


app.get('/api/maps_key', (req, res) => {

  res.json({map_key :  process.env.REACT_APP_MAPS_KEY})
});

//---------------------------------------------

// This is for getting the accessibility stalls' status and time stamp
app.get('/api/elevenX',  async (req, res) => {
  try{
    const getCSVData = async ()=>{
      return new Promise((resolve,reject) =>{
      
        filePath = `./x_11/stalls_data.csv`;

        // Temporary array to hold the data
        let streamData = []
        const dataStream = fs.createReadStream(filePath)

        dataStream.pipe(csv())
        .on('data',  async (row) => {

          // Instantiate a new object containing only the neccessary properties
          const newRow = {
            ["stall_name"]: row.stall_name,
            ["status"]: row.status,
            ["payload_timestamp"] : row.payload_timestamp
          }
          
          // Add the new row 
          streamData.push(newRow);
        })

        // Once the entire file was read return the data
        .on('end', () => {
          console.log('Data length:', streamData.length);
          resolve(streamData); 
        })
        .on('error', (error) => {
          console.error('Error:', error.message);
          res.status(500).json({ error: 'Internal server error' });
        });
      })

    }
    
    const returnValue = await getCSVData();
    res.json(returnValue);

  }catch(e){
    console.log("Error in LGBM_short");
    res.status(500).json({ error: 'Internal server error' });
  }
  
});

//-------------------------------------------------------------------------------

const get_elevenX = ()=>{
  try{
    // Run the elevenX script which will update the csv file
    const pythonProcess = spawn('python', [`x_11/get_stalls_data.py`, x_11_key], {
      stdio: ['ignore', 'inherit', 'inherit'] // Ignore stdin, inherit stdout and stderr
    });
    pythonProcess.on('exit', () => {
      try{
        console.log("Stalls data updataed")

      }catch(e){
        console.error(`Error executing Python get_stalls_data.py`);
        console.log(e);
      }
      
    });

  }catch(e){
    console.log(e)
    
  }
}





const elevenX_update_acc_stalls = ()=>{
  try{
    // Run the elevenX script which will update the csv file
    const pythonProcess = spawn('python', [`x_11/elevenX_update_acc_stalls.py`, x_11_key], {
      stdio: ['ignore', 'ignore', 'inherit'] // Ignore stdin, inherit stdout and stderr
    });
    pythonProcess.on('exit', () => {
      try{
        console.log("---nice---")

      }catch(e){
        console.error(`Error executing Python startup.py`);
        console.log(e);
      }
      
    });

  }catch(e){
    console.log(e)
    
  }
}


app.get('/api/update_acc_stalls',  async (req, res) => {
  try{
    elevenX_update_acc_stalls();
  }catch(e){
    console.log("Error in update_acc_stalls")
    console.log(e)
    
  }
})

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  
  // Update the accessibilty data every 10 minutes
  setInterval(get_elevenX, 1000 * 60 * 10);
});