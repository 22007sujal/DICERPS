'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { SOCKET } from './[context]/socket_context';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

interface SocketProviderProps {
  children: ReactNode;
}

export default function Socket_Provider({ children }: SocketProviderProps) {
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001', {
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });
    }

    return () => {
       socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SOCKET.Provider value={socketRef.current}>
      {isConnected ? children : <div>Connecting...</div>}
    </SOCKET.Provider>
  );
}
