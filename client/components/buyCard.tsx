"use client";
import React, { useEffect, useState, useRef, use } from "react";
import ReactDOM from 'react-dom';
import {
  Button,
  ButtonGroup,
  Input,
  Tabs,
  Tab,
  Snippet,
  Image,
} from "@nextui-org/react";
import { PinataSDK } from "pinata-web3";
import Decimal from 'decimal.js';
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, ComputeBudgetProgram, PublicKey,Connection } from '@solana/web3.js';
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { Token, ACCOUNT_LAYOUT, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from "@coral-xyz/anchor";
import { Link } from "@nextui-org/link";
import { FrameIcon } from "@/components/icons";
import { KLineChart } from "@/components/kLine";
import { Tradesmobile } from "@/components/Tradesmobile";
import { Trades } from "@/components/Trades";
import { Holder } from "@/components/Holder";
import { Holdermobile } from "@/components/Holdermobile";
import { Slippage } from "@/components/Slippage";
import { BN } from 'bn.js';
import type { AmiContract } from "@/src/idlType";
import { Api } from "@/src/utils/api";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import idl from "@/src/idl.json";
import { useSolBalance } from '@/src/utils/getWallet';

const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;
const PINATA_JWT = process.env.NEXT_PUBLIC_APP_PINATA_JWT;
const PINATA_URL = process.env.NEXT_PUBLIC_APP_PINATA_URL;
const solScanTxUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_TX_URL;
const solScanBaseUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_BASE_URL;
const clusterParam = process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM ? `?${process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM}` : '';
const endpoint = process.env.NEXT_PUBLIC_APP_SOLANA_COM;
const programId = new PublicKey(process.env.NEXT_PUBLIC_APP_IDL_ID)

export const BuyCard = (props) => {
  const btnClassify = [{ name: "buy" }, { name: "sell" }];
  const { fetchSolBalance } = useSolBalance();
  const [newData, setNewData] = useState({ ...props.data });
  const [classify, setClassify] = useState(0);
  const [status, setStatus] = useState(0);
  const [statusColor, setStatusColor] = useState("#489682");
  const [selectedValue, setSelectedValue] = React.useState('');
  const [handleOpen, setHandleOpen] = React.useState(false);
  const [sol, setSol] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connection } = useConnection();
  const { publicKey,wallet,connect,connected } = useWallet();
  const  anchorWallet = useAnchorWallet();
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("Caution: The first sell order requires ≥0.018 Sol. Please enter a value of ≥0.018.");
  const [showAlert, setShowAlert] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("please enter a valid amount to trade."); //提示信息
  const [mintPdaAddress, setMintPdaAddress] = useState('');
  const [tokenPdaAddress, setTokenPdaAddress] = useState('');
  const [amount, setAmount] = useState();
  const [balance, setBalance] = useState({});//token账户余额
  const [isTrade, setIsTrade] = useState(false);
  const [txUrl, setTxUrl] = useState();
  const [mint, setMint] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [tx, setTx] = useState(null);
  const [isWideViewport, setIsWideViewport] = useState(false);
  const parentEleRef = useRef(null);
  const router = useRouter();
  const [solPrice,setSolPrice] = useState(null);
  const [tokenQuantity,setTokenQuantity] = useState(null);
  const [tokenNum, setTokenNum] = useState(800000000);
  //获取localStore中的setState方法
  const setState = useLocalGlobalStore((state) => state.setState);
  const address = useLocalGlobalStore((state) => state.wallet.address);
  const isConnect = useLocalGlobalStore((state) => state.isConnect);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const walletName = useLocalGlobalStore((state) => state.wallet.walletName);
  console.log("anchorWallet",anchorWallet);
  // 调用 POST 接口
  const apiUrl = PRE_URL + "/token/updateTokenInfo";
  const mintUrl = "/token/initMint";
  useEffect(() => {
    setNewData({ ...props.data });
  }, [props.data]);
  const solValue = [
    { name: "0.1", value: 0.1 },
    { name: "0.5", value: 0.5 },
    { name: "1", value: 1 },
  ];
  const myCreated = [
    { name: "20%", value: '20%'},
    { name: "50%", value: "50%"},
    { name: "70%", value: "70%"},
    { name: "100%", value: "100%"},
  ];
  //input框样式
  const inputStyle = {
    input: classify ? ["bg-[#10F4B10A]", "pl-3", "hover:bg-[#221F2E]", "rounded-lg"] : ["bg-[#DD49470A]", "pl-3", "hover:bg-[#221F2E]", "rounded-lg"],
    // innerWrapper: classify ? ["bg-[#10F4B10A]", "pl-3", "hover:bg-[#221F2E]", "rounded-lg"] : ["bg-[#DD49470A]", "pl-3", "hover:bg-[#221F2E]", "rounded-lg"],
    inputWrapper:classify==0 ? [
      "bg-[#10F4B10A]",
      "hover:bg-[#10F4B10A]",
      "dark:hover:bg-[#10F4B10A]",
      "p-0",
      "group-data-[focus=true]:bg-[#10F4B10A]",
      "dark:group-data-[focus=true]:bg-[#10F4B10A]",
      "rounded-lg",
    ]:[
      "bg-[#DD49470A]",
      "hover:bg-[#DD49470A]",
      "dark:hover:bg-[#DD49470A]",
      "p-0",
      "group-data-[focus=true]:bg-[#DD49470A]",
      "dark:group-data-[focus=true]:bg-[#DD49470A]",
      "rounded-lg",
    ],
  };

  useEffect(() => {
    setIsWideViewport(window.matchMedia('(min-width: 640px)')?.matches);
  }, [isWideViewport, props]);

  //点击buy或者sell
  const handleChange = (index) => {
    setSelectedValue("");
    console.log("handleChange setSelectedValue", selectedValue)
    if (index == 0) {
      setStatus(true);
    } else {
      setStatus(false);
    }
  };

  //显示对应sol
  const handleSetSolPrice = (value, num) => {
    // 如果 sol 为 true 或 value 是空字符串/非正数，则设置 solPrice 为 null 并返回
    if (sol || value === "" || value <= 0) {
      setSolPrice(null);
      return;
    }
    // 计算 sol 的价格
    let solPrice;
    if (num === 800000000) {
      solPrice = value > num ? 59.6 : calculateBuySolAmountByTokenAmount(0, Math.min(value, num));
    } else {
      solPrice = calculateBuySolAmountByTokenAmount(0, Math.min(value, num));
    }
    // 设置 solPrice 并更新余额
    setSolPrice(solPrice);
    handleBalance(solPrice);
  };
  //sol转换代币数量
  const handleSetTokenQuantity = async (item) => {
    const solNum = Number(item);
    if(newData.tokenPdaAddress == ""){
      setTokenQuantity(calTokenAmountBySol(0,solNum));
      return;
    }
    let solVaultAmountLamp = await getVaultBalance(newData.tokenPdaAddress);
    let solVaultAmount = solVaultAmountLamp / (10 ** 9)
    let sumSol = solNum + solVaultAmount;
    console.log("aaaaaa",solVaultAmount,sumSol);
    setTokenQuantity(calTokenAmountBySol(solVaultAmount,sumSol));
  }
  //选中sol
  const handleSelect = (item) => {
    if (status == 1) {
      // 去掉百分号，并将字符串转换为数字  
    let percentage = parseFloat(item.replace('%', ''));
    // 将百分比转换为实际的数值（例如，10% 变为 0.1）  
    let decimalValue = percentage / 100;
    let formattedResult = null;
    if(balance.uiAmountString){
      if(decimalValue == 1){
        const valueDecimal = new Decimal(decimalValue);
        const uiAmountDecimal = new Decimal(balance.uiAmountString);
        const result = uiAmountDecimal.times(valueDecimal);
        formattedResult = result.toString();
        setAmount(balance.amount);
      }else{
        formattedResult = decimalValue * balance.uiAmount;
        const amount = Math.trunc(decimalValue * balance.amount);
        setAmount(amount.toString());
      }
    }
    
    setSelectedValue(formattedResult);
    }else if(status == 0 && !sol){
      // 去掉百分号，并将字符串转换为数字  
    let percentage = parseFloat(item.replace('%', ''));
    // 将百分比转换为实际的数值（例如，10% 变为 0.1）  
    let decimalValue = percentage / 100;
    const calculatedValue = decimalValue * tokenNum;
      setSelectedValue(calculatedValue);
      handleSetSolPrice(calculatedValue,tokenNum)
    } else {
      setSelectedValue(item);
      handleSetTokenQuantity(item);
      handleBalance(item);
    }
    console.log("handleSelect setSelectedValue", item)
  };
  //监听第一次建议必须大于0.018
  const handleFirstValue = () => {
    if (!selectedValue || selectedValue < 0.018) {
      setWarningMessage("Caution: The first sell order requires ≥0.018 Sol. Please enter a value of ≥0.018.");
      setShowWarning(true)
      return true
    } else {
      setShowWarning(false)
      return false
    }
  }
  //监听输入的值
  useEffect(() => {
    if (status !== 1 || newData.tokenPdaAddress == "") {
      return;
    }
    
    handleSelectedValue();
  }, [selectedValue, status, balance.uiAmount, newData.name]); // 确保所有用到的外部变量都在依赖项中
  
  const handleSelectedValue = async () => {
    if (selectedValue === "") {
      setSolPrice(null);
      setWarningMessage("");
      setShowWarning(false);
      return;
    }else if (balance.uiAmount == 0 || !balance.uiAmount) {
      setSolPrice(null);
      setWarningMessage(`Insufficient balance: You have 0.00 ${newData.name}`);
      setShowWarning(true);
      return;
    }
    let solVaultAmountLamp = await getVaultBalance(newData.tokenPdaAddress);
    console.log("solVaultAmountLamp",solVaultAmountLamp);
    let solVaultAmount = solVaultAmountLamp / (10 ** 9)
    const maxAllowed = Math.min(balance.uiAmount, 50000000);
    if (selectedValue > maxAllowed) {
      setWarningMessage(selectedValue > balance.uiAmount
        ? `Insufficient balance: You have ${balance.uiAmount} ${newData.name}`
        : "Caution: A single sale cannot exceed 50M (5%) of the total circulation.");
      setShowWarning(true);
      const solNum = calculateSellSolAmountByTokenAmount(solVaultAmount, balance.uiAmount);
      setSolPrice(solNum);
    } else {
      setWarningMessage("");
      setShowWarning(false);
      const solNum = calculateSellSolAmountByTokenAmount(solVaultAmount, selectedValue <= balance.uiAmount ? selectedValue : balance.uiAmount);
      setSolPrice(solNum);
    }
  };
  useEffect(() => {
    setWarningMessage("");
    setShowWarning(false);
    setSelectedValue("");
  }, [status])

  async function getVaultBalance(tokenVaultAddr:string) {

    let tokenVaultPda = new PublicKey(tokenVaultAddr)
    let [solVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol_vault"), tokenVaultPda.toBuffer()],
        programId
    )
    let res: number
    try {
        let balanceValue = await connection.getBalance(solVaultPda)
        console.log("vault balance:", balanceValue)
        res = balanceValue

    } catch(error) {
        console.log("getVaultBalance error:", error)
        res = 0
    }
    return res
    
}
//买入时sol转换成代币数量
function calTokenAmountBySol(currentSolVaultAmount:number, buySolAmount:number) {
  return (1.0 / (currentSolVaultAmount + 25.5)) * 29200000000.0 - (1.0 / (buySolAmount + 25.5)) * 29200000000.0;
}
//买入时代币数量转换sol
  function calculateBuySolAmountByTokenAmount(currentSolVaultAmount: number, buyTokenAmount: number) {
    return parseFloat(((29200000000 * (currentSolVaultAmount + 25.5) / (29200000000.0 - (buyTokenAmount * (currentSolVaultAmount + 25.5)))) - 25.5) - currentSolVaultAmount).toFixed(9);
  }
  //卖出时代币数量转换sol
  function calculateSellSolAmountByTokenAmount(currentSolVaultAmount: number, sellTokenAmount: number) {
    let endToken = - (1.0 / (currentSolVaultAmount + 25.5)) * 29200000000.0;
    let start = (29200000000.0 / (sellTokenAmount - endToken)) - 25.5;
    return currentSolVaultAmount - start;
}
//查询钱包账户余额
const handleBalance = async (newValue) => {
  if(!address){
    return;
  }
  const solVaultPda = new PublicKey(address);
  let balanceValue = await connection.getBalance(solVaultPda)
  console.log("balanceValue",balanceValue/1e9);
  const solBalance =  balanceValue/1e9;
  if(newValue > solBalance){
    setWarningMessage(`insufficient balance: you have ${solBalance} SOL`);
    setShowWarning(true)
    return;
  }else{
    setWarningMessage("");
    setShowWarning(false)
  }
}
  //输入框输入内容
  const handleInputChange = (event) => {
    const newValue = parseFloat(event.target.value);
    console.log("newValue", newValue);
    // 判断是否为有效数字，并且允许的最大值为59
    const isValidNumber = !isNaN(newValue) && newValue <= 59.6 && isFinite(newValue); 
    if ((sol && isValidNumber && status === 0) || status !== 0) {
        setSelectedValue(newValue);
        if (status === 0) {
            if (newValue > 0) {
                handleSetTokenQuantity(newValue);
            } else {
                setTokenQuantity(null);
            }
            handleBalance(isValidNumber ? newValue : 0); 
        }
        setAmount(newValue * 1e9); 
    } else if (!sol && status === 0) {
        setSelectedValue(newValue);
        handleSetSolPrice(newValue, tokenNum);
    } else {
        setSelectedValue("");
        setTokenQuantity(null);
    }
};

// 注意：上面的 useEffect 代码应该放在组件的顶层，而不是 handleInputChange 函数内部。
// 您需要将 selectedValue 和其他相关状态作为组件的状态变量，并使用 useState 钩子来管理它们。
  //创建代币调用后台接口
  const handleToken = async (Mint = '', token = '') => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST", // 指定请求方法为 POST
        headers: {
          'Content-Type': 'application/json',
          userid: userId,
        },
        body: JSON.stringify({ id: newData.id, mintPdaAddress: Mint, tokenPdaAddress: token }), // 将参数对象序列化为 JSON 格式并作为请求主体发送
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json(); // 解析响应为 JSON 格式
      setNewData(responseData.data);
    } catch (error) {
      handleWalletNotConnected(error.message)
    }
  };


  useEffect(() => {
    if (tx) {
      setIsTrade(true);
      setTxUrl(`${solScanTxUrl}${tx}${clusterParam}`);
      setShowAlert(true);

    } else {
      setTxUrl()
      setIsSuccess(false)
    }
  }, [tx && isTrade && isSuccess]);
  useEffect(() => {
    if (mint && imageUrl) {
      handleCreateToken(imageUrl)
    }
  }, [mint && imageUrl]);

  // 定义一个公共方法
  function handleWalletNotConnected(message) {
    setAlertMessage(message);
    setLoading(false);
    setShowAlert(true);
    console.log("init anchor wallet failed");
  }

  //上传json文件到 Pinata
  const handleConvertTokenImg = async () => {
    // if (!selectedValue || selectedValue < 0.018) {
    //   setShowWarning(true)
    //   return
    // } else {
    //   setShowWarning(false)
    // }
    const firstValue = handleFirstValue();
    if (firstValue) {
      return
    }
    setLoading(true)
    // 检查钱包连接
    const isConnected = await handleWalletConnection(anchorWallet, isConnect, wallet, 'Please connect your wallet first.');
    if (!isConnected) {
      return;
    }

    // const file = req.file as Express.Multer.File;
    const data = {
      name: newData.name,
      symbol: newData.ticker,
      description: newData.description,
      image: newData.image
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
        const url = PINATA_URL + `${ipfsHash}`;
        setImageUrl(url);
      }
    } catch (error) {
      handleWalletNotConnected(error.message)
    }
  };
  //调用后台返回mint
  const handleInitMint = async () => {
    const firstValue = handleFirstValue();
    if (firstValue) {
      return
    }
    try {
      const responseData = await Api.post(mintUrl, {}, userId);
      console.log("initmint",responseData);
      if (!responseData.publicKey) {
        handleWalletNotConnected(responseData)
        return;
      } else {
        setMint(responseData.publicKey)
      }
    } catch (error) {
      handleWalletNotConnected(error.message)
    }
  }

  //查询钱包余额
  const handleFetchBalance = async () => {
    try {
      await fetchSolBalance(address);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
    }
  };
  //交易后重置
  const handleResetValue = () => {
    setIsTrade(false);
    setLoading(false);
    setSelectedValue("");
    setSolPrice(null);
    setTokenQuantity(null);
    handleTokenBalance(1);
    handleFetchBalance();
  }
  //点击断开钱包按钮
  const handleDisconnect = async () => {
    console.log("断开连接--------------------------");
    setState((preState) => {
      return {
        ...preState,
        isConnect: false,
        wallet: {
          address: null,
          signature: null,
          userId: null,
          walletName: null,
          avatar: null,
        },
      };
    });
  };
  //交易时检查钱包是否连接
  async function handleWalletConnection(anchorWallet, isConnect, wallet, messageOnDisconnect) {
    console.log("wallet",wallet);
    console.log("connected",connected);
    console.log("isConnect",isConnect);
    if (!anchorWallet || !wallet ) {
        handleDisconnect();
        handleWalletNotConnected(messageOnDisconnect);
        return false; // 或者你可以根据需要返回其他值或抛出错误
    }
    return true; // 或者你可以根据需要返回其他值
  }
   
  //catch重置
  const handleCatchReset = (message) => {
    setIsTrade(true);
    setIsSuccess(false);
    setAlertMessage(message);
    setShowAlert(true);
    setSelectedValue("");
    setLoading(false);
  }
  //创建代币调用合约
  const handleCreateToken = async (url) => {
    const isConnected = await handleWalletConnection(anchorWallet, isConnect, wallet, 'Please connect your wallet first.');
    if (!isConnected) {
      return;
    }
    // if (selectedValue < 0.018) {
    //   setShowWarning(true)
    //   return
    // } else {
    //   setShowWarning(false)
    // }
    const firstValue = handleFirstValue();
    if (firstValue) {
      return
    }
    if (showWarning) {
      return;
    }
    
    setTx();
    
    const provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: "finalized",
      commitment: "finalized"
    })
    console.log("provider============", provider)
    setProvider(provider);
    const program = new Program(idl as AmiContract, provider)
    const signer = provider.wallet.publicKey;
    let eventCaptured = null
    let eventSlot = null
    program.addEventListener("createTokenEvent", (event, slot) => {
      eventCaptured = event
      eventSlot = slot
    })
    try {
      const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 500_000,
      });
      console.log("uri", url)
      const name: any = newData.name;
      const symbol: any = newData.ticker;
      const uri: any = url
      console.log("mint====", mint);
      console.log("name====", name);
      console.log("ticker====", symbol);
      console.log("imageUrl====", uri);
      const selectSol: any = (!sol && selectedValue >= 800000000) ? 59.6 : (solPrice && !sol) ? solPrice : selectedValue;
      console.log("selectSol====", selectSol);
      const tx = await program.methods.createToken(
        name, symbol, uri, selectSol)
        .accounts({
          signer: signer,
          mint: mint
        }).preInstructions([computeBudgetIx]).rpc({
          commitment: "finalized",
          preflightCommitment: "finalized",
          skipPreflight: true,
          maxRetries: 3,
        })
      console.log("create Token tx:", tx)
      if (tx) {
        setTx(tx)
        //await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 5 seconds
        if (eventCaptured && eventCaptured.mintAddr) {
          if(eventCaptured.signer.toBase58() !== address){
            return;
          }
          // BuyToken(eventCaptured.mintAddr.toBase58(), eventCaptured.tokenPdaAddr.toBase58());
          handleToken(eventCaptured.mintAddr.toBase58(), eventCaptured.tokenVaultAddr.toBase58());
          setAlertMessage(`Buy ${eventCaptured.tokenAmount} $ ${newData.ticker} for ${eventCaptured.tradeSolAmount} SOL`);
          setIsSuccess(true);
          setIsTrade(true);
          eventCaptured = null;
        } else {
          handleToken(mint);
          setIsSuccess(true);
          setIsTrade(true);
          setAlertMessage("Transaction submitted successfully, but we couldn't detect the status. Please check your on-chain transaction record for confirmation.");
        }
      };
      
    } catch (error) {
      console.log("error=====", error)
      if(solPrice && !sol){
        handleCheckTx(error.message,selectedValue,solPrice,'Buy')
      }else{
        handleCheckTx(error.message,tokenQuantity,selectedValue,'Buy')
      }
      console.log("handleCreateToken setSelectedValue", selectedValue)
    } finally {
      handleResetValue();
      setImageUrl();
      setMint();
      console.log("BuyToken setSelectedValue", selectedValue)
    }

  };

  //购买代币
  const BuyToken = async (Mint, token) => {
    const isConnected = await handleWalletConnection(anchorWallet, isConnect, wallet, 'Please connect your wallet first.');
    if (!isConnected) {
      return;
    }
    if (showWarning) {
      return;
    }
    setLoading(true)
    setTx();
    const provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: "finalized",
      commitment: "finalized"
    })
    setProvider(provider);
    const program = new Program(idl as AmiContract, provider)
    const signer = provider.wallet.publicKey;
    let eventCaptured = null
    let eventSlot = null
    program.addEventListener("tradeTokenEvent", (event, slot) => {
      console.log(event)
      eventCaptured = event
      eventSlot = slot
      if (eventCaptured && eventCaptured.mintAddr) {
        if(eventCaptured.signer.toBase58() !== address){
          return;
        }
        setIsSuccess(true);
        setMintPdaAddress(eventCaptured.mintAddr.toBase58());
        setTokenPdaAddress(eventCaptured.tokenVaultAddr.toBase58());
        setAlertMessage(`Buy ${eventCaptured.tokenAmount} $ ${newData.ticker} for ${eventCaptured.tradeSolAmount} SOL`);

        eventCaptured = null;
        setIsTrade(true);
      } else {
        setLoading(false);
        setIsSuccess(false);
        setAlertMessage("event not captured");
        setShowAlert(true);
      }
    })
    const mintPda = new anchor.web3.PublicKey(Mint)
    const tokenPda = new anchor.web3.PublicKey(token);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectSol = (solPrice && !sol) ? solPrice : selectedValue;
      console.log("Buy selectSol==",selectSol);
      const buyAmount: any = selectSol;
      const tx = await program.methods.buy(buyAmount).accounts({
        signer: signer,
        tokenVaultPda: tokenPda,
        mint: mintPda,
      }).rpc({
        commitment: "finalized",
        preflightCommitment: "finalized",
        skipPreflight: true,
        maxRetries: 3,
      });
      console.log("buyToken tx:", tx);
      console.log("buyToken tx:", "https://solscan.io/tx/" + tx);
      if (tx) {
        setTx(tx)
        // setShowAlert(true); 

      };


    } catch (error) {
      console.log("error=====", error.message)
      if(solPrice && !sol){
        handleCheckTx(error.message,selectedValue,solPrice,'Buy')
      }else{
        handleCheckTx(error.message,tokenQuantity,selectedValue,'Buy')
      }
      
    } finally {
      handleResetValue();
      console.log("BuyToken setSelectedValue", selectedValue)
    }


  }
  const SellToken = async (Mint, token) => {
    const isConnected = await handleWalletConnection(anchorWallet, isConnect, wallet, 'Please connect your wallet first.');
    if (!isConnected) {
      return;
    }
    if (showWarning) {
      return;
    }
    console.log("sellAmount",amount);
    if (Mint == "" || token == "" || amount == "") {
      setAlertMessage('Transaction failed');
      setShowAlert(true);
      return;
    }
    setLoading(true);
    setTx();
    // if (!wallet.isConnected) {
    //   await wallet.connect();
    // }
    const provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: "finalized",
      commitment: "finalized"
    })
    setProvider(provider);
    const program = new Program(idl as AmiContract, provider)
    const signer = provider.wallet.publicKey;

    let eventCaptured = null
    let eventSlot = null
    program.addEventListener("tradeTokenEvent", (event, slot) => {
      eventCaptured = event
      eventSlot = slot
      if (eventCaptured && eventCaptured.tokenAmount) {
        if(eventCaptured.signer.toBase58() !== address){
          return;
        }
        setIsSuccess(true);
        setAlertMessage(`Sell ${eventCaptured.tokenAmount} $ ${newData.ticker} for ${eventCaptured.tradeSolAmount} SOL`);

        eventCaptured = null;
        setIsTrade(true);
      } else {
        setAlertMessage("event not captured");
        setShowAlert(true);
      }
    })
    const mintPda = new anchor.web3.PublicKey(Mint)
    const tokenPda = new anchor.web3.PublicKey(token);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log("amount=====", amount);
      const sellAmount: any = new BN(typeof amount === 'string' ? amount : amount.toString());
      const tx = await program.methods.sell(sellAmount).accounts({
        signer: signer,
        tokenVaultPda: tokenPda,
        mint: mintPda,
      }).rpc({
        commitment: "finalized",
        preflightCommitment: "finalized",
        skipPreflight: true,
        maxRetries: 3,
      });
      console.log("sellToken tx:", tx);
      if (tx) {
        setTx(tx)
      }

    } catch (error) {
      console.log("sellToken Err: ", error)
      handleCheckTx(error.message,amount,solPrice,'Sell')
    } finally {
      handleResetValue();
      console.log("SellToken setSelectedValue", selectedValue)
    }
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
      setAlertMessage(`${status} ${value} $ ${newData.ticker} for ${sol} SOL`);
      setTx(tx);
    }else{
      const errKeys = Object.keys(response.meta.status.Err);
      handleCatchReset(errKeys);
    }
  }
  //下单交易
  const handlePlaceTrade = () => {
    if (selectedValue == "" || selectedValue == undefined) {
      setTx();
      setIsTrade(false);
      setAlertMessage("please enter a valid amount to trade.");
      setShowAlert(true); // 如果没有输入值，显示提示框  
      return;
    }
    handleCloseAlert();
    if (status == 0 && newData.mintPdaAddress == "" && newData.tokenPdaAddress == "") {
      handleConvertTokenImg();
      handleInitMint();
    } else if (newData.mintPdaAddress !== "" && newData.tokenPdaAddress !== "") {
      if (status == 0) {
        BuyToken(newData.mintPdaAddress, newData.tokenPdaAddress);
      } else {
        SellToken(newData.mintPdaAddress, newData.tokenPdaAddress);
      }
    } else if (newData.mintPdaAddress !== "" && newData.tokenPdaAddress == "") {
      setTx();
      setIsTrade(false);
      setAlertMessage("The token is initializing. Please refresh and try again later.");
      setShowAlert(true);
    }
  }
  const handleCloseAlert = () => {
    setTx();
    setIsTrade(false);
    setIsSuccess(false);
    setShowAlert(false); // 关闭提示框  
  };
  // 获取与钱包关联的所有Token账户  
  async function getTokenAccountsForWallet(connection, walletPk) {
    const response = await connection.getTokenAccountsByOwner(
      walletPk,
      {
        mint: new PublicKey(newData.mintPdaAddress),
      },
      'confirmed'
    );
    return response.value.map(accountInfo => accountInfo);
  }
  //  切换到sell获取token余额
  const handleTokenBalance = async (index) => {
    if (index == 1 && newData.mintPdaAddress !== "" && newData.mintPdaAddress !== undefined && address !== null) {
      // 钱包公钥  
      const walletPublicKey = new PublicKey(address);
      const tokenAccounts = await getTokenAccountsForWallet(connection, walletPublicKey);
      // 找到与特定代币程序ID关联的Token账户 
      if (tokenAccounts.length > 0) {
        const pubkeyString = tokenAccounts[0].pubkey.toString();
        if (pubkeyString) {
          const balanceResponse = await connection.getTokenAccountBalance(new PublicKey(pubkeyString));
          console.log("balanceResponse",balanceResponse);
          setBalance(balanceResponse.value);
        } else {
          return 0; // 或者抛出错误，表示没有找到与给定mint关联的Token账户  
        }
      }

    }
  }
  function getTop20Holder(mintAddr:string) {
    const connection = new Connection(endpoint)
    try {
        connection.getTokenLargestAccounts(new PublicKey(mintAddr)).then(res=>{ 
          console.log("connection",res.value)
          const foundItem = res.value.find(item => item.address == newData.tokenPdaAddress);
          if (foundItem) {
            const uiAmount = (foundItem.uiAmount - 200000000);
            console.log("uiAmount====",uiAmount);
            setTokenNum(uiAmount);
          } else {
            return null;
          }
        })
    } catch (error) {
        console.log("err:", error)
    }
}


  useEffect(() => {
    if(newData.tokenPdaAddress !== "") {
      getTop20Holder(newData.mintPdaAddress)
    }
  },[newData.tokenPdaAddress])
  useEffect(() => {
    if(newData.mintPdaAddress !== "") {
      handleTokenBalance(1);
    }
  },[newData.mintPdaAddress])
  

  // `text-[#489682] font-light bg-[#10F4B10A]`:`text-[#DD4947] font-light bg-[#DD49470A]
  const btnStyle = classify == 0 ? "text-[#489682] bg-[#10F4B10A] rounded-3xl h-[28px] w-[60px] min-w-[60px]" : "text-[#DD4947] bg-[#DD49470A] rounded-3xl h-[28px] w-[60px] min-w-[60px]";
  console.log(props, "props", classify, "=====", statusColor, "StatusColor")
  return (
    <div className="flex flex-row gap-10 w-full sm:w-[32%] justify-between items-start">
      <div className="flex sm:hidden w-full flex-col  text-xs sm:text-sm">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="light"
          classNames={{
            tabList:
              "w-full relative rounded-none grid grid-cols-3 gap-4 justify-center",
            cursor: "w-full shadow-none rounded bg-[#5a58f2] dark:bg-[#5a58f2]",
            tab: "bg-[#221F2E] rounded",
            tabContent:
              "text-[#F1F2F6] group-data-[selected=true]:text-[#F1F2F6] rounded-md",
            panel: "px-0"
          }}
        >
          <Tab key="Buy/Sell" title="Buy/Sell">
            <div className="flex flex-col gap-2 text-left border-none">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-row gap-3 items-center justify-between  text-sm">
                  <div className="flex flex-row gap-1 items-center justify-start">
                    <h1 className="text-base font-semibold max-w-14 overflow-hidden text-ellipsis whitespace-nowrap">{newData.name}</h1>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-sm font-semibold text-[#FACC15]">CA</p>
                    {newData.mintPdaAddress && newData.mintPdaAddress !== "" && (<CopyButton mint={newData.mintPdaAddress} />)}
                  </div>
                  <div>
                    <Link
                      isExternal
                      href={`${solScanBaseUrl}${props.data.address}${clusterParam}`}
                    >
                      <Button
                        variant="bordered"
                        size="sm"
                        className="border-[#10f4b11a] text-[#10F4B1] bg-[#10f4b11a] px-1"
                      >
                        View on solscan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              {props.tokenValue === 0 && (<div className="flex flex-col gap-4 rounded-t-lg mb-1 w-full p-6 bg-[#14111C] rounded-lg">
                <ButtonGroup className="flex flex-row w-full grid grid-cols-2 bg-[#221F2E] rounded-lg mb-4">
                  {btnClassify.map((item, index) => (
                    <Button
                      key={index}
                      className={`${index == classify && classify == 0 ? "text-[#fff] bg-[#489682]" : index == classify && classify == 1 ? "text-[#fff] bg-[#DD4947]" : "text-[#fff] bg-[#221F2E]"} rounded-lg `}
                      onClick={() => {
                        setClassify(index);
                        setStatus(index);
                        setSolPrice(null);
                        setStatusColor(index == 0 ? "#489682" : "#DD4947");
                      }}
                    >
                      {item.name}
                    </Button>
                  ))}
                </ButtonGroup>
                <div
                  className={`flex flex-row ${status == 0 ? "justify-between" : "justify-end"}`}
                  // className={` mb-4 flex flex-row justify-end`}
                >
                  {status == 0 && (
                    <Button className="text-[#489682] font-light bg-[#10F4B10A] rounded-md" onClick={() => {setSol(!sol);setSelectedValue("");setSolPrice(null)}}>
                      Switch to {sol ? newData.ticker : "SOL"}
                    </Button>
                  )}
                  <Button className={classify == 0 ? `text-[#489682] font-light bg-[#10F4B10A] rounded-md` : `text-[#DD4947] font-light bg-[#DD49470A] rounded-md`} onClick={() => { setHandleOpen(true) }}>
                    Set max slippage
                  </Button>
                </div>
                <div className="flex flex-row justify-between w-full">
                  {status == 0 ? (
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
                            {sol ? "SOL" : newData.ticker}
                          </p>
                          <div className="pointer-events-none flex items-center capitalize border-box border rounded-md py-2 px-[6px] max-w-full">
                            {sol ? (
                              <div className="w-[19px] h-[16px]">
                                <img
                                  src="/Vector.svg"
                                  className="w-[100%] h-[100%]"
                                />
                              </div>
                            ) : (
                              <div className="w-[19px] h-[16px]">
                                <img
                                  src={newData.image}
                                  className="w-[100%] h-[100%]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      }
                    />
                  ) : (
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
                          <p className="text-nowrap">{newData.ticker}</p>
                          <div className="pointer-events-none flex items-center capitalize border-box border rounded-md py-2 px-[6px] max-w-full">
                            <div className="w-[19px] h-[16px]">
                              <img
                                src={newData.image}
                                className="w-[100%] h-[100%]"
                              />
                            </div>
                          </div>
                        </div>
                      }
                    />
                  )}
                </div>
                {showWarning && <div className="flex flex-row text-[#DD4947] text-[10px]">
                  {warningMessage}
                </div>}
                {solPrice && <div className="text-[#9ca3af] text-[12px] text-left">{solPrice}SOL</div>}
                <div className="flex flex-row gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className={btnStyle}
                    onClick={() => {setSelectedValue("");setSolPrice(null)}}
                  >
                    Reset
                  </Button>
                  {(sol && status == 0 ? solValue : myCreated).map((item, index) => (
                    // {solValue.map((item, index) => (
                    <Button
                      key={index}
                      className={btnStyle}
                      onClick={() => handleSelect(item.value)}
                    >
                      {item.name}
                      {sol && status == 0 && "SOL"}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-row w-full">
                  <Button className={classify == 0 ? "bg-[#489682] w-full rounded-lg" : "bg-[#DD4947] w-full rounded-lg"} isLoading={loading} onClick={handlePlaceTrade}>
                    Place Trade
                  </Button>
                </div>
              </div>)}
              <div className="flex flex-row justify-between gap-8 w-full mb-10" id="buyCardKline" ref={parentEleRef} >
                {!isWideViewport && props.data?.ticker && <KLineChart tokenValue={props.tokenValue} detailData={props.data} />}
              </div>
            </div>
          </Tab>
          <Tab key="Trades" title="Trades">
            <Tradesmobile tokenId={props.data.id} />
          </Tab>
          <Tab key="Holder" title="Holder">
            <Holdermobile tokenId={props.data.id}  tokenAddress={props.data.tokenPdaAddress} mintPdaAddress={props.data.mintPdaAddress} />
          </Tab>
        </Tabs>
      </div>
      <div className="hidden sm:flex flex-col gap-4 rounded-t-lg mb-1 w-full p-6 bg-[#14111C] rounded-lg">
        <ButtonGroup className="flex flex-row w-full grid grid-cols-2 bg-[#221F2E] rounded-lg mb-4">
          {btnClassify.map((item, index) => (
            <Button
              key={index}
              className={`${index == classify && classify == 0 ? "text-[#fff] bg-[#489682]" : index == classify && classify == 1 ? "text-[#fff] bg-[#DD4947]" : "text-[#fff] bg-[#221F2E]"} rounded-lg `}
              onClick={() => {
                setClassify(index);
                setStatus(index);
                setSelectedValue("");
                setSolPrice(null);
                setTokenQuantity(null);
                setStatusColor(index == 0 ? "#489682" : "#DD4947");
              }}
            >
              {item.name}
            </Button>
          ))}
        </ButtonGroup>
        <div
          className={` mb-4 ${status == 0 ? "flex flex-row justify-between" : " flex flex-row justify-end"}`}
          // className={` mb-4 flex flex-row justify-end`}
        >
          {status == 0 && (
            <Button className="text-[#489682] font-light bg-[#10F4B10A] px-4 whitespace-wrap rounded-md" onClick={() => {setSol(!sol);setSelectedValue("");setSolPrice(null);setTokenQuantity(null);}}>
              Switch to {sol ? newData.ticker : "SOL"}
            </Button>
          )}
          <Button className={classify == 0 ? `text-[#489682] font-light bg-[#10F4B10A] rounded-md` : `text-[#DD4947] font-light bg-[#DD49470A] rounded-md`} onClick={() => { setHandleOpen(true) }}>
            Set max slippage
          </Button>
        </div>
        <div className="flex flex-row justify-between w-full">
          {status == 0 ? (
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
                    {sol ? "SOL" : newData.ticker}
                  </p>
                  <div className="pointer-events-none flex items-center capitalize border-box border rounded-md py-2 px-[6px] max-w-full">
                    {sol ? (
                      <div className="w-[19px] h-[16px]">
                        <img
                          src="/Vector.svg"
                          className="w-[100%] h-[100%]"
                        />
                      </div>
                    ) : (
                      <div className="w-[19px] h-[16px]">
                        <img
                          src={newData.image}
                          className="w-[100%] h-[100%]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              }
            />
          ) : (
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
                  <p className="text-nowrap">{newData.ticker}</p>
                  <div className="pointer-events-none flex items-center capitalize border-box border rounded-md py-2 px-[6px] max-w-full">
                    <div className="w-[19px] h-[16px]">
                      <img
                        src={newData.image}
                        className="w-[100%] h-[100%]"
                      />
                    </div>
                  </div>
                </div>
              }
            />
          )}
        </div>
        {showWarning && <div className="flex flex-row text-[#DD4947] text-[12px]">
          {warningMessage}
        </div>}
        {solPrice && <div className="text-[#9ca3af] text-[12px] text-left">{solPrice} SOL</div>}
        {tokenQuantity && <div className="text-[#9ca3af] text-[12px] text-left">{tokenQuantity} {newData.ticker}</div>}
        <div className="flex flex-row gap-2 flex-wrap">
          <Button
            size="sm"
            className={btnStyle}
            onClick={() => {setSelectedValue("");setSolPrice(null);setTokenQuantity(null);}}
          >
            Reset
          </Button>
          {(sol && status == 0 ? solValue : myCreated).map((item, index) => (
            // {solValue.map((item, index) => (
            <Button
              key={index}
              className={btnStyle}
              onClick={() => handleSelect(item.value)}
            >
              {item.name}
              {sol && status == 0 && "SOL"}
            </Button>
          ))}
        </div>
        <div className="flex flex-row w-full">
          <Button className={classify == 0 ? "bg-[#489682] w-full rounded-lg" : "bg-[#DD4947] w-full rounded-lg"} isLoading={loading} onClick={handlePlaceTrade}>
            Place Trade
          </Button>
        </div>
      </div>

      <Slippage handleOpen={handleOpen} setClose={() => { setHandleOpen(false) }} />
      {showAlert && (
        <div className={`flex flex-col alert-box sm:w-[400px] sm:right-5 sm:bottom-5 text-left ${isSuccess ? 'bg-[#EDFDF5] text-[#14181F] border border-[#D0F3E2]' : 'bg-[#FDEDED] text-[#14181F] border border-[#FADBDB]'}`}>
          <div className="flex flex-row justify-between items-center">
            <h1>{!selectedValue && !isTrade ? "invalid amount" : isSuccess ? 'Transaction confirmed' : 'Transaction failed'}</h1>
            <button onClick={handleCloseAlert} className={`alert-close-btn ${isSuccess ? 'text-[#0D7544]' : 'text-[#C42525]'} text-[24px]`}>
              ×
            </button>
          </div>
          <span>{alertMessage}</span>
          {txUrl && (<Link
            isExternal
            aria-label="Discord"
            href={txUrl}
          >
            {isTrade && (<div className={`${isSuccess ? 'text-[#0D7544]' : 'text-[#C42525]'}`}>View tx</div>)}
          </Link>)}

        </div>
      )}
    </div>
  );
};
