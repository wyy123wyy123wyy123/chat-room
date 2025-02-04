const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

let onlineUsers = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`${socket.username} disconnected`);
            onlineUsers = onlineUsers.filter(user => user.username !== socket.username);
            io.emit('user list', onlineUsers);
        }
    });

    socket.on('login', ({ username, avatar }) => {
        if (!username || !avatar) {
            console.error('Invalid login attempt: missing username or avatar');
            return;
        }
        socket.username = username;
        socket.avatar = avatar;
        socket.color = getRandomColor(); // Assign a random color for the user
        onlineUsers.push({ username, color: socket.color });
        console.log(`${username} logged in`);
        io.emit('user list', onlineUsers);
    });

    socket.on('chat message', (msg) => {
        if (!socket.username) {
            console.error('Chat message received from unauthenticated user');
            return;
        }
        io.emit('chat message', { username: socket.username, message: JSON.stringify(msg.message), color: socket.color });
    });
});

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
