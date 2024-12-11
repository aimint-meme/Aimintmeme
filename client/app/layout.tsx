// "use client";
// import { useState } from 'react';
import { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Spinner } from "@nextui-org/react";

import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { MyContext } from "./MyContext";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Overlayer } from "@/components/overlayer";
import { Navbar } from "@/components/navbar";
import { Marquee } from "@/components/marquee";
import { LocalGobalProvider } from "@/components/LocalSessionStorageContext";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
  ArrowDown,
  UnitedIcon,
  GroupIcon,
  NoticeIcon,
  PolygonIcon,
  ToogleIcon,
  CloseIcon,
} from "@/components/icons";
import { Suspense, useMemo } from "react";
// 引入Solana的钱包适配器
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets';
import AppWalletProvider from "@/components/AppWalletProvider";
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};
function SearchBarFallback() {
  return <Spinner label="Loading..." color="primary" labelColor="primary" />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const network = WalletAdapterNetwork.Mainnet;//Devnet;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const wallets = useMemo(
  //     () => [new UnsafeBurnerWalletAdapter()],
  //     []
  // )
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  )
  // const [guidePage, setGuidePage] = useState(0);
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <script src="/static/datafeeds/udf/dist/bundle.js" />
        <script src="/static/charting_library/charting_library.js" type="text/javascript" ></script>
        <script src="/static/js/dataUpdater.js" type="text/javascript" />
        <script src="/static/js/datafees.js" type="text/javascript" />
        <script src="/static/js/socket.js" type="text/javascript" />
        <script src="/static/js/jquery.js"></script>
        <script async src="/static/js/gTag.js" type="text/javascript" />
        <script src="/static/js/currentGoogleTag.js" type="text/javascript" />
      </head>
      <body
        className={clsx(
          "min-h-screen font-sora antialiased bg-[url('/bg.svg')] bg-contain bg-no-repeat bg-center sm:bg-none",
        )}
      >
        <AppWalletProvider>
          <LocalGobalProvider>
            <Providers
              themeProps={{ attribute: "class", defaultTheme: "dark" }}
            >
              <div className="relative flex flex-col h-screen ">
                {/* <App /> */}
                <Overlayer />
                <Navbar />
                <Marquee />
                <main className="container mx-auto px-6 flex-grow md:max-w-[100vw]">
                  {/* <MyContext.Provider value={{ guidePage, setGuidePage }}>{children}</MyContext.Provider> */}
                  <Suspense fallback={<SearchBarFallback />}>
                    {children}
                  </Suspense>
                </main>
                {/* <footer className="w-full flex items-center justify-center py-3">
                  <Link
                    isExternal
                    className="flex items-center gap-1 text-current"
                    href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
                    title="nextui.org homepage"
                  >
                    <span className="text-default-600">Powered by</span>
      <p className="text-primary">NextUI</p> 
                  </Link>
                </footer> */}
              </div>
            </Providers>
          </LocalGobalProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
