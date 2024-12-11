"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,Input,
  Image,
} from "@nextui-org/react";
import { /*useAnchorWallet, */ useWallet } from "@solana/wallet-adapter-react";
import { Program } from "@coral-xyz/anchor";
import { Buffer } from 'buffer';
import base58 from "bs58";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useProvider } from "@/components/overlayer";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;


export const Slippage = ({ handleOpen, setClose }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  // 控制提示框的显示
  const [showAlert, setShowAlert] = useState(false);
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); //提示信息
  const [selectedValue, setSelectedValue] = React.useState(2);
  const [classify, setClassify] = useState(0);
  useEffect(() => {
    handleOpen && onOpen();
  }, [handleOpen]);
  const slip=[2,10,20,30];
  //选中滑点值
  const handleSelect = (item) => {
    setSelectedValue(item);
    if(item >= 10){
      setShowAlert(true);
    }else{
      setShowAlert(false);
    }
  };
  const handleInputChange = (event) => {
    setSelectedValue(event.target.value);
  };
  //保存滑点值
  const handleSaveSlip = () => {
    onClose();
    setClose();
    setSelectedValue(2);
    setClassify(0);
  }

  
  return (
    <>
      <Modal
        placement="center"
        backdrop="transparent"
        isDismissable={false}
        isOpen={isOpen}
        hideCloseButton
        onOpenChange={onOpenChange}
        size="lg"
        className="w-full sm:w-[480px] m-6 md:py-6 py-3 bg-[#14111C]"
      >
        <ModalContent>
          <ModalBody className="">
            <div className="flex flex-row justify-between md:mb-5 mb-0">
              <div className="md:text-xl text-lg">Set max. slippage(%)</div>
              <div
                className="pt-[5px] cursor-pointer"
                onClick={() => {
                  onClose();
                  setClose();
                  setSelectedValue(2);
                  setClassify(0);
                }}
              >
                <svg
                  className="md:w-6 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width={"24"}
                  height={"24"}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 4L20 20"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 20L20 4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-3 w-full sm:w-[433px] justify-center items-center ">
            {slip.map((item, index) => (
                    <Button
                      key={index}
                      className={`${index == classify ? "text-[#fff] bg-[#5A58F2]" : "text-[#5A58F2] bg-[#221F2E]"} rounded-3xl h-[28px] w-[60px] min-w-[60px]`}
                      onClick={() => {handleSelect(item);setClassify(index)}}
                    >
                      {item}%
                    </Button>
                  ))}
                <Input
                  type="number"
                  label=""
                  variant="bordered"
                  placeholder="0.00"
                  labelPlacement="outside"
                  onChange={handleInputChange}
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">%</span>
                    </div>
                  }
                />
            </div>
            {showAlert && <div className="text-[10px] text-[#DD4947]">Caution: Slippage above 10% may result in significant deviations in the transaction price. Please proceed with caution.</div>}
            <div className="flex flex-row w-full">
              <Button className="bg-[#5a58f2] w-full rounded-lg h-11" onClick={handleSaveSlip}>
                Save
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      {showWalletAlert && (
        <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#0A251D] text-[#42BE65] border-l-4 border-[#42BE65] flex-1 px-8 py-3">
          <Image src="/Information--filled.svg" className="w-5" />
          {alertSuccessMessage}
        </div>
      )}
    </>
  );
};
