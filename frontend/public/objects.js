class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.type = random(['speed', 'size', 'multiball', 'gravity']);
        this.active = true;
        this.pulseSize = 0;
        this.pulseDir = 1;
    }

    draw() {
        if (!this.active) return;
        
        // Pulse effect
        this.pulseSize += 0.5 * this.pulseDir;
        if (this.pulseSize > 5 || this.pulseSize < 0) this.pulseDir *= -1;
        
        push();
        // Different colors for different power-ups
        switch(this.type) {
            case 'speed':
                fill(255, 165, 0); // Orange
                break;
            case 'size':
                fill(147, 112, 219); // Purple
                break;
            case 'multiball':
                fill(0, 191, 255); // Deep sky blue
                break;
            case 'gravity':
                fill(50, 205, 50); // Lime green
                break;
        }
        
        // Draw power-up
        noStroke();
        circle(this.x, this.y, this.size + this.pulseSize);
        
        // Draw icon
        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        switch(this.type) {
            case 'speed':
                text('⚡', this.x, this.y);
                break;
            case 'size':
                text('⭐', this.x, this.y);
                break;
            case 'multiball':
                text('×2', this.x, this.y);
                break;
            case 'gravity':
                text('↑', this.x, this.y);
                break;
        }
        pop();
    }

    checkCollision(ball) {
        return this.active && 
               dist(this.x, this.y, ball.x, ball.y) < (this.size/2 + ball.size/2);
    }
}

class Ball {
    constructor(x, y, size = 20, isClone = false) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.originalSize = size;
        this.vy = 0;
        this.vx = 0;
        this.gravity = 0.6;
        this.originalGravity = 0.6;
        this.bounce = -0.7;
        this.active = false;
        this.moveSpeed = 5;
        this.friction = 0.98;
        this.isClone = isClone;
        
        // Power-up states
        this.powerUps = {
            speed: 0,
            size: 0,
            gravity: 0
        };
        this.effects = [];
    }

    update() {
        if (!this.active) return;
        
        // Update power-up timers
        Object.keys(this.powerUps).forEach(power => {
            if (this.powerUps[power] > 0) {
                this.powerUps[power]--;
                if (this.powerUps[power] === 0) this.deactivatePowerUp(power);
            }
        });
        
        // Update effects
        this.effects = this.effects.filter(effect => {
            effect.life--;
            return effect.life > 0;
        });
        
        // Apply physics
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;
        this.vx *= this.friction;
        
        // Ground collision
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

    draw() {
        push();
        // Draw effects
        this.effects.forEach(effect => {
            noFill();
            stroke(effect.color);
            strokeWeight(2);
            circle(this.x, this.y, this.size + effect.life/2);
        });
        
        // Draw ball with power-up visual effects
        if (this.powerUps.speed > 0) {
            // Speed trail effect
            for (let i = 1; i <= 3; i++) {
                noStroke();
                fill(255, 165, 0, 100 - i * 30);
                circle(this.x - this.vx * i, this.y - this.vy * i, this.size);
            }
        }
        
        // Main ball
        fill(this.isClone ? color(0, 191, 255, 200) : 255);
        noStroke();
        circle(this.x, this.y, this.size);
        
        // Power-up indicators
        if (Object.values(this.powerUps).some(v => v > 0)) {
            noFill();
            stroke(255, 255, 0);
            strokeWeight(2);
            circle(this.x, this.y, this.size + 5);
        }
        pop();
    }

    activatePowerUp(type) {
        const duration = 300; // 5 seconds at 60fps
        
        switch(type) {
            case 'speed':
                this.moveSpeed = 8;
                this.friction = 0.99;
                this.powerUps.speed = duration;
                this.addEffect(255, 165, 0);
                break;
            case 'size':
                this.size = this.originalSize * 1.5;
                this.powerUps.size = duration;
                this.addEffect(147, 112, 219);
                break;
            case 'gravity':
                this.gravity = this.originalGravity * 0.5;
                this.powerUps.gravity = duration;
                this.addEffect(50, 205, 50);
                break;
        }
    }

    deactivatePowerUp(type) {
        switch(type) {
            case 'speed':
                this.moveSpeed = 5;
                this.friction = 0.98;
                break;
            case 'size':
                this.size = this.originalSize;
                break;
            case 'gravity':
                this.gravity = this.originalGravity;
                break;
        }
    }

    addEffect(r, g, b) {
        this.effects.push({
            color: color(r, g, b),
            life: 60
        });
    }

    move(direction) {
        if (this.active) {
            this.vx += direction * this.moveSpeed;
            this.vx = constrain(this.vx, -15, 15);
        }
    }
}