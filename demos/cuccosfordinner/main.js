// HTML canvas
var context;
var canvas;


// Dimensiones del canvas
var WIDTH = 768;
var HEIGHT = 672;

var mouseXPosition;
var mouseYPosition;

// Variables enemigos
var chickenXPos = 100;
var chickenYPos = 100;
var chickenXSpeed = 1.5;
var chickenYSpeed = 1.75;

// Variables juego
var score = 0;
var gameTimer; // intervalo
var gameTime = 0;
var ticksForRandomize = 100;
var ticksCounter = 0;


// Variables debug
var debugMode = false;
var DEBUG = { INFO: 1, WARNING: 2, ERROR: 3 };

// Cola de recursos de CreateJS
var queue;

// Recursos
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var timerText;
var scoreText;

/*
 *  Cargar el juego
 *
 */
window.onload = function()
{
    //Establecer el ancho y alto del canvas
    canvas = document.getElementById('game');

    // Sin canvas no se puede seguir
    if (canvas == null) return;

    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;

    // Mostrar al usuario
    context.font = "20px Arial";
    context.fillText("Cargando...", 10, 50);

    stage = new createjs.Stage("game");

    // Crear la cola de recursos
    queue = new createjs.LoadQueue(false);

    // Cargar los recursos de sonido
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg", "wav"];

    // Crear un manifiesto de carga para todos los recursos
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

    // Iniciar la carga de la cola
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
    animation.x = chickenXPos;
    animation.y = chickenYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function birdDeath()
{
    deathAnimation = new createjs.Sprite(birdDeathSpriteSheet, "die");
    deathAnimation.regX = 24;
    deathAnimation.regY = 31;
    deathAnimation.x = chickenXPos;
    deathAnimation.y = chickenYPos;
    deathAnimation.gotoAndPlay("die");
    stage.addChild(deathAnimation);
    createjs.Sound.play("deathSound");
}

function tickEvent()
{
    var randomize = false;

    // Deberiamos cambiar la ruta de la gallina?
    if (ticksCounter == ticksForRandomize)
    {
        debug("Changing cucco path...", DEBUG.INFO);

        randomize = true;
        ticksCounter = 0;
    } else {
        ticksCounter++;
        debug("Ticks: " + ticksCounter, DEBUG.INFO);
    }

	/*
     * Verificar que la gallina este dentro del canvas y mover
     *
     */

    // Posicion horizontal
	if(chickenXPos < WIDTH - 5 && chickenXPos > 5)
	{
        if (randomize) {
            chickenXSpeed = (!(Math.random()<.5) ? chickenXSpeed : chickenXSpeed * (-1));
        }

        chickenXPos += chickenXSpeed;
	} else {
		chickenXSpeed = chickenXSpeed * (-1);
		chickenXPos += chickenXSpeed;
	}

    // Posicion vertical
	if(chickenYPos < HEIGHT - 5 && chickenYPos > 5)
	{
		if (randomize) {
            chickenYSpeed = (!(Math.random()<.5) && chickenXSpeed > 0 ? chickenYSpeed : chickenYSpeed * (-1));
        }

        chickenYPos += chickenYSpeed;

	} else {
		chickenYSpeed = chickenYSpeed * (-1);
		chickenYPos += chickenYSpeed;
	}

    // Actualizar la posicion de los graficos
	animation.x = chickenXPos;
	animation.y = chickenYPos;

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
    chickenXSpeed *= 1.05;
    chickenYSpeed *= 1.06;
    debug("Changed enemy speed x: " + chickenXSpeed + " y: " + chickenYSpeed, DEBUG.INFO);

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

        // Randomize direction
        chickenXSpeed = (!(Math.random()<.5) ? chickenXSpeed : chickenXSpeed * (-1));
        chickenYSpeed = (!(Math.random()<.5)  && chickenXSpeed > 0 ? chickenYSpeed : chickenYSpeed * (-1));
    	
        //Make it harder next time
    	chickenYSpeed *= 1.15;
    	chickenXSpeed *= 1.3;

        if (chickenXSpeed > 60) chickenXSpeed = 65;
        if (chickenYSpeed > 60) chickenYSpeed = 60;

        debug("Changed enemy speed x: " + chickenXSpeed + " y: " + chickenYSpeed);

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
