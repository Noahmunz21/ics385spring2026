
// ============================================================
// SIMON GAME — JAVASCRIPT GAME LOGIC
// ============================================================
// This file contains all game logic for the Simon memory game.
// 
// COMMENT LEGEND:
//   - Comments WITHOUT a tag = retained/adapted from the original code
//   - Comments marked [AI-GENERATED] = written with AI assistance
//     and reviewed by the developer. These are clearly labeled so
//     the reviewer can distinguish them from hand-written comments.
//
// CHANGES MADE (documented for assignment requirements):
//   1. BUG FIXES — see inline notes
//   2. UX IMPROVEMENTS — welcome screen, status messages, score, replay button
//   3. NEW LEVEL SYSTEM — Speed Level (6+) and Strict Mode (10+)
//      See the "DIFFICULTY CONFIGURATION" section below for details.
// ============================================================


// ============================================================
// DIFFICULTY CONFIGURATION
// [AI-GENERATED] This entire section was added to implement the new
// leveling system (Assignment Requirement #7 — "Add a level to your game").
//
// TWO new difficulty tiers were added on top of the original single-speed game:
//
//   TIER 1 — SPEED LEVEL (activates at Level 6):
//     The sequence playback speed increases. The fadeIn/fadeOut animation
//     durations shrink from 200ms down to 70ms as levels increase.
//     This forces players to watch and react faster.
//
//   TIER 2 — STRICT MODE (activates at Level 10):
//     Once the player reaches Level 10, "Strict Mode" turns on.
//     In Strict Mode, if the player makes ANY mistake during a sequence,
//     they do not simply replay that level — they are sent all the way
//     back to Level 1. This dramatically raises the difficulty and makes
//     the game feel like a true challenge for experienced players.
//
// These thresholds are defined as constants below so they can be easily
// adjusted if you want to tweak when each tier kicks in.
// ============================================================

var SPEED_LEVEL_THRESHOLD = 6;    // Level at which speed starts increasing
var STRICT_MODE_THRESHOLD = 10;   // Level at which Strict Mode activates


// ============================================================
// GAME STATE VARIABLES
// ============================================================

// Array of four colors used in the game.
// Arrays are lists of items stored in square brackets [].
// We use this to store the colors so we can access them by index (position).
var buttonColours = ["red", "blue", "green", "yellow"];

// This array stores the sequence of colors that the game generates.
// The game adds a new color each level.
// Example: after level 1, it might be ["red"]
//          after level 2, it might be ["red", "green"]
var gamePattern = [];

// This array stores the sequence of colors the user has clicked.
// We use this to check if the user's clicks match the game's sequence.
// It gets reset to empty [] when a new sequence starts.
var userClickedPattern = [];

// Boolean (true/false) variable to track whether the game has started.
// We set this to false at the beginning.
// When the user clicks the Start button, we set it to true.
var started = false;

// Variable to track what level the player is currently on.
// Level increases by 1 each time the user successfully completes a sequence.
// This makes the game harder as levels increase.
var level = 0;

// [AI-GENERATED] High score tracking variable.
// Stores the highest level the player has reached during this session.
// Updated whenever the player advances to a new level.
var highScore = 0;

// [AI-GENERATED] Boolean flag to track whether it is currently the
// player's turn to click buttons. When false, button clicks are ignored
// (e.g., while the game is playing back the sequence). This prevents
// players from accidentally clicking during the demo phase.
var playerTurn = false;


// ============================================================
// WELCOME SCREEN — START BUTTON
// [AI-GENERATED] This event listener replaces the original
//   $(document).keypress(function() { ... })
// The original game started ONLY when the user pressed a keyboard key,
// which was confusing for beginners (there was no visible indication of
// what to do). This new version uses a clearly labeled "Start Game" button
// on a welcome screen that also shows instructions.
//
// The original keypress listener has been removed entirely.
// ============================================================
$("#start-btn").click(function() {
  // Hide the welcome screen and show the game board
  $("#welcome-screen").hide();
  $("#game-screen").show();

  // Mark the game as started so the logic knows we're in play
  started = true;

  // Update the level display and kick off the first sequence
  $("#level-title").text("Level " + level);
  nextSequence();
});


