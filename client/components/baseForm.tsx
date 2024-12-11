"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { Button, Input, Textarea, Image } from "@nextui-org/react";
import { AssetsIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { CreateToken } from "@/components/CreateToken";
import {
  ConnectionProvider,
  useAnchorWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Api } from "@/src/utils/api";
import { useAiImageSelected } from "@/components/overlayer";
import { PinataSDK } from "pinata-web3";
import { CreateShare } from "@/components/CreateShare";
const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;


const PINATA_API_KEY = process.env.NEXT_PUBLIC_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_APP_PINATA_SECRET_API_KEY;
const PINATA_ENDPOINT = process.env.NEXT_PUBLIC_APP_PINATA_ENDPOINT;
const PINATA_JWT = process.env.NEXT_PUBLIC_APP_PINATA_JWT;
const PINATA_URL = process.env.NEXT_PUBLIC_APP_PINATA_URL;

export const BaseForm = (props) => {
  // const network = WalletAdapterNetwork.Devnet;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const router = useRouter();
  const [isSHowMore, setShowMore] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); //上传图片
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    image: null,
    metadata: "",
    addr: "",
    x_link: "",
    teltgram_link: "",
    discord_link: "",
    user_website: "",
    type: "",
  }); //表单数据
  const wallet = useAnchorWallet();
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { selectImage, setSelectImage } = useAiImageSelected();//AI生成的图片
  const [pinataUrl, setPinataUrl] = useState("");
  const [handleShareOpen, setHandleShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [error, setError] = useState({});
  const [errors, setErrors] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); //提示信息  
  const [handleOpen, setHandleOpen] = useState(false);
  const address = useLocalGlobalStore((state) => state.wallet.address);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const isConnect = useLocalGlobalStore(state => state.isConnect);
  let imageUrl = "";
  //表单必填项
  const initialFormData = {
    name: "",
    ticker: "",
    description: "",
    image: null,
  };
  const emailFormData = {
    x_link: "",
    teltgram_link: "",
    discord_link: "",
    user_website: "",
  };
  // 调用 POST 接口
  const apiUrl = PRE_URL + "/token/generateToken";
   // 定义一个公共方法
   function handleWalletNotConnected(message) {
    setAlertMessage(message);
    setShowAlert(true);
  }
  //获取表单填入的数据
  const handleChange = (e) => {
    if (isConnect) {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setShowAlert(true)
    }
  };
  // 校验网址格式  
  const validateURL = (url) => {
    // 这是一个简单的URL正则表达式，它可能不涵盖所有有效的URL格式  
    // 根据需要，你可以使用更复杂的正则表达式或库来校验URL  
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  };

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

  const handleBlur = () => {
    let formErrors = {};
    Object.keys(emailFormData).forEach((key) => {
      if (formData[key] !== "" && !validateURL(formData[key])) {
        formErrors[key] = 'Please enter the link.';
      }
    });
    setError(formErrors);
    return Object.keys(formErrors).length === 0;
  }
  // 循环校验表单字段
  const validateForm = () => {
    let formErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && initialFormData[key] !== undefined) {
        formErrors[key] = `The ${key} field is required`;
      } else if (typeof formData[key] == 'string' && formData[key].indexOf('&') > -1) {
        formErrors[key] = `The '&' character should not appear in the ${key}.`;
      } else if (key == "name" || key == "ticker" || key == "description") {
        if (key == "description" && formData[key].length > 500) {
          formErrors[key] = `${key} must be 500 characters or less.`;
        } else if (key !== "description" && formData[key].length > 100) {
          formErrors[key] = `${key} must be 100 characters or less.`;
        }
      }
    });

    setError(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  //生成代币
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShareLoading(true);
    setErrors(null);
    console.log(formData.image);
    try {
      if (validateForm() && handleBlur()) {
        setHandleOpen(true);
      }
    } catch (error) {
      setErrors(error);
    } finally {
      setShareLoading(false);
    }
  };

  //input框样式
  const inputStyle = {
    base: "w-full text-left",
    input: ["bg-[#221F2E]", "hover:bg-[#221F2E]", "px-3"],
    // innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    inputWrapper: [
      "bg-[#221F2E]",
      "hover:bg-[#221F2E]",
      "dark:hover:bg-[#221F2E]",
      "group-data-[focus=true]:bg-[#221F2E]",
      "dark:group-data-[focus=true]:bg-[#221F2E]",
      "border",
      "border-[#d9d9d912]",
      "data-[hover=true]:bg-[#221F2E]",
      "px-0",
    ],
  };
  const fileInputRef = useRef(null);
  const handleImageClick = () => {
    if (isConnect) {
      fileInputRef.current.click();
    } else {
      setShowAlert(true)
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(window.URL.createObjectURL(file));
      setFormData({
        ...formData,
        image: file,
        imgUrl: window.URL.createObjectURL(file),
      });
    }
  };
  useEffect(() => {
    if (pinataUrl !== "") {
      handleShare();
    }
  }, [pinataUrl])

  //上传json文件到 Pinata
  // const handleConvertTokenImg = async (url) => {
  //   setShareLoading(true);
  //   setErrors(null);
  //   setPinataUrl(url)
  //   // const file = req.file as Express.Multer.File;
  //   const data = {
  //     name: formData.name,
  //     symbol: formData.ticker,
  //     description: formData.description,
  //     image: url
  //   }
  //   try {
  //     // 上传文件到 Pinata
  //     const pinata = new PinataSDK({
  //       pinataJwt: PINATA_JWT,
  //       pinataGateway: "example-gateway.mypinata.cloud",
  //     });

  //     const upload = await pinata.upload.json(data)
  //     let ipfsHash = "";
  //     if (upload.IpfsHash) {
  //       ipfsHash = upload.IpfsHash; // 获取 IpfsHash
  //       imageUrl = PINATA_URL + `${ipfsHash}`;

  //     }
  //   } catch (error) {
  //     setErrors(error);
  //     setShareLoading(false);
  //   }
  // };

  //上传文件到 Pinata
  const handleConvertImg = async (image) => {
    setShareLoading(true);
    setErrors(null);
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
        imageUrl = PINATA_URL + `${ipfsHash}`;
        setPinataUrl(PINATA_URL + `${ipfsHash}`)

      }
    } catch (error) {
      setErrors(error);
      setShareLoading(false);
    }
  };
  //分享到推特
  const handleToX = (id) => {
    const url = `https://x.com/intent/post?text=$${formData.ticker} ${formData.description} @ai_mint_  %23aimint %23meme https://aimint.meme/tokenDetails?id=${id}`;
    window.open(url, '_blank');
  }
  const handleToTG = (id) => {
    const url = `https://t.me/share/url?url=aimint.meme&text=$${formData.ticker} ${formData.description} @ai_mint_  %23aimint %23meme https://aimint.meme/tokenDetails?id=${id}`;
    window.open(url, '_blank');
  }

  const handleShareConfirm = async (type) => {
    setErrors(null);
    try {
      if (validateForm() && handleBlur()) {
        const response = await fetch(apiUrl, {
          method: "POST", // 指定请求方法为 POST
          headers: {
            'Content-Type': 'application/json',
            userid: userId,
          },
          body: JSON.stringify({ ...formData, image: selectImage ? selectImage : pinataUrl }), // 将参数对象序列化为 JSON 格式并作为请求主体发送
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const responseData = await response.json(); // 解析响应为 JSON 格式

        if (type == 'X') {
          handleToX(responseData.data.id);
        } else {
          handleToTG(responseData.data.id);
        }
        router.push(`/tokensDetail?id=${responseData.data.id}`)
        setSelectImage(0);
      }
    } catch (error) {
      setErrors(error);
    } finally {
      setShareLoading(false);

    }
  }
  const handleShare = async () => {
    setShareLoading(true);
    setErrors(null);
    console.log(formData.image);
    try {
      setHandleShareOpen(true)
    } catch (error) {
      setErrors(error);
    } finally {
      setShareLoading(false);
    }
  }
  useEffect(() => {
    if (selectImage) {
      setSelectedFile(selectImage);
      setFormData({
        ...formData,
        "image": selectImage,
      });
    }
  }, [selectImage, userId]);

  if (errors) return <div>Error: {errors.message}</div>;
  return (
    <>
      <form
        encType="multipart/form-data"
        className="flex flex-col w-full gap-4"
        onSubmit={handleSubmit}
      >
        <Input
          label="Name"
          name="name"
          isRequired
          value={formData.name}
          onChange={handleChange}
          labelPlacement="outside"
          placeholder=" "
          classNames={inputStyle}
          isInvalid={error.name ? true : false}
          errorMessage={error.name}
        />
        <Input
          label="Ticker"
          name="ticker"
          isRequired
          value={formData.ticker}
          onChange={handleChange}
          labelPlacement="outside"
          placeholder=" "
          classNames={inputStyle}
          isInvalid={error.ticker ? true : false}
          errorMessage={error.ticker}
        />
        <Textarea
          label="Description"
          name="description"
          isRequired
          value={formData.description}
          onChange={handleChange}
          placeholder=" "
          labelPlacement="outside"
          classNames={inputStyle}
          isInvalid={error.description ? true : false}
          errorMessage={error.description}
        />
        <div className="text-center text-small">
          <div className="flex w-full mb-2">
            Image <span className="text-[#f31260]">*</span>{" "}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/jpeg, image/gif, image/png, image/bmp"
            className="hidden"
          />
          {selectedFile ? (
            <div className="md:flex inline-block text-center justify-start w-full gap-7 my-2 relative z-9">
              <div className="flex justify-between items-center w-full md:w-[100%] h-14 md:h-24 bg-[#221F2E] rounded-[12px] p-6">
                <img
                  src={selectedFile}
                  alt=""
                  className="preview md:w-[62px] md:h-[62px] w-[32px] h-[32px] rounded-[8.4px] mr-[12px]"
                ></img>
                <div className="md:w-[32px] md:h-[32px]  flex justify-center content-center items-center">
                  <img
                    src="/delete.svg"
                    alt=""
                    className="w-[28px] h-[28px]"
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                  ></img>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col justify-start text-left">
              <Image
                src="/Frame 30.png"
                width="100%"
                className="h-[105px] w-full object-cover"
                onClick={handleImageClick}
              />
              {error.image && (
                <span className="text-[#f31260] text-[12px]">
                  {error.image}
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          className="flex text-[#5A58F2] cursor-pointer justify-start w-48 bg-transparent"
          onClick={() => setShowMore((prev) => !prev)}
        >
          <p>Show more options</p>{" "}
          {!isSHowMore ? (
            <Image src="/arrowDown.svg" />
          ) : (
            <AssetsIcon className="ml-2 " />
          )}
        </Button>
        {isSHowMore ? (
          <div className="flex flex-col text-center justify-center items-center gap-4">
            <Input
              label="X link"
              labelPlacement="outside"
              name="x_link"
              value={formData.x_link}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Optional"
              classNames={inputStyle}
              isInvalid={error.x_link ? true : false}
              errorMessage={error.x_link}
            />
            <Input
              label="Telegram link"
              labelPlacement="outside"
              name="teltgram_link"
              value={formData.teltgram_link}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Optional"
              classNames={inputStyle}
              isInvalid={error.teltgram_link ? true : false}
              errorMessage={error.teltgram_link}
            />
            <Input
              label="Discord link"
              labelPlacement="outside"
              name="discord_link"
              value={formData.discord_link}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Optional"
              classNames={inputStyle}
              isInvalid={error.discord_link ? true : false}
              errorMessage={error.discord_link}
            />
            <Input
              label="Website"
              labelPlacement="outside"
              name="user_website"
              value={formData.user_website}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Optional"
              classNames={inputStyle}
              isInvalid={error.user_website ? true : false}
              errorMessage={error.user_website}
            />
          </div>
        ) : (
          <></>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            color="primary"
            type="submit"
            variant="bordered"
            isLoading={loading}
            className="border-[#5A58F2] text-[#5A58F2]"
          >
            CREATE COIN
          </Button>
          <Button color="primary" className="bg-[#5A58F2]" isLoading={shareLoading} onClick={() => {
            if (validateForm() && handleBlur()) {
              selectImage ? handleShare() : handleConvertImg(formData.image)
            }
          }} >
            Sharing is Creating
          </Button>
        </div>
      </form>
      <div className="flex flex-row item-center justify-center">
      Cost to deploy: ~0.018 SOL
      </div>
      {showAlert && (
          <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
            <Image src="/StatusIcon.svg" className="w-5" />{alertMessage}</div>
        )}
      <CreateToken
        handleOpen={handleOpen}
        setClose={() => {
          setHandleOpen(false);
        }}
        formData={formData}
      />
      <CreateShare handleOpen={handleShareOpen} setClose={() => { setHandleShareOpen(false) }} handleShareConfirm={handleShareConfirm} detailData={{ ...formData, selectImage, pinataUrl }} />
      {showAlert && (
        <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
          <Image src="/StatusIcon.svg" className="w-5" />Please connect your wallet first.</div>
      )}
    </>
  );
};
