"use client";
import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
import { MyContext } from './MyContext';
import { Checkbox, Form, Upload } from "antd";
import { useOverLayer } from "@/components/overlayer";
import { useRouter } from "next/navigation";
import {
  Input,
  Tooltip,
  ImageUploader,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Listbox,
  ListboxItem,
  Textarea,
} from "@nextui-org/react";
// import { ListboxWrapper } from "./ListboxWrapper";
import { Image } from "@nextui-org/image";
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { Trend } from "@/components/Trend";
import { HotTab } from "@/components/hotTab";
import { BaseForm } from "@/components/baseForm";
import { AICreateImage } from "@/components/AICreateImage";
import {
  GithubIcon,
  EditIcon,
  Linkcon,
  ArrowRightIcon,
  AssetsIcon,
} from "@/components/icons";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { getCookie, setCookie } from "@/src/utils/api";

export default function Home() {
  // const data = await fetch("");
  // const res = (await data).json();
  const { guidePage, setGuidePage } = useOverLayer();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); //提示信息  
  const [guideStatus, setGuideStatus] = useState(''); //提示信息  
  const isConnect = useLocalGlobalStore(state => state.isConnect);
  const router = useRouter();

  // 使用useEffect来设置定时器，自动隐藏提示框  
  useEffect(() => {
    if (showAlert) {
      // 设置定时器，3秒后隐藏提示框  
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      // 清除定时器，防止组件卸载时继续执行  
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    setGuideStatus(getCookie('guideStatus'))
  }, [])

  //input框样式
  const inputStyle = {
    base: "w-full text-left",
    input: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    inputWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]", "dark:hover:bg-[#221F2E]", "group-data-[focus=true]:bg-[#221F2E]",
      "dark:group-data-[focus=true]:bg-[#221F2E]",],
  };

  const fileList = [
    {
      uid: "-1",
      name: "xxx.png",
      status: "done",
      url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
      thumbUrl:
        "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
    {
      uid: "-2",
      name: "yyy.png",
      status: "error",
    },
  ];
  const [selectedFile, setSelectedFile] = useState('');
  const [showComponent, setShowComponent] = useState(false);
  const [isShowImg, setImage] = useState(false);
  // const [guidePage, setGuidePage] = React.useState(1);
  // const { guidePage, setGuidePage } = useContext(MyContext);
  useEffect(() => {//首次加载弹出用户引导遮罩层
    setGuidePage(isConnect || guideStatus ? 0 : 1);
  }, [isConnect, guideStatus])
  const ImgInputRef = useRef(null);
  const handleFileChange = (event) => {
    setSelectedFile(window.URL.createObjectURL(event.target.files[0]));
  };

  const handleUpload = () => {
    setAlertMessage('Please connect your wallet first.');
    setShowAlert(true);
  };
  const handleGenerateEImg = () => {
    if (isConnect) {
    } else {
      setAlertMessage('Please connect your wallet first.');
      setShowAlert(true);
    }
  };

  const handleFocus = (event) => {
    setIsHidden(false);
  };
  const variants = ["solid", "underlined", "bordered", "light"];
  const [selectedKeys, setSelectedKeys] = React.useState("");
  const [selectedValue, setSelectedValue] = React.useState("");
  React.useMemo(
    () => setSelectedValue(Array.from(selectedKeys).join(", ")),
    [selectedKeys]
  );
  const handleInputChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleClear = () => {
    setSelectedKeys("");
  };
  const [isHidden, setIsHidden] = useState(true);

  return (
    <section className="flex flex-col items-center justify-center pt-2 relative">
      <div className="flex flex-col items-center justify-center  w-full  sm:max-w-[1280px]">
        <div className="inline-block text-center justify-center mb-4" >
          <h1 className="text-2xl md:text-5xl text-gradient md:bg-gradient-to-r from-[#5A58F2] via-[#5BE2FF] to-[#D043D0]">
            Create NFTs/MEMEs with AI
          </h1>
          <h2 className={subtitle({ class: "my-0 md:my-2 font-normal" })}>
            Creating Value with AI-Generated Content
          </h2>
        </div>
        <div className="md:flex inline-block text-center justify-center items-center w-full gap-7 mb-4 md:w-11/12">
          <div className="w-full text-center justify-center">
            <Tooltip
              isOpen={guidePage == 1 ? true : false}
              key={'bottom'}
              placement={'bottom'}
              content={<div className="m-4 mx-2">
                <div className="font-semibold text-[17px] mb-2">Easy Creation</div>
                <div className="mb-4">Create stunning, high-quality images using just a few words.</div>
                <div className="flex flex-row justify-start items-center"><div className="index text-[#757083]">1/3</div><div className="w-24 h-8 flex justify-center items-center border-[#5A58F2] border-1 rounded-[8px] text-[#5A58F2] ml-12 cursor-pointer" onClick={() => { setGuidePage(0); router.push("/"); setCookie('guideStatus', true, 30) }}>Skip</div><div className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer" onClick={() => { setGuidePage(2) }}>Next</div></div>
              </div>}
              size="md"
              classNames={{
                content: "w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
              }}
              offset={35}
              crossOffset={0}
              showArrow
            ><Input
                aria-label="Search"
                classNames={{
                  input: "text-base md:text-2xl bg-[#221F2E] hover:bg-[#221F2E]",
                  base: "w-full text-left",
                  innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
                  inputWrapper: guidePage == 1 ? ["w-full", "h-14", "md:h-20", "bg-[#221F2E]", "hover:bg-[#221F2E]", "dark:hover:bg-[#221F2E]", "group-data-[focus=true]:bg-[#221F2E]",
                    "dark:group-data-[focus=true]:bg-[#221F2E]", "border-box", "border-4"] : ["w-full", "h-14", "md:h-20", "bg-[#221F2E]", "hover:bg-[#221F2E]", "dark:hover:bg-[#221F2E]", "group-data-[focus=true]:bg-[#221F2E]",
                    "dark:group-data-[focus=true]:bg-[#221F2E]",]
                }}
                color="#1A1425"
                labelPlacement="outside"
                value={selectedValue}
                onChange={handleInputChange}
                placeholder="What do you wish to generate?"
                onFocus={() => setShowComponent(true)}
                // onClear={handleClear}
                startContent={
                  <div className="flex flex-row gap-2 justify-center items-center">
                    <Tooltip
                      isOpen={guidePage == 2 ? true : false}
                      key={'bottom-start'}
                      placement={'bottom-start'}
                      content={<div className="m-4 mx-2">
                        <div className="font-semibold text-[17px] mb-2">Prompt Assistant</div>
                        <div className="mb-4">One-click to enhance the prompt to generate detailed, high-quality images.</div>
                        <div className="flex flex-row justify-start items-center"><div className="index text-[#757083]">2/3</div><div className="w-24 h-8 flex justify-center items-center border-[#5A58F2] border-1 rounded-[8px] text-[#5A58F2] ml-12 cursor-pointer" onClick={() => { setGuidePage(1) }}>Back</div><div className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer" onClick={() => { setGuidePage(3) }}>Next</div></div>
                      </div>}
                      size="md"
                      classNames={{
                        content: "w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                      }}
                      offset={25}
                      crossOffset={-10}
                      showArrow
                    ><div className={guidePage == 2 ? "bg-[#5A58F2] md:w-[48px] md:h-[48px] w-[34px] h-[34px] flex justify-center items-center" : ""}><EditIcon className="text-base text-default-400 pointer-events-none flex-shrink-0 " color={guidePage == 2 ? "#F8F8FF" : "#676697"} /></div></Tooltip>
                    <div className="h-full">|</div>
                  </div>
                }
                type="search"
              /></Tooltip>
          </div>


          <div className="flex flex-row md:gap-6 justify-center" >
            {/* <Tooltip
              isOpen={guidePage == 3 ? true : false}
              key={'bottom'}
              placement={'bottom'}
              content={<div className="m-4 mx-2">
                <div className="font-semibold text-[17px] mb-2">Image to Image</div>
                <div className="mb-4">Create unlimited variations to boost your productivity and creativity.</div>
                <div className="flex flex-row justify-start items-center"><div className="index text-[#757083]">3/4</div><div className="w-24 h-8 flex justify-center items-center border-[#5A58F2] border-1 rounded-[8px] text-[#5A58F2] ml-12 cursor-pointer" onClick={() => { setGuidePage(2) }}>Back</div><div className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer" onClick={() => { setGuidePage(4) }}>Next</div></div>
              </div>}
              size="md"
              classNames={{
                content: "w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
              }}
              offset={15}
              crossOffset={0}
              showArrow
            ><div className="inline-block text-center justify-center items-center m-2 md:m-0">
                <input type="file" onChange={handleFileChange} className="hidden" ref={ImgInputRef} />
                <button
                  onClick={handleUpload}
                  className={guidePage == 3 ? "border-box border-4 flex bg-[#1A1425] rounded-lg md:rounded-[21px] justify-center items-center w-12 h-12 md:w-20 md:h-20" : "flex bg-[#1A1425] rounded-lg md:rounded-[21px] justify-center items-center w-12 h-12 md:w-20 md:h-20"}
                >
                  <Linkcon className="w-7 h-7 md:w-10 md:h-10" />
                </button>
              </div>
            </Tooltip> */}
            <Tooltip
              isOpen={guidePage == 3 ? true : false}
              key={'bottom'}
              placement={'bottom'}
              content={<div className="m-4 mx-2">
                <div className="font-semibold text-[17px] mb-2">AI Mint MEMEs</div>
                <div className="mb-4">Click this button to quickly generate a MEME image. Connect your wallet and start creating your first MEMEs.</div>
                <div className="flex flex-row justify-start items-center"><div className="index text-[#757083]">3/3</div>
                  <div className="w-50 h-8 flex justify-center items-center rounded-[8px] bg-[#5A58F2] ml-8 px-4 cursor-pointer" onClick={() => { setGuidePage(0); router.push("/"); setCookie('guideStatus', true, 30) }} >Start Your Creation Now</div></div>
              </div>}
              size="md"
              classNames={{
                content: "w-[320px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
              }}
              offset={15}
              crossOffset={0}
              showArrow
            ><div className="inline-block md:flex text-center justify-center items-center m-2 md:m-0">
                <button
                  onClick={handleGenerateEImg}
                  className={guidePage == 3 ? "border-3 arrow-box flex md:flex fle-row justify-center rounded-lg md:rounded-[21px] items-center w-12 h-12 md:w-20 md:h-20 bg-[#5A58F2]" : "flex md:flex flex-row justify-center rounded-lg md:rounded-[21px] items-center w-12 h-12 md:w-20 md:h-20 bg-[#5A58F2] cursor-pointer"}
                >
                  <ArrowRightIcon className="w-6 h-5 md:w-8 md:h-8" />
                </button>
              </div>
            </Tooltip>
          </div>
        </div>
        <div className="text-center hidden sm:flex flex-row justify-center">
          <Image
            alt=""
            src="/bg.png"
            className="flex flex-row text-center justify-center"
          />
        </div>
        <div className="flex sm:hidden w-full">
          <Trend />
        </div>
        {showAlert && (
          <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
            <Image src="/StatusIcon.svg" className="w-5" />Please connect your wallet first.</div>
        )}
      </div>
      {/* {guidePage != 0 && <div className="fixed w-[150%] h-[500%] z-20"></div>} */}
    </section >
  );
}
