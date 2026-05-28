const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const http = require("http");
const path = require("path");
const PokerGame = require("./PokerGame");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = 3000;
const origin = "https://simplepokergame.com";

const poker_games = {};

// Middleware
app.use(cors({ origin }));
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: { origin },
});

// Helper functions
function generate_room() {
  let room = "";
  for (let i = 0; i < 6; i++) {
    room += crypto.randomInt(10);
  }
  return room;
}

function create_poker_game(room) {
  const poker_game = new PokerGame();

  poker_games[room] = poker_game;

  poker_game.on("state_update", () => {
    for (const player of poker_game.players) {
      io.to(player.player_id + " " + room).emit("state_update", poker_game.PublicState(player.player_id));
    }
  });

  poker_game.on("individual_state_update", (player_id) => {
    io.to(player_id + " " + room).emit("state_update", poker_game.PublicState(player_id));
  });

  poker_game.on("connect_player_failure", (player_id) => {
    io.to(player_id + " " + room).emit("connect_player_failure");
  });

  poker_game.on("delete_poker_game", () => {
    poker_game.removeAllListeners();
    delete poker_games[room];
  });
}

// API routes
app.post("/api/create_game", (_, res) => {
  let room = generate_room();

  while (room in poker_games) {
    room = generate_room();
  }

  create_poker_game(room);

  res.json({ room });
});

// Socket.IO event handling
io.on("connection", (socket) => {
  const {room, player_id, name} = socket.handshake.auth;

  if (!(room in poker_games)) {
    socket.emit("connect_player_failure");
    return;
  }

  socket.join(player_id + " " + room);
  
  const poker_game = poker_games[room];
  poker_game.ConnectPlayer(player_id, name);

  socket.on("request_start_game", () => poker_game.RequestStartGame(player_id));
  socket.on("fold", () => poker_game.Fold(player_id));
  socket.on("check", () => poker_game.Check(player_id));
  socket.on("call", () => poker_game.Call(player_id));
  socket.on("raise_to", (new_bet_amount) => poker_game.RaiseTo(player_id, new_bet_amount));
  socket.on("disconnect", () => poker_game.DisconnectPlayer(player_id));
});

// React production build
const clientBuildPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientBuildPath));

app.use((_, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Start server
server.listen(PORT);
