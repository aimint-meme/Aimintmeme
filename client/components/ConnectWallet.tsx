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


export const ConnectWallet = ({ handleOpen, setClose, setIsConnect }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  // 控制提示框的显示
  const [showAlert, setShowAlert] = useState(false);
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); //提示信息
  //钱包连接成功后保存连接状态
  const [responseData, setResponseData] = useState({});
  const {provider, setProvider } = useProvider();//链接钱包成功后保存provider
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletname, setWalletName] = useState("");
  const apiUrl = PRE_URL + "/user/connect";
  const [alertSuccessMessage, setSuccessAlertMessage] = useState(
    "Successfully Connected."
  ); //连接成功提示信息
  const [messageApi, contextHolder] = message.useMessage();
  const { connected } = useWallet();
  //获取localStore中的setState方法
  const setState=useLocalGlobalStore(state => state.setState);
  //存储钱包连接成功后地址以及状态
  const handleUseLocalStore = (userId,address,signature,name) => { 
    setState((preState) => {
      return {
        ...preState,
        isConnect:true,
        wallet: {
          address: address,
          signature:signature,
          userId:userId,
          walletName:name,
        },
      };
    });
  }
  // const alertMessage = 'Successfully Connected.';
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
  // useEffect(() => {
  //   setState((preState) => {
  //     return {
  //       wallet: {
  //         walletName:walletname,
  //       },
  //     };
  //   });
  // }, [walletname]);
  useEffect(() => {
    if (showWalletAlert) {
      // 设置定时器，3秒后隐藏提示框
      const timer = setTimeout(() => {
        setShowWalletAlert(false);
      }, 3000);

      // 清除定时器，防止组件卸载时继续执行
      return () => clearTimeout(timer);
    }
  }, [showWalletAlert]);
  const router = useRouter();
  useEffect(() => {
    handleOpen && onOpen();
  }, [handleOpen]);
  
  //钱包连接成功后调用后台接口
  const handleConnectWallet = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl, {
        method: "POST", // 指定请求方法为 POST
        headers: {
          "Content-Type": "application/json", // 设置内容类型为 JSON
        },
        body: JSON.stringify(data), // 将参数对象序列化为 JSON 格式并作为请求主体发送
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json(); // 解析响应为 JSON 格式
      setResponseData(responseData.data);
      //连接成功后将地址存储起来
      handleUseLocalStore(responseData.data.userId,data.address,data.signature,data.name);
      setIsConnect(true); //同步给父级连接状态
      setShowWalletAlert(true); //显示钱包连接成功提示
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const getProviderPhantom = () => {
    if ("phantom" in window) {
      //phantom钱包
      const provider = window.phantom.solana;
      console.log(provider);
      if (provider.isPhantom) {
        setWalletName("phantom");
        return provider;
      }
    }
    //没安装钱包
    setAlertMessage("请安装phantom钱包插件");
    setShowAlert(true);
  };
  const getProviderSolflare = () => {
    if ("solflare" in window) {
      //solflare 钱包
      const provider = window.solflare;
      console.log(provider);
      if (provider) {
        setWalletName("solflare");
        return provider;
      }
    }
    //没安装钱包
    setAlertMessage("请安装solflare钱包插件");
    setShowAlert(true);
  };
  const getProviderOkx = () => {
    if ("okxwallet" in window) {
      //okx 钱包
      const provider = window.okxwallet.solana;
      console.log(provider);
      if (provider) {
        setWalletName("okxwallet");
        return provider;
      }
    }
    //没安装钱包
    setAlertMessage("请安装okx钱包插件");
    setShowAlert(true);
  };
  const getProviderTrust = () => {
    if ("trustwallet" in window) {
      //trust 钱包
      const provider = window.trustwallet.solana;
      console.log(provider);
      if (provider) {
        setWalletName("trustwallet");
        return provider;
      }
    }
    //没安装钱包
    setAlertMessage("请安装trust钱包插件");
    setShowAlert(true);
  };
  // console.log(window.phantom)
  // console.log(window.solflare)
  const sendPhantomSignMessage = async () => {
    setError("");
    const provider = getProviderPhantom();
    console.log(provider, "provider");
    try {
      if (!connected || !provider.isConnected) {
        await provider.connect();
      }
      const message = `Hello ${provider.publicKey.toBase58()}, Welcome to AIMint!`;

      const encodedMessage = new TextEncoder().encode(message);
      provider
        .request({
          method: "signMessage",
          params: {
            message: encodedMessage,
            display: "utf8", // "hex",
          },
        })
        .then((signedMessage) => {
          onClose();
          handleConnectWallet({
            address: provider.publicKey.toBase58(),
            signature: base58.encode(signedMessage.signature),
            name:'phantom'
          });
          router.push("/search/list");
          console.log(
            provider.publicKey.toBase58(),
            base58.encode(signedMessage.signature)
          );
          setProvider(provider)
        })
        .catch((err) => {
          console.log("catch");
          console.error(err.message);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };
  const sendSolflareSignMessage = async () => {
    setError("");
    const provider = getProviderSolflare();
    try {
      if (!connected || !provider.isConnected) {
        await provider.connect();
      }
      const message = `Hello ${provider.publicKey.toBase58()}, Welcome to AIMint!`;

      const encodedMessage = new TextEncoder().encode(message);
      provider
        .signMessage(encodedMessage)
        .then((signedMessage) => {
          setError(provider.publicKey.toBase58());
          onClose();
          //连接成功后传给后台
          handleConnectWallet({
            address: provider.publicKey.toBase58(),
            signature: base58.encode(signedMessage.signature),
            name:'solflare'
          });
          router.push("/search/list");
          console.log(
            provider.publicKey.toBase58(),
            base58.encode(signedMessage.signature)
          );
          setProvider(provider)
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };
  const sendOkxSignMessage = async () => {
    setError("");
    const provider = getProviderOkx();
    try {
      if (!connected || !provider.isConnected) {
        await provider.connect();
      }
      const message = `Hello ${provider.publicKey.toBase58()}, Welcome to AIMint!`;

      const encodedMessage = new TextEncoder().encode(message);
      provider
        .signMessage(encodedMessage)
        .then((signedMessage) => {
          setError(provider.publicKey.toBase58());
          onClose();
          //连接成功后传给后台
          handleConnectWallet({
            address: provider.publicKey.toBase58(),
            signature: base58.encode(signedMessage.signature),
            name:'okxwallet'
          });
          router.push("/search/list");
          console.log(
            provider.publicKey.toBase58(),
            base58.encode(signedMessage.signature)
          );
          setProvider(provider)
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };

  const sendTrustSignMessage = async () => {
    setError("");
    const provider = getProviderTrust();
    try {
      if (!connected || !provider.isConnected) {
        await provider.connect();
      }
      const message = `Hello ${provider.publicKey.toBase58()}, Welcome to AIMint!`;

      const encodedMessage = new TextEncoder().encode(message);
      provider
        .signMessage(encodedMessage)
        .then((signedMessage) => {
          setError(provider.publicKey.toBase58());
          onClose();
          //连接成功后传给后台
          handleConnectWallet({
            address: provider.publicKey.toBase58(),
            signature: base58.encode(signedMessage.signature),
            name:'trustwallet'
          });
          router.push("/search/list");
          console.log(
            provider.publicKey.toBase58(),
            base58.encode(signedMessage.signature)
          );
          setProvider(provider)
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (error) {
      console.log(error, "error");
    }
  };
  return (
    <>
      <Modal
        placement="center"
        backdrop="transparent"
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        className="connectWallet w-[480px] m-6 md:py-6 py-3 bg-[#14111C]"
      >
        <ModalContent>
          <ModalBody className="">
            <div className="flex flex-row justify-between md:mb-5 mb-0">
              <div className="md:text-2xl text-xl">Connect Wallet</div>
              <div
                className="pt-[5px] cursor-pointer"
                onClick={() => {
                  onClose();
                  setClose();
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
            <div className="flex flex-row flex-wrap gap-3 md:w-[433px] ">
              <div
                className="flex flex-col justify-center content-center items-center bg-[#221F2E] flex-1 rounded-[12px] p-4 cursor-pointer"
                onClick={sendPhantomSignMessage}
              >
                <div className="block flex flex-col justify-center md:pb-4 pb-3">
                  <img
                    width="100%"
                    className="w-full w-[40px] h-[33px]"
                    src="/cw1.svg"
                  />
                </div>
                <div className="md:text-base text-[14px]">Phantom</div>
              </div>
              <div
                className="flex flex-col justify-center content-center items-center bg-[#221F2E] flex-1 rounded-[12px] p-4 cursor-pointer"
                onClick={sendOkxSignMessage}
              >
                <div className="block flex flex-col justify-center md:pb-4 pb-3 ">
                  <img
                    width="100%"
                    className="w-full w-[40px] h-[33px]"
                    src="/cw2.png"
                  />
                </div>
                <div className="md:text-base text-[14px]">OKX</div>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-4 md:w-[433px]">
              <div
                className="flex flex-col justify-center content-center items-center bg-[#221F2E] flex-1 rounded-[12px] p-4 cursor-pointer"
                onClick={sendSolflareSignMessage}
              >
                <div className="block flex flex-col justify-center md:pb-4 pb-3">
                  <img
                    width="100%"
                    className="w-full w-[40px] h-[33px]"
                    src="/cw3.svg"
                  />
                </div>
                <div className="md:text-base text-[14px]">Solflare</div>
              </div>
              <div
                className="flex flex-col justify-center content-center items-center bg-[#221F2E] flex-1 rounded-[12px] p-4 cursor-pointer"
                onClick={sendTrustSignMessage}
              >
                <div className="block flex flex-col justify-center md:pb-4 pb-3 ">
                  <img
                    width="100%"
                    className="w-full w-[40px] h-[33px]"
                    src="/cw4.svg"
                  />
                </div>
                <div className="md:text-base text-[14px]">Trust</div>
              </div>
            </div>
            {showAlert && (
              <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#0A251D] text-[#42BE65] border-l-4 border-[#42BE65] flex-1 px-8 py-3">
                <Image src="/Information--filled.svg" className="w-5" />
                {alertMessage}
              </div>
            )}
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
