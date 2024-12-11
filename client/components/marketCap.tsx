"use client";
import React, { useState, useEffect,useRef } from "react";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatTokenCount,formattedNumber } from '@/src/utils/globalUtils';
import { useResolutionsData } from "@/components/overlayer";

export const MarketCap = (props) => {
  const [solPrice, setSolPrice] = useState(1);
  const [marketCapData,setMarketCapData] = useState({});
  const { resolutionsData, setResolutionsData } = useResolutionsData();
  const [isWebSocketInitialized, setIsWebSocketInitialized] = useState(false);
  const userId = useLocalGlobalStore(state => state.wallet.userId);
  // const [data,setData] = useState([]);
  const apiUrlSol = "/token/sqlPrice";
  
  useEffect(() => {
    setMarketCapData(props.marketCapData)
    setSolPrice(props.solPrice)
    
  }, [props.marketCapData, props.solPrice])

  useEffect(() => {
    if(resolutionsData !== {}){
      setMarketCapData(resolutionsData)
    }
  }, [resolutionsData])

  const formatNumber = (numStr) => {
    // 找到小数点的位置  
    let decimalPointIndex = numStr.indexOf('.');

    // 如果没有小数点，则直接返回原数字字符串  
    if (decimalPointIndex === -1 || numStr <= 0) {
      return numStr;
    }

    // 截取小数点后的部分  
    let decimalPart = numStr.slice(decimalPointIndex + 1);

    // 计算小数点后紧跟的零的个数  
    let zeroCount = 0;
    while (decimalPart[zeroCount] === '0') {
      zeroCount++;
    }

    // 如果零的个数大于4，则格式化字符串  
    if (zeroCount > 4) {
      // 截取小数点后非零部分的开始几位  
      let nonZeroPrefix = decimalPart.slice(zeroCount, zeroCount + 5);
      // 构造格式化后的字符串  
      let formattedStr = `0.0{${zeroCount}}${nonZeroPrefix}`;
      return formattedStr;
    } else {
      // 如果零的个数不超过4，则直接返回原始的小数形式（这里进行了截断处理）  
      return parseFloat(numStr).toFixed(9);
    }
  }
  
  const markUp = marketCapData.markup && parseFloat(marketCapData.markup.replace('%', ''));
  const data = [
    { id: '1', name: 'Market cap', num: marketCapData.marketCap && formattedNumber(parseFloat(marketCapData.marketCap * solPrice).toFixed(6)) || 0 },
    { id: '2', name: 'Price', num: marketCapData.avePri && formattedNumber(formatNumber((marketCapData.avePri).toString())) || 0 },
    { id: '3', name: 'Virtual Liquidity', num: marketCapData.poolSolBalance && formattedNumber(parseFloat(marketCapData.poolSolBalance).toFixed(6)) || 0 },
    { id: '4', name: 'Volume', num: marketCapData.volume && formattedNumber(parseFloat(marketCapData.volume * solPrice).toFixed(6)) || 0 }
  ]

  return (
    <div className="w-full justify-between text-left items-start grid grid-cols-2 sm:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <div key={index} className="bg-[#221F2E] py-3 md:px-6 px-4 rounded-lg flex flex-col gap-2">
          <h1 className="text-lg font-normal text-nowrap">{item.name}{index == 1 && <span className={`${markUp < 0 ? 'text-[#FF3E80]' : 'text-[#10F4B1]'}`}>{marketCapData.markup}</span>}</h1>
          <p className="text-[#5a58f2] font-2xl font-semibold">{index == 2 || index == 1 ? `` : '$'}{item.num}{index == 1 || index == 2 ? `Sol` : ''}</p>
        </div>
      ))}
    </div>
  );
};