"use client";
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Image,
  Link,
  Divider,
  Progress,
  ProgressBar,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useHover } from "react-aria";
// import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Input } from "@nextui-org/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { MemesCard } from "@/components/memesCard";
import { ScrollMemesCard } from "@/components/ScrollMemesCard";
import { ArrowDown, PolygonIcon } from "@/components/icons";
import { Actor } from "next/font/google";
import { BtnGroup } from "@/components/btnGroup";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatRelativeToNow } from '@/src/utils/timeFormat';
import { OutSideLinks } from "@/components/OutSideLinks";
import { formatTokenCount } from '@/src/utils/globalUtils';
import {AlertBox} from "@/components/AlertBox";

export const Trend = () => {

  const router = useRouter();
  const [isFollowed, setIsFollowed] = React.useState(false);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const [shake, setShake] = useState(false);
  const [newData, setNewData] = useState([]);
  const [hotData, setHotData] = useState([]);
  const { wallet, connected, disconnect } = useWallet();
  const [isMobile, setIsMobile] = useState(false);
  const [solPrice, setSolPrice] = useState(1)
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const apiUrl = "/token/list", apiUrlSol = "/token/sqlPrice";
  //获取localStore中的setState方法
  const setState = useLocalGlobalStore((state) => state.setState);
  const data = { page: 1, limit: 8, time: "1", unit: "DAY" };
  const hotParams = { page: 1, limit: 8, time: "1", orderBy: "quantity" };
  const markUpData = { page: 1, limit: 10, orderBy: "market_cap", orderDirection: "DESC" }
  const discoverData = { page: 1, limit: 8 };
  const [selectedKeys, setSelectedKeys] = React.useState(new Set(["24h"]));

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
 
  const simulateTransactionFailure = (message) => {
    setShowAlert(true);
    setAlertMessage(message);
  };
  const handleDisconnect = () => {
    setState((preState) => {
      return {
        ...preState,
        isConnect: false,
        wallet: {
          address: null,
          signature: null,
          userId: null,
          walletName: null,
        },
      };
    });
    if (wallet && connected) {
      disconnect();
    }
    router.push("/");
  };
  //请求代币列表接口
  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 并行发送三个请求
      const [responseData, newData, hotData] = await Promise.all([
          Api.post(apiUrl, markUpData, userId),
          Api.post(apiUrl, data, userId),
          Api.post(apiUrl, hotParams, userId)
      ]);
      setHotData(prev => [...(hotData.item || [])]);
      setNewData(prev => [...(newData.item || [])]);
      if (responseData.item) {
          return responseData;
      } else {
          setError(responseData);
          handleDisconnect();
      }
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message);
    } finally {
      setLoading(false);
    }
  };
  // 使用 useLayoutEffect 而不是 useEffect，以便在 DOM 更新后同步运行  
  useLayoutEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768); // 根据你的断点设置  
    }

    handleResize(); // 组件挂载时立即调用  
    window.addEventListener('resize', handleResize); // 添加事件监听器  

    return () => {
      window.removeEventListener('resize', handleResize); // 组件卸载时移除监听器  
    };
  }, []);
  const fetchSolPrice = () => {
    Api.post(apiUrlSol, {}, userId).then(res => {
      setSolPrice(res?.solPrice);
    }).catch(error => {
    });
  };
   
  useEffect(() => {
    fetchSolPrice();
    // 设置定时器，每两秒请求一次SOL价格
    const intervalId = setInterval(fetchSolPrice, 60000);
    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);
  //首次加载页面调用代币列表接口
  useEffect(() => {
    const fetchData = async () => {
      const data = await handleFetchData();
      if (data) {
        setResponseData(data.item);
      } else {
        handleDisconnect();
      }
    };

    // 首次加载时获取数据
    if (!isMobile) {
      fetchData();
    }

    // 每隔3秒刷新一次数据
    const interval = setInterval(
      () =>
        setResponseData((p) => {
          if (p.length !== 0) {
            setShake(true);
            const [p1, ...p2] = p;
            return [...p2, p1];
          }
          return p;
        }),
      3000
    );
    // // 清理函数，组件卸载时清除定时器
    return () => clearInterval(interval);
  }, [isMobile]);
  //抖动效果
  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => {
        setShake(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shake]);
  //时间下拉框选择事件
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleToOutSideLink = (link) => {
    window.open(link, '_blank');
  }


  if (loading) return <Spinner />;
  return (
    <div className="flex flex-col w-full">
      <div className="hidden sm:flex flex-row items-center gap-8 mb-4 justify-between">
        <p className="text-3xl">Trending</p>
        <NextLink isExternal aria-label="marketCap" href="/marketCap">
          <Button size="md" className="bg-[#1A1425] px-6">
            View all
          </Button>
        </NextLink>
      </div>
      <div className="hidden sm:grid grid-cols-2 gap-x-32 gap-y-8 pb-20">
        {responseData.length > 0 ? (
          responseData.map((item, index) => (
            <div
              className={`runner box-border rounded-xl hover:bg-[#1A1425] border cursor-pointer bg-[#110E17] ${shake && index === 0 ? "border-none" : (item.badge == 4 ? "border-[#10f4b09d]" : item.badge == 5 ? "border-[#ffc4008a]" : item.badge == 6 ? "border-[#ff3e8261]" : "border-[#5a58f252]")}`}
              key={`${item}-${index}`}
            >
              <Card
                className={`${shake && index === 0 ? "shake d2 animate-move" : ""} dark:bg-[#110E17] w-full box-border hover:dark:bg-[#1A1425]`}
                isBlurred
                isPressable
                shadow="none"
                radius="md"
                onPress={() => router.push(`/tokensDetail?id=${item.id}`)}
              >
                <CardHeader className="justify-between p-0">
                  <div className="flex flex-row gap-2 justify-start items-start w-full">
                    {item.colour !== 4 && (<div className="absolute top-1 left-1 z-20 flex fle-row gap-1 shadow-none items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="9"
                        height="16"
                        viewBox="0 0 9 16"
                        fill="none"
                        className={`${item.colour == 1 ? "fill-[#5A58F2]" : item.colour == 2 ? "fill-[#FF3E80]" : "fill-[#10F4B1]"}  w-[9] h-[16]`}
                      >
                        <path d="M8.04189 5.91192L3.32292 16L3.32292 8.79581L0 8.70052L5.04744 0L5.04744 5.91192L8.04189 5.91192Z"
                        />
                      </svg>
                      <p
                        className={`text-[10px] font-normal ${item.colour == 1 ? "text-[#5A58F2]" : item.colour == 2 ? "text-[#FF3E80]" : "text-[#10F4B1]"}`}
                      >
                        {item.colour == 1 ? "Never give up." : item.isOutside == 1 ? "To Raydium" : item.markup}
                      </p>
                    </div>)}
                    <Image
                      shadow="none"
                      width="100%"
                      radius="none"
                      className={`w-[110px] h-[109px] ${shake && index === 0 ? "p-1" : "p-[0]"} object-cover rounded-l-lg z-1`}
                      src={item.image}
                    />
                    <div className="flex flex-col gap-0 p-2 items-start card-right-width">
                      <div className="flex flex-row justify-between w-full">
                        <div className=" flex flex-row text-small justify-between items-center">
                          <div className="flex flex-row justify-center items-center gap-1">
                            <b className="text-[14px] font-semibold">Created by</b>
                            <Image width="100%" src={item.avatar} className="w-[20px] h-[20px]" />
                            <Link
                              href={`/personalCenter?userId=${item.userId}`}
                              underline="always"
                              className="w-[60px] max-w-[60px] block whitespace-nowrap overflow-hidden text-ellipsis text-[12px] bg-transparent text-[#5a58fa] "
                            >
                              {item.createdBy}
                            </Link>
                          </div>

                          <p className="text-[14px] text-default-500 flex flex-row gap-1 justify-center items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              className="w-[20] h-[20]"
                            >
                              <path
                                d="M8.08313 1.67673C8.56247 1.11101 9.43499 1.11101 9.91433 1.67673L10.4919 2.35846C10.7858 2.70537 11.2505 2.85637 11.6923 2.74848L12.5602 2.53644C13.2805 2.36049 13.9864 2.87336 14.0417 3.61276L14.1082 4.5038C14.1421 4.9572 14.4293 5.35253 14.8501 5.52486L15.6769 5.86352C16.3631 6.14452 16.6327 6.97438 16.2428 7.60504L15.7729 8.365C15.5338 8.75176 15.5338 9.2404 15.7729 9.62716L16.2428 10.3871C16.6327 11.0178 16.3631 11.8476 15.6769 12.1286L14.8501 12.4673C14.4293 12.6396 14.1421 13.035 14.1082 13.4883L14.0417 14.3794C13.9864 15.1188 13.2805 15.6317 12.5602 15.4557L11.6923 15.2437C11.2505 15.1358 10.7858 15.2868 10.4919 15.6337L9.91433 16.3154C9.43499 16.8812 8.56247 16.8812 8.08313 16.3154L7.50557 15.6337C7.21163 15.2868 6.74693 15.1358 6.30521 15.2437L5.43724 15.4557C4.71696 15.6317 4.01105 15.1188 3.95581 14.3794L3.88925 13.4883C3.85537 13.035 3.56815 12.6396 3.1474 12.4673L2.32055 12.1286C1.63441 11.8476 1.36477 11.0178 1.75469 10.3871L2.22457 9.62716C2.46368 9.2404 2.46368 8.75176 2.22457 8.365L1.75469 7.60504C1.36477 6.97438 1.63441 6.14452 2.32055 5.86352L3.1474 5.52486C3.56815 5.35253 3.85537 4.9572 3.88925 4.5038L3.95581 3.61276C4.01105 2.87336 4.71696 2.36049 5.43724 2.53644L6.30521 2.74848C6.74693 2.85637 7.21163 2.70537 7.50557 2.35846L8.08313 1.67673Z"
                                fill={`${item.badge == 1 ? "#5A58F233" : item.badge == 2 ? '#2081E2' : item.badge == 3 ? "#5B667E" : item.badge == 4 ? '#10F4B1' : item.badge == 5 ? "#FFC300" : '#FF3E80'}`}
                              />
                              <path
                                d="M8.10122 10.5712L6.52622 8.99619L6.00122 9.52119L8.10122 11.6212L12.6012 7.12119L12.0762 6.59619L8.10122 10.5712Z"
                                fill={`${item.badge == 2 ? "#5a58f2" : "#F2F2FC"}`}
                                stroke="white"
                                strokeWidth="0.6"
                              />
                            </svg>
                          </p>
                          <span className="text-[10px] text-[#F1F2F6]">
                            {formatRelativeToNow(item.createdTime,item.currentTime)}
                          </span>
                        </div>
                        <div className="flex flex-row justify-start gap-2 scale-[0.8]">
                          <OutSideLinks data={item} />
                        </div>
                      </div>
                      <div className="text-[12px]">{item.name} (ticker:{item.ticker})</div>
                      <p className={`w-full line-clamp-1 text-[#757C82] text-[10px] text-left`}>
                        {item.description}
                      </p>
                      <Divider className="border-t-[0.644px] bg-[#242932]" />
                      <div className={`flex flex-row text-[12px] justify-start items-center gap-2 ${item.progress == '0' ? 'h-[60px]' : ''}`}>
                        <b className="text-[10px] text-[#707A83] font-normal">MARKET CAP</b>
                        <p className="text-white font-semibold">$ {formatTokenCount(parseFloat(item.marketCap * solPrice).toFixed(2))}</p>
                        <p className="text-default-500">({item.progressBar})</p>
                      </div>
                      <div className={`progress-container m-0 mt-2 ${item.progressBar == '0' ? 'hidden' : 'flex'}`}>
                        <div
                          style={{ width: `${item.progressBar}` }}
                          className="progress-bar"
                          id="progressBar2"
                        ></div>
                      </div>
                    </div>


                  </div>
                  {/* <div className="flex gap-5">
                    <div className="flex flex-col items-start justify-center text-[20px]">
                      {index + 1}
                    </div>
                    <Avatar isBordered radius="md" size="lg" src={item.image} />
                    <div className="flex flex-col gap-1 items-start justify-center">
                      <h4 className="leading-none text-[#fff] text-[18px] font-semibold">
                        {item.name}
                      </h4>
                      <h5 className="text-small tracking-tight text-[#637592]">
                        MARKET CAP : ${item.marketCap}
                      </h5>
                    </div>
                  </div>
                  <div className="text-[16px] tracking-tight text-[#fff] font-semibold">{item.quantity}</div> */}
                </CardHeader>
              </Card>
            </div>
          ))
        ) : (
          <>
            <p>No data available</p>
          </>
        )}
      </div>
      {(hotData.length > 0 && !isMobile) && (<div className="hidden sm:flex flex-col items-center gap-6 mb-4">
        <div className="flex flex-row w-full justify-between items-center">
          <p className="text-3xl">Hot</p>
          <div className="flex flex-row gap-8">
            <NextLink isExternal aria-label="Github" href="/marketCap">
              <Button size="md" className="bg-[#1A1425] px-6">
                View all
              </Button>
            </NextLink>
          </div>
        </div>
        <MemesCard list={hotData} solPrice={solPrice} />
      </div>)}
      {(newData.length > 0 && !isMobile) && (<div className="hidden sm:flex flex-col items-center gap-6 mb-4">
        <div className="flex flex-row w-full justify-between items-center">
          <p className="text-3xl">New</p>
          <div className="flex flex-row gap-8">
            <NextLink isExternal aria-label="Github" href="/marketCap">
              <Button size="md" className="bg-[#1A1425] px-6">
                View all
              </Button>
            </NextLink>
          </div>
        </div>
        <MemesCard list={newData} solPrice={solPrice} />
      </div>)}
      {!isMobile && (<div className="hidden sm:flex flex-col items-center gap-6 mb-4">
        
        <ScrollMemesCard solPrice={solPrice} />
      </div>)}
      {isMobile && (<BtnGroup />)}
      <AlertBox
        showAlert={showAlert}
        alertMessage={alertMessage}
        handleCloseAlert={handleCloseAlert}
      />

    </div>
  );
};
