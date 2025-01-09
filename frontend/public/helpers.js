function checkCollision(ball, target) {
  // Check if ball hits target
  return (
    ball.y + ball.size/2 >= target.y &&
    ball.y - ball.size/2 <= target.y + target.height &&
    ball.x + ball.size/2 >= target.x - target.width/2 &&
    ball.x - ball.size/2 <= target.x + target.width/2
  );
}

function displayScore(score) {
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);
}