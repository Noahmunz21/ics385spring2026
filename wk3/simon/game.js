
// ============================================
// SIMON GAME - JAVASCRIPT CODE
// A memory game where players repeat an increasingly complex sequence
// ============================================

// VARIABLES - These store data that the game needs

// Array of four colors used in the game
// Arrays are lists of items stored in square brackets []
// We use this to store the colors so we can access them by index (position)
var buttonColours = ["red", "blue", "green", "yellow"];

// This array stores the sequence of colors that the game generates
// The game adds a new color each level
// Example: after level 1, it might be ["red"]
// After level 2, it might be ["red", "green"]
var gamePattern = [];

// This array stores the sequence of colors the user has clicked
// We use this to check if the user's clicks match the game's sequence
// It gets reset to empty [] when a new sequence starts
var userClickedPattern = [];

// Boolean (true/false) variable to track whether the game has started
// We set this to false at the beginning
// When the user presses a key, we set it to true
var started = false;

// Variable to track what level the player is currently on
// Level increases by 1 each time the user successfully completes a sequence
// This makes the game harder as levels increase
var level = 0;

// EVENT LISTENER - This waits for the user to press any key
// When a key is pressed, the function inside runs
// $(document).keypress() uses jQuery to listen for keypress events
$(document).keypress(function() {
  // Check if the game hasn't started yet
  // The ! symbol means "NOT" - so this reads as "if NOT started"
  if (!started) {
    // Update the display to show "Level 0"
    // The # symbol targets elements with an id (like <div id="level-title">)
    // .text() changes the text inside that element
    $("#level-title").text("Level " + level);
    
    // Start the game by calling the nextSequence function
    nextSequence();
    
    // Set started to true so this event listener won't trigger again
    // until the game is restarted
    started = true;
  }
});


// EVENT LISTENER - Listen for button clicks
// When a button with the class "btn" is clicked, this function runs
// The .click() method is a jQuery event listener
$(".btn").click(function() {

  // Get the id attribute of the button that was clicked
  // $(this) refers to the button that triggered the click event
  // .attr("id") gets the id attribute of that element
  // For example, if the red button is clicked, userChosenColour becomes "red"
  var userChosenColour = $(this).attr("id");
  
  // Add the clicked color to the end of the userClickedPattern array
  // .push() adds an item to the end of an array
  // After this line, userClickedPattern might be ["red"] or ["red", "blue"], etc.
  userClickedPattern.push(userChosenColour);

  // Play the sound associated with this color
  // This function is defined below
  playSound(userChosenColour);
  
  // Add a visual animation (flash effect) when the button is pressed
  // This function is defined below
  animatePress(userChosenColour);

  // Check if the user's click matches the game's pattern
  // We pass userClickedPattern.length - 1 which is the INDEX of the last item added
  // For example, if userClickedPattern has 3 items, we check index 2 (the 3rd item)
  // The -1 is because arrays start counting from 0, not 1
  checkAnswer(userClickedPattern.length - 1);
});


// FUNCTION: Check if the user's answer is correct
// Parameters: currentLevel - the index of the color to check
// This function compares what the user clicked with what the game expects
function checkAnswer(currentLevel) {

  // Check if the user's color at this position matches the game's color
  // The === operator checks if two values are equal
  // gamePattern[currentLevel] is the color the game expects at this level
  // userClickedPattern[currentLevel] is the color the user clicked at this level
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    
    // If the user got this color right, check if they've completed the entire sequence
    // We compare the length (number of items) in both arrays
    // If the user has clicked as many colors as the game has generated, 
    // they've successfully completed the sequence
    if (userClickedPattern.length === gamePattern.length) {
      
      // Wait 1000 milliseconds (1 second) before showing the next sequence
      // setTimeout() delays the function call by the specified time
      // This gives the player a moment to breathe before the next sequence starts
      setTimeout(function () {
        // After the delay, generate the next sequence
        nextSequence();
      }, 1000);
    }
  } 
  // If the user clicked the wrong color
  else {
    // Play the "wrong" sound to indicate an error
    playSound("wrong");
    
    // Add a "game-over" class to the body element
    // This CSS class makes the background turn red to show the game ended
    // .addClass() adds a CSS class to an HTML element
    $("body").addClass("game-over");
    
    // Update the display to tell the player the game is over
    // and to press any key to restart
    $("#level-title").text("Game Over, Press Any Key to Restart");

    // Remove the red background after 200 milliseconds
    // .removeClass() removes a CSS class from an element
    // This creates a quick flash effect when the game ends
    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 200);

    // Reset the game to its starting state
    // This function is defined below
    startOver();
  }
}


