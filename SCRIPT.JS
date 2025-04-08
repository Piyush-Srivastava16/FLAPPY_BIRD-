//< ---------------------------------------------------------------SETTING BOARD---------------------------------------------------------------------->

let board;
let boardWidth = window.innerWidth;
let boardHeight = 660;
let context;

//<------------------------------------------------------------------ SETTING BIRD ---------------------------------------------------------------------->

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

// <------------------------------------------------------------------- CREATING A OBJECT ------------------------------------------------------------------>

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight
};

// <------------------------------------------------------------------------ FOR PIPES ----------------------------------------------------------------------->

let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// <--------------------------------------------------------------------------------Game Physics---------------------------------------------------------------------------------------------------->

let velocityX = -2.5; // pipes moving left speed (L<-R)
let velocityY = 0; // Bird Jump Speed
let gravity = 0.18; // setting Gravity (bird goes downward)

let gameOver = false;
let score = 0;
let paused = false; // Add a paused state

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); // used for drawing on the board

  // LOAD THE BIRD IMAGE
  birdImg = new Image();
  birdImg.src = "./flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  // LOAD THE PIPES IMAGE
  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  requestAnimationFrame(update);

  // FUNCTION THAT GENERATES THE PIPES
  setInterval(placePipes, 1650); // every 1.65 seconds
  document.addEventListener("keydown", moveBird);
  document.addEventListener("keydown", handlePause); // Add listener for ESC key (pause)
  document.addEventListener("keydown", handleResume); // Add listener for Enter key (resume)
};

// <------------------------------------------------------------------------------main game loop----------------------------------------------------------------------------------------------------->

function update() {
  if (paused) {
    return; // If paused, stop updating the game
  }

  requestAnimationFrame(update); // updating the new frame

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height); // Clearing the previous frame

  // bird
  velocityY += gravity;

  bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird.y, limit the bird.y to top of the canvas

  // drawing bird for each frame
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    gameOver = true;
  }

  // PIPES
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX; // shifting the X position of each pipe 2px to the left
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      // Updating score condition
      score += 0.5; // score update 0.5 because there are two pipes
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  // clearing the previous pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // removes first element from the array
  }

  // score
  context.fillStyle = "WHITE";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  if (gameOver) {
    context.fillText("GAME OVER", 5, 90);
  }

  if (paused) {
    context.fillText("PAUSED", boardWidth / 2 - 75, boardHeight / 2); // Display "PAUSED" message
  }
}

function placePipes() {
  if (gameOver || paused) {
    return; // If paused or game over, don't place pipes
  }

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyW") {
    velocityY = -6; // ---BIRD JUMP

    // RESET THE GAME
    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && // a's top right corner passes b's top left corner
    a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y // a's bottom left corner passes b's top left corner
  );
}

// Pause the game when Escape key is pressed
function handlePause(e) {
  if (e.code === "Escape") {
    paused = true; // Pause the game
  }
}

// Resume the game when Enter key is pressed
function handleResume(e) {
  if (e.code === "Enter") {
    paused = false; // Resume the game
    requestAnimationFrame(update); // Ensure the game loop continues if Enter is pressed
  }
}
