"use client";
import { Image, Link } from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react";

const WEBSOCKET_API_KEY = process.env.NEXT_PUBLIC_APP_WEBSOCKET_URL;

export const Marquee = () => {
  const [marqueeList, setMarqueeList] = useState([]);
  const ws = useRef(null);
  const [reconnecting, setReconnecting] = useState(false);
  // WebSocket连接函数
  const connectWebSocket = () => {
    const socket = new WebSocket(WEBSOCKET_API_KEY);
    ws.current = socket;
 
    socket.onopen = () => {
      console.log('WebSocket connection opened');
      setReconnecting(false);
      // 发送参数给后端
      const params = {};
      socket.send(JSON.stringify(params));
    };
 
    const onMessage = (event) => {
      const kLineData = JSON.parse(event.data);
      setMarqueeList(prevData => prevData.concat(kLineData?.data || []).slice(-20));
    };
 
    socket.onmessage = onMessage;
 
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      if (!reconnecting) {
        setReconnecting(true);
        // 使用setTimeout实现延迟重连，这里可以设置一个固定的延迟时间
        setTimeout(() => {
          connectWebSocket();
        }, 5000); // 例如，5秒后重连
      }
    };
 
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };
 
  useEffect(() => {
    connectWebSocket();
 
    // 清理函数，组件卸载时执行
    return () => {
      if (ws.current) {
        ws.current.close(); // 关闭WebSocket连接
        ws.current.onopen = null; // 清除事件监听器（虽然在这里不是必需的，因为socket将被销毁）
        ws.current.onmessage = null; // 清除事件监听器
        ws.current.onclose = null; // 清除事件监听器
        ws.current.onerror = null; // 清除事件监听器
        ws.current = null; // 重置引用
      }
    };
  }, []);

  const formatDate = (isoString) => {
    // 创建一个Date对象
    const date = new Date(isoString);

    // 提取年份、月份和日期
    const year = date.getFullYear().toString().slice(-2); // 获取年份的最后两位
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1，并且确保是两位数
    const day = String(date.getDate()).padStart(2, '0'); // 确保日期是两位数

    // 格式化并返回结果
    return `/${month}/${day}/${year}`;
  }

  // console.log("🚀 ~ Marquee ~ marqueeList:", marqueeList)

  return (
    <>
      <div className="flex flex-nowrap gap-12 rounded-xl  container1 container max-w-full h-10 sm:h-16">
        <div className="flex flex-nowrap gap-4 scrolling-wrapper">
          {marqueeList?.map((item, index) => {
            return <div key={index} className={`${index == marqueeList?.length ? 'd2 shakeSlow animate-move' : ''} box cursor-pointer min-w-80 w-auto h-6 md:h-8 bg-[#14111C] p-2 md:p-4 box-content rounded-xl flex flex-nowrap justify-between items-center text-sm text-[#fff]`}>
              <Link
                href={`/personalCenter?userId=${item.userId}`}
                underline="none"
                className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
              >
                <Image
                  shadow="none"
                  width="100%"
                  radius="none"
                  className="w-full object-cover w-[31px] h-[31px] rounded-[50%]"
                  src={item.avatar}
                />
              </Link>
              <p className="text-nowrap">{item.username?.slice(0, 6)}</p>
              {item.transactionType != 'create' ? <p className="flex flex-nowrap justify-between gap-1 items-center">
                <span className="font-semibold">{item.transactionType == 'buy' ? 'Bought' : 'Sold'}</span>
                {Number(item.solAmount?.replace(/\.?0+$/, ''))?.toFixed(6)}
                <span className="font-semibold">SOL</span>
                of
              </p> : <p className="flex flex-nowrap justify-between gap-1 items-center">
                <span className="font-semibold">Created</span>
              </p>}
              <span>{" "}</span>
              <span className={item.transactionType == 'create' ? 'font-semibold' : ''}>{item.ticker?.slice(0, 6)}</span>
              <Link
                href={`/tokensDetail?id=${item.id}`}
                underline="none"
                className="text-sm sm:text-base bg-transparent text-[#fff]"
              >

                <Image
                  shadow="none"
                  width="100%"
                  radius="none"
                  className="w-full object-cover w-[31px] h-[31px] rounded-[50%]"
                  src={item.image}
                />
              </Link>
              {item.transactionType == 'create' ? <p className="flex flex-nowrap justify-between gap-1 items-center">
                <span>on</span>
                <span className="font-semibold ml-2 tracking-wider">{formatDate(item.updatedTime)}</span>
              </p> : null}
            </div>
          })}
          {/* <div className="box cursor-pointer w-80 h-6 md:h-8 bg-[#14111C] p-2 md:p-4 box-content rounded-xl flex flex-nowrap justify-between items-center text-sm">
            <Image
              shadow="none"
              width="100%"
              radius="none"
              className="w-full object-cover"
              src="/Polygon 1.svg"
            /> <p>Vector Sold 0.02 SOL of Silly</p>{" "}
            <Image
              shadow="none"
              width="100%"
              radius="none"
              className="w-full object-cover"
              src="/Polygon 1.svg"
            />
          </div> */}
        </div>
      </div>
    </>
  );
};
