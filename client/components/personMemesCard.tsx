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
import { CopyButtonSmall } from "@/components/CopyButtonSmall";
import { Slider } from "@nextui-org/react";
import { formatTokenCount } from '@/src/utils/globalUtils';

export const PersonMemesCard = (props) => {
  return (
    <div className="w-full gap-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 rounded-t-lg">
      {props.list.map((item, index) => (
        <div key={index} className={`w-full h-[140px] bg-[#14111C] rounded-[4px] p-0`}>
          <Card
            shadow="sm"
            className="w-full h-[140px] bg-[#14111C] rounded-[4px] p-[10px] p-0"
            key={index}
            isPressable
          // onPress={() => router.push(`/tokensDetail?id=${item.id}`)}
          >
            <CardBody className="flex flex-row items-center gap-2 md:p-3 p-1">
              <Link
                href={`/tokensDetail?id=${item.id}`}
              >
                <Image width="100%" src={item.image} className="w-[120px] h-[120px] sm:w-[120px] sm:h-[120px] border-0 border-[#5a58f2]" />
              </Link>

              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between md:w-[256px] w-[215px] grow">
                  <div className="flex flex-row items-center gap-1">
                    <div className="md:text-[16px] text-[12px]">{item.ticker}</div>
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
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="md:text-[16px] text-[12px]">By</div>
                    <Image width="100%" src={item.avatar} className="w-[16px] h-[16px] sm:w-[24px] sm:h-[24px] border-0" />
                    <Link
                      href={`/personalCenter?userId=${item.userId}`}
                      underline="always"
                      className="block  max-w-[30px] whitespace-nowrap overflow-hidden text-ellipsis text-sm sm:text-base bg-transparent text-[#5a58fa] ml-[5px]"
                    >
                      {item.createdBy}
                    </Link>
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="md:scale-y-90 scale-y-75 md:scale-x-100 scale-x-80 md:translate-x-0 translate-x-[-15px]"><CopyButtonSmall mint={item.mintPdaAddress} /></div>
                  <div className="flex flex-row justify-start items-center">
                    <div className="flex flex-row justify-start items-center gap-1 block md:mt-1 mt-0 md:scale-y-100 scale-y-85">
                      <OutSideLinks data={item} />
                    </div>
                  </div>
                </div>
                <div className="md:w-[256px] w-[210px] h-[44px] border-[0.4px] border-[#5A58F2] rounded-[4px] flex flex-row justify-around items-center translate-y-1">
                  <div className="text-[#7B778A] md:text-[16px] text-[12px]">Token Balance</div>
                  <div className="h-[30px] w-[1px] bg-[#363247]"></div>
                  <div className="text-[12px] text-center">
                    <div className="text-[#ffffff] md:text-[12px] text-[10px]">{
                      item && item.isOutside !== undefined && item.isOutside === 1 ? '0.00' :
                        formatTokenCount((props.balancesRes?.find(balance => { return balance?.mintPdaAddress == item.mintPdaAddress })?.uiAmount))}
                      {' ' + item.ticker}</div>
                      {/* {(props.balancesRes?.find(balance => { return balance?.mintPdaAddress == item.mintPdaAddress })?.uiAmount)} */}
                      {/* {formatTokenCount((props.balancesRes?.find(balance => { return balance?.mintPdaAddress == item.mintPdaAddress })?.uiAmount))} */}
                    <div className="text-[#5BE1FF] md:text-[12px] text-[10px]">{item && item.isOutside !== undefined && item.isOutside === 1 ? '0.0000 SOL' : ((props.balancesRes?.find(balance => { return balance?.mintPdaAddress == item.mintPdaAddress })?.uiAmount || 0) * Number(item.avePri))?.toFixed(4) + ' SOL'}</div>
                  </div>
                </div>
                <div className="flex flex-row flex-between items-center gap-1">
                  <Slider
                    isDisabled
                    size="sm"
                    aria-label="Player progress"
                    color="foreground"
                    hideThumb={true}
                    defaultValue={item && item.isOutside !== undefined && item.isOutside === 1 ? 100 : Number(item.progressBar?.slice(0, item.progressBar.length - 1))}
                    className="max-w-md"
                    classNames={{
                      base: 'opacity-100 h-[10px w-[100%]',
                      track: Number(item.progressBar?.slice(0, item.progressBar.length - 1)).toFixed(0) == '0' ? "bg-[#ffffff] h-[8px] opacity-100 border-s-[#ffffff]" : item && item.isOutside !== undefined && item.isOutside === 1 ? "bg-[#5a58f2] h-[8px] opacity-100 border-s-[#5a58f2]" : "bg-[#ffffff] h-[8px] opacity-100 border-s-[#5a58f2]",
                      filler: "bg-[#5a58f2] h-[8px] opacity-100",
                    }}
                  />
                  <div className="text-[#DFE2EA] md:text-[10px] text-[9px]">{item && item.isOutside !== undefined && item.isOutside === 1 ? 100 : Number(item.progressBar?.slice(0, item.progressBar.length - 1)).toFixed(0)}%</div>
                </div>
              </div>
            </CardBody>
            {/* <CardFooter className=""></CardFooter> */}
          </Card>
        </div>
      ))}
    </div>
  );
};
