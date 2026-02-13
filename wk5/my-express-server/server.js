console.log("Hello CodeSandbox");
//jshint esversion:6

const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) =>
  res.send(
    "Hello World! This is the main page - URL displayed by Code Sandbox!"
  )
);

app.get("/contact", (req, res) => res.send("This is the contact page!"));

app.get("/news", (req, res) => res.send("This is the news page!"));

app.get("/about", function (req, res) {
  res.send("This is a the bio page!");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
