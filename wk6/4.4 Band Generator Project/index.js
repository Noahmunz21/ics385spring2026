import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

//Step 3 - Make the styling show up.
//Hint 1: CSS files are static files!
//Hint 2: The header and footer are partials.
//Hint 3: Add the CSS link in header.ejs

//Step 4 - Add a dynamic year to the footer.
//Hint: Google to find out how to get the current year using JS.

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
   //Step 1 - Make the get route work and render the index.ejs file.
});
 

app.post("/submit", (req, res) => {
   const randomCourseID = courseID[Math.floor(Math.random() * courseID.length)];
  const randomCourseName = courseName[Math.floor(Math.random() * courseName.length)];
  res.render("index.ejs", {
    courseID: randomCourseID,
    courseName: randomCourseName,
  });
});
  //Step 2 - Make the generate name functionality work
  //Hint: When the "Generate Name" button in index.ejs is clicked, it should hit up this route.
  //Then:
  //1. You should randomly pick an adjective from the const "adj" and a noun from const "noun",
  //scroll down to see the two arrays.
  //2. Send the index.ejs as a response and add the adjective and noun to the res.render
  //3. Test to make sure that the random words display in the h1 element in index.ejs


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const courseID = [
  "ICS 111",
  "ICS 169",
  "ICS 212",
  "ICS 241",
  "ICS 311",
  "ICS 314",
  "ICS 320",
  "ICS 321",
  "ICS 385",
  "ICS 461",
];

const courseName = [
  "Intro to Programming",
  "Data Structures",
  "Computer Organization",
  "Software Engineering",
  "Operating Systems",
  "Programming Languages",
  "Web Programming",
  "Mobile App Development",
  "Artificial Intelligence",
  "Computer Graphics",
];