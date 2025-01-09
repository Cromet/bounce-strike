// Global game state
window.gameState = {
  ball: null,
  target: null,
  score: 0,
  canDrop: true,
  gameStarted: false,
  mode: null
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  gameState.ball = new Ball(mouseX, mouseY);
  gameState.target = new Target();
  initializeMultiplayer();
}

function draw() {
  background(20);
  
  if (!gameState.gameStarted) {
    gameModeMenu?.draw();
    return;
  }
  
  // Game is active, run normal game loop
  if (keyIsDown(LEFT_ARROW)) {
    gameState.ball.move(-1);
  }
  if (keyIsDown(RIGHT_ARROW)) {
    gameState.ball.move(1);
  }
  
  // Update ball position if not active
  if (!gameState.ball.active) {
    gameState.ball.x = mouseX;
    gameState.ball.y = mouseY;
  }
  
  // Update game objects
  gameState.ball.update();
  gameState.target.update();
  
  // Send ball position to other players
  if (gameState.ball.active) {
    sendBallUpdate(gameState.ball);
  }
  
  // Draw everything
  gameState.target.draw();
  gameState.ball.draw();
  drawOpponentBalls();
  displayGameInfo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (!gameState.gameStarted) {
    gameModeMenu?.handleClick();
    return;
  }
  
  if (gameState.canDrop) {
    gameState.ball.active = true;
    gameState.canDrop = false;
    gameState.ball.vy = map(mouseY, height, 0, 1, 20);
  }
}

function mouseMoved() {
  if (!gameState.gameStarted) {
    gameModeMenu?.handleHover();
  }
}

function keyPressed() {
  // Press ESC to return to mode selection
  if (keyCode === ESCAPE && gameState.gameStarted) {
    gameState.gameStarted = false;
    gameModeMenu.show();
    // Disconnect from current room
    if (socket) {
      socket.emit('leave-room');
    }
  }
}