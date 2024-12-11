"use client";
import React, { useState, useEffect } from "react";
import { Slider, Tooltip } from "@nextui-org/react";
import { TipsIcon } from "@/components/icons";
import { formatTokenCount,formattedNumber } from '@/src/utils/globalUtils';

export const ProgressBar = (props) => {
  const [solPrice, setSolPrice] = useState(1);
  const [marketCapData,setMarketCapData] = useState({});
  const [isOpen, setIsOpen] = React.useState(false);
  const [showTooltip,setShowTooltip] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if(props.marketCapData.progressBar){
      setSolPrice(props.solPrice)
      setMarketCapData(props.marketCapData)
      const calculation = (1 / 4100000) * 1000000000 * props.solPrice;
      setResult(calculation);
    }
    
  }, [props.marketCapData, props.solPrice])
    // 去掉百分号，并将字符串转换为数字  
    let percentage = marketCapData.progressBar && parseFloat(marketCapData.progressBar.replace('%', ''));
    // 将百分比转换为实际的数值（例如，10% 变为 0.1）  
    let decimalValue = percentage / 100;
    const poolSolBalance = 800000000 - (decimalValue * 800000000);
    const processValue = marketCapData.progressBar && formattedNumber(marketCapData.progressBar);
  
  return (
    <div className="flex flex-col gap-2 w-full h-full items-start justify-center">
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-row gap-2 justify-center items-center font-medium text-small text-[#F1F2F6]"><h1 className={`${marketCapData.isOutside == 1 ? 'text-[#10F4B1]' : 'text-[#5A58F2]'} font-semibold`}>{processValue}</h1> {formatTokenCount(parseFloat(marketCapData.marketCap * solPrice).toFixed(2))}</div>
        <Tooltip
          showArrow={true}
          placement="bottom"
          isOpen={isOpen}
          onOpenChange={(open) => setIsOpen(open)}
          className=""
          content={
            <div className="px-4 py-4 w-full flex flex-col gap-2">
              <p>
                when the market cap reaches <b className="text-[#5A58F2]">${result !== null ? result : ''}</b> all the liquidity fromthe
              </p>
              <p>bonding curve will be deposited into Raydium and</p>
              <p>burned.progression increases as the price goes up,there are</p>
              <p>
                <b className="text-[#5A58F2]">{poolSolBalance}</b> tokens still available for sale in thebonding curve
              </p>
              <p>and there is <b className="text-[#5A58F2]">{marketCapData.poolSolBalance}</b> SOL in the bonding curve.</p>
            </div>
          }
        >
          <div className="cursor-pointer hidden sm:flex flex-row gap-2 items-center">
            <div className="border border-[#ffffff] w-[20px] h-[20px] flex justify-center rounded-full">
              <TipsIcon />
            </div>
            What is this?
          </div>
        </Tooltip>
        <div className="cursor-pointer flex sm:hidden flex-row gap-2 items-center relative" onClick={() => setShowTooltip(!showTooltip)}>
          <div className="border border-[#ffffff] w-[20px] h-[20px] flex justify-center rounded-full">
            <TipsIcon />
          </div>
          What is this?
          {showTooltip && (<div className="absolute bottom-8 right-0 z-50 w-[90vw] bg-[#221F2E]">
            <div className="px-4 py-4 w-full flex flex-col gap-2 text-left">
              <p>
                when the market cap reaches <b className="text-[#5A58F2]">${result !== null ? result : ''}</b> all the liquidity fromthe
              bonding curve will be deposited into Raydium and
              burned.progression increases as the price goes up,there are<b className="text-[#5A58F2]">{poolSolBalance}</b>tokens still available for sale in thebonding curve
              and there is <b className="text-[#5A58F2]">{marketCapData.poolSolBalance}</b> SOL in the bonding curve.</p>
            </div>
          </div>)}
        </div>
      </div>

      <Slider
        isDisabled
        classNames={{
          base: 'opacity-100',
          track: "bg-[#ffffff] h-[8px] opacity-100 border-s-[#5a58f2]",
          filler: "bg-[#5a58f2] h-[8px] opacity-100",
        }}
        value={parseFloat(marketCapData.progressBar && marketCapData.progressBar.replace('%', ''))}
        renderThumb={(props) => (
          <div
            {...props}
            className="group p-1 top-1/2 bg-[#ffffff] border-small border-[#E2E2E2] dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
          >
            <span className="transition-transform bg-gradient-to-br shadow-small from-[#5a58f2] to-[#5a58f2] rounded-full w-3 h-3 block group-data-[dragging=true]:scale-80" />
          </div>
        )}
      />
    </div>
  );
};
