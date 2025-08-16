const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { sendPrizeToWinner } = require("./app/[utility]/dicrpssol");

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

// -------------------------
// Socket Connection
// -------------------------
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // -------------------------
  // Player Move
  // -------------------------
  socket.on("move", (data) => {
    const { room_id, player, move, card_id } = data || {};
    if (!room_id || !player || !move) return;

    const game_state = game_states.get(room_id);
    if (!game_state) return;

    const isP1 =
      player === game_state.player1username &&
      socket.id === game_state.player1_socket_id;
    const isP2 =
      player === game_state.player2username &&
      socket.id === game_state.player2_socket_id;

    if (isP1) {
      game_state.player1_move = move;
      if (game_state.player2_socket_id) {
        io.to(game_state.player2_socket_id).emit("opponent_move", {
          card_id: card_id ?? null,
        });
      }
    } else if (isP2) {
      game_state.player2_move = move;
      if (game_state.player1_socket_id) {
        io.to(game_state.player1_socket_id).emit("opponent_move", {
          card_id: card_id ?? null,
        });
      }
    }

    // ✅ Both moved
    if (game_state.player1_move && game_state.player2_move) {
      const winner = checkWinner(
        game_state.player1_move,
        game_state.player2_move
      );

      if (winner === "player1") game_state.player1_wins++;
      else if (winner === "player2") game_state.player2_wins++;

      setTimeout(() => {
        io.to(room_id).emit("round_result", {
          round: game_state.round,
          winner,
          player1_wins: [game_state.player1_wins, game_state.player1username],
          player2_wins: [game_state.player2_wins, game_state.player2username],
        });

        // ✅ Game over after 3 rounds
        if (game_state.round >= 3) {
          finalizeGame(room_id, game_state, "Game has ended");
          return;
        }

        // Reset for next round
        game_state.player1_move = null;
        game_state.player2_move = null;
        game_state.round++;
      }, 800);
    }
  });

  // -------------------------
  // Matchmaking
  // -------------------------
  socket.on("find_match", (data) => {
    const { color, username, profile_link, entry_fee, wallet_address } =
      data || {};
    if (!color || !player_waiting[color]) return;

    // ✅ Enforce entry fee for wallet games
    if (wallet_address !== "guest") {
      if (color === "RED" && entry_fee !== 1) return;
      if (color === "BLUE" && entry_fee !== 0.5) return;
      if (color === "YELLOW" && entry_fee !== 0.2) return;
    }

    const Queue = player_waiting[color];

    // Prevent duplicate queue
    if (!Queue.find((p) => p.socket_id === socket.id)) {
      Queue.push({
        socket_id: socket.id,
        username,
        profile_link,
        entry_fee,
        wallet_address,
      });
    }

    // ✅ If 2 players → start match
    if (Queue.length >= 2) {
      const player1 = Queue.shift();
      const player2 = Queue.shift();

      const player1Socket = io.sockets.sockets.get(player1.socket_id);
      const player2Socket = io.sockets.sockets.get(player2.socket_id);
      if (!player1Socket || !player2Socket) return;

      const room_id = `room_${Date.now()}_${Math.floor(
        Math.random() * 1_000_000
      )}`;

      game_states.set(room_id, {
        player1_socket_id: player1.socket_id,
        player2_socket_id: player2.socket_id,
        player1username: player1.username,
        player2username: player2.username,
        player1wallet: player1.wallet_address,
        player2wallet: player2.wallet_address,
        player1_move: null,
        player2_move: null,
        round: 1,
        prize_pool: player1.entry_fee + player2.entry_fee,
        player1_wins: 0,
        player2_wins: 0,
        is_guest_game:
          player1.wallet_address === "guest" ||
          player2.wallet_address === "guest",
      });

      player1Socket.join(room_id);
      player2Socket.join(room_id);

      setTimeout(() => {
        player1Socket.emit("match_found", {
          players: [player1, player2],
          color,
          room_id,
          role: "player1",
          enemy: player2.username,
          profile_link: player2.profile_link,
        });

        player2Socket.emit("match_found", {
          players: [player1, player2],
          color,
          room_id,
          role: "player2",
          enemy: player1.username,
          profile_link: player1.profile_link,
        });

        setTimeout(() => {
          if (game_states.has(room_id)) {
            io.to(room_id).emit("match_started", { room_id });
          }
        }, 10000);
      }, 1000);
    }
  });

  // -------------------------
  // Disconnect
  // -------------------------
  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.id}`);

    // Remove from waiting queue
    Object.keys(player_waiting).forEach((color) => {
      const idx = player_waiting[color].findIndex(
        (p) => p.socket_id === socket.id
      );
      if (idx > -1) player_waiting[color].splice(idx, 1);
    });

    // If in a game → end it
    for (const [room_id, state] of game_states.entries()) {
      const { player1_socket_id, player2_socket_id } = state;

      if (player1_socket_id === socket.id || player2_socket_id === socket.id) {
        const opponentId =
          player1_socket_id === socket.id
            ? player2_socket_id
            : player1_socket_id;

        if (opponentId) {
          io.to(opponentId).emit("opponent_disconnected", { room_id });
        }

        finalizeGame(room_id, state, "Opponent disconnected");
      }
    }
  });
});

// -------------------------
// Finalize Game
// -------------------------
async function finalizeGame(room_id, game_state, message) {
  let final_winner = "draw";
  let tx_hash = null;

  try {
    if (!game_state.is_guest_game) {
      if (game_state.player1_wins > game_state.player2_wins) {
        final_winner = game_state.player1username;
        tx_hash = await sendPrizeToWinner(
          game_state.player1wallet,
          game_state.prize_pool
        );
      } else if (game_state.player2_wins > game_state.player1_wins) {
        final_winner = game_state.player2username;
        tx_hash = await sendPrizeToWinner(
          game_state.player2wallet,
          game_state.prize_pool
        );
      }
    } else {
      if (game_state.player1_wins > game_state.player2_wins)
        final_winner = game_state.player1username;
      else if (game_state.player2_wins > game_state.player1_wins)
        final_winner = game_state.player2username;
    }
  } catch (error) {
    console.error("❌ Error sending prize:", error);
  }

  io.to(room_id).emit("game_over", {
    message,
    final_winner,
    player1_wins: game_state.player1_wins,
    player2_wins: game_state.player2_wins,
    tx_hash,
    prize_pool: game_state.is_guest_game ? 0 : game_state.prize_pool,
  });

  game_states.delete(room_id);
}

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

server.listen(3001, () => {
  console.log("🚀 Server is running on port 3001");
});
