const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active players and leaderboard
const players = new Map();
let leaderboard = [];

// Helper function to update leaderboard
function updateLeaderboard(playerId, score) {
    const existingEntry = leaderboard.find(entry => entry.id === playerId);
    
    if (existingEntry) {
        existingEntry.score = Math.max(existingEntry.score, score);
    } else {
        leaderboard.push({
            id: playerId,
            score: score,
            timestamp: Date.now()
        });
    }
    
    // Sort by score (descending) and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    // Broadcast updated leaderboard
    io.emit('leaderboard-update', leaderboard);
}

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // Add new player
    players.set(socket.id, {
        id: socket.id,
        score: 0,
        ball: null,
        name: `Player ${socket.id.slice(0, 4)}`
    });
    
    // Broadcast player list
    io.emit('players-update', Array.from(players.values()));
    
    // Send current leaderboard to new player
    socket.emit('leaderboard-update', leaderboard);
    
    // Handle name updates
    socket.on('name-update', (name) => {
        const player = players.get(socket.id);
        if (player) {
            player.name = name;
            io.emit('players-update', Array.from(players.values()));
        }
    });
    
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
    
    // Handle score updates with leaderboard
    socket.on('score-update', (score) => {
        const player = players.get(socket.id);
        if (player) {
            player.score = score;
            updateLeaderboard(socket.id, score);
            io.emit('players-update', Array.from(players.values()));
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        players.delete(socket.id);
        io.emit('player-disconnected', socket.id);
        io.emit('players-update', Array.from(players.values()));
    });
});

const PORT = 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});