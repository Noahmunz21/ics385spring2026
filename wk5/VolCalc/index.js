//jshint esversion:6

// create an express object from the express package
const express = require("express");
const bodyParser = require("body-parser");

// create an app object from the express object
const app = express();

// this allows the parsing of the html file using body parser
app.use(bodyParser.urlencoded({ extended: true }));

// this sends the html file to the web page using the root directory
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/VolCalculator.html");
});

// this code is only invoked on the path /VolCalc with a GET method
app.get("/VolCalc", function(req, res) {
  res.sendFile(__dirname + "/VolCalculator.html");
});

// invoked on the Calculate button submit
app.post("/VolCalc", function(req, res) {

  // converts the string input to a float number
  var radius = parseFloat(req.body.radius);
  var height = parseFloat(req.body.height);

  // calculates the volume using the formula pi * r^2 * h
  var volume = Math.PI * Math.pow(radius, 2) * height;

  // displays the result formatted to 2 decimal places
  res.send("The volume of the cylinder is " + volume.toFixed(2));

});

app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
