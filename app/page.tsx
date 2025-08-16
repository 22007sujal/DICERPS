"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Connector, CreateConnectorFn, useAccount, useConnect } from "wagmi";

export default function HOME() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const router = useRouter();
  const firstRender = useRef(true);

  const [connector, set_connector] = useState<Connector<CreateConnectorFn> | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    set_connector(connectors[1]);
  }, []);

  useEffect(() => {
    if (firstRender.current === true) {
      firstRender.current = false;
      return;
    }
    // router.replace("/play");
  }, [isConnected]);

  const handleGuestLogin = () => {
    const savedUsername = localStorage.getItem("diceusername");
    if (savedUsername) {
      router.replace("/play");
    } else {
      setShowPopup(true);
    }
  };

  const handleSaveUsername = () => {
    if (!username.trim()) return;

    // ✅ Free avatar API (no key required)
    const avatarUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
      username
    )}`;

    localStorage.setItem("diceusername", username);
    localStorage.setItem("diceavatar", avatarUrl);

    setShowPopup(false);
    router.replace("/play");
  };

  return (
    <div id="main-container">
      <div id="wallet-connect">
        <h2 onClick={() => connector && connect({ connector })}>CONNECT</h2>
      </div>
      <div id="wallet-connect">
        <h2 onClick={handleGuestLogin}>AS GUEST</h2>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Enter Username</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <button onClick={handleSaveUsername}>Continue</button>
          </div>
        </div>
      )}

      <div id="credits">
        <div id="shy">
          <p>BUILT BY SUJAL</p>
        </div>
      </div>

     <style jsx>{`
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .popup-content {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    width: 300px;
    height: 200px;  /* ✅ fixed height */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

    display: flex;
    flex-direction: column;
    justify-content: center; /* centers content vertically */
  }

  .popup-content h3 {
    margin-bottom: 10px;
  }

  .popup-content input {
    width: 90%;
    padding: 8px;
    margin: 10px auto;
    border-radius: 8px;
    border: 1px solid #ccc;
  }

  .popup-content button {
    padding: 8px 15px;
    border: none;
    border-radius: 8px;
    background: #4cafef;
    color: white;
    cursor: pointer;
    font-weight: bold;
    margin-top: auto;
  }

  .popup-content button:hover {
    background: #2196f3;
  }
`}</style>

    </div>
  );
}
