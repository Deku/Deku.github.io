var version = "0.3.0";
var game;
var caught = 0;
var totalCaught = 0;
var shipCompleted = 0;
// Dimensiones del canvas
var WIDTH = 768;
var HEIGHT = 672;

function getAngle(x1, y1, x2, y2) {
    var pend = (y2 - y1) / (x2 - x1);

    return Math.atan(pend);
}


window.onload = function () {
    var container = document.getElementById('game-container');
    game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, container);
    game.state.add("Title", titleState);
    game.state.add("PlayGame", gameState);
    game.state.add("GameOver", gameOverState);

    game.state.start("Title");
}

/*
 * Main menu
 *
 */
var titleState = function (game) {};

titleState.prototype = {
    preload: function() {
        game.load.image('background','assets/background.png');
        game.load.image('button', 'assets/buttonLong_brown.png');
    },
    create: function () {
        var line1;
        var line2;
        var versionText;
        var button;
        var buttonText;

        game.stage.backgroundColor = '#182d3b';        
        game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'background');
        
        line1 = game.add.text(game.world.centerX, game.world.centerY, "Cuccos", {font: "65px Arial Black", fill: "#fff", align: "center"});
        line1.anchor.set(0.5);
        
        line2 = game.add.text(game.world.centerX, game.world.centerY + 50, "for dinner", {font: "36px Arial Black", fill: "#fff", align: "center"});
        line2.anchor.set(0.5);

        versionText = game.add.text(game.world.width - 10, game.world.height - 10, "v" + version, {font: "16px Arial", fill: "#fff", align: "right"});
        versionText.anchor.set(1,1);

        button = game.add.button(game.world.centerX, game.world.centerY + 110, "button");
        button.anchor.set(0.5);
        button.inputEnabled = true;
        button.events.onInputDown.add(function () {
            game.state.start("PlayGame");
        }, this);
        
        buttonText = game.add.text(
                button.centerX,
                button.centerY,
                "PLAY",
                {font: "24px Arial", fill: "#fff", align: "center"}
            );
        buttonText.anchor.set(0.5);
    }
};



/*
 * The game
 *
 */
var gameState = function (game) {
    this.RUNAWAY_RADIUS = 300;

    // GUI Layer group
    this.gui;
    // GUI texts
    this.scoreText;
    this.timeText;
    this.shipmentsText;
    // In-game notifications
    this.notificationsQueue = [];
    // Time limit for the game
    this.timeLimit;
    // Entities Layer group
    this.entities;
    // Array containing cuccos
    this.cuccos;
    // Current amount of cuccos displayed
    this.amount;
    this.maxAmount = 16;
    // Amount per shipment
    this.shipmentReq = [10, 50, 100, 200, 500, 1000, 5000];
    // Speed for a bird
    this.minSpeed;
    this.maxSpeed = 200;
    // Audio
    this.bgm;
    this.dieSound;
};

