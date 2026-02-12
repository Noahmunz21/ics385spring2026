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
  res.sendFile(__dirname + "/f2cCalc.html");
});

// this code is only invoked on the path /f2c with a GET method
app.get("/f2c", function(req, res) {
  res.sendFile(__dirname + "/f2cCalc.html");
});

// invoked on the Convert button submit
app.post("/f2c", function(req, res) {

  // converts the string input to an integer
  var fTemp = parseInt(req.body.ftemp);

  // applies the F to C conversion formula: (F - 32) x 5/9 = C
  var cTemp = (fTemp - 32) * 5 / 9;

  // displays the result as an integer
  res.send("The converted temperature is " + Math.round(cTemp) + " degrees Centigrade");

});

app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
