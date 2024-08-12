const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require('dotenv');
const axios = require("axios");
dotenv.config();

const { parse } = require('json2csv');
const cors = require("cors");

//const timeSlider = require("routes")
const fs = require('fs');
const csv = require('csv-parser');
const { spawn } = require('child_process');
const { exec } = require('child_process');

const PORT = 8080;

const app = express();
app.use(express.json());

const config = {
  "user": process.env.DB_USERNAME, // Database username
  "password": process.env.DB_PASSWORD, // Database password
  "server": process.env.DB_SERVER, // Server address
  "database": process.env.DB_NAME, // Database name
  "options": {
    trustServerCertificate: true
  },
  // Your Cognito User Pool ID and Region
  "cognitoPoolId": process.env.USER_POOL_ID,
  "region": process.env.REGION
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

const COGNITO_URL = `https://cognito-idp.${config['region']}.amazonaws.com/${config['cognitoPoolId']}`;

const authentication = async (req, res, next) => {
  try {
      const accessToken = req.headers.authorization.split(" ")[1];

      const { data } = await axios.post(
          COGNITO_URL,
          {
              AccessToken: accessToken
          },
          {
              headers: {
                  "Content-Type": "application/x-amz-json-1.1",
                  "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser"
              }
          }
      )

      req.user = data;
      next();
  } catch (error) {
      console.log(error);
      return res.status(401).json({
          message: 'Unauthorized'
      });
  }
};

//app.use(authentication);

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


app.get('/api/get_slider_data', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log(`Received request for date range: ${startDate} to ${endDate}`);

    const startTimestamp = new Date(startDate);
    const endTimestamp = new Date(endDate);

    const startTimestampUnix = Math.floor(startTimestamp.getTime() / 1000);
    const endTimestampUnix = Math.floor(endTimestamp.getTime() / 1000);

    console.log(`Converted to Unix timestamps: start = ${startTimestampUnix}, end = ${endTimestampUnix}`);

    const tables = {
      'dbo.NorthParkade_Occupancy': 'North',
      'dbo.WestParkade_Occupancy': 'West',
      'dbo.RoseGardenParkade_Occupancy': 'Rose',
      'dbo.HealthSciencesParkade_Occupancy': 'Health Sciences',
      'dbo.FraserParkade_Occupancy': 'Fraser',
      'dbo.ThunderbirdParkade_Occupancy': 'Thunderbird',
      'dbo.UnivWstBlvdParkade_Occupancy': 'University Lot Blvd'
    };

    const allParkadeData = [];
    const parkadeNames = Object.values(tables);
    const parkadeKeys = Object.keys(tables);

    for (const [table, parkade] of Object.entries(tables)) {
      const query = `
        WITH HourlyData AS (
            SELECT 
                DATEADD(hour, DATEDIFF(hour, 0, DATEADD(SECOND, [TimestampUnix], '1970-01-01')), 0) AS HourStart,
                MAX([TimestampUnix]) AS MaxTimestamp
            FROM ${table}
            WHERE [TimestampUnix] BETWEEN ${startTimestampUnix} AND ${endTimestampUnix}
            GROUP BY DATEADD(hour, DATEDIFF(hour, 0, DATEADD(SECOND, [TimestampUnix], '1970-01-01')), 0)
        )
        SELECT 
          t.[TimestampUnix],
          t.[Vehicles],
          '${parkade}' AS Parkade
        FROM 
            HourlyData h
        JOIN 
            ${table} t ON t.[TimestampUnix] = h.MaxTimestamp
        ORDER BY 
            h.HourStart ASC
      `;

      console.log(`Querying table: ${table} for parkade: ${parkade}`);

      const parkadeData = await executeQuery(query);
      allParkadeData.push(...parkadeData);

      console.log(`Fetched ${parkadeData.length} records for ${parkade}`);
    }

    // Transform data for CSV
    const combinedData = {};
    parkadeNames.forEach(name => {
      combinedData[name] = [];
    });

    allParkadeData.forEach(record => {
      const { TimestampUnix, Vehicles, Parkade } = record;
      if (!combinedData[TimestampUnix]) {
        combinedData[TimestampUnix] = { TimestampUnix };
        parkadeNames.forEach(name => {
          combinedData[TimestampUnix][name] = 0; // Initialize all parkades with 0
        });
      }
      combinedData[TimestampUnix][Parkade] = Vehicles;
    });

    // Convert combinedData into CSV format
    const csvHeader = ['TimestampUnix', ...parkadeNames];
    const csvRows = Object.values(combinedData).map(row => 
      csvHeader.map(header => row[header] || 0)
    );
    
    const csvString = [csvHeader, ...csvRows].map(row => row.join(',')).join('\n');

    // Save the combined CSV
    fs.writeFileSync('sliderData/combined_vehicle_data.csv', csvString);
    console.log('Saved combined vehicle data to combined_vehicle_data.csv');

    const weatherQuery = `
      SELECT [dt], [weather_main], [weather_desc], [temp]
      FROM [Parking].[dbo].[actual_weather]
      WHERE [dt] BETWEEN ${startTimestampUnix} AND ${endTimestampUnix}
    `;

    const weatherData = await executeQuery(weatherQuery);

    console.log(`Fetched ${weatherData.length} weather records`);

    if (weatherData.length > 0) {
      const weatherCsv = parse(weatherData);
      fs.writeFileSync('sliderData/weather_data.csv', weatherCsv);
      console.log('Saved weather data to weather_data.csv');
    } else {
      console.log('No weather data found for the specified date range.');
    }

    res.json({
      message: 'Data successfully saved',
      weatherData,
      vehicleData: combinedData
    });
    console.log('Successfully sent response with weather and vehicle data');
  } catch (error) {
    console.error('Error fetching slider data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/get_parkade_occupancies', async (req, res) => {
  try {
    const { timestamp } = req.query;

    if (!timestamp) {
      return res.status(400).json({ error: 'Timestamp query parameter is required.' });
    }

    const timestampUnix = Math.floor(new Date(timestamp).getTime() / 1000);

    console.log(`Received request for timestamp: ${timestamp}, Unix timestamp: ${timestampUnix}`);

    const tables = {
      'dbo.NorthParkade_Occupancy': 'North',
      'dbo.WestParkade_Occupancy': 'West',
      'dbo.RoseGardenParkade_Occupancy': 'Rose',
      'dbo.HealthSciencesParkade_Occupancy': 'Health Sciences',
      'dbo.FraserParkade_Occupancy': 'Fraser',
      'dbo.ThunderbirdParkade_Occupancy': 'Thunderbird',
      'dbo.UnivWstBlvdParkade_Occupancy': 'University Lot Blvd'
    };

    const queries = Object.entries(tables).map(([table, parkade]) => {
      return executeQuery(`
        SELECT [Vehicles]
        FROM ${table}
        WHERE [TimestampUnix] = ${timestampUnix}
      `).then(data => {
        return {
          parkade,
          data: data.length > 0 ? data[0] : { Vehicles: 0 } // Default to 0 if no data found
        };
      });
    });

    const resultsArray = await Promise.all(queries);

    const results = resultsArray.reduce((acc, { parkade, data }) => {
      acc[parkade] = data;
      return acc;
    }, {});

    console.log('Fetched data:', results);

    res.json(results);
    console.log('Successfully sent response with parkade occupancies');

  } catch (error) {
    console.error('Error fetching parkade occupancies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Helper function to validate timestamp
const isValidTimestamp = (timestamp) => {
  return !isNaN(parseInt(timestamp, 10)) && parseInt(timestamp, 10) > 0;
};

// Convert timestamp to Unix timestamp (if needed)
const toUnixTimestamp = (timestamp) => {
  // Check if the timestamp is an ISO 8601 string
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    const date = new Date(timestamp);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid ISO 8601 timestamp format');
    }
    
    // Convert to Unix timestamp in seconds
    return Math.floor(date.getTime() / 1000);
  }

  // Convert timestamp to a number
  const parsedTimestamp = Number(timestamp);

  // Check if the timestamp is a valid number
  if (isNaN(parsedTimestamp)) {
    throw new Error('Invalid timestamp format');
  }

  // Check if the timestamp is in milliseconds (length > 10 digits)
  // Convert milliseconds to seconds if needed
  return parsedTimestamp.toString().length > 10 
    ? Math.floor(parsedTimestamp / 1000) 
    : parsedTimestamp;
};


// Endpoint to get data from CSV based on timestamp
app.get('api/weatherpoint', (req, res) => {
  const timestamp = req.query.timestamp;

  if (!isValidTimestamp(timestamp)) {
    return res.status(400).json({ error: 'Invalid or missing timestamp query parameter.' });
  }

  const unixTimestamp = toUnixTimestamp(timestamp);
  const csvFilePath = path.join(__dirname, 'weather_data.csv'); // Path to your CSV file
  const results = [];

  console.log(`Searching for timestamp: ${unixTimestamp}`);

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      const csvTimestamp = parseInt(data.dt, 10);
      if (csvTimestamp === unixTimestamp) {
        results.push(data);
      }
    })
    .on('end', () => {
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: 'No data found for the given timestamp.' });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
            ["Vehicle"]: parseInt(row.Occupancy, 10)
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

// Long term prediction
app.post('/api/LGBM_longterm_predict', (req, res) => {
  const { startDate, endDate, parkades } = req.body;

  if (!startDate || !endDate || !parkades || !Array.isArray(parkades) || parkades.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const results = {};

  const processParkade = (parkade) => {
    return new Promise((resolve, reject) => {
      // Construct the command to run the Python script
      const scriptPath = path.join(__dirname, 'LightGBM', 'longterm', 'predict.py');
      const command = `python "${scriptPath}" "${startDate}" "${endDate}" "${parkade}"`;

      console.log(`Running command for parkade ${parkade}: ${command}`);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error for ${parkade}: ${error}`);
          return reject(error);
        }

        if (stderr) {
          console.error(`stderr for ${parkade}: ${stderr}`);
          return reject(new Error(stderr));
        }

        console.log(`stdout for ${parkade}: ${stdout}`);

        // Determine the output CSV file path
        const csvFilePath = path.join(__dirname, 'LightGBM', 'longterm', 'predictions', `${parkade}.csv`);

        if (!fs.existsSync(csvFilePath)) {
          return reject(new Error('CSV file not found'));
        }

        const parkadeResults = [];

        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (data) => {
            // Push each row to parkadeResults
            
            if (data.Vehicle) {
              data.Vehicle = parseInt(data.Vehicle, 10);
            }
            parkadeResults.push(data);
          })
          .on('end', () => {
            // Resolve the promise with the results for this parkade
            results[parkade] = parkadeResults;
            resolve();
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    });
  };

  // Process each parkade sequentially
  Promise.all(parkades.map(processParkade))
    .then(() => {
      res.status(200).json(
        results);
    })
    .catch((error) => {
      console.error('Error processing parkades:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/api/LGBM_shortterm_predict', (req, res) => {
  const results = {};
  
  // Define parkades within the route handler
  const parkades = ['North', 'West', 'Rose', 'Health Sciences', 'Fraser', 'Thunderbird', 'University Lot Blvd'];
  let missingDataFlag = false;
  // Function to process each parkade
  const processParkade = (parkade) => {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'LightGBM', 'shortterm', 'predict.py');
      const command = `python "${scriptPath}" "${parkade}"`;

      console.log(`Running command for parkade ${parkade}: ${command}`);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error for ${parkade}: ${error}`);
          return reject(error);
        }

        if (stderr) {
          console.error(`stderr for ${parkade}: ${stderr}`);
          return reject(new Error(stderr));
        }

        console.log(`stdout for ${parkade}: ${stdout}`);

        const missingDataMatch = stdout.match(/missing_data: (true|false)/);
        const missingData = missingDataMatch ? missingDataMatch[1] === 'true' : false;
        missingDataFlag = missingData;

        const csvFilePath = path.join(__dirname, 'LightGBM', 'shortterm', 'predictions', `${parkade}.csv`);

        if (!fs.existsSync(csvFilePath)) {
          return reject(new Error('CSV file not found'));
        }

        const parkadeResults = [];

        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (data) => {
            if (data.Vehicle) {
              data.Vehicle = parseInt(data.Vehicle, 10);
            }
            parkadeResults.push(data);
          })
          .on('end', () => {
            results[parkade] = parkadeResults;
            resolve();
          })
          .on('error', (err) => {
            reject(err);
          });
      });
    });
  };

  // Process all parkades
  Promise.all(parkades.map(processParkade))
    .then(() => {
      res.status(200).json(results);
    })
    .catch((error) => {
      console.error('Error processing parkades:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/api/LGBM_shortterm_predict_csv', (req, res) => {
  const results = {};

  // Define parkades
  const parkades = ['North', 'West', 'Rose', 'Health Sciences', 'Fraser', 'Thunderbird', 'University Lot Blvd'];
  let missingDataFlag = false;

  // Function to process each parkade
  const processParkade = (parkade) => {
    return new Promise((resolve, reject) => {
      const csvFilePath = path.join(__dirname, 'LightGBM', 'shortterm', 'predictions', `${parkade}.csv`);

      if (!fs.existsSync(csvFilePath)) {
        return reject(new Error(`CSV file not found for parkade: ${parkade}`));
      }

      const parkadeResults = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.Vehicle) {
            data.Vehicle = parseInt(data.Vehicle, 10);
          }
          parkadeResults.push(data);
        })
        .on('end', () => {
          results[parkade] = parkadeResults;
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  };

  // Process all parkades
  Promise.all(parkades.map(processParkade))
    .then(() => {
      res.status(200).json(results);
    })
    .catch((error) => {
      console.error('Error processing parkades:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


const runLGBMShortTermPredict = () => {
  const results = {};
  const scriptPath = path.join(__dirname, 'LightGBM', 'shortterm', 'predict.py');
  const command = `python "${scriptPath}"`;
  
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return reject(new Error(stderr));
      }

      console.log(`stdout: ${stdout}`);

      const missingDataMatch = stdout.match(/missing_data: (true|false)/);
      const missingDataFlag = missingDataMatch ? missingDataMatch[1] === 'true' : false;

      const parkades = ['North', 'West', 'Rose', 'Health Sciences', 'Fraser', 'Thunderbird', 'University Lot Blvd'];
      const readCsvPromises = parkades.map((parkade) => {
        const csvFilePath = path.join(__dirname, 'LightGBM', 'shortterm', 'predictions', `${parkade}.csv`);

        if (!fs.existsSync(csvFilePath)) {
          return Promise.reject(new Error(`CSV file for ${parkade} not found`));
        }

        return new Promise((resolve, reject) => {
          const parkadeResults = [];

          fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
              if (data.Vehicle) {
                data.Vehicle = parseInt(data.Vehicle, 10);
              }
              parkadeResults.push(data);
            })
            .on('end', () => {
              results[parkade] = parkadeResults;
              resolve();
            })
            .on('error', (err) => {
              reject(err);
            });
        });
      });

      Promise.all(readCsvPromises)
        .then(() => {
          console.log('LGBM short-term prediction completed successfully.');
          resolve(results);
        })
        .catch((err) => {
          console.error('Error reading CSV files:', err);
          reject(err);
        });
    });
  });
};



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

const views = ['map', 'dashboard', 'live', 'analytics'];
let currentView = 'dashboard';

app.get('/api/activeView', (req,res) =>{
  res.json({ currentView : currentView })
});

app.post('/api/activeView', (req,res) =>{
  console.log(req.query.view);
  currentView = req.query.view;
  res.json({ currentView : currentView })
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


//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);

  runLGBMShortTermPredict();
  // Update the accessibilty data every 10 minutes

  // Update the short term LGBM data every 30 minutes
  setInterval(() => {
    runLGBMShortTermPredict().catch((error) => console.error('Scheduled run error:', error));
  }, 60 * 1000 * 30); // 1000ms * 60s * 60m = 1 hour

  setInterval(get_elevenX, 1000 * 60 * 10);
  
  
});