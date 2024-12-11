"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Link,
  Divider,
} from "@nextui-org/react";
import { OutSideLinks } from "@/components/OutSideLinks";
import { formatTokenCount } from '@/src/utils/globalUtils';

export const MemesCard = (props) => {
  const router = useRouter();
  return (
    <div className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 rounded-t-lg">
      {props.list.map((item, index) => (
        <div key={index} className={`rounded-[14px] border-1 flex flex-row sm:flex-col bg-[#221f2e] ${item.badge == 4 ? "border-[#10F4B1]" : item.badge == 5 ? "border-[#FFC300]" : item.badge == 6 ? "border-[#FF3E80]" : "border-[#5a58f252]"} overflow-hidden  gap-0 hover:border-[#5a58f2] group/item relative`}>
          <Card
            shadow="sm"
            className="flex flex-row sm:flex-col h-[100%] max-w-[100%] w-[100%]  bg-[#221f2e] transition ease-in-out delay-50 sm:hover:-translate-y-1 sm:hover:scale-105 sm:duration-200 sm:hover:h-[434.2px]"
            key={index}
            isPressable
            onPress={() => router.push(`/tokensDetail?id=${item.id}`)}
          >
            <CardBody className="overflow-visible p-0 rounded-t-lg w-[45%] sm:w-full gap-0 shadow-none">
              {item.colour !== 4 && (<div className="absolute top-1 left-1 sm:top-2 sm:left-3 z-20 flex fle-row gap-1 sm:gap-2 shadow-none items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="32"
                  viewBox="0 0 18 32"
                  fill="none"
                  className={`${item.colour == 1 ? "fill-[#5A58F2]" : item.colour == 2 ? "fill-[#FF3E80]" : "fill-[#10F4B1]"}  w-[9] sm:w-[18] h-[16] sm:h-[32]`}
                >
                  <path
                    d="M17.0417 11.8238L7.60412 32L7.60412 17.5916L0.958496 17.401L11.053 0L11.053 11.8238L17.0417 11.8238Z"
                  // fill="#FF3E80"
                  />
                </svg>
                <p
                  className={`text-[10px] sm:text-[16px] font-semibold ${item.colour == 1 ? "text-[#5A58F2]" : item.colour == 2 ? "text-[#FF3E80]" : "text-[#10F4B1]"}`}
                >
                  {item.colour == 1 ? "Never give up." : item.isOutside == 1 ? "To Raydium" : item.markup}
                </p>
              </div>)}
              <Image
                shadow="sm"
                  width="100%"
                radius="none"
                className="w-full object-cover rounded-l-lg sm:rounded-t-lg h-[117px] sm:h-[274px] z-1 "
                src={item.image}
              />
            </CardBody>
            <CardFooter className="pb-0 pt-0 sm:pt-2 p-0 flex-col items-start justify-start text-left text-sm gap-0 w-full">
              <div className={`${props.list.length > 1 ? 'sm:group-hover/item:absolute sm:group-hover/item:bottom-8 sm:group-hover/item:left-0' : 'sm:group-hover/item:h-[152.2px]'} w-full`}>
                <div className=" flex flex-row text-small justify-between items-center gap-2 px-2 sm:px-4 w-full">
                  <div className="flex flex-row justify-center items-center gap-1">
                    <b className="text-sm sm:text-base max-w-[92px] text-nowrap">Created by</b>
                    <Image width="100%" src={item.avatar} className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] md:border-0 border-1 border-[#5a58f2]" />
                    <Link
                      href={`/personalCenter?userId=${item.userId}`}
                      underline="always"
                      className="md:block hidden max-w-[30px] whitespace-nowrap overflow-hidden text-ellipsis text-sm sm:text-base bg-transparent text-[#5a58fa] ml-[5px]"
                    >
                      {item.createdBy}
                    </Link>
                    <p className="text-xxs sm:text-[14px] text-default-500 flex flex-row gap-1 justify-center items-center ml-2">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        className="w-[16] sm:w-[18] h-[16] sm:h-[18]"
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
                  </div>
                  <div className="flex flex-row justify-start gap-1 block mt-1">
                    <OutSideLinks data={item} />
                  </div>
                </div>
                <div className="px-2 sm:px-4 text-nowrap">{item.name} (ticker:{item.ticker})</div>
                <p className={`px-2 sm:px-4 w-full line-clamp-1 sm:line-clamp-2 text-[#757C82] sm:group-hover/item:hidden  text-xxs sm:text-[12px] sm:h-[32px]`}>
                  {item.description}
                </p>
                <div className="px-2 sm:px-4 w-full">
                  <Divider className="sm:my-2" />
                </div>
                <div className={`pl-2 sm:pl-4 sm:px-4 flex flex-row text-small justify-start items-center gap-2 text-sm sm:text-base ${item.progress == '0' ? 'h-[60px]' : ''}`}>
                  <b className="text-xs text-[#707A83]">MARKET CAP</b>
                  <p className="text-white ">$ {formatTokenCount(parseFloat(item.marketCap * props.solPrice).toFixed(2))}</p>
                  <p className="text-default-500">({item.progressBar})</p>
                  <div className={`sm:hidden ${item.progressBar == "0" ? "flex" : "hidden"} w-[60px] h-[26px] bg-[#5A58F2] rounded-lg flex justify-center items-center`}>Buy</div>
                </div>
                <div className={`progress-container m-2 sm:m-4 ${item.progressBar == '0' ? 'hidden' : 'flex'}`}>
                  <div
                    className={`progress-icon hidden ${item.progressBar == "100%" ? "hidden" : "sm:flex"}`}
                    style={{ left: `${item.progressBar}` }}
                  >
                    <Image src="/Group 60.svg" alt="Icon" className="w-8 h-6" />
                  </div>
                  <div
                    style={{ width: `${item.progressBar}` }}
                    className="progress-bar"
                    id="progressBar2"
                  ></div>
                </div>
              </div>
              {/* <Progress
                  size="md"
                  radius="md"
                  classNames={{
                    base: "max-w-md py-4 px-4",
                    track: "drop-shadow-md border border-default",
                    indicator: "bg-gradient-to-r from-[#5A58F2] from-0% via-[#FF3E80] via-47.12% to-[#FFC300] to-130.43% bg-[url('/Group 60.svg')]",
                    // label: "tracking-wider font-medium text-default-600",
                    value: "text-foreground/60 bg-[url('/Group 60.svg')]",
                  }}
                  // label="Lose weight"
                  value={65}
                  // showValueLabel={false}
                /> */}

              <div className="hidden sm:flex w-full text-center flex-row justify-center items-center h-10 bg-[#5A58F2] absolute bottom-0 left-0 opacity-0 sm:group-hover/item:flex sm:group-hover/item:opacity-100 transition delay-50 sm:group-hover/item:bottom-1">
                Buy
              </div>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
};