gameState.prototype = {
    preload: function () {
        game.load.image("background","assets/background.png");
        game.load.image("clock", "assets/gui.png");
        game.load.spritesheet("cucco", "assets/bird.png", 48, 63);
        game.load.spritesheet("goldencucco", "assets/goldenBird.png", 48, 63);
        game.load.spritesheet("cuccodie", "assets/birdDeath.png", 48, 63);
        game.load.audio("bgm", ["assets/tlozmc_minigame.mp3"]);
        game.load.audio("cuccodiesound", ["assets/OOT_Cucco2.wav"]);
    },
    create: function () {
        // Reset game variables
        caught = 0;
        totalCaught = 0;
        shipCompleted = 0;
        this.cuccos = [];
        this.amount = 1;
        this.minSpeed = 50;
        this.timeLimit = 60;
        this.game.time.reset();

        // Create background
        game.stage.backgroundColor = "#182d3b";
        game.add.tileSprite(0, 0, WIDTH, HEIGHT, "background");
        
        // Start playing background music
        if (this.bgm != null) {
            this.bgm.stop();
        } else {
            this.bgm = game.add.audio("bgm");
        }
        this.bgm.play('', 0, 1, true, true);

        // Set the die sound for future uses
        this.dieSound = game.add.audio("cuccodiesound");

        // Add birds to the screen
        this.entities = game.add.group();
        this.addBirds();

        // Initialize texts
        this.gui = game.add.group();
        this.gui.create(10, 10, "clock");
        this.scoreText = game.add.text(110, 17, caught + "/" + this.shipmentReq[shipCompleted], {font: "18px Arial", fill: "#fff"});
        this.shipmentsText = game.add.text(290, 17, shipCompleted, {font: "18px Arial", fill: "#fff"});
        this.timeText = game.add.text(120, 50, this.timeLimit, {font: "18px Arial", fill: "#fff"});
        this.gui.add(this.scoreText);
        this.gui.add(this.shipmentsText);
        this.gui.add(this.timeText);
        
        // Register mouse click for AI behavior
        this.game.input.onDown.add(this.runaway, this);
    },
    render: function () {
        // Get remaining time, limit it in 0
        var remainingTime = Math.floor(this.timeLimit - this.game.time.totalElapsedSeconds());
        remainingTime = remainingTime < 0 ? 0 : remainingTime;

        this.timeText.setText(remainingTime);

        // Trigger game over if time runs out
        if (remainingTime == 0) {
            this.gameOver();
        }
    },
    addBirds: function () {
        for (var i = 0; i < this.amount; i++) {

            if (this.cuccos[i] == undefined || this.cuccos[i].alive == false) {
                // If the sprite exists but is dead, try to destroy it
                try {
                    this.cuccos[i].destroy();    
                } catch (e) {};
                
                // Initialize vars to create a bird
                var randX = Math.floor(Math.random() * game.world.width);
                var randY = Math.floor(Math.random() * game.world.height);
                var velX = Math.floor(this.minSpeed + (Math.random() * this.maxSpeed));
                var velY = Math.floor(this.minSpeed + (Math.random() * this.maxSpeed));
                velX = velX > this.maxSpeed ? this.maxSpeed : velX;
                velY = velY > this.maxSpeed ? this.maxSpeed : velY;
                // 10% chance to spawn a golden cucco
                var isGolden = (Math.random() * 100) <= 50;
                var birdType = isGolden ? "goldencucco" : "cucco";

                this.cuccos[i] = this.entities.create(randX, randY, birdType);
                this.cuccos[i].name = birdType;
                this.cuccos[i].animations.add("move");
                this.cuccos[i].animations.play("move", 10, true);
                this.cuccos[i].anchor.set(0.5);
                this.cuccos[i].checkWorldBounds = true;
                this.cuccos[i].inputEnabled = true;
                this.cuccos[i].events.onInputDown.add(this.onBirdClick, this);

                game.physics.enable(this.cuccos[i], Phaser.Physics.ARCADE);

                this.cuccos[i].body.collideWorldBounds = true;
                this.cuccos[i].body.bounce.set(1);
                this.cuccos[i].body.velocity.x = velX;
                this.cuccos[i].body.velocity.y = velY;
            }
        }
    },
    runaway: function() {
        for (var i = 0; i < this.cuccos.length; i++) {
            if (!this.cuccos[i].alive) { continue; }

            var distance = Math.sqrt(Math.pow(game.input.x - this.cuccos[i].x, 2) + Math.pow(game.input.y - this.cuccos[i].y, 2));
            
            if (distance <= this.RUNAWAY_RADIUS) {
                // Speed in pixels/second relative to the distance from the click point.
                // The nearer it is, the fastest it runs
                var relSpeed = (this.RUNAWAY_RADIUS / (this.RUNAWAY_RADIUS * distance)) * this.maxSpeed;
                if (relSpeed > this.maxSpeed) {
                    relSpeed = this.maxSpeed;
                } else if (relSpeed < this.minSpeed) {
                    relSpeed = this.minSpeed;
                }

                var dirX = this.cuccos[i].x - game.input.x;
                var dirY = this.cuccos[i].y - game.input.y;

                this.cuccos[i].body.velocity.x = dirX + (relSpeed * (dirX < 0 ? -1 : 1));
                this.cuccos[i].body.velocity.y = dirY + (relSpeed * (dirX < 0 ? -1 : 1));
            } else {
                // Increase speed of alive cuccos
                var velX = this.cuccos[i].body.velocity.x * (1 + Math.random());
                var velY = this.cuccos[i].body.velocity.y * (1 + Math.random());

                velX = Math.abs(velX) > this.maxSpeed ? this.maxSpeed * (velX / Math.abs(velX)) : velX;
                velY = Math.abs(velY) > this.maxSpeed ? this.maxSpeed * (velY / Math.abs(velY)) : velY;

                this.cuccos[i].body.velocity.x = velX;
                this.cuccos[i].body.velocity.y = velY;

                //console.log("* Cucco[" + i + "] speed: x" + this.cuccos[i].body.velocity.x.toFixed(2) + " y" + this.cuccos[i].body.velocity.y.toFixed(2));
            }
        }
    },
    onBirdClick: function(bird) {
        // If the bird is golden, add 10 seconds
        if (bird.name == "goldencucco") {
            this.timeLimit += 10;
            this.popupText("+10 secs!");
        }

        // Catch the bird pos to display the animation
        var x = bird.x;
        var y = bird.y;
        
        // Stop the bird and kill it
        bird.body.velocity.x = 0;
        bird.body.velocity.y = 0;
        bird.destroy();

        // Replace with death animation in the same spot
        bird = this.entities.create(x, y, "cuccodie");
        bird.anchor.set(0.5)
        bird.animations.add("die");
        bird.animations.play("die", 15, false, true);

        // Play sound
        this.dieSound.play();
        
        // Update score
        caught++;
        totalCaught++;

        if (caught >= this.shipmentReq[shipCompleted]) {
            caught -= this.shipmentReq[shipCompleted];
            shipCompleted++;
            this.shipmentsText.setText(shipCompleted);

            if (shipCompleted == this.shipmentReq.length) {
                this.gameOver();
            }

            this.popupText("Shipment completed!");
        }

        this.scoreText.setText(caught + "/" + this.shipmentReq[shipCompleted]);

        // Increase difficulty
        this.amount = (this.amount >= this.maxAmount ? this.maxAmount : this.amount *= 2);
        this.minSpeed *= (1 + Math.random());
        if (this.minSpeed > this.maxSpeed) this.minSpeed = this.maxSpeed;


        this.runaway(true);

        this.addBirds();
    },
    popupText: function  (msg) {

        if (this.notificationsQueue.length > 0) {
            this.notificationsQueue.forEach(function (text, i) {
                game.add.tween(text).to({y: text.y - 30}, 100, Phaser.Easing.Linear.None, true);
            });
        }

        var popupText = game.add.text(game.world.width - 30, game.world.height -30, msg, {font: "24px Arial Black", fill: "#fff"});
        popupText.anchor.set(1);
        game.time.events.add(2000, function () {
            game.add.tween(popupText).to({y: (popupText.y - 50), alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
            this.notificationsQueue.pop();
        }, this);

        this.notificationsQueue.push(popupText);
    },
    gameOver: function() {
        game.state.start("GameOver");
    }
};




/*
 * Game over screen
 *
 */
var gameOverState = function(game) {}

gameOverState.prototype = {
    preload: function() {
        game.load.image('background','assets/background.png');
        game.load.image('button', 'assets/buttonLong_brown.png');
    },
    create: function () {
        var line1;
        var line2;
        var button;
        var buttonText;

        game.stage.backgroundColor = '#182d3b';        
        game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'background');
        
        line1 = game.add.text(game.world.centerX, game.world.centerY - 50, "GAME OVER", {font: "65px Arial Black", fill: "#fff", align: "center"});
        line1.stroke = "#292829";
        line1.strokeThickness = 16;
        line1.setShadow(2, 2, "#333333", 2, true, false);
        line1.anchor.set(0.5);

        var resultText = "You caught " + totalCaught + " cuccos, and managed to finish " + shipCompleted + " shipment" + (shipCompleted != 1 ? "s" : "");
        line2 = game.add.text(
            game.world.centerX,
            game.world.centerY,
            resultText,
            {font: "36px Arial Black", fill: "#fff", align: "center", wordWrap: true, wordWrapWidth: 500}
        );
        line2.setShadow(2, 2, "#333333", 2);
        line2.anchor.set(0.5, 0);

        button = game.add.button(game.world.centerX, game.world.centerY + 170, "button");
        button.anchor.set(0.5);
        button.inputEnabled = true;
        button.events.onInputDown.add(function () {
            game.state.start("PlayGame");
        }, this);

        buttonText = game.add.text(
                button.centerX,
                button.centerY,
                "PLAY AGAIN",
                {font: "24px Arial", fill: "#fff", align: "center"}
            );
        buttonText.anchor.set(0.5);
    }
}