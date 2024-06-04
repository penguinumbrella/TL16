const express = require("express");
const path = require("path");

const timeSlider = require("routes")

const PORT = 8080;

const app = express();

app.use(express.static(path.resolve(__dirname, './frontend/build')));

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});