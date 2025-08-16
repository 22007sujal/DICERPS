"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useBalance } from "wagmi";
import "./nav.css";
import { useDiceRps } from "../[hooks]/savedata";

interface NavProps {
  showConnect?: boolean;
}

export default function Nav({ showConnect = true }: NavProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: balanceData } = useBalance({
    address: address,
    enabled: !!address,
  });

  const { data: profile, getDiceRps, saveDiceRps, uploadImage } = useDiceRps(
    "http://localhost:3000"
  );

  const [connector, setConnector] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImg, setProfileImg] = useState("");

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

  // When wallet connects → check DB
  useEffect(() => {
    if (isConnected && address) {
      (async () => {
        const userData = await getDiceRps(address);
        if (!userData) {
          setShowPopup(true); // Not found → show popup
        }
      })();
    }
  }, [isConnected, address]);

  async function handleSaveProfile() {
    const success = await saveDiceRps({
      wallet_address: address!,
      username,
      profile_image: profileImg,
    });
    if (success) {
      setShowPopup(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setProfileImg(url);
  }

  if (!mounted) return null;

  return (
    <>
      <nav id={isConnected ? "navbar_connected" : "navbar_not_connected"}>
        <div className="logo-with-text">
          <img src="./dicerpslogo.png" alt="logo" />
          <h1>DICERPS</h1>
        </div>

        {showConnect && (
          <div className="wallet-section">
            {!isConnected ? (
              <div id="connect" onClick={connect_wallet}>
                <p>CONNECT</p>
              </div>
            ) : (
              <div
                id="connect"
                className="dropdown-wrapper"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <p>{address?.slice(0, 7)}...</p>

                {dropdownOpen && (
                  <div className="wallet-dropdown-card">
                    <p className="wallet-balance">
                      {balanceData
                        ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
                        : "Loading..."}
                    </p>
                    <button className="wallet-history-btn">HISTORY</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <div className="profile-image-wrapper">
              {profileImg ? (
                <img src={profileImg} alt="Profile" className="profile-preview" />
              ) : (
                <div className="profile-placeholder"></div>
              )}
              <input type="file" onChange={handleImageUpload} />
            </div>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button id="save" onClick={handleSaveProfile}>Save</button>
          </div>
        </div>
      )}
    </>
  );
}
