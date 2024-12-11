"use client";
import React, { useEffect,useState } from "react";
import { Tabs, Tab,Input } from "@nextui-org/react";
import { Binoculars,XyaxisLine,BubbleIcon } from "@/components/icons";
import {usePathname,useSearchParams } from "next/navigation";
import { Thread } from "./Thread";

export const FooterNav = (props) => {
  const btnStyle = "text-[#5a58f2] bg-[#221F2E] rounded-3xl"
  const pathname = usePathname();
  // const searchParams = useSearchParams()
  // useEffect(() => {
  //   // Do something here...
  // }, [pathname, searchParams])
  // console.log(pathname)
  const [selected, setSelected] = React.useState("tokensCard");
  const handleSelected = (key) => {
    setSelected(key);
    props.getValue(key);
};

  return (
    <footer className="w-full fixed bottom-0 left-0 flex sm:hidden items-center justify-center pt-3 z-10">
        <div className="flex w-full flex-col bg-[#0F0C14]">
          <Tabs
            aria-label="Options"
            variant="light"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none grid grid-cols-3 gap-4 justify-center",
              cursor: "w-full bg-transparent dark:bg-transparent shadow-none",
              tab: "h-12",
              tabContent: "py-2 px-1 text-[#F2F2FC] group-data-[selected=true]:bg-[#5a58f233] group-data-[selected=true]:text-[#5A58F2] rounded-md"
            }}
            selectedKey={props.selectedTab}
            onSelectionChange={handleSelected}
          >
            <Tab
              key="tokensCard"
              title={
                <div className="flex items-center space-x-2">
                  <Binoculars />
                </div>
              }
            />
            <Tab
              key="buyCard"
              title={
                <div className="flex items-center space-x-2">
                  <XyaxisLine />
                </div>
              }
            />
            <Tab
              key="msgCard"
              title={
                <div className="flex items-center space-x-2">
                  <BubbleIcon />
                </div>
              }
            />
          </Tabs>
        </div>
      </footer>
  );
};
