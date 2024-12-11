"use client";
import React, { useState, useEffect } from "react";
import { Button, Image, Snippet, Spinner } from "@nextui-org/react";
import { title } from "@/components/primitives";
import { Link } from "@nextui-org/link";

export default function FaqPage() {
  const [classify, setClassify] = useState(0);
  const dataList = [
    {
      id: 1, title: "Who is K-line chart technology provider?", subTitle: 'TradingView', desc: <div>
        SKARB uses TradingView technology to display trading data on
        charts. TradingView is a charting platform for traders and
        investors. loved and visited by millions of usersworldwide. lt
        offers state-of-the-art charting tools and a space where people
        driven bymarkets can track important upcoming events in the<Link
          isExternal
          href="https://www.tradingview.com/economic-calendar/"
          underline="always"
          className="text-[#5a58f2]"
        >
          Economic calendar
        </Link>
        , chat, chart, andprepare for trades.
        <div>
          <Button className="bg-[#5a58f2] w-[160px] px-[14] rounded mt-7">
            <Link
              isExternal
              href="https://www.tradingview.com/economic-calendar/"
              className="text-[#FCFAFF]"
            >
              DETAILS
            </Link>
          </Button>
        </div>
      </div>
    },
    {
      id: 2, title: "How do you calculate Market Cap?", subTitle: 'Market Cap', desc: `Total supply (e.g. 1Bn token) multiplied by  the price.`
    },
    { id: 3, title: "Is there a minimum buy amount?", subTitle: 'minimum buy amount', desc: `Yes, the minimum buy amount is 0.018 SOL on Solana to avoid spamming and chain congestion.` },
    {
      id: 4, title: "Why can’t I sell my dust?", subTitle: 'transactions fail', desc: <div>
        here are a few possible reasons why transactions might fail
        <div><span className="mx-[5px]">▪</span>Trade exceeds your slippage tolerance. Try increasing it</div>
        <div><span className="mx-[5px]">▪</span>Network congestion.</div>
        <div><span className="mx-[5px]">▪</span>Check the minimum amount you're buying/selling
        </div>
      </div>
    },
    { id: 5, title: "How long does the migration take to Raydium?", subTitle: 'migration time', desc: `It is typically 1 minutes, but it can take up to 10 minutes to completely migrate. While the migration is happening, trading on Aimint is paused.` },
  ];
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col items-center w-full relative gap-5">
        <img
          src="/faqBanner.png"
          className="w-[100%] max-w-[100%] h-[120px] sm:h-[248px] object-cover "
        />
      </div>
      <div className="flex flex-col justify-between gap-8">
        <h1 className="text-[#F0F0FF] text-[34px] text-left pt-[20px]">
          Frequently Asked Questions
        </h1>
        <div className="w-full flex flex-row items-center justify-end relative">
          <ul className="w-[56%] text-left bg-[#1A1425]  absolute left-0 z-10">
            {dataList.map((item, index) => (
              <li
                key={index}
                className={`${index == classify ? "text-[#F0F0FF] bg-[#221F2E] font-semibold" : "font-normal"} py-[24px] px-[16px] cursor-pointer hover:bg-[#221F2E] flex flex-row justify-between text-left `}
                onClick={() => setClassify(index)}
              >
                <div className="flex flex-row items-center gap-4">
                  <div className={`w-[24px] h-[24px] rounded-full ${index == classify ? 'bg-[#5a58f2]' : 'bg-[#A5A6F6]'}`}>
                  </div>
                  <div>{item.title}</div>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 4L16 12L8 20"
                    stroke={`${index == classify ? '#5D5FEF' : '#A5A6F6'}`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </li>
            ))}
          </ul>
          <div className="w-[50%] bg-[#191622] rounded-2xl flex flex-col text-left gap-5 pt-[40px] pr-[32px] pb-[145px] pl-[144px] h-[472px]">
            <h1 className="text-[#F0F0FF] text-[18px] font-bold">
              {dataList?.[classify]?.subTitle}
            </h1>
            <div className="text-[#9191AA] leading-6">
              {dataList?.[classify]?.desc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
