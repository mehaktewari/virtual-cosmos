const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://virtual-cosmos-eight.vercel.app/", "http://localhost:5173"],
  },
});

const PORT = process.env.PORT || 5000;

// 🧠 In-memory players store
const players = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /**
   * 🧍 JOIN WITH USERNAME
   */
  socket.on("join", ({ username }) => {
    players[socket.id] = {
      id: socket.id,
      x: 400,
      y: 300,
      username: username || "Anonymous",
    };

    io.emit("players", players);
  });

  /**
   * 🎮 MOVEMENT
   */
  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;

      io.emit("players", players);
    }
  });

  /**
   * 💬 CHAT
   */
  socket.on("chat", (message) => {
    if (!players[socket.id]) return;

    io.emit("chat", {
      id: socket.id,
      username: players[socket.id].username,
      text: message,
      timestamp: Date.now(),
    });
  });

  /**
   * ❌ DISCONNECT
   */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    delete players[socket.id];
    io.emit("players", players);
  });
});

/**
 * 🌐 HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.send("Virtual Cosmos Backend Running");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});