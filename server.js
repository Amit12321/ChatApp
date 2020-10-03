const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const wrapMessageWithMetadata = require("./modules/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder

app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatApp Bot";
let users = [];

// Run when client connects
io.on("connection", (socket) => {
  console.log("[SERVER] New connection.");
  socket.on("user join", ({ username, room }) => {
    const newUser = {
      username,
      room,
      id: socket.id,
    };

    users.push(newUser);
    console.log(
      `[SERVER] ${newUser.username} entered chat room ${newUser.room}`
    );
    socket.join(newUser.room);
    socket.emit(
      "message",
      wrapMessageWithMetadata(botName, `Welcome to the chat!`)
    );

    socket.broadcast
      .to(newUser.room)
      .emit(
        "message",
        wrapMessageWithMetadata(
          botName,
          `${newUser.username} has joined the chat.`
        )
      );

    //send rooms's users
    io.to(newUser.room).emit("show users", getUsersInARoom(newUser.room));
  });

  socket.on("chat message", (msg) => {
    if (msg.length > 300) return;
    console.log(`[SERVER] New message: ${msg} sent from ${socket.id}`);
    const user = users.find((u) => u.id === socket.id);
    if (!user) return;
    socket.emit("own message", wrapMessageWithMetadata("", msg));
    socket.broadcast
      .to(user.room)
      .emit("message", wrapMessageWithMetadata(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = users.find((u) => u.id === socket.id);
    if (!user) return;
    const index = users.indexOf(user);
    users.splice(index, 1);
    console.log(
      `[SERVER] ${user.username} from room ${user.room} disconnected.`
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        wrapMessageWithMetadata(botName, `${user.username} has left the chat.`)
      );

    //send users
    socket.broadcast
      .to(user.room)
      .emit("show users", getUsersInARoom(user.room));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[SERVER] Server running on port ${PORT}`);
});

function getUsersInARoom(room) {
  return users.filter((user) => user.room === room);
}
