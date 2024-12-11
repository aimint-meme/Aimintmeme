"use client";
import React, { useState } from "react";
import { Button, ButtonGroup, Input, Tabs, Tab, Snippet } from "@nextui-org/react";
import { FrameIcon, MyTwitterIcon } from "@/components/icons";
import { FooterNav } from "@/components/footer";
import { KLineChart } from "@/components/kLine";
import { Thread } from "@/components/Thread";

export default function msgCardPage() {
  const btnClassify = [{ name: "buy" }, { name: "sell" }];
  const [classify, setClassify] = useState(0);
  //input框样式
  const inputStyle = {
    input: [
      "bg-[#221F2E]", "pl-3", "hover:bg-[#221F2E]", "rounded-lg"
    ],
    innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]", "pr-3", "rounded-lg"],
    inputWrapper: [
      "bg-[#221F2E]",
      "hover:bg-[#221F2E]",
      "dark:hover:bg-[#221F2E]",
      "p-0",
      "group-data-[focus=true]:bg-[#221F2E]",
      "dark:group-data-[focus=true]:bg-[#221F2E]", "rounded-lg"
    ],
  };
  const btnStyle = "text-[#5a58f2] bg-[#221F2E] rounded-3xl"
  return (
    <div className="flex flex-col gap-2 w-full justify-between items-start">
      <Thread />

      <FooterNav />
    </div>
  );
}

