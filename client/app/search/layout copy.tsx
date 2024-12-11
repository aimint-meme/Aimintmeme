"use client";
import React, { useState, useRef } from "react";
import { HotTab } from "@/components/hotTab";
import { subtitle } from "@/components/primitives";
import { Input, } from "@nextui-org/react";
import { useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation";
import { PoliciesAndTerms } from "@/components/PoliciesAndTerms";
import {
  ArrowRightIcon,
} from "@/components/icons";
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedValue, setSelectedValue] = React.useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();
  // const [guidePage, setGuidePage] = React.useState(1);
  const searchParams = useSearchParams();

  const search = searchParams.get('isSearch');
  // const search = false;
  // React.useMemo(
  //   () => setSelectedValue(Array.from(selectedKeys).join(", ")),
  //   [selectedKeys]
  // );
  const ImgInputRef = useRef(null);
  const handleInputChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const [showComponent, setShowComponent] = useState(false);
  const handleGenerateEImg = () => {
    router.push(`/search/aiCreateImage?prompt=${selectedValue}`);
  };
  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="w-full flex flex-col items-center text-center justify-center sm:max-w-[1280px] ">
          <div className="order-first inline-block text-center justify-center mb-4">
            <h1 className="text-2xl md:text-5xl text-gradient md:bg-gradient-to-r from-[#5A58F2] via-[#5BE2FF] to-[#D043D0]">
              Create NFTs/MEMEs with AI
            </h1>
            <h2 className={subtitle({ class: "my-0 md:my-2 font-normal" })}>
              Creating Value with AI-Generated Content
            </h2>
          </div>
          {showComponent && selectedFile == null ? <HotTab setValue={(value) => { setSelectedValue(value) }} /> : <></>}
          {!search ? <div className="md:flex inline-block text-center items-start w-full gap-7 md:w-11/12 relative mt-1">
            <div className="w-full text-center md:w-4/5 justify-center">
              <Input
                aria-label="Search"
                classNames={{
                  input: "text-base md:text-2xl bg-[#221F2E] hover:bg-[#221F2E]",
                  base: "w-full text-left",
                  innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
                  inputWrapper: [
                    "w-full",
                    "h-14",
                    "md:h-20",
                    "bg-[#221F2E]",
                    "hover:bg-[#221F2E]",
                    "dark:hover:bg-[#221F2E]",
                    "group-data-[focus=true]:bg-[#221F2E]",
                    "dark:group-data-[focus=true]:bg-[#221F2E]",
                    "z-10",
                  ],
                }}
                color="#1A1425"
                labelPlacement="outside"
                value={selectedValue}
                onChange={handleInputChange}
                placeholder="What do you wish to generate?"
                // onClear={handleClear}
                startContent={
                  <div className="flex flex-row gap-2 cursor-pointer justify-center items-center">
                    {selectedFile == null ? (
                      <div onClick={() => setShowComponent(!showComponent)} >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                        >
                          <path
                            d="M2.32324 1.52434H21.8232C22.4694 1.52434 22.9932 2.04816 22.9932 2.69434V22.1943C22.9932 22.8405 22.4694 23.3643 21.8232 23.3643H2.32324C1.67707 23.3643 1.15324 22.8405 1.15324 22.1943V2.69434C1.15324 2.04816 1.67707 1.52434 2.32324 1.52434Z"
                            stroke="#676697"
                            strokeWidth="2.16"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19.273 5.24414L4.87305 19.6441"
                            stroke="#676697"
                            strokeWidth="1.68"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.2">
                          <path
                            d="M2.32324 1.52434H21.8232C22.4694 1.52434 22.9932 2.04816 22.9932 2.69434V22.1943C22.9932 22.8405 22.4694 23.3643 21.8232 23.3643H2.32324C1.67707 23.3643 1.15324 22.8405 1.15324 22.1943V2.69434C1.15324 2.04816 1.67707 1.52434 2.32324 1.52434Z"
                            stroke="#676697"
                            strokeWidth="2.16"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19.273 5.24414L4.87305 19.6441"
                            stroke="#676697"
                            strokeWidth="1.68"
                            strokeLinecap="round"
                          />
                        </g>
                      </svg>
                    )}
                    <div className="h-full">|</div>
                  </div>
                }
                type="search"
              />
              {selectedFile && (
                <div className="md:flex inline-block text-center justify-start w-full gap-7 mb-4 relative z-9 -translate-y-18">
                  <div className="flex w-full md:w-[100%] h-14 md:h-24 bg-[#120E19] rounded-[12px] p-6 md:-translate-y-3 -translate-y-2">
                    <img
                      src={selectedFile}
                      alt=""
                      className="preview md:w-[62px] md:h-[62px] w-[32px] h-[32px] rounded-[8.4px] mr-[12px] md:translate-y-0 -translate-y-2"
                    ></img>
                    <div className="bg-[#ff3e801a] rounded-[52.571px] md:w-[32px] md:h-[32px]  flex justify-center content-center items-center md:translate-y-4 translate-y-1">
                      <img
                        src="/close_red.svg"
                        alt=""
                        className="w-[16px] h-[16px] rounded-[8.4px]"
                        onClick={() => {
                          setSelectedFile(null);
                        }}
                      ></img>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-row md:gap-6 justify-center">
              {/* <div className="inline-block text-center justify-center items-center m-2 md:m-0">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={ImgInputRef}
              />
              <button
                onClick={handleUpload}
                className="bg-[#221F2E] flex md:flex flex-row rounded-lg md:rounded-[21px] justify-center items-center w-12 h-12 md:w-20 md:h-20"
              >
                <Linkcon className="w-7 h-7 md:w-10 md:h-10" />
              </button>
            </div> */}
              <div className="inline-block md:flex text-center justify-center items-center m-2 md:m-0">
                <button
                  onClick={handleGenerateEImg}
                  className="flex md:flex flex-row justify-center rounded-lg md:rounded-[21px] items-center w-12 h-12 md:w-20 md:h-20 bg-[#5A58F2] cursor-pointer"
                >
                  <ArrowRightIcon className="w-6 h-5 md:w-8 md:h-8" />
                </button>
              </div>
            </div>
          </div>
            : <></>}
          {children}
        </div>
      </section>
      {/* <PoliciesAndTerms /> */}
    </>
  );
}
