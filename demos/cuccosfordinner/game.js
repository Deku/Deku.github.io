var game;
var score = 0;
// Dimensiones del canvas
var WIDTH = 768;
var HEIGHT = 672;

window.onload = function () {
    var container = document.getElementById('game-container');
    game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, container);
    game.state.add("Title", titleState);
    game.state.add("PlayGame", gameState);
    game.state.add("GameOver", gameOverState);

    game.state.start("Title");
}




var titleState = function (game) {};

titleState.prototype = {
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
        line1 = game.add.text(game.world.centerX, game.world.centerY, "Cuccos", {font: "65px Arial Black", fill: "#fff", align: "center"});
        line2 = game.add.text(game.world.centerX, game.world.centerY + 50, "for dinner", {font: "36px Arial Black", fill: "#fff", align: "center"});
        line1.anchor.set(0.5);
        line2.anchor.set(0.5);
        button = game.add.button(game.world.centerX, game.world.centerY + 110, "button", function () {
            game.state.start("PlayGame");
        });
        button.anchor.set(0.5);
        buttonText = game.add.text(
                button.centerX,
                button.centerY,
                "PLAY",
                {font: "24px Arial", fill: "#fff", align: "center"}
            );
        buttonText.anchor.set(0.5);
    }
};




var gameState = function (game) {
    // GUI Layer group
    this.gui;
    // GUI texts
    this.scoreText;
    this.timeText;
    // Time limit for the game
    this.timeLimit;
    // Entities Layer group
    this.entities;
    // Array containing cuccos
    this.cuccos;
    // Current amount of cuccos displayed
    this.amount;
    this.maxAmount = 16;
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
        this.cuccos = [];
        this.amount = 1;
        this.minSpeed = 10;
        this.timeLimit = 60;
        this.game.time.reset();

        // Create background
        game.stage.backgroundColor = "#182d3b";
        game.add.tileSprite(0, 0, WIDTH, HEIGHT, "background");
        
        // Start playing background music
        this.bgm = game.add.audio("bgm");
        this.bgm.play();
        // Set the die sound for future uses
        this.dieSound = game.add.audio("cuccodiesound");

        // Add birds to the screen
        this.entities = game.add.group();
        this.addBirds();

        // Initialize texts
        this.gui = game.add.group();
        this.gui.create(10, 10, "clock");
        this.scoreText = game.add.text(50, 15, "Cuccos catched: 0", {font: "18px Arial", fill: "#fff"});
        this.timeText = game.add.text(50, 50, "Remaining time: " + this.timeLimit, {font: "18px Arial", fill: "#fff"});
        this.gui.add(this.scoreText);
        this.gui.add(this.timeText);
        
    },
    render: function () {
        // Get remaining time, limit it in 0
        var remainingTime = Math.floor(this.timeLimit - this.game.time.totalElapsedSeconds());
        remainingTime = remainingTime < 0 ? 0 : remainingTime;

        this.timeText.setText("Remaining time: " + remainingTime);

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
                var isGolden = (Math.random() * 100) <= 10;
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
            } else {
                // Increase speed of alive cuccos
                var velX = this.cuccos[i].body.velocity.x * (1 + Math.random());
                var velY = this.cuccos[i].body.velocity.y * (1 + Math.random());
                velX = velX > this.maxSpeed ? this.maxSpeed : velX;
                velY = velY > this.maxSpeed ? this.maxSpeed : velY;

                this.cuccos[i].body.velocity.x = velX;
                this.cuccos[i].body.velocity.y = velY;
            }
        }
    },
    onBirdClick: function(bird) {
        // If the bird is golden, add 10 seconds
        if (bird.name == "goldencucco") {
            this.timeLimit += 10;
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
        score += 1;
        this.scoreText.setText("Cuccos catched: " + score);

        // Increase difficulty
        this.amount = (this.amount >= this.maxAmount ? this.maxAmount : this.amount *= 2);
        this.minSpeed *= (1 + Math.random());

        this.addBirds();
    },
    gameOver: function() {
        game.state.start("GameOver");
    }
};





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
        line1 = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER", {font: "65px Arial Black", fill: "#fff", align: "center"});
        line2 = game.add.text(game.world.centerX, game.world.centerY + 50, "You catched " + score + " cuccos", {font: "36px Arial Black", fill: "#fff", align: "center"});
        line1.anchor.set(0.5);
        line2.anchor.set(0.5);
        button = game.add.button(game.world.centerX, game.world.centerY + 110, "button", function () {
            game.state.start("PlayGame", true, true);
        });
        button.anchor.set(0.5);
        buttonText = game.add.text(
                button.centerX,
                button.centerY,
                "PLAY AGAIN",
                {font: "24px Arial", fill: "#fff", align: "center"}
            );
        buttonText.anchor.set(0.5);
    }
}