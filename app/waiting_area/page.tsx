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

  const receivedMatchStarted = useRef(false);
  const receivedRoleAndRoom = useRef(false);
  const hasNavigated = useRef(false); // Prevent double navigation

  const DEBUG = true; // toggle this to false in production

  const checkRedirect = () => {
    if (
      receivedMatchStarted.current &&
      receivedRoleAndRoom.current &&
      room.role &&
      room.room_id &&
      !hasNavigated.current
    ) {
      if (DEBUG) console.log("✅ Redirecting to /room now");
      hasNavigated.current = true;
      router.replace("/room");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onMatchFound = (data: {
      room_id: string;
      color: "RED" | "BLUE" | "YELLOW";
      role: "player1" | "player2";
      players: string[];
    }) => {
      if (DEBUG) console.log("🎯 MATCH FOUND:", data);
      room.setRoomId(data.room_id as unknown as number);
      room.set_role(data.role);
      receivedRoleAndRoom.current = true;
      checkRedirect();
    };

    const onMatchStarted = () => {
      if (DEBUG) console.log("🚀 MATCH STARTED");
      receivedMatchStarted.current = true;
      checkRedirect();
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