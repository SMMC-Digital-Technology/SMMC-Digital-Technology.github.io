// world
var WIDTH = window.innerWidth; // or use 720
var HEIGHT = HEIGHT = window.innerHeight; // or use 720

var GRID_X = 9;
var GRID_Y = 8;

var GRID_WIDTH = WIDTH / GRID_X;
var GRID_HEIGHT = HEIGHT / GRID_Y;

var CENTRE_X = GRID_WIDTH / 2;
var CENTRE_Y = GRID_HEIGHT / 2;

// tombstones
var tombstones;

// humans
var humans;
var currentHumans;
var maxHumans = 15;

// player
var player;
var playerLives;
var livesText;
var score = 0;
var scoreText;
var GHOST_SPEED = 30;


var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'thegame', { preload: preload, create: create, update: update });

/**
 * Load the game assets.
 */
function preload() {
   game.load.image("background", "./assets/background.png");
   game.load.image("Plant_0", "./assets/Plant_0.png");
   game.load.image("Plant_1", "./assets/Plant_1.png");
   game.load.image("Plant_2", "./assets/Tree_0.png");
   game.load.image("Plant_3", "./assets/Tree_1.png");
   game.load.image("Stone_0", "./assets/TombStone_0.png");
   game.load.image("Stone_1", "./assets/TombStone_1.png");
   game.load.image("Human_0", "./assets/human_0.png");
   game.load.image("Human_1", "./assets/human_1.png");
   game.load.image("Human_2", "./assets/human_2.png");
   game.load.image("Human_3", "./assets/human_3.png");
   game.load.image("ghost", "./assets/ghost.png");
}

/**
 * Create the game system.
 */
function create() {
   game.physics.startSystem(Phaser.Physics.ARCADE);

   game.scaleMode = Phaser.ScaleManager.SHOW_ALL;

   playerLives = 3;
   score = 0;
   currentHumans = 0;

   // background
   game.add.sprite(0, 0, "background");

   // objects
   tombstones = game.add.group();
   tombstones.enableBody = true;


   createGameWorld();

   scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
   livesText = game.add.text(WIDTH - 16, 16, 'Lives: 3', { fontSize: '32px', fill: '#000' });
   livesText.anchor.x = 1;

   humans = game.add.group();
   humans.enableBody = true;
   addHuman();
   game.time.events.loop(Phaser.Timer.SECOND * 30, addHuman, this);


   // player
   var px = Math.ceil(GRID_X / 2) * GRID_WIDTH + CENTRE_X;
   var py = Math.floor(GRID_Y / 2) * GRID_HEIGHT + CENTRE_Y;
   player = game.add.sprite(px, py, "ghost");
   player.anchor.x = 0.5;
   player.anchor.y = 0.5;
   game.physics.arcade.enable(player);
   player.body.collideWorldBounds = true;

}

/**
 * Randomly creates the game world based on simple rules.
 */
function createGameWorld() {
   for (var i = 0; i < GRID_Y; i++) {
      for (var j = 0; j < GRID_X; j++) {
         if (i % 2 == 0) {
            if (j % 2 == 0) {
               addTombstone(j, i);
            }
         } else {
            if (j % 2 != 0) {
               addPlant(j, i);
            }
         }
      }
   }
}

/**
 * Adds a random tombstone to the world at the given grid position.
 */
function addTombstone(x, y) {
   var string =  "Stone_" + getRandomInRange(0,2);
   var stone = tombstones.create(x * GRID_WIDTH + CENTRE_X, (y+1) * GRID_HEIGHT, string);
   stone.anchor.x = 0.5;
   stone.anchor.y = 0.9;
}

/**
 * Adds a random plant to the world at the given grid position.
 */
function addPlant(x, y) {
   var string =  "Plant_" + getRandomInRange(0,4);
   var plant = game.add.sprite(x * GRID_WIDTH + CENTRE_X, (y+1) * GRID_HEIGHT, string);
   plant.scale.x = 0.75;
   plant.scale.y = 0.75;
   plant.anchor.x = 0.5;
   plant.anchor.y = 0.9;
}

/**
 *
 */
function addHuman() {
   if (currentHumans < maxHumans) {
      currentHumans = currentHumans + 1;
      var x = getRandomInRange(0, GRID_X);
      var y = 0;
      if (x % 2 == 0) {
         y = getRandomOddInRange(0, GRID_Y);
      } else {
         y = getRandomEvenInRange(0, GRID_Y);
      }
      var string =  "Human_" + getRandomInRange(0,4);
      var human = humans.create(x * GRID_WIDTH + CENTRE_X, (y+1) * GRID_HEIGHT, string);
      human.anchor.x = 0.5;
      human.anchor.y = 0.9;
      human.scared = false;
      human.checkWorldBounds = true;
      human.outOfBoundsKill = true;
   }
}

/**
 * Game control loop
 */
function update() {
   game.physics.arcade.overlap(player, tombstones, hitTombstone, null, this);
   game.physics.arcade.overlap(player, humans, hitHuman, null, this);

   if (game.input.activePointer.isDown) {
      moveGhost();
   }
}

/**
 * Actions the player ghost hitting a tombsone.
 */
function hitTombstone (player, stone) {
   player.body.velocity.x = player.body.velocity.x * -1;
   player.body.velocity.y = player.body.velocity.y * -1;
   playerLives = playerLives - 1;
   livesText.text = "Lives: " + playerLives;
   if (playerLives == 0) {
      game.state.restart();
   }
}

/**
 * Actions the player ghost hitting a human.
 */
function hitHuman (player, human) {
   if (!human.scared) {
      human.body.velocity.x = 50;
      human.scared = true;
      score = score + 1;
      scoreText.text = "Score: " + score;
      currentHumans = currentHumans - 1;
      addHuman();
   }
}


/**
 * Moves the ghost in the rough direction of the mouse.
 */
function moveGhost() {
   var deltaX = game.input.activePointer.x - player.x;
   var deltaY = game.input.activePointer.y - player.y;
   if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // make an x change
      player.body.velocity.x = GHOST_SPEED * Math.sign(deltaX);
      player.body.velocity.y = 0;
   } else {
      // make a y change
      player.body.velocity.y = GHOST_SPEED * Math.sign(deltaY);
      player.body.velocity.x = 0;
   }
}

/**
 * Returns a random integer between min (inclusive) and max (exclusive)
 * MDN example
 */
function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Returns a random ODD number between min (inclusive) and max (inclusive)
 */
function getRandomOddInRange(min, max) {
   var number = 0;
   while (number % 2 == 0) {
      number = getRandomInRange(min, max);
   }
   return number;
}

/**
 * Returns a random EVEN number between min (inclusive) and max (inclusive)
 */
function getRandomEvenInRange(min, max) {
   var number = 0;
   while (number % 2 != 0) {
      number = getRandomInRange(min, max);
   }
   return number;
}