// FUNCTION: Generate the next sequence in the game
// This function is called when the player successfully completes a level
// or when the game first starts
function nextSequence() {
  
  // Clear the user's pattern so they can start fresh for the new sequence
  // Setting it to [] (empty array) means the user hasn't clicked anything yet
  userClickedPattern = [];
  
  // Increase the level by 1
  // The ++ operator is a shorthand for level = level + 1
  level++;
  
  // Update the display to show the current level
  // We concatenate (combine) strings using the + operator
  // This creates text like "Level 1", "Level 2", etc.
  $("#level-title").text("Level " + level);
  
  // Generate a random number between 0 and 3 (inclusive)
  // Math.random() generates a decimal between 0 and 1 (like 0.5387)
  // * 4 multiplies it (giving 0 to 3.999...)
  // Math.floor() rounds down to the nearest whole number (0, 1, 2, or 3)
  // This random number will be used as an index to pick a color
  var randomNumber = Math.floor(Math.random() * 4);
  
  // Use the random number to pick a random color from buttonColours array
  // Arrays use indexes starting from 0
  // buttonColours[0] = "red", buttonColours[1] = "blue", etc.
  var randomChosenColour = buttonColours[randomNumber];
  
  // Add the randomly chosen color to the end of gamePattern
  // This builds up the sequence that the player needs to remember
  gamePattern.push(randomChosenColour);

  // Show the color by making the button flash
  // #red, #blue, etc. targets the button with that id
  // .fadeIn(100) makes it appear in 100 milliseconds
  // .fadeOut(100) makes it disappear in 100 milliseconds
  // .fadeIn(100) makes it appear again
  // This creates a visual indicator of which color to click
  $("#" + randomChosenColour).fadeIn(100).fadeOut(100).fadeIn(100);
  
  // Play the sound associated with this color
  playSound(randomChosenColour);
}


// FUNCTION: Animate a button press
// Parameter: currentColor - the color of the button that was pressed
// This function creates a visual effect when a button is clicked
function animatePress(currentColor) {
  // Add the "pressed" CSS class to the button with this color
  // The "pressed" class in the CSS file makes the button look pressed/darker
  // #id selects the HTML element with that id attribute
  $("#" + currentColor).addClass("pressed");
  
  // After 100 milliseconds, remove the "pressed" class
  // This removes the darker effect and returns the button to normal
  // This timing creates a quick flash effect that shows the button was clicked
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}


// FUNCTION: Play a sound file
// Parameter: name - the name of the sound to play (like "red", "blue", "wrong")
// This function creates an audio element and plays it
function playSound(name) {
  // Create a new Audio object that points to an MP3 file
  // The path "sounds/" + name + ".mp3" creates a full file path
  // For example, if name = "red", this becomes "sounds/red.mp3"
  var audio = new Audio("sounds/" + name + ".mp3");
  
  // Play the audio file
  // The .play() method starts playing the audio
  audio.play();
}

// FUNCTION: Reset the game to its starting state
// This is called when the player makes a mistake and the game ends
function startOver() {
  // Reset the level to 0
  // Players will start from Level 1 next time they press a key
  level = 0;
  
  // Clear the game's pattern sequence
  // Set it to an empty array [] so no colors are stored
  gamePattern = [];
  
  // Set started back to false
  // This allows the game to start again when the user presses any key
  started = false;
}

// ============================================
// HOW TO EXTEND THIS CODE:
// ============================================
// 1. Add difficulty levels: Create a difficulty variable and use it to adjust
//    timing or number of colors shown per level
// 
// 2. Add a high score: Create a variable to track the highest level reached
//    and display it on the page
//
// 3. Add more colors: Add more colors to buttonColours array and adjust
//    the random number calculation (currently * 4 for 4 colors)
//
// 4. Add time pressure: Use setTimeout to give players less time as levels increase
//
// 5. Add a "ready?" prompt: Add a delay before showing the sequence so players
//    can prepare
//
// 6. Track stats: Count successful sequences, log game data, etc.
// ============================================
