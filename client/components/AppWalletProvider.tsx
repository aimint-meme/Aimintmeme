"use client";
 
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {PhantomWalletAdapter, SolflareWalletAdapter,TrustWalletAdapter,WalletConnectWalletAdapter} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from "@solana/web3.js";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
 
// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

const main_endpoint = process.env.NEXT_PUBLIC_APP_SOLANA_COM;
let network;
switch (process.env.NEXT_PUBLIC_APP_SOL_NET) {
  case 'Devnet':
    network = WalletAdapterNetwork.Devnet;
    break;
  case 'Mainnet':
  default:
    network = WalletAdapterNetwork.Mainnet;
    break;
}

export default function AppWalletProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const endpoint = useMemo(() => main_endpoint, [network]);
  //   const wallets = useMemo(
  //     () => [new PhantomWalletAdapter(),new SolflareWalletAdapter()],
  //     []
  // )
    const wallets = useMemo(
      () => [
        // manually add any legacy wallet adapters here
        // new UnsafeBurnerWalletAdapter(),
        new PhantomWalletAdapter(),new SolflareWalletAdapter(),new TrustWalletAdapter(),new WalletConnectWalletAdapter()
      ],
      [network],
    );
   
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }