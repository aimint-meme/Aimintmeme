"use client";
import React, { useRef, useState } from "react";
import { title } from "@/components/primitives";
import {
  Button,
  Tabs,
  Tab,
  Card,
  Image,
  CardHeader,
  Snippet, Link, Chip
} from "@nextui-org/react";
import { FooterNav } from "@/components/footer";
import {
  MyTwitterIcon,
  Binoculars,
  XyaxisLine,
  BubbleIcon,
} from "@/components/icons";
import { ProgressBar } from '@/components/progress';
import { MarketCap } from '@/components/marketCap';

export default function TokensCardPage() {
  return (
    <div className="flex flex-col w-full mb-10">
      <div className="flex flex-col gap-5 w-full justify-between items-center">
        <div className="flex flex-col gap-2 w-full justify-between items-start">
          <div className="flex flex-row gap-1 items-center w-full justify-between">
            <div className="flex flex-row gap-2"><Image
              shadow="none"
              width="100%"
              radius="none"
              className="w-full object-cover"
              src="/Polygon 1.svg"
            />
              <Link
                href="#"
                underline="always"
                className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
              >
                Vector
              </Link>
            </div>
            <Button
            size="sm"
              variant="bordered"
              className="border-[#5a58f2] text-[#5a58f2]"
            >
              FOLLOW
            </Button>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row gap-3 items-center justify-between  text-sm">
              <div className="flex flex-row gap-1 items-center justify-start">
                <h1 className="text-xl font-semibold">Mikey</h1>
                <h2 className="font-normal text-lg">($Mikey)</h2>
              </div>
              <div className="flex flex-row items-center gap-2">
                <p className="text-sm font-semibold text-[#FACC15]">CA</p>
                <Snippet hideSymbol variant="bordered" size="sm" classNames={{ base: 'w-26', pre: 'max-w-18 overflow-hidden',copyButton:'w-6 h-6' }}>0x6c4F...Dd12</Snippet>
              </div>
            </div>

          </div>
          <div className="flex flex-row justify-center items-center w-full">
            <MarketCap />
          </div>
          <div className="flex flex-row justify-center items-center w-full">
            <ProgressBar />
          </div>
          <div className="w-full flex flex-col gap-2">
            <Image
              shadow="none"
              width="100%"
              radius="none"
              className="w-full object-cover"
              src="/pig.png"
            />
            <p className="text-left text-[#757C82] text-sm font-normal">
                  WE HAVE OUR OWN STICKER PACK! JOIN THE SECRET SERVICE! 25K DEX
                  PAID. ADS AT RAYDIUM! BECOME AN AGENT NOW!
                </p>
          </div>

        </div>

      </div>
      {/* <FooterNav /> */}
    </div>
  );
}
