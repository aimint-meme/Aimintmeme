"use client";
import React, { useState } from "react";
import {
  Image, ButtonGroup, Button
} from "@nextui-org/react";
import TradingViewWidget from "@/components/TradingViewWidget";
import TVChart from "@/components/tvChart";


export const KLineChart = (props) => {
  const btnClassify = [{ name: "Raydium Chart" }, { name: "AImint Chart" }];
  const [classify, setClassify] = useState(0);
  return (
    <div className="w-full max-w-full">
      {/* {props.tokenValue === 1 && (<ButtonGroup
        className="hidden sm:grid flex-row w-full  grid-cols-2 bg-[#221F2E] rounded-t-lg mb-4"
      >
        {btnClassify.map((item, index) => (
          <Button
            key={index}
            className={`${index == classify ? "text-[#fff] bg-[#5A58F2]" : "text-[#5A58F2] bg-[#221F2E]"} rounded-lg ${index == 0 ? 'first:rounded-es-none' : 'rounded-br-none last:rounded-ee-none'}`}
            onClick={() => setClassify(index)}
          >
            {item.name}
          </Button>
        ))}
      </ButtonGroup>)} */}
      {/* <div className={`${props.tokenValue == '100' ? 'h-[600px]' : 'h-[332px]'}  sm:h-[392px] w-full`}>
          <TradingViewWidget />
        </div> */}
      <div className={`${props.tokenValue === 1 ? 'holder-mobile-h' : 'h-[300px]'}  sm:h-[392px] w-full`}>
        <TVChart detailData={props.detailData} />
      </div>

    </div>

  );
};