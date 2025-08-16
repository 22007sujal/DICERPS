"use client";
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  RefObject,
} from "react";
import "./room.css";
import { SOCKET } from "../[context]/socket_context";
import { useRoomContext } from "../[context]/room_context";
import Dice3D from "../[components]/dice";
import { useAccount } from "wagmi";
import { useDiceRps } from "../[hooks]/savedata";
import { useRouter } from "next/navigation";
import Pop_up from "../[components]/popup";

export interface Players {
  wins: number;
  username: string;
}

interface RoundData {
  winner: string;
  Player1: Players;
  Player2: Players;
  current_round: number;
}

export default function Page() {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [pop_up_state, set_popup] = useState(true);

  const {
    room_id: room,
    role: player_role,
    player_username,
    player_profile_image_link,
    set_player_profile_image_link,
    set_player_username,
    enemy,
    set_tx_hash,
    set_winner,
    set_prize,
    set_current_round,
    current_round,
  } = useRoomContext();

  const socket = useContext(SOCKET);
  const router = useRouter();

  const target_1 = useRef<HTMLDivElement | null>(null);
  const target_2 = useRef<HTMLDivElement | null>(null);

  const account = useAccount();
  const dicerps = useDiceRps("http://localhost:3000");

  useEffect(() => {
    async function fetch_profile(wallet: string) {
      let start = await dicerps.getDiceRps(wallet);
      set_player_profile_image_link(start?.profile_image as string);
      set_player_username(start?.username as string);
    }
    if (account.address) fetch_profile(account.address as string);
  }, []);

  const [enemyMovedCard, setEnemyMovedCard] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [playerMovedCard, setPlayerMovedCard] = useState<{ id: string; dx: number; dy: number } | null>(null);

  function move(room_id: number, player: string, move: string, card_id: string) {
    socket?.emit("move", { room_id, player, move, card_id });
  }

  const handleEnemyCardClick = (card_id: string, target: React.RefObject<HTMLDivElement>) => {
    const cardEl = document.getElementById(card_id);
    const targetEl = target.current;
    if (!cardEl || !targetEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const dx = targetRect.left - cardRect.left;
    const dy = targetRect.top - cardRect.top;
    setEnemyMovedCard({ id: cardEl.id, dx, dy });
  };

  const handlePlayerCardClick = (e: React.MouseEvent<HTMLImageElement>, target: React.RefObject<HTMLDivElement>) => {
    const cardEl = e.currentTarget;
    const targetEl = target.current;
    if (!cardEl || !targetEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const dx = targetRect.left - cardRect.left;
    const dy = targetRect.top - cardRect.top;
    setPlayerMovedCard({ id: cardEl.id, dx: -dx, dy: -dy });
  };

  // Close popup on background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && pop_up_state) {
      set_popup(false);
    }
  };

  // ✅ Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const roundResultHandler = (data: any) => {
      console.log(`the winner is ${data.winner} of round ${data.round}`);
      set_current_round(data.round);

      const player1: Players = {
        wins: data.player1_wins[0] as number,
        username: data.player1_wins[1] as string,
      };

      const player2: Players = {
        wins: data.player2_wins[0] as number,
        username: data.player2_wins[1] as string,
      };

      setRoundData({
        winner: data.winner,
        Player1: player1,
        Player2: player2,
        current_round: data.round,
      });

      setTimeout(() => {
        setEnemyMovedCard(null);
        setPlayerMovedCard(null);
      }, 500);

      set_popup(false);
      setTimeout(() => set_popup(true), 3000);
    };

    // ✅ Always listen for opponent_move (guest + wallet)
    const opponentMoveHandler = (data: any) => {
      if (data.card_id === "card6") handleEnemyCardClick("card3", target_2);
      if (data.card_id === "card5") handleEnemyCardClick("card2", target_2);
      if (data.card_id === "card4") handleEnemyCardClick("card1", target_2);
    };

    const gameover = (data: any) => {
      console.log("Game over data received:", data);
      set_popup(false);
      set_tx_hash(data.tx_hash);
      set_winner(data.final_winner);
      set_prize(data.prize_pool);
      setTimeout(() => router.replace("/game_over"), 100);
    };

    socket.on("round_result", roundResultHandler);
    socket.on("opponent_move", opponentMoveHandler);
    socket.on("game_over", gameover);

    return () => {
      socket.off("round_result", roundResultHandler);
      socket.off("opponent_move", opponentMoveHandler);
      socket.off("game_over", gameover);
    };
  }, [socket, set_tx_hash, set_winner, set_prize, router, set_current_round]);

  return (
    <div id="room-container" onClick={handleBackgroundClick}>
      {/* Enemy Cards */}
      <div id="jk" style={{ position: "relative", zIndex: 1, height: "fit-content" }}>
        <img
          id="card1"
          src={"./red.png"}
          style={{
            width: "170px",
            height: "190px",
            transition: "transform 0.5s ease",
            transform:
              enemyMovedCard?.id === "card1"
                ? `translate(${enemyMovedCard.dx}px, ${enemyMovedCard.dy}px)`
                : "translate(0, 0)",
          }}
        />
        <img
          id="card2"
          src={"./blue.png"}
          style={{
            width: "150px",
            height: "180px",
            transition: "transform 0.5s ease",
            transform:
              enemyMovedCard?.id === "card2"
                ? `translate(${enemyMovedCard.dx}px, ${enemyMovedCard.dy}px)`
                : "translate(0, 0)",
          }}
        />
        <img
          id="card3"
          src={"./yellow.png"}
          style={{
            width: "150px",
            height: "180px",
            transition: "transform 0.5s ease",
            transform:
              enemyMovedCard?.id === "card3"
                ? `translate(${enemyMovedCard.dx}px, ${enemyMovedCard.dy}px)`
                : "translate(0, 0)",
          }}
        />
        <div className="opponent-container">
          <h1 className="oppon" id="player_name">
            <div>{enemy?.toUpperCase()}</div>
          </h1>
        </div>
      </div>

      {/* Ground */}
      <div id="ground">
        <h1>ROUND {current_round}</h1>
        <div id="holders">
          <div id="player1" ref={target_1} className="card_holder"><p>SHY</p></div>
          <div id="player2" ref={target_2} className="card_holder"><p>SUJAL</p></div>
        </div>
      </div>

      {/* Player Cards */}
      <div id="kj-main">
        <div id="dice"><Dice3D /></div>
        <div id="kj" style={{ position: "relative", zIndex: 1, height: "fit-content" }}>
          <img
            id="card4"
            src={"./red.png"}
            onClick={(e) => {
              handlePlayerCardClick(e, target_1);
              move(room as number, player_username as string, "rock", "card4");
            }}
            style={{
              width: "170px",
              height: "190px",
              transition: "transform 0.5s ease",
              transform:
                playerMovedCard?.id === "card4"
                  ? `translate(${playerMovedCard.dx}px, ${playerMovedCard.dy}px)`
                  : "translate(0, 0)",
            }}
          />
          <img
            id="card5"
            src={"./blue.png"}
            onClick={(e) => {
              handlePlayerCardClick(e, target_1);
              move(room as number, player_username as string, "paper", "card5");
            }}
            style={{
              width: "150px",
              height: "180px",
              transition: "transform 0.5s ease",
              transform:
                playerMovedCard?.id === "card5"
                  ? `translate(${playerMovedCard.dx}px, ${playerMovedCard.dy}px)`
                  : "translate(0, 0)",
            }}
          />
          <img
            id="card6"
            src={"./yellow.png"}
            onClick={(e) => {
              handlePlayerCardClick(e, target_1);
              move(room as number, player_username as string, "scissors", "card6");
            }}
            style={{
              width: "150px",
              height: "180px",
              transition: "transform 0.5s ease",
              transform:
                playerMovedCard?.id === "card6"
                  ? `translate(${playerMovedCard.dx}px, ${playerMovedCard.dy}px)`
                  : "translate(0, 0)",
            }}
          />
          <div className="opponent-container">
            <h1 id="player_name"><div>{player_username?.toUpperCase()}</div></h1>
          </div>
        </div>
      </div>

      {roundData && (
        <Pop_up
          round={roundData.current_round}
          winner={roundData.winner}
          Player1={roundData.Player1}
          Player2={roundData.Player2}
          is_closed={pop_up_state}
        />
      )}
    </div>
  );
}
