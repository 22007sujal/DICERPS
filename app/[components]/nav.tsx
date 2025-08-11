"use client"

import React, { useEffect, useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import "./nav.css"

export default function Nav() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  const [connector, setConnector] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false); // ✅ Add mounted state

  useEffect(() => {
    setConnector(connectors[1]);
    setMounted(true); // ✅ Mark component as mounted
  }, [connectors]);

  async function connect_wallet() {
    try {
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }

  if (!mounted) {
    return null; // ✅ Prevent hydration mismatch
  }

  return (
    <nav id={isConnected ? "navbar_connected" : "navbar_not_connected"}>
      <div className="logo-with-text">
        <img src="./dicerpslogo.png" alt="logo" />
        <h1>DICERPS</h1>
      </div>
      <div id="connect" onClick={!isConnected ? connect_wallet : undefined}>
        <p>{isConnected ? address?.slice(0, 7) : "CONNECT"}</p>
      </div>
    </nav>
  );
}
