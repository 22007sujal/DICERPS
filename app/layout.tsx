"use client"; // ✅ allow hooks

import Nav from "./[components]/nav";
import { ROOM_PROVIDER } from "./[context]/room_context";
import "./lay.css";
import Socket_Provider from "./socket_provider";
import WalletProvider from "./wallet_provider";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showConnect = pathname !== "/"; // hide connect button on home page

  return (
    <html>
      <body>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://unpkg.com/augmented-ui@2/augmented-ui.min.css"
        />
        <Socket_Provider>
        <WalletProvider>
          <ROOM_PROVIDER>
            <Nav showConnect={showConnect} /> {/* ✅ Pass prop */}
            {children}
          </ROOM_PROVIDER>
        </WalletProvider>
        </Socket_Provider>
      </body>
    </html>
  );
}
