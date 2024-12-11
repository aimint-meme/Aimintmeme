"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
  useDisclosure,
  Divider,
  Input,
  Spinner,
} from "@nextui-org/react";
import { FrameIcon } from "@/components/icons";
import base58 from "bs58";
import { PinataSDK } from "pinata-web3";
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, ComputeBudgetProgram,PublicKey } from '@solana/web3.js';
import {Program, AnchorProvider, setProvider, BN} from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { useAiImageSelected } from "@/components/overlayer";
import { Buffer } from "buffer";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { Image } from "@nextui-org/react";
import { RotatingCircle } from "@/components/RotatingCircle";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import type { AmiContract } from "@/src/idlType";
import idl from "@/src/idl.json";
import multer from "multer";
import { useSolBalance } from '@/src/utils/getWallet';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_APP_PINATA_SECRET_API_KEY;
const PINATA_ENDPOINT = process.env.NEXT_PUBLIC_APP_PINATA_ENDPOINT;
const PINATA_JWT = process.env.NEXT_PUBLIC_APP_PINATA_JWT;
const PINATA_URL = process.env.NEXT_PUBLIC_APP_PINATA_URL;
// const agent = new HttpsProxyAgent(proxy);
const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;


export const CreateToken = ({ handleOpen, setClose, formData }) => {
  const wallet = useAnchorWallet();
  const { fetchSolBalance } = useSolBalance();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedValue, setSelectedValue] = React.useState();
  const [sol, setSol] = useState(true);
  const [responseData, setResponseData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const address = useLocalGlobalStore((state) => state.wallet.address);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const walletName = useLocalGlobalStore((state) => state.wallet.walletName);
  const { connection } = useConnection();
  const [mintPdaAddress, setMintPdaAddress] = useState('');
  const [tokenPdaAddress, setTokenPdaAddress] = useState('');
  const { selectImage, setSelectImage } = useAiImageSelected();//AI生成的图片
  const [showAlert, setShowAlert] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [mint,setMint] = useState(); 
  const [imageUrl,setImageUrl] = useState(); 
  const [pinataUrl, setPinataUrl] = useState("");
  const [tx,setTx] = useState(null);
  const [solPrice,setSolPrice] = useState(null);
  const [tokenQuantity,setTokenQuantity] = useState(null);
  const [alertMessage, setAlertMessage] = useState(
    "Successfully Created."
  ); //连接成功提示信息

  // 调用 POST 接口
  const apiUrl = PRE_URL + "/token/generateToken";
  const mintUrl = "/token/initMint";
  //input框样式
  const inputStyle = {
    input: ["bg-[#221F2E]", "pl-3", "hover:bg-[#221F2E]", "rounded-lg"],
    innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]", "pr-3", "rounded-lg"],
    inputWrapper: [
      "bg-[#221F2E]",
      "hover:bg-[#221F2E]",
      "dark:hover:bg-[#221F2E]",
      "p-0",
      "group-data-[focus=true]:bg-[#221F2E]",
      "dark:group-data-[focus=true]:bg-[#221F2E]",
      "rounded-lg",
    ],
  };
  const btnStyle =
    "text-[#5a58f2] bg-[#221F2E] rounded-3xl h-[28px] w-[60px] min-w-[60px]";
  const solValue = [
    { name: "0.1", value: 0.1 },
    { name: "0.5", value: 0.5 },
    { name: "1", value: 1 },
  ];
  const myCreated = [
    { name: "5%", value: 40000000 },
    { name: "10%", value: 80000000 },
    { name: "20%", value: 160000000 },
    { name: "50%", value: 400000000 },
    { name: "100%", value: 800000000 },
  ];
  useEffect(() => {
    handleOpen && onOpen();
    setLoading(false);
  }, [handleOpen]);
useEffect(() => {
  if(pinataUrl !== "") {
    handleConvertTokenImg(pinataUrl);
    // handleInitMint();
  }
},[pinataUrl])

//买入时sol转换成代币数量
function calTokenAmountBySol(currentSolVaultAmount:number, buySolAmount:number) {
  return (1.0 / (currentSolVaultAmount + 25.5)) * 29200000000.0 - (1.0 / (buySolAmount + 25.5)) * 29200000000.0;
}
//sol转换代币数量
const handleSetTokenQuantity = async (item) => {
  if(formData.tokenPdaAddress == "" || !formData.tokenPdaAddress){
    setTokenQuantity(calTokenAmountBySol(0,Number(item)));
    return;
  }
}

  // 定义一个公共方法
  function handleWalletNotConnected(message) {
    onClose();
    setClose();
    setAlertMessage(message);
    setLoading(false);
    setShowAlert(true);
    console.log(message);
  }
