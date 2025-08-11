"use client"

import React, { createContext, useContext, useState } from "react";

// Room type
export type Room = {
  room_id: number | null;
  role:String | null;
  setRoomId: (id: number) => void;
  set_role:(role: string) => void;
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
  const [role , set_role] = useState<String|null>(null);

  return (
    <ROOM_CONTEXT.Provider value={{ room_id, setRoomId , role , set_role }}>
      {children}
    </ROOM_CONTEXT.Provider>
  );
};
