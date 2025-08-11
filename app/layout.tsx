import Nav from "./[components]/nav";
import { ROOM_CONTEXT, ROOM_PROVIDER } from "./[context]/room_context";
import "./lay.css";
import Socket_Provider from "./socket_provider";
import WalletProvider from "./wallet_provider";
import Head from "next/head";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://unpkg.com/augmented-ui@2/augmented-ui.min.css"
        ></link>

        {/* <Socket_Provider> */}
         <Socket_Provider><WalletProvider>
            <ROOM_PROVIDER>
            <Nav />
              {children}
            </ROOM_PROVIDER>
          </WalletProvider>
          </Socket_Provider> 
        {/* </Socket_Provider> */}
      </body>
    </html>
  );
}
