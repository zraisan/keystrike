import express from "express";
import http from "http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";
const port = parseInt(process.env.PORT || "4000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);

  const io = new Server(server, {
    serveClient: false,
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("join_room", (room) => {
      socket.join(room);
      if (rooms.has(room) && rooms.get(room).paragraph) {
        socket.emit("room_paragraph", rooms.get(room).paragraph);
      }
      socket.to(room).emit("user_joined", socket.id);
      console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on("player_joined", (room, username) => {
      const playerData = { id: socket.id, progress: 0, username };

      if (!rooms.has(room)) {
        rooms.set(room, {
          players: new Map(),
          paragraph: "",
        });
      }

      rooms.get(room).players.set(socket.id, playerData);

      const existingPlayers = Array.from(rooms.get(room).players.values()).filter(
        (p: any) => p.id !== socket.id
      );
      socket.emit("room_players", existingPlayers);

      socket.to(room).emit("new_player", playerData);

      console.log(`Player joined in room: ${room}`, playerData);
    });

    socket.on("send_keystroke", (data) => {
      const { room, message, sender, username } = data;
      socket.to(room).emit("receive_keystroke", { message, sender, username });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);

      rooms.forEach((roomData, room) => {
        if (roomData.players.has(socket.id)) {
          roomData.players.delete(socket.id);
          socket.to(room).emit("player_left", socket.id);

          if (roomData.players.size === 0) {
            rooms.delete(room);
          }
        }
      });
    });

    socket.on("paragraph_set", (room, paragraph) => {
      const roomData = rooms.get(room);
      if (roomData) {
        roomData.paragraph = paragraph;
        console.log(`Paragraph set for room ${room}: ${paragraph}`);
      }
      io.to(room).emit("room_paragraph", paragraph);
    });
  });

  // Let Next.js handle all other requests
  expressApp.use((req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});