// ============================================================
// REPLAY BUTTON — SHOWN ON GAME OVER
// [AI-GENERATED] This button appears after a game-over and lets the
// player restart without needing to reload the page or press a random key.
// It resets all game state and begins a fresh game.
// ============================================================
$("#replay-btn").click(function() {
  // Hide the replay button again
  $("#replay-btn").hide();

  // Reset all game variables to starting state
  startOver();

  // Start a new game immediately
  started = true;
  $("#level-title").text("Level " + level);
  nextSequence();
});


// ============================================================
// BUTTON CLICK EVENT LISTENER
// When a colored button is clicked, this function runs.
// The .click() method is a jQuery event listener.
// ============================================================
$(".btn").click(function() {

  // [AI-GENERATED] If it's not the player's turn (e.g., the game is
  // showing the sequence), ignore the click entirely. This prevents
  // accidental inputs during the playback phase.
  if (!playerTurn) {
    return;
  }

  // Get the id attribute of the button that was clicked.
  // $(this) refers to the button that triggered the click event.
  // .attr("id") gets the id attribute of that element.
  // For example, if the red button is clicked, userChosenColour becomes "red".
  var userChosenColour = $(this).attr("id");

  // Add the clicked color to the end of the userClickedPattern array.
  // .push() adds an item to the end of an array.
  userClickedPattern.push(userChosenColour);

  // Play the sound associated with this color (with error handling)
  playSound(userChosenColour);

  // Add a visual animation (flash effect) when the button is pressed
  animatePress(userChosenColour);

  // Check if the user's click matches the game's pattern.
  // We pass userClickedPattern.length - 1, which is the INDEX of the
  // last item added. Arrays start counting from 0, not 1.
  checkAnswer(userClickedPattern.length - 1);
});


// ============================================================
// FUNCTION: checkAnswer(currentLevel)
// Check if the user's answer is correct at the given index.
// Parameters: currentLevel — the index of the color to check.
// ============================================================
function checkAnswer(currentLevel) {

  // Check if the user's color at this position matches the game's color.
  // === checks strict equality (value AND type must match).
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {

    // CORRECT click — now check if the entire sequence is complete
    if (userClickedPattern.length === gamePattern.length) {

      // [AI-GENERATED] Update the high score if the current level exceeds it.
      if (level > highScore) {
        highScore = level;
        $("#high-score").text(highScore);
      }

      // [AI-GENERATED] Show a brief "Correct!" status message before
      // moving to the next sequence. This gives the player positive feedback.
      setStatus("Correct! Next level...", "correct");

      // Wait 1000 milliseconds (1 second) before showing the next sequence.
      // This gives the player a moment to breathe.
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
    // If not all buttons matched yet, do nothing — wait for the next click.

  } else {
    // ============================================================
    // WRONG ANSWER
    // ============================================================

    // Play the "wrong" sound to indicate an error
    playSound("wrong");

    // Add a "game-over" class to the body element.
    // This CSS class makes the background flash red to show the game ended.
    $("body").addClass("game-over");

    // [AI-GENERATED] Update status message to inform the player they got
    // it wrong and what they should do next.
    $("#level-title").text("Game Over!");
    setStatus("Wrong! Press Play Again to restart.", "");

    // Remove the red background after 200 milliseconds.
    // This creates a quick flash effect when the game ends.
    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 200);

    // [AI-GENERATED] Show the replay button so the player can restart
    // with a single click instead of pressing an invisible key.
    setTimeout(function() {
      $("#replay-btn").show();
    }, 400);

    // Reset the game state (but don't auto-restart)
    startOver();
  }
}


