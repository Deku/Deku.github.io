var context;
var canvas;
var queue;
var WIDTH = 768;
var HEIGHT = 672;
var mouseXPosition;
var mouseYPosition;
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var enemyXPos = 100;
var enemyYPos = 100;
var enemyXSpeed = 1.5;
var enemyYSpeed = 1.75;
var score = 0;
var scoreText;
var gameTimer;
var gameTime = 0;
var timerText;
var debugMode = false;
var DEBUG = { INFO: 1, WARNING: 2, ERROR: 3 };

window.onload = function()
{
    /*
     *      Set up the Canvas with Size and height
     *
     */
    canvas = document.getElementById('game');

    // If we don't get the canvas stop running
    if (canvas == null) return;


    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("game");

    /*
     *      Set up the Asset Queue and load sounds
     *
     */
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg", "wav"];

    /*
     *      Create a load manifest for all assets
     *
     */
    queue.loadManifest([
        {id: 'backgroundImage', src: 'assets/background.png'},
        {id: 'crossHair', src: 'assets/crosshair.png'},
        {id: 'shot', src: 'assets/LTTP_Arrow_Hit.wav'},
        {id: 'bgm', src: 'assets/tlozmc_minigame.mp3'},
        {id: 'gameOverSound', src: 'assets/LOZ_Die.wav'},
        {id: 'tick', src: 'assets/tick.mp3'},
        {id: 'deathSound', src: 'assets/OOT_Cucco2.wav'},
        {id: 'birdSpritesheet', src: 'assets/birdSpritesheet.png'},
        {id: 'birdDeath', src: 'assets/birdDeath.png'},
    ]);
    queue.load();

}

function queueLoaded(event)
{
    // Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"))
    stage.addChild(backgroundImage);

    // Add Score
    scoreText = new createjs.Text("Score: " + score.toString(), "14px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);

    // Add Timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "14px Arial", "#FFF");
    timerText.x = 650;
    timerText.y = 10;
    stage.addChild(timerText);

    // Play background sound
    var music = createjs.Sound.play("bgm");
    music.loop = -1;
    music.volume = 0.3;

    // Create bat spritesheet
    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('birdSpritesheet')],
        "frames": {"width": 48, "height": 63},
        "animations": { "flap": [0,3] }
    });

    // Create bat death spritesheet
    birdDeathSpriteSheet = new createjs.SpriteSheet({
    	"images": [queue.getResult('birdDeath')],
    	"frames": {"width": 48, "height" : 63},
    	"animations": {"die": [0,9, false,1 ] }
    });

    // Create bat sprite
    createEnemy();

    // Create crosshair
    crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    stage.addChild(crossHair);

    // Add ticker
    createjs.Ticker.setFPS(15);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    // Set up events AFTER the game is loaded
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;

    /*
     *      Create a timer that updates once per second
     *
     */
    gameTimer = setInterval(updateTime, 1000);
}

function createEnemy()
{
	animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 24;
    animation.regY = 31;
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function birdDeath()
{
    deathAnimation = new createjs.Sprite(birdDeathSpriteSheet, "die");
    deathAnimation.regX = 24;
    deathAnimation.regY = 31;
    deathAnimation.x = enemyXPos;
    deathAnimation.y = enemyYPos;
    deathAnimation.gotoAndPlay("die");
    stage.addChild(deathAnimation);
}

function tickEvent()
{
	//Make sure enemy bat is within game boundaries and move enemy Bat
	if(enemyXPos < WIDTH - 5 && enemyXPos > 5)
	{
		enemyXPos += enemyXSpeed;
	} else {
		enemyXSpeed = enemyXSpeed * (-1);
		enemyXPos += enemyXSpeed;
	}

	if(enemyYPos < HEIGHT - 5 && enemyYPos > 5)
	{
		enemyYPos += enemyYSpeed;
	} else {
		enemyYSpeed = enemyYSpeed * (-1);
		enemyYPos += enemyYSpeed;
	}

	animation.x = enemyXPos;
	animation.y = enemyYPos;

    if (debugMode)
    {
        context.fillStyle = "#FF0000";
        context.beginPath();
        context.arc(animation.x, animation.y, 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
}


function handleMouseMove(event)
{
    // Correct mouse position
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    //Offset the position by 45 pixels so mouse is in center of crosshair
    crossHair.x = x - 45;
    crossHair.y = y - 45;

    if (debugMode)
    {
        context.fillStyle = "#FF0000";
        context.beginPath();
        context.arc(crossHair.x, crossHair.y, 2, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }
}

function handleMouseDown(event)
{
    
    // Play Gunshot sound
    createjs.Sound.play("shot");

    // Increase speed of enemy slightly
    enemyXSpeed *= 1.05;
    enemyYSpeed *= 1.06;
    debug("Changed enemy speed x: " + enemyXSpeed + " y: " + enemyYSpeed, DEBUG.INFO);

    // Correct mouse position
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Obtain Shot position
    var shotX = Math.round(x);
    var shotY = Math.round(y);

    // Obtain the enemy position
    var spriteX = Math.round(animation.x);
    var spriteY = Math.round(animation.y);
    debug("Clicked on x: " + shotX + " y: " + shotY + " and enemy's position was x: " + spriteX + " y: " + spriteY, DEBUG.INFO);
    if (debugMode)
    {
        context.fillStyle = "#00FF00";
        context.beginPath();
        context.arc(shotX, shotY, 3, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }

    if (debugMode)
    {
        context.fillStyle = "#0000FF";
        context.beginPath();
        context.arc(spriteX, spriteY, 3, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    }

    // Compute the X and Y distance using absolte value
    var distX = Math.abs(shotX - spriteX);
    var distY = Math.abs(shotY - spriteY);

    // Anywhere in the body or head is a hit - but not the wings
    if(distX < 30 && distY < 59 )
    {
    	//Hit
    	stage.removeChild(animation);
    	birdDeath();
    	score += 100;
    	scoreText.text = "Score: " + score.toString();
    	createjs.Sound.play("deathSound");
    	
        //Make it harder next time
    	enemyYSpeed *= 1.25;
    	enemyXSpeed *= 1.3;

        if (enemyXSpeed > 60) enemyXSpeed = 65;
        if (enemyYSpeed > 60) enemyYSpeed = 60;

        debug("Changed enemy speed x: " + enemyXSpeed + " y: " + enemyYSpeed);

    	//Create new enemy
    	var timeToCreate = Math.floor((Math.random()*3500)+1);
	    setTimeout(createEnemy,timeToCreate);

    } else {
    	//Miss
    	score -= 10;
    	scoreText.text = "Score: " + score.toString();
    }
}

function updateTime()
{
	gameTime += 1;
	if(gameTime > 60)
	{
		//End Game and Clean up
		timerText.text = "GAME OVER";
		stage.removeChild(animation);
		stage.removeChild(crossHair);
        createjs.Sound.stop();
		var si = createjs.Sound.play("gameOverSound");
		clearInterval(gameTimer);
        window.onmousedown = null;
        window.onmousemove = null;
	}
	else
	{
		timerText.text = "Time: " + gameTime;
	}
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
