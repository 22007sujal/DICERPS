"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import "./lobby.css";
import { useRoomContext } from "../[context]/room_context";
import { SOCKET } from "../[context]/socket_context";
import { useRouter } from "next/navigation";

export default function Lobby() {
  const room = useRoomContext();
  const socket = useContext(SOCKET);
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const hasNavigated = useRef(false);

  const DEBUG = true; // toggle this to false in production

  useEffect(() => {
    if (!socket) return;

    const onMatchStarted = () => {
      if (DEBUG) console.log("🚀 MATCH STARTED from lobby - Redirecting to /room");
      
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/room");
      }
    };

    socket.on("match_started", onMatchStarted);

    return () => {
      socket.off("match_started", onMatchStarted);
    };
  }, [socket, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div id="lobby_container">
      <div id="players">
        <div className="player_info_wrapper">
          <p className="username">{room.player_username}</p>
          <div id="you" className="player_info">
            <img src={room.player_profile_image_link as string} width={"95%"} />
          </div>
          {/* <p>WIN {10} | LOSS {0}</p> */}
        </div>

        <div id="vs">
          <p>VS</p>
        </div>

        <div className="player_info_wrapper">
          <p className="username">{room.enemy}</p>
          <div id="enemy" className="player_info">
            <img src={room.profile_link as string} width={"95%"} />
          </div>
          {/* <p>WIN {10} | LOSS {0}</p> */}
        </div>
      </div>

      <div id="game_timer">
        <p>GAME STARTING IN {countdown} SEC</p>
      </div>

      <div id="howto">
        <p>HOW TO PLAY</p>
      </div>
    </div>
  );
}