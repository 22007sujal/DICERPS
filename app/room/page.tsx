"use client";
import React, { useContext, useState, useRef, useEffect } from "react";
import "./room.css";
import { SOCKET } from "../[context]/socket_context";
import { useRoomContext } from "../[context]/room_context";
import Dice3D from "../[components]/dice";

export default function Page() {
  const { room_id: room, role: player_role } = useRoomContext();
  const socket = useContext(SOCKET);

  const target_1 = useRef<HTMLDivElement | null>(null);
  const target_2 = useRef<HTMLDivElement | null>(null);

  socket?.on("round_result" , (data)=>{
     alert(`THE WINNER OF ROUND ${data.round} IS ${data.winner}`);
  })

  const [enemyMovedCard, setEnemyMovedCard] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [playerMovedCard, setPlayerMovedCard] = useState<{ id: string; dx: number; dy: number } | null>(null);

  function move(room_id: number, player: string, move: string, card_id: string) {
    let data = { room_id, player, move, card_id };
    socket?.emit("move", data);
  }

  const handleEnemyCardClick = (
    card_id: string,
    target: React.RefObject<HTMLDivElement>
  ) => {
    const cardEl = document.getElementById(card_id);
    const targetEl = target.current;
    if (!cardEl || !targetEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const dx = targetRect.left - cardRect.left;
    const dy = targetRect.top - cardRect.top;
    setEnemyMovedCard({ id: cardEl.id, dx, dy });
  };

  const handlePlayerCardClick = (
    e: React.MouseEvent<HTMLImageElement>,
    target: React.RefObject<HTMLDivElement>
  ) => {
    const cardEl = e.currentTarget;
    const targetEl = target.current;
    if (!cardEl || !targetEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const dx = targetRect.left - cardRect.left;
    const dy = targetRect.top - cardRect.top;
    setPlayerMovedCard({ id: cardEl.id, dx: -dx, dy: -dy });
  };

  // Socket event listeners in useEffect
  useEffect(() => {
    if (!socket) return;

    const roundResultHandler = (data: any) => {
      console.log(`the winner is ${data.winner} of round ${data.round}`);
    };

    const opponentMoveHandler = (data: any) => {
      if (data.card_id === "card6") {
        handleEnemyCardClick("card3", target_2);
      }
      if (data.card_id === "card5") {
        handleEnemyCardClick("card2", target_2);
      }
      if (data.card_id === "card4") {
        handleEnemyCardClick("card1", target_2);
      }
    };

    socket.on("round_result", roundResultHandler);
    socket.on("opponent_move", opponentMoveHandler);

    // Cleanup to prevent duplicate listeners
    return () => {
      socket.off("round_result", roundResultHandler);
      socket.off("opponent_move", opponentMoveHandler);
    };
  }, [socket]);


  console.log(player_role)

  return (
    <div id="room-container">
      {/* Enemy Cards */}
      <div id="jk" style={{ position: "relative", zIndex: 1, height: "fit-content" }}>
        <img
          id="card1"
          src={"./red.png"}
          style={{
            width: "170px",
            height: "190px",
            objectFit: "cover",
            cursor: "pointer",
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
            objectFit: "cover",
            cursor: "pointer",
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
            objectFit: "cover",
            cursor: "pointer",
            transition: "transform 0.5s ease",
            transform:
              enemyMovedCard?.id === "card3"
                ? `translate(${enemyMovedCard.dx}px, ${enemyMovedCard.dy}px)`
                : "translate(0, 0)",
          }}
        />
        <div className="opponent-container"></div>
      </div>

      {/* Ground */}
      <div id="ground">
        <h1>ROUND 1</h1>
        <div id="holders">
          <div id="player1" ref={target_1} className="card_holder">
            <p>SHY</p>
          </div>
          <div id="player2" ref={target_2} className="card_holder">
            <p>SUJAL</p>
          </div>
        </div>
      </div>

      {/* Player Cards */}
      <div id="kj-main">
        <div id="dice"><Dice3D/></div>
      <div id="kj" style={{ position: "relative", zIndex: 1, height: "fit-content" }}>
        <img
          id="card4"
          src={"./red.png"}
          onClick={(e) => {
            handlePlayerCardClick(e, target_1);
            move(room as number, player_role as string, "rock", "card4");
          }}
          style={{
            width: "170px",
            height: "190px",
            objectFit: "cover",
            cursor: "pointer",
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
            move(room as number, player_role as string, "paper", "card5");
          }}
          style={{
            width: "150px",
            height: "180px",
            objectFit: "cover",
            cursor: "pointer",
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
            move(room as number, player_role as string, "scissors", "card6");
          }}
          style={{
            width: "150px",
            height: "180px",
            objectFit: "cover",
            cursor: "pointer",
            transition: "transform 0.5s ease",
            transform:
              playerMovedCard?.id === "card6"
                ? `translate(${playerMovedCard.dx}px, ${playerMovedCard.dy}px)`
                : "translate(0, 0)",
          }}
        />
        <div className="opponent-container"><h1>{player_role}</h1></div>
      </div>
    </div>
    </div>
  );
}
