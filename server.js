const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const match_player = require("./app/[utility]/match_player");

const player_waiting = {
  RED: [],
  BLUE: [],
  YELLOW: [],
};

const game_states = new Map();

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
    const { room_id, player, move, card_id } = data; // player: "player1" or "player2"

    if (!room_id || !player || !move) {
      console.warn(`Invalid move data from ${socket.id}:`, data);
      return;
    }

    const game_state = game_states.get(room_id);
    if (!game_state) {
      console.warn(`No game state found for room ${room_id}`);
      return;
    }

    // Save move for correct player
    if (player === "player1" && socket.id === game_state.player1_socket_id) {
      game_state.player1_move = move;
      io.to(game_state.player2_socket_id).emit("opponent_move", { card_id });
    } else if (
      player === "player2" &&
      socket.id === game_state.player2_socket_id
    ) {
      game_state.player2_move = move;
      io.to(game_state.player1_socket_id).emit("opponent_move", { card_id });
    } else {
      console.warn(`Invalid player or socket mismatch in room ${room_id}`);
      return;
    }

    console.log(`Room ${room_id} - Round ${game_state.round} -`, game_state);

    // Check if both players have made their move
    if (game_state.player1_move !== null && game_state.player2_move !== null) {
      console.log(
        `Checking winner for Room ${room_id}, Round ${game_state.round}...`
      );

      const winner = checkWinner(
        game_state.player1_move,
        game_state.player2_move
      );
      io.to(room_id).emit("round_result", {
        round: game_state.round,
        winner,
      });

      // If last round, end the game
      if (game_state.round >= 3) {
        io.to(room_id).emit("game_over", { message: "Game has ended" });
        game_states.delete(room_id);
        return;
      }

      // Prepare for next round
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
    Queue.push(socket.id);

    const matchedPlayers = match_player(Queue);

    if (matchedPlayers) {
      // Create unique room ID
      const room_id = `room_${Date.now()}_${Math.floor(
        Math.random() * 1000000
      )}`;

      // Store both players' socket IDs in game state
      game_states.set(room_id, {
        player1_socket_id: matchedPlayers[0],
        player2_socket_id: matchedPlayers[1],
        player1_move: null,
        player2_move: null,
        round: 1,
      });

      // Join players to the room
      matchedPlayers.forEach((playerId, index) => {
        const playerSocket = io.sockets.sockets.get(playerId);
        if (playerSocket) {
          playerSocket.join(room_id);
          playerSocket.emit("assign_role", { player: `player${index + 1}` });
        }
      });

      // Notify players
      io.to(room_id).emit("match_found", {
        players: matchedPlayers,
        color,
        room_id,
      });

      setTimeout(() => {
        io.to(room_id).emit("match_started", { room_id });
      }, 500);
    }
  });

  // -------------------------
  // Handle Disconnect
  // -------------------------
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove player from queues
    Object.keys(player_waiting).forEach((color) => {
      const index = player_waiting[color].indexOf(socket.id);
      if (index > -1) {
        player_waiting[color].splice(index, 1);
      }
    });
  });
});

// -------------------------
// Winner Logic (Example)
// -------------------------
function checkWinner(move1, move2) {
  if (move1 === move2) return "draw";

  // Example: rock-paper-scissors
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
