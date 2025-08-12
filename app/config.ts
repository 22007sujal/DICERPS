import { http, createConfig } from 'wagmi'
import { mainnet, base } from 'wagmi/chains'
import { injected, metaMask, safe } from 'wagmi/connectors'

// Define the Somnia Testnet chain
const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    name: 'Somnia Testnet Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
    public: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [mainnet, base, somniaTestnet],
  connectors: [
    injected(),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [somniaTestnet.id]: http('https://dream-rpc.somnia.network'),
  },
})
