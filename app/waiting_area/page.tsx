"use client";
import React, { useContext, useEffect, useRef } from "react";
import "./waiting_area.css";
import { SOCKET } from "../[context]/socket_context";
import { useRoomContext } from "../[context]/room_context";
import { useRouter } from "next/navigation";

export default function Page() {
  const socket = useContext(SOCKET);
  const room = useRoomContext();
  const router = useRouter();

  const hasNavigatedToLobby = useRef(false);
  const hasNavigatedToRoom = useRef(false);

  const DEBUG = true; // toggle this to false in production

  useEffect(() => {
    if (!socket) return;

    const onMatchFound = (data: {
      room_id: string;
      color: "RED" | "BLUE" | "YELLOW";
      role: "player1" | "player2";
      enemy: string;
      players: any[];
      profile_link: string;
    }) => {
      if (DEBUG) console.log("🎯 MATCH FOUND:", data);
      
      // Set room data
      room.setRoomId(data.room_id as unknown as number);
      room.set_role(data.role);
      room.set_enemy(data.enemy);
      room.set_profile_link(data.profile_link);
      
      // Redirect to lobby immediately when match is found
      if (!hasNavigatedToLobby.current) {
        if (DEBUG) console.log("✅ Redirecting to /lobby now");
        hasNavigatedToLobby.current = true;
        router.replace("/lobby");
      }
    };

    const onMatchStarted = () => {
      if (DEBUG) console.log("🚀 MATCH STARTED - Redirecting to /room");
      
      // Redirect to room when match starts (after 10 seconds)
      if (!hasNavigatedToRoom.current) {
        hasNavigatedToRoom.current = true;
        router.replace("/room");
      }
    };

    socket.on("match_found", onMatchFound);
    socket.on("match_started", onMatchStarted);

    return () => {
      socket.off("match_found", onMatchFound);
      socket.off("match_started", onMatchStarted);
    };
  }, [socket, room, router]);

  return (
    <div id="waiting_container">
      <div id="logo_rps">
        <img src={"./dicerpslogo.png"} alt="Dice RPS logo" />
      </div>
      <h1>FINDING OPPONENT FOR YOU...</h1>
    </div>
  );
}