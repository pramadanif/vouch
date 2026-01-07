import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Lisk Sepolia chain definition
export const liskSepolia = {
    id: 4202,
    name: 'Lisk Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'Sepolia Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.sepolia-api.lisk.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Lisk Explorer',
            url: 'https://sepolia-blockscout.lisk.com',
        },
    },
    testnet: true,
} as const;

// Wagmi configuration
export const config = createConfig({
    chains: [liskSepolia],
    connectors: [
        injected(),
    ],
    transports: {
        [liskSepolia.id]: http(),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}
