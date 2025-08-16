"use client";

import React, { createContext, useContext, useState } from "react";

// Room type
export type Room = {
  room_id: number | null;
  role: string | null;
  player_username: string | null;
  profile_link: string | null;
  player_profile_image_link: string | null;
  enemy: string | undefined;
  tx_hash:string|undefined;
  winner:string|undefined;
  prize_pool:number|undefined;
  current_round:number|undefined;
  setRoomId: (id: number) => void;
  set_role: (role: string) => void;
  set_player_username: (username: string) => void;
  set_player_profile_image_link: (link: string) => void;
  set_enemy: (enemy: string) => void;
  set_profile_link: (link: string) => void;
  set_tx_hash:(hash:string)=> void;
  set_winner:(hash:string)=> void;
  set_prize:(amount:number)=> void;
  set_current_round:(round:number) => void;
  
};

// Create context
export const ROOM_CONTEXT = createContext<Room | null>(null);

// Custom hook
export const useRoomContext = () => {
  const context = useContext(ROOM_CONTEXT);
  if (!context) {
    throw new Error("useRoomContext must be used within a ROOM_PROVIDER");
  }
  return context;
};

// Provider component
export const ROOM_PROVIDER: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room_id, setRoomId] = useState<number | null>(null);
  const [role, set_role] = useState<string | null>(null);
  const [player_username, set_player_username] = useState<string | null>(null);
  const [player_profile_image_link, set_player_profile_image_link] = useState<string | null>(null);
  const [enemy, set_enemy] = useState<string | undefined>();
  const [profile_link, set_profile_link] = useState<string | null>(null);
  const [tx_hash , set_tx_hash] = useState<string | undefined>();
   const [winner , set_winner] = useState<string | undefined>();
    const [prize_pool , set_prize] = useState<number | undefined>();
     const [current_round , set_current_round] = useState<number | undefined>();

  return (
    <ROOM_CONTEXT.Provider
      value={{
        current_round,
        set_current_round,
        prize_pool,
        set_prize,
        winner, 
        set_winner,
        tx_hash,
        set_tx_hash,
        room_id,
        profile_link,
        set_profile_link,
        enemy,
        set_enemy,
        setRoomId,
        role,
        set_role,
        player_username,
        set_player_username,
        player_profile_image_link,
        set_player_profile_image_link,
      }}
    >
      {children}
    </ROOM_CONTEXT.Provider>
  );
};
