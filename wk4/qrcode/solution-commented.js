/*
 * Author: [Original Solution Code]
 * Date: February 6, 2026 (Comments Added)
 * 
 * QR Code Generator - Original Version with Comments
 * 
 * Overview:
 * Basic QR code generator that takes a URL input from the user,
 * generates a QR code image, and saves the URL to a text file.
 * 
 * Key Highlights:
 * - Simple command-line interface using Inquirer
 * - QR code generation using qr-image library
 * - File system operations for saving outputs
 * - Promise-based async flow
 * 
 * Dependencies:
 * - inquirer: Interactive CLI prompts
 * - qr-image: QR code image generation
 * - fs: Node.js file system module
 */

// Import required npm packages
import inquirer from "inquirer"; // For interactive command-line prompts
import qr from "qr-image";       // For generating QR code images
import fs from "fs";             // Node.js file system module

// Start the interactive prompt flow
inquirer
  .prompt([
    {
      // Configuration for the URL input prompt
      message: "Type in your URL: ",  // The question shown to user
      name: "URL",                     // The key name for the answer object
    },
  ])
  .then((answers) => {
    // This block executes after user provides input
    // 'answers' is an object containing user responses
    
    // Extract the URL from the answers object
    const url = answers.URL;
    
    // Generate QR code image from the URL
    // qr.image() returns a readable stream of PNG data
    var qr_svg = qr.image(url);
    
    // Pipe the QR code stream to a file
    // Creates 'qr_img.png' in the current directory
    qr_svg.pipe(fs.createWriteStream("qr_img.png"));

    // Save the URL to a text file
    // Writes the URL string to 'URL.txt'
    fs.writeFile("URL.txt", url, (err) => {
      // Error handling callback
      if (err) throw err;  // Stop execution if file write fails
      
      // Success message
      console.log("The file has been saved!");
    });
  })
  .catch((error) => {
    // Error handling for the prompt itself
    
    if (error.isTtyError) {
      // This error occurs when prompt cannot render in the terminal
      // For example: when run in a non-interactive environment
      // No action taken in original code
    } else {
      // Catch-all for any other errors
      // No action taken in original code
    }
  });

/* 
Original Assignment Requirements:
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/
