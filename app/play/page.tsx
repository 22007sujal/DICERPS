"use client";
import React, { useContext, useEffect } from "react";
import "./play.css";
import { SOCKET } from "../[context]/socket_context";
import { useRouter } from "next/navigation";
import { useRoomContext } from "../[context]/room_context";
import { useAccount, useWriteContract } from "wagmi";
import { abi } from "../[utility]/abi";
import { parseEther } from "viem";
import { useDiceRps } from "../[hooks]/savedata";

export default function Page() {
  const socket = useContext(SOCKET);
  const { data: hash, writeContract } = useWriteContract();
  const room = useRoomContext();
  const router = useRouter();
  const account = useAccount();

  const dicerps = useDiceRps("https://dicerps.vercel.app/");

  // ✅ Fetch profile for Wallet OR Guest
  useEffect(() => {
    async function fetch_profile() {
      try {
        if (account.address) {
          // Wallet user → fetch from backend
          const start = await dicerps.getDiceRps(account.address);
          room.set_player_profile_image_link(
            start?.profile_image || "/default_profile.png"
          );
          room.set_player_username(start?.username || "Guest");
        } else {
          // Guest user → fetch from localStorage
          const guestUsername = localStorage.getItem("diceusername");
          const guestAvatar = localStorage.getItem("diceavatar");

          room.set_player_profile_image_link(
            guestAvatar || "/default_profile.png"
          );
          room.set_player_username(guestUsername || "Guest");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        room.set_player_profile_image_link("/default_profile.png");
        room.set_player_username("Guest");
      }
    }

    fetch_profile();
  }, [account.address]);

  // ✅ Common emit for both
  function emitJoin(color: string, entry_fee: number) {
    socket?.emit("find_match", {
      color,
      username: room.player_username,
      profile_link: room.player_profile_image_link,
      entry_fee,
      wallet_address: account.address || "guest",
    });
  }

  // ✅ Handle join
  async function handleJoin(color: string, fee: string) {
    emitJoin(color, parseFloat(fee));

    if (account.address) {
      // Wallet user → send tx
      writeContract({
        abi: abi,
        address: "0x8D7aDc07999DD446703b6221b05a681D6CFfd0B5",
        functionName: "joinGame",
        args: [1],
        value: parseEther(fee),
      });
    }
    // Guests skip contract
    router.replace("/waiting_area");
  }

  return (
    <div id="play-container">
      <div id="username">
        <h1>HEY {room.player_username?.toUpperCase()} : )</h1>
      </div>

      <div id="ticket-container">
        <div id="YELLOW" onClick={() => handleJoin("YELLOW", "0.2")}>
          <img src={"./yellow_ticket.png"} />
        </div>
        <div id="BLUE" onClick={() => handleJoin("BLUE", "0.5")}>
          <img src={"./blue_ticket.png"} />
        </div>
        <div id="RED" onClick={() => handleJoin("RED", "1")}>
          <img src={"./red_ticket.png"} />
        </div>
      </div>

      <div id="howto">
        <h1>HOW TO PLAY</h1>
      </div>
    </div>
  );
}
