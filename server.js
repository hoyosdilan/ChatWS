import * as path from 'node:path';
import express from 'express';
import * as http from 'node:http';
import { Server } from "socket.io";
import formatMessage from './utils/messages.js';
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from './utils/users.js';

const botName = 'adminBot';
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set static folder
app.use(express.static(path.join(path.dirname('./'), 'public')));

// Run when client connects 
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        
        socket.join(user.room);
        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to chatws.'));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat.`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`));
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));