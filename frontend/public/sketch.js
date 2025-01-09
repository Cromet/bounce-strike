// Global variables
let ball;
let target;
let score = 0;
let canDrop = true;
let gameStarted = false;
let gameMode;
let gameModeMenu;

// p5.js will automatically use these functions
function setup() {
  createCanvas(windowWidth, windowHeight);
  ball = new Ball(mouseX, mouseY);
  target = new Target();
  initializeMultiplayer();
  
  // Initialize game mode menu
  gameModeMenu = new GameModeMenu();
}

function draw() {
  background(20);
  
  if (!gameStarted) {
    // Draw the mode selection menu
    gameModeMenu.draw();
    return;
  }
  
  // Game is active, run normal game loop
  if (keyIsDown(LEFT_ARROW)) {
    ball.move(-1);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    ball.move(1);
  }
  
  // Update ball position if not active
  if (!ball.active) {
    ball.x = mouseX;
    ball.y = mouseY;
  }
  
  // Mode-specific updates
  switch (gameMode) {
    case 'team':
      updateTeamMode();
      break;
    case 'battle':
      updateBattleMode();
      break;
    case 'coop':
      updateCoopMode();
      break;
    default:
      updateClassicMode();
  }
  
  // Common updates
  ball.update();
  sendBallUpdate(ball);
  drawOpponentBalls();
  displayGameInfo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (!gameStarted) {
    gameModeMenu.handleClick();
    return;
  }
  
  if (canDrop) {
    ball.active = true;
    canDrop = false;
    ball.vy = map(mouseY, height, 0, 1, 20);
  }
}

function mouseMoved() {
  if (!gameStarted) {
    gameModeMenu.handleHover();
  }
}

function keyPressed() {
  // Press ESC to return to mode selection
  if (keyCode === ESCAPE && gameStarted) {
    gameStarted = false;
    gameModeMenu.show();
    // Disconnect from current room
    if (socket) {
      socket.emit('leave-room');
    }
  }
}

function updateClassicMode() {
  target.update();
  target.draw();
  
  if (ball.active && checkCollision(ball, target)) {
    handleScoring();
  }
}

function updateTeamMode() {
  target.update();
  target.draw();
  
  // Draw team-colored balls
  const playerTeam = players.get(socket.id)?.team;
  if (playerTeam) {
    push();
    fill(playerTeam);
    ball.draw();
    pop();
  }
  
  if (ball.active && checkCollision(ball, target)) {
    handleTeamScoring();
  }
}

function updateBattleMode() {
  target.update();
  target.draw();
  
  // Update and draw power-ups
  updatePowerUps();
  
  if (ball.active && checkCollision(ball, target)) {
    handleBattleScoring();
  }
}

function updateCoopMode() {
  // Shared target between players
  if (isHost()) {
    target.update();
    socket.emit('target-moved', { x: target.x, y: target.y });
  }
  target.draw();
  
  if (ball.active && checkCollision(ball, target)) {
    handleCoopScoring();
  }
}

function handleScoring() {
  score++;
  sendScoreUpdate(score);
  ball.active = false;
  canDrop = true;
}

function handleTeamScoring() {
  score++;
  sendScoreUpdate(score);
  ball.active = false;
  canDrop = true;
}

function handleBattleScoring() {
  score++;
  sendScoreUpdate(score);
  // Generate power-up for scoring player
  spawnPowerUp(ball.x, ball.y);
  ball.active = false;
  canDrop = true;
}

function handleCoopScoring() {
  score++;
  sendScoreUpdate(score);
  // Make target harder to hit in co-op mode
  target.speed *= 1.1;
  ball.active = false;
  canDrop = true;
}