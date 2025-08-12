// server.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const player_waiting = {
  RED: [],
  BLUE: [],
  YELLOW: [],
};

const game_states = new Map(); // room_id -> state

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // -------------------------
  // Handle Player Move
  // -------------------------
  socket.on("move", (data) => {
    const { room_id, player, move, card_id } = data || {};

    if (!room_id || !player || !move) {
      console.warn(`Invalid move data from ${socket.id}:`, data);
      return;
    }

    const game_state = game_states.get(room_id);
    if (!game_state) {
      console.warn(`No game state found for room ${room_id}`);
      return;
    }

    const isP1 = player === "player1" && socket.id === game_state.player1_socket_id;
    const isP2 = player === "player2" && socket.id === game_state.player2_socket_id;

    if (isP1) {
      game_state.player1_move = move;
      if (game_state.player2_socket_id) {
        io.to(game_state.player2_socket_id).emit("opponent_move", { card_id: card_id ?? null });
      }
    } else if (isP2) {
      game_state.player2_move = move;
      if (game_state.player1_socket_id) {
        io.to(game_state.player1_socket_id).emit("opponent_move", { card_id: card_id ?? null });
      }
    } else {
      console.warn(`Invalid player or socket mismatch in room ${room_id}`);
      return;
    }

    if (game_state.player1_move !== null && game_state.player2_move !== null) {
      const winner = checkWinner(game_state.player1_move, game_state.player2_move);

      io.to(room_id).emit("round_result", {
        round: game_state.round,
        winner,
      });
      

      if (game_state.round >= 3) {
        io.to(room_id).emit("game_over", { message: "Game has ended" });
        game_states.delete(room_id);
        return;
      }

      game_state.player1_move = null;
      game_state.player2_move = null;
      game_state.round++;
    }
  });

  // -------------------------
  // Handle Matchmaking
  // -------------------------
  socket.on("find_match", (color) => {
    if (!player_waiting[color]) {
      console.warn(`Invalid color: ${color}`);
      return;
    }

    const Queue = player_waiting[color];

    if (!Queue.includes(socket.id)) {
      Queue.push(socket.id);
    }

    if (Queue.length >= 2) {
      console.log("match found");

      const player1Id = Queue.shift();
      const player2Id = Queue.shift();

      const room_id = `room_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

      const player1Socket = io.sockets.sockets.get(player1Id);
      const player2Socket = io.sockets.sockets.get(player2Id);

      if (!player1Socket || !player2Socket) {
        if (player1Socket) Queue.unshift(player1Id);
        if (player2Socket) Queue.unshift(player2Id);
        return;
      }

      game_states.set(room_id, {
        player1_socket_id: player1Id,
        player2_socket_id: player2Id,
        player1_move: null,
        player2_move: null,
        round: 1,
      });

      player1Socket.join(room_id);
      player2Socket.join(room_id);

      // Delay match_found emit so both clients are ready
      setTimeout(() => {
        player1Socket.emit("match_found", {
          players: [player1Id, player2Id],
          color,
          room_id,
          role: "player1",
        });

        player2Socket.emit("match_found", {
          players: [player1Id, player2Id],
          color,
          room_id,
          role: "player2",
        });

        // Delay match_started to ensure both received match_found
        setTimeout(() => {
          if (game_states.has(room_id)) {
            io.to(room_id).emit("match_started", { room_id });
          }
        }, 1000);
      }, 2000); // wait 2s before sending match_found

    } else {
      console.log("there is only one player in queue");
    }
  });

  // -------------------------
  // Handle Disconnect
  // -------------------------
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    Object.keys(player_waiting).forEach((color) => {
      const index = player_waiting[color].indexOf(socket.id);
      if (index > -1) {
        player_waiting[color].splice(index, 1);
      }
    });

    for (const [room_id, state] of game_states.entries()) {
      const { player1_socket_id, player2_socket_id } = state;

      if (player1_socket_id === socket.id || player2_socket_id === socket.id) {
        const opponentId =
          player1_socket_id === socket.id ? player2_socket_id : player1_socket_id;
        if (opponentId) {
          io.to(opponentId).emit("opponent_disconnected", { room_id });
          io.to(room_id).emit("game_over", { message: "Opponent disconnected" });
        }
        game_states.delete(room_id);
      }
    }
  });
});

// -------------------------
// Winner Logic
// -------------------------
function checkWinner(move1, move2) {
  if (move1 === move2) return "draw";
  if (
    (move1 === "rock" && move2 === "scissors") ||
    (move1 === "paper" && move2 === "rock") ||
    (move1 === "scissors" && move2 === "paper")
  ) {
    return "player1";
  }
  return "player2";
}

app.get("/", (req, res) => {
  res.send("Server is running");
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
