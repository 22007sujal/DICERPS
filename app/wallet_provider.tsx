"use client";


import { config } from "./config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


export default function WalletProvider({ children }: { children: React.ReactNode }) {

  return (
    
    <WagmiProvider config={config}>
        <QueryClientProvider client={new QueryClient()}>
            {children}
        </QueryClientProvider>
    </WagmiProvider>
  );
}
