// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleHeight = 80;
const paddleWidth = 10;
const ballSize = 8;
const paddleSpeed = 6;
const initialBallSpeed = 4;

let playerScore = 0;
let computerScore = 0;

// Paddle objects
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: initialBallSpeed,
    dy: initialBallSpeed,
    speed: initialBallSpeed
};

// Keyboard input tracking
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Mouse tracking
let mouseY = canvas.height / 2;

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Mouse movement tracking
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle based on input
function updatePlayerPaddle() {
    // Arrow key control
    if (keys.ArrowUp]) {
        player.dy = -paddleSpeed;
    } else if (keys.ArrowDown]) {
        player.dy = paddleSpeed;
    } else {
        // Mouse control
        const paddleCenter = player.y + player.height / 2;
        if (mouseY < paddleCenter - 5) {
            player.dy = -paddleSpeed;
        } else if (mouseY > paddleCenter + 5) {
            player.dy = paddleSpeed;
        } else {
            player.dy = 0;
        }
    }

    // Update position
    player.y += player.dy;

    // Boundary collision for player paddle
    if (player.y < 0) {
        player.y = 0;
    } else if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const difficulty = 3.5; // Adjust for AI difficulty

    if (ballCenter < computerCenter - 20) {
        computer.y -= difficulty;
    } else if (ballCenter > computerCenter + 20) {
        computer.y += difficulty;
    }

    // Boundary collision for computer paddle
    if (computer.y < 0) {
        computer.y = 0;
    } else if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        if (ball.y - ball.size < 0) {
            ball.y = ball.size;
        } else {
            ball.y = canvas.height - ball.size;
        }
    }

    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;

        // Add spin based on paddle movement
        const paddleCenter = player.y + player.height / 2;
        const collidePoint = ball.y - paddleCenter;
        const collidePercent = collidePoint / (player.height / 2);
        ball.dy = collidePercent * ball.speed;

        // Increase ball speed slightly
        if (Math.abs(ball.dx) < 8) {
            ball.speed += 0.5;
            ball.dx = ball.dx > 0 ? Math.abs(ball.speed) : -Math.abs(ball.speed);
        }
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;

        // Add spin based on paddle position
        const paddleCenter = computer.y + computer.height / 2;
        const collidePoint = ball.y - paddleCenter;
        const collidePercent = collidePoint / (computer.height / 2);
        ball.dy = collidePercent * ball.speed;

        // Increase ball speed slightly
        if (Math.abs(ball.dx) < 8) {
            ball.speed += 0.5;
            ball.dx = ball.dx > 0 ? Math.abs(ball.speed) : -Math.abs(ball.speed);
        }
    }

    // Scoring - left side
    if (ball.x - ball.size < 0) {
        computerScore++;
        resetBall();
    }

    // Scoring - right side
    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = initialBallSpeed;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * initialBallSpeed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * initialBallSpeed * 0.7;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Update game state
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    updateScore();

    // Draw game objects
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