//上传json文件到 Pinata
  const handleConvertTokenImg = async (url) => {
    setLoading(true);
    // 检查钱包连接
    if (!wallet) {
      handleWalletNotConnected('Please connect your wallet first.');
      return;
    }
    console.log("pinataUrl============",pinataUrl)
    const firstValue = handleFirstValue();
    if(firstValue){
      return
    }
    // const file = req.file as Express.Multer.File;
    const data = {
      name:formData.name,
      symbol:formData.ticker,
      description:formData.description,
      image:url
    }
    try {
      // 上传文件到 Pinata
      const pinata = new PinataSDK({
        pinataJwt: PINATA_JWT,
        pinataGateway: "example-gateway.mypinata.cloud",
      });
      
      const upload = await pinata.upload.json(data)
      let ipfsHash = "";
      if (upload.IpfsHash) {
        ipfsHash = upload.IpfsHash; // 获取 IpfsHash
        const url = PINATA_URL+`${ipfsHash}`;
        setImageUrl(url)
      }
    } catch (error) {
      setError(error);
      handleWalletNotConnected(responseData.data);
    }
  };
  //上传文件到 Pinata
  const handleConvertImg = async (image) => {
    const firstValue = handleFirstValue();
    if(firstValue){
      return
    }
    setLoading(true);
    setError(null);
    // const file = req.file as Express.Multer.File;
    console.log("file======", image);
    const formDataImg = new FormData();
    formDataImg.append("file", image);
    try {
      // 上传文件到 Pinata
      const response = await fetch(PINATA_ENDPOINT, {
        method: "POST", // 指定请求方法为 POST
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
        body: formDataImg, // 将参数对象序列化为 JSON 格式并作为请求主体发送
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json(); // 解析响应为 JSON 格式
      let ipfsHash = "";
      if (responseData.IpfsHash) {
        ipfsHash = responseData.IpfsHash; // 获取 IpfsHash
        const url = PINATA_URL+`${ipfsHash}`;
        setPinataUrl(url);
      }
    } catch (error) {
      setError(error);
      handleWalletNotConnected(responseData.data);
    }
  };
  const handleCloseAlert = () => {  
    setShowAlert(false); // 关闭提示框  
  };  
  //显示对应sol
  const handleSetSolPrice = (value) => {
    if(value !== "" && value > 0 && value <= 800000000 && !sol){
      setSolPrice(calculateBuySolAmountByTokenAmount(0, value));
    }else if(value > 800000000){
      setSolPrice(59.6);
    }else{
      setSolPrice(null);
    }
  }

  //选中sol
  const handleSelect = (item) => {
    setSelectedValue(item);
    if(!sol){
      handleSetSolPrice(item);
      return;
    }
    handleSetTokenQuantity(item);
  };
  const handleInputChange = (event) => {
    if(sol && !isNaN(event.target.value) && event.target.value <= 59.6){
      if(event.target.value !== "" || event.target.value > 0){
        handleSetTokenQuantity(event.target.value);
      }else{
        setTokenQuantity(null);
      }
      setSelectedValue(event.target.value);
      
    }else if(!sol){
      setSelectedValue(event.target.value);
      handleSetSolPrice(event.target.value);
    }
  };
   //调用后台返回mint
   const handleInitMint = async () => {
    try {
      const responseData = await Api.post(mintUrl, {},userId);   
      if(!responseData.publicKey){
        handleWalletNotConnected(responseData);
        return;
      }else{
        setMint(responseData.publicKey)
      }
    } catch (error) {
      setError(error);
      onClose();
      setClose();
    }finally{
      setSelectImage(0);
    }
  }
  useEffect(() => {
    if(mint && imageUrl){
      handleCreateToken();//创建代币调用合约
    }
    
  },[mint && imageUrl])
  //监听第一次建议必须大于0.018
  const handleFirstValue = () => {
    if (!selectedValue || selectedValue < 0.018) {
      setShowWarning(true)
      return true
    } else {
      setShowWarning(false)
      return false
    }
  };
  function calculateBuySolAmountByTokenAmount(currentSolVaultAmount: number, buyTokenAmount: number) {
      return parseFloat(((29200000000 * (currentSolVaultAmount + 25.5) / (29200000000.0 - (buyTokenAmount * (currentSolVaultAmount + 25.5)))) - 25.5) - currentSolVaultAmount).toFixed(9);
      
  }
//查询钱包余额
const handleFetchBalance = async () => {
  try {
    await fetchSolBalance(address);
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
  }
};

  //创建代币调用合约
  const handleCreateToken = async () => {
    console.log("imageUrl======",imageUrl)
    setLoading(true);
    setError(null);
   
    // 检查 selectedValue
    const firstValue = handleFirstValue();
    if(firstValue){
      return
    }
    // 初始化 AnchorProvider 和 Program
    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "finalized",
      commitment: "finalized",
    });
    setProvider(provider);
    const program = new Program(idl as AmiContract, provider);
    const signer = provider.wallet.publicKey;
    let eventCaptured = null
    program.addEventListener("createTokenEvent", (event, slot) => {
      eventCaptured = event
    })
    try {
      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 500_000,
      });
   
      const { name, ticker } = formData;
      const uri = imageUrl;
      console.log("mint====",mint);
      console.log("name====",formData.name);
      console.log("ticker====",formData.ticker);
      console.log("imageUrl====",imageUrl);
      const selectSol = (!sol && selectedValue >= 800000000) ? 59 : (solPrice && !sol) ? solPrice : selectedValue;
      console.log("selectSol====",selectSol);
      if (isValidSelectedValue(selectedValue)) {
        const tx = await program.methods.createToken(name, ticker, uri,selectSol)
          .accounts({ signer:signer,mint:mint })
          .preInstructions([computeBudgetIx])
          .rpc({
            commitment: "finalized",
            preflightCommitment: "finalized",
            skipPreflight: true,
            maxRetries: 3,
          });
   
        console.log("Create Token Transaction:", tx);
        // if(tx) {
        //   // await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 5 seconds
          
        // }
          if (eventCaptured && eventCaptured.mintAddr) {
            if(eventCaptured.signer.toBase58() !== address){
              return;
            }
            setIsSuccess(true);
            handleToken(eventCaptured.mintAddr.toBase58(), eventCaptured.tokenVaultAddr.toBase58());
            setAlertMessage(`Buy ${eventCaptured.tokenAmount} $ ${formData.ticker} for ${eventCaptured.tradeSolAmount} SOL`);
            setIsSuccess(true);
            setShowAlert(true);
            setLoading(false);
            eventCaptured = null;  // Reset for future events
          } else {
            handleToken(mint);
            // setIsSuccess(false);
            // setLoading(false);
            setIsSuccess(true);
            showErrorAlert("Transaction submitted successfully, but we couldn't detect the status. Please check your on-chain transaction record for confirmation.");
            
          }
        
      } else {
        setLoading(false);
        showErrorAlert("please enter a valid amount to trade.");
      }
    } catch (error) {
      console.log("tokenQuantity",tokenQuantity)
      if(solPrice && !sol){
        handleCheckTx(error.message,selectedValue,solPrice,'Buy')
      }else{
        handleCheckTx(error.message,tokenQuantity,selectedValue,'Buy')
      }
    } finally {
      setLoading(false);
      onClose();
      setClose();
      setSelectImage(0);
      setSolPrice(null);
      setTokenQuantity(null)
      handleFetchBalance();
}
  };
  //catch重置
  const handleCatchReset = (message) => {
    onClose();
    setClose();
    setLoading(false);
    setIsSuccess(false);
    setAlertMessage(message);
    setShowAlert(true);
  }

  //失败获取tx
  const handleCheckTx = (error,value,sol,status) => {
    const regex = /Check signature ([a-zA-Z0-9]+)/;
    // 确保error是字符串类型
    if (typeof error !== 'string') {
      return handleCatchReset(error);
    }
      const match = error.match(regex);
      if (match) {
        const signature = match[1];
        console.log("Found signature:", signature);
        handleCheckStatus(signature,value,sol,status);
      } else {
        handleCatchReset(error);
      }
  }
  //根据tx查询交易是否成功
  const handleCheckStatus = async (tx,value,sol,status) =>{
    const response = await connection.getTransaction(tx)
    console.log("tx",response)
    if(!response){
      handleCatchReset("No transaction is found!");
      return
    }
    if(response && response.meta.status && 'Ok' in response.meta.status){
      setIsSuccess(true);
      setAlertMessage(`${status} ${value} $ ${formData.ticker} for ${sol} SOL`);
      setTx(tx);
      setShowAlert(true);
    }else{
      const errKeys = Object.keys(response.meta.status.Err);
      handleCatchReset(errKeys);
    }
  }
   
  // 辅助函数
  const isValidSelectedValue = (value: any): boolean => {
    return value !== '' && value !== 0 && value !== undefined;
  };
   
  const showErrorAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    
  };
  //创建代币调用后台接口
  const handleToken = async (Mint = '',token = '') => {
    console.log("pinataUrl============",pinataUrl)
    try {
      const response = await fetch(apiUrl, {
        method: "POST", // 指定请求方法为 POST
        headers: {
          'Content-Type': 'application/json',
          userid: userId,
        },
        body: JSON.stringify({...formData,image:pinataUrl, mintPdaAddress:Mint,tokenPdaAddress:token}), // 将参数对象序列化为 JSON 格式并作为请求主体发送
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json(); // 解析响应为 JSON 格式
      setResponseData(responseData);
      setIsSuccess(true);
      setShowAlert(true);
      setSelectImage(0);
      // 设置三秒后跳转到首页  
      setTimeout(() => {  
        router.push(`/tokensDetail?id=${responseData.data.id}`); //跳转到详情页
      }, 500);
      
    } catch (error) {
      setError(error);
      handleCatchReset(error.message)
    } finally {
      setLoading(false);
      onClose();
      setClose();
    }
  };
  useEffect(() => {
    if (!isOpen) {
      onClose();
      setClose();
      setMint();
      setImageUrl();
      setPinataUrl("");
      setLoading(false);
      setShowWarning(false);
      setSelectedValue("");
      setSol(true);
    }
  }, [isOpen]);
  // 使用useEffect来设置定时器，自动隐藏提示框
  useEffect(() => {
    if (showAlert && isSuccess) {
      // 设置定时器，3秒后隐藏提示框
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      // 清除定时器，防止组件卸载时继续执行
      return () => clearTimeout(timer);
    }
  }, [showAlert,isSuccess]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        // scrollBehavior="outside"
        isDismissable={false}
        onClose={() => {
          onClose;
          setClose();
        }}
      
        className="w-[90%] max-w-[90%] sm:w-[480px] sm:max-w-[480px] bg-[#1A1425] rounded-xl"
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <ModalBody className="w-full justify-center items-center px-1 sm:px-4">
              <div className="flex flex-col w-full sm:w-[92%] justify-center items-start text-center gap-2">
                <h1 className="py-6">
                  Select the amount of tokens you wish to purchase.
                </h1>
                <Button
                  className="text-[#5A58F2] font-light bg-[#221F2E]"
                  onClick={() => {setSol(!sol);setSelectedValue("");setSolPrice(null);setTokenQuantity(null)}}
                >
                  Switch to {sol ? formData.ticker : "SOL"}
                </Button>
                <Input
                  label=""
                  type="number"
                  placeholder="0.0"
                  labelPlacement="outside"
                  classNames={inputStyle}
                  value={selectedValue}
                  onChange={handleInputChange}
                  endContent={
                    <div className="flex flex-row gap-2 items-center">
                      <p className="text-nowrap w-auto">
                        {sol ? "SOL" : formData.ticker}
                      </p>
                      <div className="pointer-events-none flex items-center capitalize border-box border rounded-md py-2 px-[6px] max-w-full">
                        {sol ? (
                          <FrameIcon />
                        ) : (
                          <div className="w-[19px] h-[16px]">
                            <img
                              src={formData.imgUrl}
                              className="w-[100%] h-[100%]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  }
                />
                {showWarning && <div className="flex flex-row text-[#DD4947] text-[10px]">
                Caution: The first sell order requires ≥0.018 Sol. Please enter a value of ≥0.018.
                </div>}
                {solPrice && <div className="text-[#9ca3af] text-[12px]">{solPrice}SOL</div>}
                {tokenQuantity && <div className="text-[#9ca3af] text-[12px] text-left">{tokenQuantity}</div>}
                <div className="flex flex-row gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className={btnStyle}
                    onClick={() => {setSelectedValue("");setSolPrice(null);setTokenQuantity(null)}}
                  >
                    Reset
                  </Button>
                  {(sol ? solValue : myCreated).map((item, index) => (
                    <Button
                      key={index}
                      className={btnStyle}
                      onClick={() => handleSelect(item.value)}
                    >
                      {item.name} {sol && "SOL"}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-row w-full py-6">
                  <Button
                    className="bg-[#5a58f2] w-full rounded-lg font-bold text-[16px]"
                    onClick={() => {
                      if (typeof formData.image === 'string' && formData.image.includes("https")) {
                        const firstValue = handleFirstValue();
                        if(firstValue){
                          return
                        }
                        setPinataUrl(formData.image);
                        handleInitMint();
                      } else {
                        const firstValue = handleFirstValue();
                        if(firstValue){
                          return
                        }
                        handleConvertImg(formData.image);
                        handleInitMint();
                      }
                    }}
                    isLoading={loading}
                  >
                    Creact Coin
                  </Button>
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
      {showAlert && (  
        <div className={`alert-box sm:w-[400px] sm:right-5 sm:bottom-5 text-left ${isSuccess ? 'bg-[#EDFDF5] text-[#14181F] border border-[#D0F3E2]' : 'bg-[#FDEDED] text-[#14181F] border border-[#FADBDB]'}`}> 
          <div className="flex flex-row justify-between">
            <h1>{!selectedValue ? "Create Token" : isSuccess ? 'Transaction confirmed' : 'Transaction failed'}</h1> 
            <button onClick={handleCloseAlert} className={`alert-close-btn ${isSuccess ? 'text-[#0D7544]' : 'text-[#C42525]'} text-[24px]`}>  
              ×
            </button> 
          </div>
          <span>{alertMessage}</span>  
           
        </div>  
      )} 
    </>
  );
};
