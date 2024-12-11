"use client";
import React, { useState, Suspense } from "react";
import { HotTab } from "@/components/hotTab";
import { subtitle } from "@/components/primitives";
import { Input, Tooltip, Spinner, Image } from "@nextui-org/react";
import { useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation";
import { useOverLayer } from "@/components/overlayer";
import { PoliciesAndTerms } from "@/components/PoliciesAndTerms";
import {
  ArrowRightIcon,
} from "@/components/icons";
function SearchBarFallback() {
  return <Spinner label="Loading..." color="primary" labelColor="primary" />
}
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { guidePage, setGuidePage } = useOverLayer();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); //提示信息  
  const [showComponent, setShowComponent] = useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editIconColor, setEditIconColor] = React.useState("#676697");
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('isSearch');
  const handleInputChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleGenerateEImg = () => {
    if (selectedValue !== "" && selectedValue !== undefined) {
      router.push(`/search/aiCreateImage?prompt=${selectedValue}`);
    } else {
      setAlertMessage('Please enter the content of the AI-generated image.');
      setShowAlert(true);
    }

  };
  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="w-full flex flex-col items-center text-center justify-center sm:max-w-[1280px] ">
          <Suspense fallback={<SearchBarFallback />}>
            <div className="order-first inline-block text-center justify-center mb-4">
              <h1 className="text-2xl md:text-5xl text-gradient md:bg-gradient-to-r from-[#5A58F2] via-[#5BE2FF] to-[#D043D0]">
                Create NFTs/MEMEs with AI
              </h1>
              <h2 className={subtitle({ class: "my-0 md:my-2 font-normal" })}>
                Creating Value with AI-Generated Content
              </h2>
            </div>
            {showComponent && (<HotTab setValue={(value) => { setSelectedValue(value) }} />)}
            {!search && <div className="flex flex-row flex-nowrap text-center justify-center items-center w-full md:gap-7  mb-4 md:w-11/12 mt-1">
              <div className="w-full text-center justify-center">
                <Tooltip
                  isOpen={guidePage == 1 ? true : false}
                  key={"bottom"}
                  placement={"bottom"}
                  content={
                    <div className="m-4 mx-2">
                      <div className="font-semibold text-[17px] mb-2">
                        Easy Creation
                      </div>
                      <div className="mb-4">
                        Create stunning, high-quality images using just a few words.
                      </div>
                      <div className="flex flex-row justify-start items-center">
                        <div className="index text-[#757083]">1/3</div>
                        <div
                          className="w-24 h-8 flex justify-center items-center border-[#5A58F2] border-1 rounded-[8px] text-[#5A58F2] ml-12 cursor-pointer"
                          onClick={() => {
                            setGuidePage(0);
                            setCookie("guideStatus", true, 30);
                          }}
                        >
                          Skip
                        </div>
                        <div
                          className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer"
                          onClick={() => {
                            setGuidePage(2);
                          }}
                        >
                          Next
                        </div>
                      </div>
                    </div>
                  }
                  size="md"
                  classNames={{
                    content:
                      "w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                  }}
                  offset={35}
                  crossOffset={0}
                  showArrow
                >
                  <Input
                    aria-label="Search"
                    classNames={{
                      input:
                        "text-base md:text-2xl bg-[#221F2E] hover:bg-[#221F2E]",
                      base: "w-full text-left",
                      innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
                      inputWrapper:
                        guidePage == 1
                          ? [
                            "w-full",
                            "h-14",
                            "md:h-20",
                            "bg-[#221F2E]",
                            "hover:bg-[#221F2E]",
                            "dark:hover:bg-[#221F2E]",
                            "group-data-[focus=true]:bg-[#221F2E]",
                            "dark:group-data-[focus=true]:bg-[#221F2E]",
                            "border-box",
                            "border-4",
                          ]
                          : showComponent ? [
                            "w-full",
                            "h-14",
                            "md:h-20",
                            "bg-[#221F2E]",
                            "hover:bg-[#221F2E]",
                            "dark:hover:bg-[#221F2E]",
                            "group-data-[focus=true]:bg-[#221F2E]",
                            "dark:group-data-[focus=true]:bg-[#221F2E]",
                            "border-1",
                            "border-[#5A58F2]",
                          ] : [
                            "w-full",
                            "h-14",
                            "md:h-20",
                            "bg-[#221F2E]",
                            "hover:bg-[#221F2E]",
                            "dark:hover:bg-[#221F2E]",
                            "group-data-[focus=true]:bg-[#221F2E]",
                            "dark:group-data-[focus=true]:bg-[#221F2E]",
                          ],
                    }}
                    color="#1A1425"
                    labelPlacement="outside"
                    value={selectedValue}
                    onChange={handleInputChange}
                    placeholder="What do you wish to generate?"
                    // onClear={handleClear}
                    startContent={
                      <div className="flex flex-row gap-2 justify-center items-center">
                        <Tooltip
                          isOpen={guidePage == 2 ? true : false}
                          key={"bottom-start"}
                          placement={"bottom-start"}
                          content={
                            <div className="m-4 mx-2">
                              <div className="font-semibold text-[17px] mb-2">
                                Prompt Assistant
                              </div>
                              <div className="mb-4">
                                One-click to enhance the prompt to generate
                                detailed, high-quality images.
                              </div>
                              <div className="flex flex-row justify-start items-center">
                                <div className="index text-[#757083]">2/3</div>
                                <div
                                  className="w-24 h-8 flex justify-center items-center border-[#5A58F2] border-1 rounded-[8px] text-[#5A58F2] ml-12 cursor-pointer"
                                  onClick={() => {
                                    setGuidePage(1);
                                  }}
                                >
                                  Back
                                </div>
                                <div
                                  className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer"
                                  onClick={() => {
                                    setGuidePage(3);
                                  }}
                                >
                                  Next
                                </div>
                              </div>
                            </div>
                          }
                          size="md"
                          classNames={{
                            content:
                              "w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                          }}
                          offset={25}
                          crossOffset={-10}
                          showArrow
                        >
                          <div
                            onClick={() => { setShowComponent(!showComponent); setEditIconColor('#676697') }}
                            className={
                              guidePage == 2
                                ? "bg-[#5A58F2] md:w-[48px] md:h-[48px] w-[34px] h-[34px] flex justify-center items-center cursor-pointer"
                                : "cursor-pointer"
                            }
                            onMouseOver={() => { editIconColor !== '#5A58F2' && setEditIconColor('#5A58F2') }}
                            onMouseOut={() => { editIconColor !== '#676697' && setEditIconColor('#676697') }}
                          >
                            {!showComponent ? <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="25"
                              height="25"
                              viewBox="0 0 25 25"
                              fill="none"
                              className={`text-base text-default-400 pointer-events-none flex-shrink-0`}
                            >
                              <path
                                d="M2.32324 1.52434H21.8232C22.4694 1.52434 22.9932 2.04816 22.9932 2.69434V22.1943C22.9932 22.8405 22.4694 23.3643 21.8232 23.3643H2.32324C1.67707 23.3643 1.15324 22.8405 1.15324 22.1943V2.69434C1.15324 2.04816 1.67707 1.52434 2.32324 1.52434Z"
                                stroke={guidePage == 2 ? "#F8F8FF" : editIconColor}
                                strokeWidth="2.16"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M19.273 5.24414L4.87305 19.6441"
                                stroke={guidePage == 2 ? "#F8F8FF" : editIconColor}
                                strokeWidth="1.68"
                                strokeLinecap="round"
                              />
                            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                              <path d="M17.5 0.97168L1.5 16.9717" stroke="#5A58F2" stroke-width="1.86667" stroke-linecap="round" />
                            </svg>}
                          </div>
                        </Tooltip>
                        <div className="h-full">|</div>
                      </div>
                    }
                    type="search"
                  />
                </Tooltip>
              </div>

              <div className="flex flex-row md:gap-6 justify-center">
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
                  key={"bottom"}
                  placement={"bottom"}
                  content={
                    <div className="m-4 mx-2">
                      <div className="font-semibold text-[17px] mb-2">
                        AI Mint MEMEs
                      </div>
                      <div className="mb-4">
                        Click this button to quickly generate a MEME image. Connect
                        your wallet and start creating your first MEMEs.
                      </div>
                      <div className="flex flex-row justify-start items-center">
                        <div className="index text-[#757083]">3/3</div>
                        <div
                          className="w-50 h-8 flex justify-center items-center rounded-[8px] bg-[#5A58F2] ml-8 px-4 cursor-pointer"
                          onClick={() => {
                            setGuidePage(0);
                            setCookie("guideStatus", true, 30);
                          }}
                        >
                          Start Your Creation Now
                        </div>
                      </div>
                    </div>
                  }
                  size="md"
                  classNames={{
                    content:
                      "w-[320px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                  }}
                  offset={15}
                  crossOffset={0}
                  showArrow
                >
                  <div className="inline-block md:flex text-center justify-center items-center my-2 ml-2 md:m-0">
                    <button
                      onClick={handleGenerateEImg}
                      className={
                        guidePage == 3
                          ? "border-3 arrow-box flex md:flex flex-row justify-center rounded-lg md:rounded-[21px] items-center w-13 h-13 md:w-20 md:h-20 bg-[#5A58F2]"
                          : "flex md:flex flex-row justify-center rounded-lg md:rounded-[21px] items-center w-[54px] h-[54px] md:w-20 md:h-20 bg-[#5A58F2] cursor-pointer"
                      }
                    >
                      <ArrowRightIcon className="w-6 h-5 md:w-8 md:h-8" />
                    </button>
                  </div>
                </Tooltip>
              </div>
            </div>}
            {children}
          </Suspense>
          {showAlert && (
            <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
              <Image src="/StatusIcon.svg" className="w-5" />
              {alertMessage}
            </div>
          )}
        </div>
      </section>
      {/* <PoliciesAndTerms /> */}
    </>
  );
}
