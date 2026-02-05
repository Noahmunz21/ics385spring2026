//jshint esversion:6

// Import all required NPM packages
const superheroes = require('superheroes');
const supervillains = require('supervillains');
const Quote = require('inspirational-quotes');
const movieQuotes = require('popular-movie-quotes');
const famousLastWords = require('famous-last-words');
const fs = require('fs');
const http = require('http');

// Generate random content from each package
var mySuperHeroName = superheroes.random();
var mySuperVillainName = supervillains.random();
var myInspirationQuote = Quote.getRandomQuote();

// For popular-movie-quotes: use getRandomQuote() method
var myMovieQuote = movieQuotes.getRandomQuote();

// For famous-last-words: it's an array, so pick a random element
var myFamousLastWords = famousLastWords[Math.floor(Math.random() * famousLastWords.length)];

// Display all generated content in the console
console.log("=== Generated Content ===");
console.log("Super Hero: " + mySuperHeroName);
console.log("Super Villain: " + mySuperVillainName);
console.log("Inspirational Quote: " + myInspirationQuote);
console.log("Movie Quote: " + myMovieQuote);
console.log("Famous Last Words: " + myFamousLastWords);
console.log("========================\n");

// Save each piece of content to its own separate .txt file
// File 1: Save superhero name
fs.writeFileSync("superhero.txt", "Super Hero: " + mySuperHeroName);
console.log("✓ Saved to superhero.txt");

// File 2: Save supervillain name
fs.writeFileSync("supervillain.txt", "Super Villain: " + mySuperVillainName);
console.log("✓ Saved to supervillain.txt");

// File 3: Save inspirational quote
fs.writeFileSync("inspirational-quote.txt", "Inspirational Quote: " + myInspirationQuote);
console.log("✓ Saved to inspirational-quote.txt");

// File 4: Save movie quote
fs.writeFileSync("movie-quote.txt", "Movie Quote: " + myMovieQuote);
console.log("✓ Saved to movie-quote.txt");

// File 5: Save famous last words
fs.writeFileSync("famous-last-words.txt", "Famous Last Words: " + myFamousLastWords);
console.log("✓ Saved to famous-last-words.txt");

console.log("\nAll files saved successfully!\n");

// Set up local web server configuration
const hostname = '127.0.0.1';
const port = 3000;

// Create HTTP server that displays all generated content
const server = http.createServer((req, res) => {
  // Set response status and content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  // Build response string with all content
  var responseText = "=== Hero HW4 Output ===\n\n";
  responseText += "Super Hero: " + mySuperHeroName + "\n";
  responseText += "Super Villain: " + mySuperVillainName + "\n";
  responseText += "Inspirational Quote: " + myInspirationQuote + "\n";
  responseText += "Movie Quote: " + myMovieQuote + "\n";
  responseText += "Famous Last Words: " + myFamousLastWords + "\n";
  
  // Send response to client
  res.end(responseText);
});

// Start the server and listen on specified port
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log("Visit the URL above to see the output in your browser!");
});
