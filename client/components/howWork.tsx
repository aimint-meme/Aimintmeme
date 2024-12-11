"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import { /*useAnchorWallet, */ useWallet } from "@solana/wallet-adapter-react";
import base58 from "bs58";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { Image } from "@nextui-org/react";
import { RotatingCircle} from "@/components/RotatingCircle";

export const HowWorkModal = ({ handleOpen, setClose }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();
  useEffect(() => {
    handleOpen && onOpen();
  }, [handleOpen]);

  return (
    <>
      <Modal
        placement="top"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        // scrollBehavior="outside"
        onClose={() => {
          onClose;
          setClose();
        }}
        hideCloseButton="true"
        className="w-[90%] max-w-[90%] sm:w-[856px] sm:max-w-[856px] bg-[#1A1425]"
      >
        <ModalContent className="px-5 w-full">
          {(onClose) => (
            <ModalBody className="w-full justify-center items-center px-1 sm:px-6">
              <div className="flex flex-col w-full sm:w-[90%] justify-center items-center text-center gap-2 md:gap-8">
                <div className="flex flex-col items-center justify-center gap-2 pt-4">
                  <Image
                    shadow="none"
                    radius="none"
                    className="object-cover"
                    src="/logo.svg"
                    className="w-[72px]"
                  />
                  <p className="text-3xl font-semibold">How it Works</p>
                </div>
                <div className="flex flex-col justify-center items-center gap-3">
                  <p className="text-[#FFC300] text-[14px] sm:text-[22px] font-semibold">
                    AImint is your go-to platform to discover <br /> and launch
                    the next trending token.
                  </p>
                  <p className="text-[10px] sm:text-[14px]">
                    AImint ensures safety by verifying that all created tokens
                    are secure. Every
                    <br /> coin on AImint is a fair launch with no presale and
                    no team allocation.
                  </p>
                </div>
                <div className="flex flex-col justify-center items-center gap-3">
                  <p className="text-[#FF3E80] text-[14px] sm:text-[22px] font-semibold">
                    AI-Powered Creations, Social Connections,
                    <br /> and Fair Launches
                  </p>
                  <p className="text-[#fffdfdcc] text-[10px] sm:text-base font-semibold">
                    Stay ahead of trends on X and create memes instantly with
                    AI.{" "}
                  </p>
                  <p className="text-[#fffdfdcc] text-[10px] sm:text-sm font-normal">
                    (Integration with social platforms like Reddit, Facebook,
                    VK, TikTok, and Instagram is underway.)
                  </p>
                  <p className="text-[#fffdfdcc] text-[10px] sm:text-sm font-normal">
                    No Pre-Sale, No Insiders, Max 1B Supply
                  </p>
                  <p className="text-[#fffdfdcc] text-[10px] sm:text-sm font-normal">
                    Ownership Renounced & Immutable
                  </p>
                  <p className="text-[#fffdfdcc] text-[10px] sm:text-sm font-normal">
                    Fully Audited Smart Contracts
                  </p>
                  <p className="text-[#fffdfdcc] text-[10px] sm:text-sm font-normal">
                    Buy & Sell Anytime
                  </p>
                </div>
                <RotatingCircle />

                <h1 className="hidden sm:flex text-[#5A58F2] text-[22px] font-semibold">
                  How to Get Started
                </h1>
                <div className="hidden sm:flex flex-col justify-center items-center gap-3 w-full">
                  <div className="flex flex-row justify-center items-start w-full">
                    <div className="flex flex-row justify-start items-start gap-2">
                      <Image
                        src="/Incomplete--normal.svg"
                        className="pt-[2px]"
                      />
                      <div className="flex flex-col gap-1 justify-start items-start">
                        <h2 className="text-base font-semibold">Step 1</h2>
                        <p className="text-xs font-normal text-left">
                          Choose a coin you like.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row justify-start items-start gap-2">
                      <Image
                        src="/Incomplete--normal.svg"
                        className="pt-[2px]"
                      />
                      <div className="flex flex-col gap-1 justify-start items-start">
                        <h2 className="text-base font-semibold">Step 2</h2>
                        <p className="text-xs font-normal text-left">
                          Buy the coin on the bonding
                          <br /> curve.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row justify-start items-start gap-2">
                      <Image
                        src="/Incomplete--normal.svg"
                        className="pt-[2px]"
                      />
                      <div className="flex flex-col gap-1 justify-start items-start">
                        <h2 className="text-base font-semibold">Step 3</h2>
                        <p className="text-xs font-normal text-left">
                          Sell anytime to secure profits
                          <br /> or losses.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Divider className="my-4 bg-[#5A58F2] w-[625px]" />
                  <div className="flex flex-row justify-center items-start w-full">
                    <div className="flex flex-row justify-start items-start gap-2">
                      <Image
                        src="/Incomplete--normal.svg"
                        className="pt-[2px]"
                      />
                      <div className="flex flex-col gap-1 justify-start items-start">
                        <h2 className="text-base font-semibold">Step 4</h2>
                        <p className="text-xs font-normal text-left">
                          When the market cap hits $48k, $9.6k in
                          <br /> liquidity is deposited in Raydium and
                          <br /> burned.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row justify-start items-start gap-2">
                      <Image
                        src="/Incomplete--normal.svg"
                        className="pt-[2px]"
                      />
                      <div className="flex flex-col gap-1 justify-start items-start">
                        <h2 className="text-base font-semibold">Step 5</h2>
                        <p className="text-xs font-normal text-left">
                          All liquidity is locked forever.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-6 justify-center py-10 sm: pt-5 pb-10">
                  <Button
                    color="primary"
                    variant="bordered"
                    className="border-[#5A58F2] text-[#5A58F2]"
                    onPress={onClose}
                  >
                    Start now
                  </Button>
                  <Link
                      aria-label="Discord"
                      href="/search/form?isSearch=true"
                    >
                      <Button
                        color="primary"
                        className="bg-[#5A58F2]"
                        onPress={onClose}
                      >
                        Launch your token
                      </Button>
                    </Link>
                  
                </div>
               
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
