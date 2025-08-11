// context/socket_context.ts
'use client';

import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

// Create the context
export const SOCKET = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

// Optional: custom hook for easier access
export const useSocket = () => {
  const socket = useContext(SOCKET);
  if (!socket) {
    throw new Error('useSocket must be used within a Socket_Provider');
  }
  return socket;
};
