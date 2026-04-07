const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("Virtual Cosmos Backend Running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send welcome event
  socket.emit("welcome", {
    message: "Welcome to Virtual Cosmos 🚀",
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});