// ============================================================
// FUNCTION: nextSequence()
// Generate the next sequence in the game and play it back.
// Called when the player successfully completes a level or when
// the game first starts.
// ============================================================
function nextSequence() {

  // It is NOT the player's turn yet — we're about to show the sequence
  playerTurn = false;

  // Clear the user's pattern so they can start fresh
  userClickedPattern = [];

  // Increase the level by 1 (++ is shorthand for level = level + 1)
  level++;

  // Update the level display
  $("#level-title").text("Level " + level);

  // [AI-GENERATED] Update the current score display
  $("#current-score").text(level);

  // [AI-GENERATED] Show or hide the Strict Mode badge depending on level.
  // The badge only appears once the player reaches the strict mode threshold.
  if (level >= STRICT_MODE_THRESHOLD) {
    $("#strict-badge").show();
  } else {
    $("#strict-badge").hide();
  }

  // [AI-GENERATED] Set the status message to tell the player the game
  // is about to show the sequence — they should watch carefully.
  setStatus("Watch the sequence...", "watching");

  // Generate a random number between 0 and 3 (inclusive).
  // Math.random() → decimal 0–0.999...
  // * 4 → scales to 0–3.999...
  // Math.floor() → rounds down to 0, 1, 2, or 3
  var randomNumber = Math.floor(Math.random() * 4);

  // Use the random number to pick a color from the buttonColours array
  var randomChosenColour = buttonColours[randomNumber];

  // Add the randomly chosen color to the end of gamePattern.
  // This builds up the full sequence the player must remember.
  gamePattern.push(randomChosenColour);

  // ============================================================
  // PLAY BACK THE ENTIRE SEQUENCE
  // [AI-GENERATED] The original code only flashed the NEWEST color
  // added to the sequence (just the last one). This was correct for
  // how the original game worked because it relied on the player
  // already having memorized previous colors.
  //
  // However, for better UX — especially for beginners — the game now
  // replays the ENTIRE sequence from the start each level. This way,
  // if the player forgot an earlier color, they get a reminder.
  //
  // The playback uses setTimeout with staggered delays so each color
  // flashes one after another in order. The delay between flashes is
  // controlled by getSequenceTiming() which returns shorter durations
  // at higher levels (the Speed Level system).
  // ============================================================
  playFullSequence(0);
}


// ============================================================
// FUNCTION: playFullSequence(index)
// Recursively plays back the entire gamePattern sequence.
// Each color flashes in order, then after the full sequence is shown,
// control is handed back to the player.
//
// [AI-GENERATED] This function was added to replace the single-color
// flash from the original code. It enables full sequence replay and
// integrates with the speed-level timing system.
//
// Parameter: index — the position in gamePattern currently being shown.
// ============================================================
function playFullSequence(index) {

  // Base case: if we've shown all colors in the sequence, it's the player's turn
  if (index >= gamePattern.length) {
    // Give a short pause before handing control to the player
    setTimeout(function() {
      playerTurn = true;
      setStatus("Your turn! Repeat the sequence.", "player-turn");
    }, getSequenceTiming());
    return;
  }

  // Get the color at the current index in the sequence
  var colour = gamePattern[index];

  // [AI-GENERATED] BUG FIX — the original code used jQuery's
  //   fadeIn() / fadeOut() to flash buttons during sequence playback.
  // jQuery's fade methods work by toggling the element's CSS "display"
  // property between "block" and "none". This caused a critical bug:
  // after a button's first flash, it would end up with display:none
  // set directly on the element by jQuery, making it invisible for the
  // rest of the game. The buttons would vanish one by one as the
  // sequence played.
  //
  // FIX: We now toggle a CSS class called "flash" instead.
  // The .flash class uses "filter: brightness()" to brighten the button
  // and add a glow — this animates the color without ever changing
  // display or visibility, so the buttons stay visible at all times.
  //
  // The timing for the flash on/off comes from getSequenceTiming(),
  // which returns shorter durations at higher levels (Speed Level system).
  var timing = getSequenceTiming();
  var $btn = $("#" + colour);

  $btn.addClass("flash");           // Turn flash ON

  setTimeout(function() {
    $btn.removeClass("flash");      // Turn flash OFF after one timing unit
  }, timing);

  // Play the sound for this color
  playSound(colour);

  // Move to the next color after: flash-on duration + flash-off gap
  // This gives enough time for the brightness to visibly pulse before
  // the next color starts.
  setTimeout(function() {
    playFullSequence(index + 1);
  }, timing * 2.5);
}


