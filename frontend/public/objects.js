class Ball {
    constructor(x, y, size = 20) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.vy = 0;     // Vertical velocity
        this.vx = 0;     // Horizontal velocity
        this.gravity = 0.6;
        this.bounce = -0.7;
        this.active = false;
        this.moveSpeed = 5;    // Horizontal movement speed
        this.friction = 0.98;  // Horizontal friction
    }

    update() {
        if (!this.active) return;
        
        // Apply gravity and velocities
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;
        
        // Apply horizontal friction
        this.vx *= this.friction;
        
        // Ground collision with bounce
        if (this.y + this.size/2 > height) {
            this.y = height - this.size/2;
            this.vy *= this.bounce;
        }
        
        // Wall collisions
        if (this.x - this.size/2 < 0) {
            this.x = this.size/2;
            this.vx *= -0.5;
        }
        if (this.x + this.size/2 > width) {
            this.x = width - this.size/2;
            this.vx *= -0.5;
        }
    }

    move(direction) {
        if (this.active) {
            this.vx += direction * this.moveSpeed;
            // Limit maximum horizontal speed
            this.vx = constrain(this.vx, -15, 15);
        }
    }

    draw() {
        fill(255);
        noStroke();
        circle(this.x, this.y, this.size);
    }
}

class Target {
    constructor(difficulty = 0) {
        this.width = 60;
        this.height = 10;
        this.y = height - this.height;
        this.x = width/2;
        this.speed = getDifficultySpeed(difficulty);
        this.direction = 1;
    }

    setDifficulty(difficulty) {
        this.speed = getDifficultySpeed(difficulty);
    }

    update() {
        // Move back and forth
        this.x += this.speed * this.direction;
        
        // Reverse at edges
        if (this.x + this.width/2 > width || this.x - this.width/2 < 0) {
            this.direction *= -1;
        }
    }

    draw() {
        fill(255, 0, 0);
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height);
    }
}