const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require('dotenv');
dotenv.config();

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




app.use(express.static(path.resolve(__dirname, './frontend/build')));

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/executeQuery", async (req, res) => {
  let query = req.query.query;
  res.json(await executeQuery(query));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});