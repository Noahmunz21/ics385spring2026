//jshint esversion:6

// create an express object from the express package
const express = require("express");
const bodyParser = require("body-parser");

// create an app object from the express object
const app = express();
// this allows the parsing of the html file using body parser
app.use(bodyParser.urlencoded({extended: true}));

//this sends the html file to the web page using the root directory
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html")
});

// this gets the response from the values in the web page
app.post("/", function(req, res){

  var num1 = Number(req.body.n1);
  var num2 = Number(req.body.n2);

// does the computation of the input variables, as numbers
  var result = num1 * num2;

// sends the results back to the web page as string
  res.send("The result of the calculation is " + result);
})
//this gets the response from the web page to this placeholder

// this code is only invoked on the path /bmiCalculator
app.get("/bmiCalculator", function(req, res){
  res.sendFile(__dirname + "/bmiCalculator.html");
});

// invoked on the submit button
app.post("/bmiCalculator", function(req, res){

//converts the string input to a float number
  var weight = parseFloat(req.body.weight);
  var height = parseFloat(req.body.height);

// does the computation of the input variables, as numbers
  var bmi = weight / (height * weight);

//display the result in 2 decimal places
res.send("Your BMI is " + bmi.toFixed(2));

})

app.listen(3000, function() {
  console.log ("Server is running on port 3000")
});
