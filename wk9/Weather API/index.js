require('dotenv').config();

const lat = "20.87";
const lon = "-156.45";
const apiKey = process.env.API_KEY;

fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`)
  .then(response => response.json())
  .then(data => {
    console.log("Description:", data.weather[0].description);
    console.log("Temperature:", data.main.temp, "°F");
    console.log("Icon:", `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`);
    console.log("Humidity:", data.main.humidity, "%");
    console.log("Wind Speed:", data.wind.speed, "mph");
    console.log("Cloudiness:", data.clouds.all, "%");
  })
  .catch(error => console.error("Error:", error));