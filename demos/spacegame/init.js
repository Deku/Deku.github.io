$(document).ready(function() {
    canvasSpaceGame();
});

  // Global variables
  var shipX = 0; // X position of ship
  var shipY = 0; // Y position of ship
  var canvas; // canvas
  var ctx; // game context
  var ctx2; // score context
  var canvasWidth;
  var canvasHeight;
  var back = new Image(); // storage for new background piece
  var oldBack = new Image(); // storage for old background piece
  var ship = new Image(); // ship
  var shipX = 0; // current ship position X
  var shipY = 0; // current ship position Y
  var oldShipX = 0; // old ship position Y
  var oldShipY = 0; // old ship position Y
  var direction = "R"; // direction of ship movement
  var movements = 50; // movements
  var state;

  // Debug
  var debugMode = false;
  var DEBUG = {
              INFO: 1,
              WARNING: 2,
              ERROR: 3 
            };
      
  // Called on page load.
  function canvasSpaceGame(option) {

      // Get the main canvas element.
    canvas = document.getElementById("game");
    // Get the movements canvas element.
    canvas2 = document.getElementById("movements");

    // Initialize the movements element.
    if (canvas2.getContext) {
      ctx2 = canvas2.getContext("2d");
    }

    // Initialize main element.
    if (canvas.getContext) {
      ctx = canvas.getContext("2d");

      canvasWidth = ctx.canvas.width;
      canvasHeight = ctx.canvas.height;

      // Paint it black.
      ctx.fillStyle = "black";
      ctx.rect(0, 0, canvasWidth, canvasHeight);
      ctx.fill();

      // Save the initial background.
      back = ctx.getImageData(0, 0, 30, 30);

      if (option == 'reset') {
        oldShipX = 0;
        oldShipY = 0;
        shipX = 0;
        shipY = 0;
        movements = 50;
      }

      // Paint the starfield.
      stars();

      // Draw space ship.
      ship.onload = function(){
        ctx.drawImage(this, 0, 0);
      };
      ship.src = "nave.png";

      // Draw asteroids.
      drawAsteroids();

      // Draw movements left
      drawMovements();
    }

    // Play the game until the until the game is over.
    gameLoop = setInterval(render, 16);

    // Add keyboard listener.
    window.addEventListener('keydown', whatKey, true);

  }

  // Paint a random star field.
  function stars() {

    // Draw 100 stars.
    for (i = 0; i <= 100; i++) {
      // Get random positions for stars.
      var x = Math.floor(Math.random() * (canvasWidth - 1));
      var y = Math.floor(Math.random() * (canvasHeight - 1));

      // Make the stars white
      ctx.fillStyle = "#FFFFFF";

      // Paint the star but not if too close to ship.
      if (x > 40 && y > 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
      } else {
        --i; // So we end having 100 stars
      }
    }

    // Save black background.
    oldBack = ctx.getImageData(0, 0, 30, 30);
  }

  function render() {

    // Put old background down to erase shipe.
    ctx.putImageData(oldBack, oldShipX, oldShipY);

    // Put ship in new position.
    //ctx.putImageData(ship, shipX, shipY);
    ctx.drawImage(ship, shipX, shipY);
  }

  // Get key press.
  function whatKey(evt) {

    // Flag to put variables back if we hit an edge of the board.
    var flag = 0;

    // Get where the ship was before key process.
    oldShipX = shipX;
    oldShipY = shipY;
    oldBack = back;

    switch (evt.keyCode) {

      // Left arrow
      case 37:
        shipX = shipX - 30;
        // If at edge, reset ship position and set flag
        if (shipX < 0) {
          shipX = 0;
          flag = 1;
        }
        direction = "L";
        // Prevent the default scrolling from arrow keys
        evt.preventDefault();
        break;

      // Right arrow
      case 39:
        shipX = shipX + 30;
        // If at edge, reset ship position and set flag
        if (shipX > canvasWidth - 30) {
          shipX = canvasWidth - 30;
          flag = 1;
        }
        direction = "R";
        evt.preventDefault();
        break;

      // Down arrow
      case 40:
        shipY = shipY + 30;
        // If at edge, reset ship position and set flag
        if (shipY > canvasHeight - 30) {
          shipY = canvasHeight - 30;
          flag = 1;
        }
        direction = "D";
        evt.preventDefault();
        break;

      // Up arrow 
      case 38:
        shipY = shipY - 30;
        // If at edge, reset ship position and set flag
        if (shipY < 0) {
          shipY = 0;
          flag = 1;
        }
        direction = "U";
        evt.preventDefault();
        break;

      // If any other keys were presssed
      default:
        flag = 1; // Don't move the ship.
    }

    // If flag is set, the ship did not move
    // Put everything back the way it was
    // Increase movements since the ship did not move
    if (flag) {
      shipX = oldShipX;
      shipY = oldShipY;
      back = oldBack;
      movements = movements + 1;
    } else {
      // Otherwise, get background where the ship will go
      // So you can redraw background when the ship
      // moves again.
      back = ctx.getImageData(shipX, shipY, 30, 30);
    }

    // Decrease movements.
    movements = movements - 1;

    // Draw movements on movementsboard.
    drawMovements();

    // Did we collide?
    collideTest();
  }

  function drawMovements() {
    ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    ctx2.font = "20px Arial";
    ctx2.fillText("Movimientos restantes", 20, 15);
    ctx2.fillText(movements, 250, 15);
  }

  function collideTest() {
    // Collision detection. Get a clip from the screen
    // See what the ship would move over
    var clipWidth = 20;
    var clipDepth = 20;
    var clipLength = clipWidth * clipDepth;
    var clipOffset = 5;
    var whatColor = ctx.getImageData(shipX + clipOffset, shipY + clipOffset, clipWidth, clipDepth);

    // Loop through the clip and check colors 
    for (var i = 0; i < clipLength * 4; i += 4) {
      var R = whatColor.data[i];
      var G = whatColor.data[i + 1];
      var B = whatColor.data[i + 2];
      var isBlue = R == 0 && G == 0 && B == 255;
      var isRed = R == 255 && G == 0 && B == 0;

      if (isBlue) {
        direction = "B";
        debug("clip -> x: " + (shipX + clipOffset) + " y: " + (shipY + clipOffset), DEBUG.INFO);
        debug(whatColor, DEBUG.INFO);
        break;
      }

      if (isRed) {
        direction = "P";
        debug("clip -> x: " + (shipX + clipOffset) + " y: " + (shipY + clipOffset), DEBUG.INFO);
        debug("R(" + i + "): " + R + " G(" + (i+1) + "): " + G + " B(" + (i+2) + "): " + B, DEBUG.INFO);
        debug(whatColor, DEBUG.INFO);
        break;
      }
    }

    // Did we hit something?
    if (direction == "P") bang();
    if (direction == "B") youWin();
    if (movements == 0) outOfMoves();
  }

  function bang() {
    alert("Game over! Un asteroide destruyó tu nave.");
    // Stop game.
    clearTimeout(gameLoop);
    window.removeEventListener('keydown', whatKey, true);
  }

  function youWin() {
    alert("Has ganado! Llegaste a la base.");
    // Stop game.
    clearTimeout(gameLoop);
    window.removeEventListener('keydown', whatKey, true);
  }

  function outOfMoves() {
    alert("Game over! Te has quedado sin movimientos.");
    // Stop game
    clearTimeout(gameLoop);
    window.removeEventListener('keydown', whatKey, true);
  }

  function drawAsteroids() {
    // Amount of asteroids to draw
    var amount = canvasWidth / 10;
    
    // Draw asteroids.
    for (i = 0; i <= amount; i++) {
      // Get random positions for asteroids.
      var a = Math.floor(Math.random() * (canvasWidth - 1));
      var b = Math.floor(Math.random() * (canvasHeight - 1));

      // Keep the asteroids far enough away from
      // the beginning or end
      if (/*beggining*/(a > 60 && b > 60)
        || /*end*/(a < 240 && b < 240)) {
        // Make the asteroids red
        ctx.fillStyle = "#FF0000";

        // Draw an individual asteroid
        ctx.beginPath();
        ctx.arc(a, b, 10, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
      } else {
        i--;
      }
    }

    var baseX = ctx.canvas.width - 30;
    var baseY = ctx.canvas.height - 30;
    
    // Draw blue base.
    ctx.fillStyle = "#0000FF";
    ctx.beginPath();
    ctx.rect(baseX, baseY, 30, 30);
    ctx.closePath();
    ctx.fill();

    // Make some room at beginning.
    ctx.putImageData(back, 0, 30);
    ctx.putImageData(back, 30, 0);
    ctx.putImageData(back, 30, 30);
    // Make some room at end.
    ctx.putImageData(back, 240, 240);
    ctx.putImageData(back, 270, 240);
    ctx.putImageData(back, 240, 270);
  }

  function debug(message, level) {
    if (!debugMode) return;

    switch (level)
    {
      case 1:
        console.log(message);
        break;
      case 2:
        console.warn(message);
        break;
      case 3:
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }