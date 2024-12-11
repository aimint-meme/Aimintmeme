"use client";
import React, { useState, useEffect } from "react";
import { Image, Button, Link, Snippet } from "@nextui-org/react";
import {
  DiagonalArrowIcon,
} from "@/components/icons";
import { ProgressBar } from "@/components/progress";
import { MarketCap } from "@/components/marketCap";
import { OutSideLinks } from "@/components/OutSideLinks";
import { TokenShare } from "@/components/TokenShare";
import { CopyButton } from "@/components/CopyButton";
import { formatRelativeToNow } from '@/src/utils/timeFormat';
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";

export const TokensCard = (props) => {
  const [handleOpen, setHandleOpen] = React.useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const isConnect = useLocalGlobalStore(state => state.isConnect);

  // 使用useEffect来设置定时器，自动隐藏提示框  
  useEffect(() => {
    if (showAlert) {
      // 设置定时器，3秒后隐藏提示框  
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);

      // 清除定时器，防止组件卸载时继续执行  
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <>
      <div className={`flex flex-col gap-5 w-full justify-between items-center ${props.data.isOutside == 1 ? "sm:w-full" : "sm:w-[68%]"}`}>
        <div className="flex flex-row w-full gap-2 items-stretch">
          <div className="w-[152px] h-[152px]">
            <img
              className="w-[100%] h-[100%] block object-cover"
              src={props.data.image}
            />
          </div>
          <div className="flex flex-col gap-3 items-start justify-between flex-right-width">
            <div className="w-full">
              <div className="flex flex-row w-full gap-3 items-center justify-between  text-sm">
                <div className="flex flex-row gap-1 items-center justify-start">
                  <h1 className="text-2xl font-semibold max-w-28 overflow-hidden whitespace-nowrap text-ellipsis">{props.data.name}</h1>
                  <h2 className="font-normal text-xl">
                    (ticker:{props.data.ticker})
                  </h2>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                  >
                    <path
                      d="M8.08313 1.67673C8.56247 1.11101 9.43499 1.11101 9.91433 1.67673L10.4919 2.35846C10.7858 2.70537 11.2505 2.85637 11.6923 2.74848L12.5602 2.53644C13.2805 2.36049 13.9864 2.87336 14.0417 3.61276L14.1082 4.5038C14.1421 4.9572 14.4293 5.35253 14.8501 5.52486L15.6769 5.86352C16.3631 6.14452 16.6327 6.97438 16.2428 7.60504L15.7729 8.365C15.5338 8.75176 15.5338 9.2404 15.7729 9.62716L16.2428 10.3871C16.6327 11.0178 16.3631 11.8476 15.6769 12.1286L14.8501 12.4673C14.4293 12.6396 14.1421 13.035 14.1082 13.4883L14.0417 14.3794C13.9864 15.1188 13.2805 15.6317 12.5602 15.4557L11.6923 15.2437C11.2505 15.1358 10.7858 15.2868 10.4919 15.6337L9.91433 16.3154C9.43499 16.8812 8.56247 16.8812 8.08313 16.3154L7.50557 15.6337C7.21163 15.2868 6.74693 15.1358 6.30521 15.2437L5.43724 15.4557C4.71696 15.6317 4.01105 15.1188 3.95581 14.3794L3.88925 13.4883C3.85537 13.035 3.56815 12.6396 3.1474 12.4673L2.32055 12.1286C1.63441 11.8476 1.36477 11.0178 1.75469 10.3871L2.22457 9.62716C2.46368 9.2404 2.46368 8.75176 2.22457 8.365L1.75469 7.60504C1.36477 6.97438 1.63441 6.14452 2.32055 5.86352L3.1474 5.52486C3.56815 5.35253 3.85537 4.9572 3.88925 4.5038L3.95581 3.61276C4.01105 2.87336 4.71696 2.36049 5.43724 2.53644L6.30521 2.74848C6.74693 2.85637 7.21163 2.70537 7.50557 2.35846L8.08313 1.67673Z"
                      fill={`${props.data.badge == 1 ? "#5A58F233" : props.data.badge == 2 ? "#2081E2" : props.data.badge == 3 ? "#5B667E" : props.data.badge == 4 ? "#10F4B1" : props.data.badge == 5 ? "#FFC300" : "#FF3E80"}`}
                    />
                    <path
                      d="M8.10122 10.5712L6.52622 8.99619L6.00122 9.52119L8.10122 11.6212L12.6012 7.12119L12.0762 6.59619L8.10122 10.5712Z"
                      fill={`${props.data.badge == 2 ? "#5a58f2" : "#F2F2FC"}`}
                      stroke="white"
                      strokeWidth="0.6"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-[#FACC15]">CA</p>
                  {props.data.mintPdaAddress && props.data.mintPdaAddress !== "" && (
                    <CopyButton mint={props.data.mintPdaAddress} />
                  )}
                  <div
                    className="border-[#5A58F2] border-1 w- px-2 py-2 rounded-[5px] text-[#5A58F2] cursor-pointer ml-1"
                    onClick={() => {
                      if (isConnect) {
                        setHandleOpen(true)
                      } else {
                        setShowAlert(true);
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                    >
                      <path
                        d="M7.7168 11.373C7.51758 11.373 7.35156 11.3086 7.21875 11.1797C7.08984 11.0508 7.02539 10.8867 7.02539 10.6875V8.44922H6.85547C6.10156 8.44922 5.43359 8.52344 4.85156 8.67188C4.26953 8.82031 3.75586 9.07617 3.31055 9.43945C2.86523 9.79883 2.47266 10.2988 2.13281 10.9395C2.03125 11.127 1.91602 11.2461 1.78711 11.2969C1.66211 11.3477 1.53711 11.373 1.41211 11.373C1.25586 11.373 1.11523 11.3047 0.990234 11.168C0.869141 11.0352 0.808594 10.8418 0.808594 10.5879C0.808594 9.50586 0.925781 8.5332 1.16016 7.66992C1.39844 6.80273 1.76172 6.0625 2.25 5.44922C2.74219 4.83594 3.36914 4.36719 4.13086 4.04297C4.89648 3.71875 5.80469 3.55664 6.85547 3.55664H7.02539V1.3418C7.02539 1.14648 7.08984 0.978516 7.21875 0.837891C7.35156 0.697266 7.52148 0.626953 7.72852 0.626953C7.86914 0.626953 7.99609 0.660156 8.10938 0.726562C8.22656 0.789062 8.36328 0.894531 8.51953 1.04297L13.1426 5.36719C13.2559 5.47266 13.334 5.58008 13.377 5.68945C13.4199 5.79883 13.4414 5.90234 13.4414 6C13.4414 6.09375 13.4199 6.19531 13.377 6.30469C13.334 6.41406 13.2559 6.52148 13.1426 6.62695L8.51953 10.9922C8.37891 11.125 8.24414 11.2207 8.11523 11.2793C7.99023 11.3418 7.85742 11.373 7.7168 11.373ZM8.05078 10.1133C8.08594 10.1133 8.11914 10.0957 8.15039 10.0605L12.3281 6.11133C12.3516 6.08789 12.3672 6.06836 12.375 6.05273C12.3828 6.0332 12.3867 6.01562 12.3867 6C12.3867 5.96484 12.3672 5.92773 12.3281 5.88867L8.15625 1.88672C8.14062 1.875 8.12305 1.86523 8.10352 1.85742C8.08789 1.8457 8.07227 1.83984 8.05664 1.83984C7.99805 1.83984 7.96875 1.86719 7.96875 1.92188V4.24805C7.96875 4.37695 7.9043 4.44141 7.77539 4.44141H6.99023C6.18555 4.44141 5.48828 4.54492 4.89844 4.75195C4.30859 4.95508 3.81055 5.23828 3.4043 5.60156C2.99805 5.96094 2.66797 6.37695 2.41406 6.84961C2.16406 7.32227 1.97852 7.82812 1.85742 8.36719C1.73633 8.90234 1.66406 9.44531 1.64062 9.99609C1.64062 10.0391 1.6543 10.0605 1.68164 10.0605C1.69727 10.0605 1.70898 10.0566 1.7168 10.0488C1.72461 10.0371 1.73242 10.0215 1.74023 10.002C2.08398 9.26758 2.69727 8.67773 3.58008 8.23242C4.46289 7.78711 5.59961 7.56445 6.99023 7.56445H7.77539C7.9043 7.56445 7.96875 7.62891 7.96875 7.75781V10.0254C7.96875 10.084 7.99609 10.1133 8.05078 10.1133Z"
                        fill="#5A58F2"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-row gap-1 items-center justify-end text-[14px]">
                  {props.data.isOutside == 1 ? (
                    <p className="text-[14px]">Created by</p>
                  ) : (
                    <h1 className="text-[14px]">By</h1>
                  )}

                  <Image
                    shadow="sm"
                    width="100%"
                    radius="none"
                    className="object-cover w-[24px] h-[24px]"
                    src={props.data.avatar}
                  />
                  <Link
                    href={`/personalCenter?userId=${props.data.userId}`}
                    underline="always"
                    className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
                  >
                    {props.data.createdBy}
                  </Link>
                  {props.data.isOutside == 1 && (
                    <p className="text-[14px] text-[#0DCAF0]">
                      Creation Time:{formatRelativeToNow(props.data.createdTime,props.data.currentTime)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-left text-[#757C82] text-sm">
                {props.data.description}
              </p>
            </div>
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-row justify-start gap-4">
                <OutSideLinks data={props.data} />
              </div>
              <div>
                {props.data.isOutside == 0 && (
                  <p className="text-[14px] text-[#0DCAF0]">
                    Creation Time:{formatRelativeToNow(props.data.createdTime,props.data.currentTime)}
                  </p>
                )}
                {props.data.isOutside == 1 && (
                  <Link
                    isExternal
                    className="flex items-center gap-1 text-current"
                    href={`https://dexscreener.com/solana/${props.data.mintPdaAddress}`}
                    title="nextui.org homepage"
                  >
                    <Button
                      variant="bordered"
                      endContent={<DiagonalArrowIcon />}
                      className="rounded border-[0.8px] border-[#10F4B1] text-[#10F4B1] h-[30px] cursor-pointer"
                    >
                      raydium pool seeded! view the coin on raydium
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center w-full">
          <ProgressBar
            solPrice={props.solPrice}
            marketCapData={props.marketCapData}
          />
        </div>
        <div className="flex flex-row justify-center items-center w-full">
          <MarketCap
            tokenId={props.data.id}
            solPrice={props.solPrice}
            marketCapData={props.marketCapData}
          />
        </div>
        <TokenShare
          handleOpen={handleOpen}
          setClose={() => {
            setHandleOpen(false);
          }}
          detailData={props.data}
          solPrice={props.solPrice}
        />
        {showAlert && (
          <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
            <Image src="/StatusIcon.svg" className="w-5" />
            Please connect your wallet first.
          </div>
        )}
      </div>
    </>
  );
};
