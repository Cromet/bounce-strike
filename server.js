const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use(express.static(path.join(__dirname, 'frontend')));

// Store active players and leaderboard
const players = new Map();
let leaderboard = [];

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // Add new player
    players.set(socket.id, {
        id: socket.id,
        score: 0,
        ball: null,
        name: `Player ${socket.id.slice(0, 4)}`
    });
    
    // Broadcast new player to others
    socket.broadcast.emit('playerJoined', socket.id);
    
    // Send existing players to new player
    const existingPlayers = Array.from(players.keys()).filter(id => id !== socket.id);
    socket.emit('existingPlayers', existingPlayers);
    
    // Handle ball updates
    socket.on('ball-update', (ballData) => {
        const player = players.get(socket.id);
        if (player) {
            player.ball = ballData;
            socket.broadcast.emit('opponent-ball-update', {
                id: socket.id,
                ball: ballData
            });
        }
    });
    
    // Handle score updates
    socket.on('score-update', (score) => {
        const player = players.get(socket.id);
        if (player) {
            player.score = score;
            socket.broadcast.emit('score-update', {
                id: socket.id,
                score: score
            });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        players.delete(socket.id);
        io.emit('player-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});