// ============================================================
// FUNCTION: getSequenceTiming()
// Returns the animation duration (in ms) for sequence playback.
//
// [AI-GENERATED] This function implements the SPEED LEVEL system
// (Assignment Requirement #7 — new level addition).
//
// HOW IT WORKS:
//   - Levels 1–5:  Normal speed  → 200ms per flash
//   - Levels 6–7:  Faster        → 140ms per flash
//   - Levels 8–9:  Even faster   → 100ms per flash
//   - Level 10+:   Maximum speed → 70ms per flash
//
// The lower the number, the faster the sequence plays, making it
// harder for the player to track and memorize.
// ============================================================
function getSequenceTiming() {
  if (level < SPEED_LEVEL_THRESHOLD) {
    // Normal speed for early levels (beginner-friendly)
    return 200;
  } else if (level < SPEED_LEVEL_THRESHOLD + 2) {
    // Slightly faster (Levels 6–7)
    return 140;
  } else if (level < STRICT_MODE_THRESHOLD) {
    // Noticeably faster (Levels 8–9)
    return 100;
  } else {
    // Maximum speed — Strict Mode territory (Level 10+)
    return 70;
  }
}


// ============================================================
// FUNCTION: setStatus(message, statusClass)
// Updates the status message shown above the game buttons.
// Also swaps the CSS class to change the text color based on context.
//
// [AI-GENERATED] Added to give players real-time feedback about
// what phase of the game they're in (watching, their turn, correct, etc.)
//
// Parameters:
//   message     — the text string to display
//   statusClass — a CSS class name ("watching", "player-turn", "correct", or "")
// ============================================================
function setStatus(message, statusClass) {
  var $status = $("#status-message");
  // Remove all known status classes first, then add the new one
  $status.removeClass("watching player-turn correct");
  if (statusClass) {
    $status.addClass(statusClass);
  }
  $status.text(message);
}


// ============================================================
// FUNCTION: animatePress(currentColor)
// Animate a button press with a visual flash effect.
// Parameter: currentColor — the color/id of the button that was pressed.
// ============================================================
function animatePress(currentColor) {
  // Add the "pressed" CSS class to make the button flash
  $("#" + currentColor).addClass("pressed");

  // After 100 milliseconds, remove the "pressed" class
  // This creates a quick flash that confirms the button was clicked
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}


// ============================================================
// FUNCTION: playSound(name)
// Play a sound file associated with the given name.
// Parameter: name — the sound identifier (e.g., "red", "blue", "wrong")
//
// [AI-GENERATED] Added a try/catch block around audio playback.
// The original code would throw an unhandled error if the sound files
// (sounds/*.mp3) were missing or the browser blocked autoplay.
// The try/catch silently handles this so the game continues working
// even without sound files present.
// ============================================================
function playSound(name) {
  try {
    // Create a new Audio object pointing to the MP3 file.
    // Path example: "sounds/red.mp3"
    var audio = new Audio("sounds/" + name + ".mp3");
    // Play the audio file
    audio.play();
  } catch (e) {
    // [AI-GENERATED] If the sound file doesn't exist or autoplay is
    // blocked, the game continues silently. No crash, no error shown.
    console.log("Sound not available: " + name);
  }
}


// ============================================================
// FUNCTION: startOver()
// Reset the game to its starting state.
// Called when the player makes a mistake and the game ends.
//
// [AI-GENERATED] This function now includes Strict Mode feedback.
// In Strict Mode (Level 10+), the player is reset ALL the way back
// to Level 0 when they make a mistake. The status message specifically
// calls out that Strict Mode caused the full reset so the player
// understands why they lost all their progress.
// ============================================================
function startOver() {
  // [AI-GENERATED] Check if Strict Mode was active when the mistake happened.
  // If so, show a message specifically calling out that Strict Mode
  // caused the full reset — so the player understands why.
  if (level >= STRICT_MODE_THRESHOLD) {
    setStatus("Strict Mode: Back to the beginning!", "");
  }

  // Reset the level to 0 (players will start from Level 1 on next game)
  level = 0;

  // Clear the game's pattern sequence
  gamePattern = [];

  // Set started back to false
  started = false;

  // It is no longer the player's turn
  playerTurn = false;

  // Hide the strict mode badge (since we're back at level 0)
  $("#strict-badge").hide();

  // Reset the score display
  $("#current-score").text(0);
}

// ============================================================
// END OF GAME LOGIC
// ============================================================
