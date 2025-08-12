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
      socketRef.current = io('https://c7c4a837-d950-472e-8e09-11c25104cb8b-00-236gow97avv2r.spock.replit.dev/', {
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
