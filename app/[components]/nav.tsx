"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import "./nav.css";

interface NavProps {
  showConnect?: boolean; // ✅ optional prop
}

export default function Nav({ showConnect = true }: NavProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  const [connector, setConnector] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConnector(connectors[1]);
    setMounted(true);
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

  if (!mounted) return null;

  return (
    <nav id={isConnected ? "navbar_connected" : "navbar_not_connected"}>
      <div className="logo-with-text">
        <img src="./dicerpslogo.png" alt="logo" />
        <h1>DICERPS</h1>
      </div>

      {/* ✅ Only render connect div if prop is true */}
      {showConnect && (
        <div id="connect" onClick={!isConnected ? connect_wallet : undefined}>
          <p>{isConnected ? address?.slice(0, 7) : "CONNECT"}</p>
        </div>
      )}
    </nav>
  );
}
