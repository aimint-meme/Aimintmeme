"use client";
import React, { useEffect, useRef, useState } from "react";
import html2canvas from 'html2canvas';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  Image as NextUiImage,
} from "@nextui-org/react";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { formatTokenCount } from '@/src/utils/globalUtils';

export const TokenShare = ({ handleOpen, setClose, detailData, solPrice }) => {
  const address = useLocalGlobalStore(state => state.wallet.address);
  const avatar = useLocalGlobalStore(state => state.wallet.avatar);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [imageSrc, setImageSrc] = useState('')
  const [tokenAvatar, setTokenAvatar] = useState()
  const [userAvatar, setUserAvatar] = useState()
  const [showCopySuccessAlert, setShowCopySuccessAlert] = useState(false);
  const [showDownloadSuccessAlert, setShowDownloadSuccessAlert] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    if (detailData?.image) {
      getBase64(detailData?.image, 'token')
    }
    if (avatar) {
      getBase64(avatar, 'user')
    }
  }, [detailData?.image, avatar]);

  const handleCaptureClick = async () => {
    if (componentRef.current) {
      try {
        const canvas = await html2canvas(componentRef.current, { scale: 1.02, removeContainer: true });
        const imgDataUrl = canvas.toDataURL('image/png');

        setImageSrc(imgDataUrl)
        moreDivDelete()
      } catch (error) {
        console.error('Error capturing the component:', error);
      }
    }
  };

  const moreDivDelete = () => {
    // 获取body元素
    var body = document.body;

    // 获取body下的所有直接子div元素
    var divs = Array.from(body.children).filter(function (child) {
      // 检查子元素是否是div
      return child.tagName === 'DIV';
    });

    // 创建一个数组用于存储需要移除的div元素
    var divsToRemove = [];

    // 遍历这些div元素
    for (var i = 0; i < divs.length; i++) {
      var div = divs[i];

      // 检查div中是否包含直接的img子元素
      // 使用Array.prototype.some来简化查找过程
      var containsImg = Array.prototype.some.call(div.children, function (child) {
        return child.tagName === 'IMG';
      });

      // 如果div包含直接的img子元素，则将其加入移除列表
      if (containsImg) {
        divsToRemove.push(div);
      }
    }

    // 遍历移除列表，并从DOM中移除这些div元素
    divsToRemove.forEach(function (divToRemove) {
      divToRemove.parentNode.removeChild(divToRemove);
    });
  }

  useEffect(() => {
    if (handleOpen) {
      setTimeout(() => {
        handleCaptureClick()
      }, 500);
    }
  }, [handleOpen])

  useEffect(() => {
    handleOpen && onOpen();
  }, [handleOpen]);

  useEffect(() => {
    if (showCopySuccessAlert) {
      // 设置定时器，3秒后隐藏提示框
      const timer = setTimeout(() => {
        setShowCopySuccessAlert(false);
      }, 3000);

      // 清除定时器，防止组件卸载时继续执行
      return () => clearTimeout(timer);
    }
  }, [showCopySuccessAlert]);

  useEffect(() => {
    if (showDownloadSuccessAlert) {
      // 设置定时器，3秒后隐藏提示框
      const timer = setTimeout(() => {
        setShowDownloadSuccessAlert(false);
      }, 3000);

      // 清除定时器，防止组件卸载时继续执行
      return () => clearTimeout(timer);
    }
  }, [showDownloadSuccessAlert]);

  const handleToX = () => {
    window.open(`https://x.com/intent/post?text=$${detailData?.ticker} ${detailData?.description} %23aimint %23meme @ai_mint_  ${window.location.href}`, '_blank');
  }

  const handleToTG = () => {
    window.open(`https://t.me/share/url?url=aimint.meme&text=$${detailData?.ticker} ${detailData?.description} @ai_mint_ %23aimint %23meme ${window.location.href} %23aimint.meme 
https://aimint.meme/sol/address/${detailData?.tokenPdaAddress}`, '_blank');
  }

  const getBase64 = async (imgUrl, type) => {
    window.URL = window.URL || window.webkitURL;
    var xhr = new XMLHttpRequest();
    xhr.open("get", imgUrl, true);
    // 至关重要
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status == 200) {
        //得到一个blob对象
        var blob = this.response;
        // 至关重要
        let oFileReader = new FileReader();
        oFileReader.onloadend = function (e) {
          // 此处拿到的已经是 base64的图片了
          let base64 = e.target.result;
          if (type == 'token') {
            setTokenAvatar(base64)
          } else {
            setUserAvatar(base64)
          }
        };
        oFileReader.readAsDataURL(blob);
      }
    }
    xhr.send();
  }

  /**
 * 根据图片路径下载
 * @param imgsrc 图片路径
 * @param name 下载图片名称
 * @param type 格式图片，可选，默认png ，可选 png/jpeg
 */
  const downloadImage = (imgsrc: string, name: string, type: string = 'png') => {
    let image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      let context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, image.width, image.height);
      let url = canvas.toDataURL(`image/${type}`); //得到图片的base64编码数据
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = name || "pic"; // 设置图片名称
      a.href = url; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    }
    //将资源链接赋值过去，才能触发image.onload 事件
    image.src = imgsrc
    // 监听错误事件  
    image.onerror = function () {
      console.error('Failed to load image.');
      // 可以在这里添加代码来处理加载失败的逻辑  
    };
    setShowDownloadSuccessAlert(true)
  }

  // Image对象转base64
  const imageToBase64 = (image) => {
    let canvas = document.createElement('canvas')

    canvas.width = image.width
    canvas.height = image.height

    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, image.width, image.height)

    return canvas.toDataURL('image/png')
  }

  // 回调方式 Image url 转base64
  const urlToBase64 = (url, callback = null) => {
    let image = new Image()

    image.setAttribute('crossOrigin', 'Anonymous')
    image.src = url

    image.onload = function () {
      let dataURL = imageToBase64(image)
      if (callback) {
        callback(dataURL)
      }
    }
  }

  // Promise方式 Image url 转base64
  const urlToBase64Async = (url) => {
    return new Promise((resolve, reject) => {
      urlToBase64(url, (data) => {
        resolve(data)
      })
    })
  }

  /**
   * 从base64编码中解析图片信息
   * @param {String} base64 
   * eg: data:image/gif;base64,R0lGODlhAQABAPcAAAuvCwu1Cwy6DAy/DA
   * 
   * @returns {Object}
   * eg: 
   * {
      type: 'image/gif',
      ext: 'gif',
      data: 'R0lGODlhAQABAPcAAAuvCwu1Cwy6DAy/DA'
   */
  const parseBase64 = (base64) => {
    let re = new RegExp('data:(?<type>.*?);base64,(?<data>.*)')
    let res = re.exec(base64)

    if (res) {
      return {
        type: res.groups.type,
        ext: res.groups.type.split('/').slice(-1)[0],
        data: res.groups.data,
      }
    }
  }

  /**
   * 拷贝图片到剪切板
   * @param {*} imageUrl 
   */
  const copyImageToClipboard = async (imageUrl) => {
    const base64Url = await urlToBase64Async(imageUrl)

    const parsedBase64 = parseBase64(base64Url)

    let type = parsedBase64.type

    //将base64转为Blob类型
    let bytes = atob(parsedBase64.data)
    let ab = new ArrayBuffer(bytes.length)
    let ua = new Uint8Array(ab)

    for (let i = 0; i < bytes.length; i++) {
      ua[i] = bytes.charCodeAt(i)
    }

    let blob = new Blob([ab], { type })

    navigator.clipboard.write([new ClipboardItem({ [type]: blob })])
    setShowCopySuccessAlert(true)
  }

  const handleDownload = () => {
    downloadImage(imageSrc, 'image')
  }

  const handleCopy = () => {
    copyImageToClipboard(imageSrc)
  }

  const formatNumber = (numStr) => {
    // 找到小数点的位置  
    let decimalPointIndex = numStr.indexOf('.');

    // 如果没有小数点，则直接返回原数字字符串  
    if (decimalPointIndex === -1) {
      return numStr;
    }

    // 截取小数点后的部分  
    let decimalPart = numStr.slice(decimalPointIndex + 1);

    // 计算小数点后紧跟的零的个数  
    let zeroCount = 0;
    while (decimalPart[zeroCount] === '0') {
      zeroCount++;
    }

    // 如果零的个数大于4，则格式化字符串  
    if (zeroCount > 4) {
      // 截取小数点后非零部分的开始几位  
      let nonZeroPrefix = decimalPart.slice(zeroCount, zeroCount + 3);
      // 构造格式化后的字符串  
      let formattedStr = `0.0{${zeroCount}}${nonZeroPrefix}`;
      return formattedStr;
    } else {
      // 如果零的个数不超过4，则直接返回原始的小数形式（这里进行了截断处理）  
      return parseFloat(numStr).toFixed(9);
    }
  }

  const data = [
    { id: '1', name: 'Market cap', num: formatTokenCount(parseFloat(detailData.marketCap * solPrice).toFixed(2)) },
    { id: '2', name: 'Price', num: detailData.avePri && formatNumber((detailData.avePri).toString()) || 0 },
    { id: '3', name: 'Virtual Liquidity', num: parseFloat(detailData.poolSolBalance).toFixed(2) },
    { id: '4', name: 'Volume', num: formatTokenCount(parseFloat(detailData.volume * solPrice).toFixed(2)) }
  ]

  const shareButton = <div className="md:relative md:h-auto h-[140px] absolute bottom-0 md:bg-transparent bg-[#0C0C16E5] flex flex-row justify-center items-center w-[100%] md:gap-12 gap-6 sm:gap-14 md:pt-7 pt-4 md:rounded-[0] rounded-[8px]">
    <div className="relative flex flex-col items-center justify-center gap-1 text-[14px]">
      <Button
        isIconOnly
        variant="bordered"
        className="border border-[#ffffff] min-w-8 w-8 h-8 rounded-small sm:min-w-10 sm:w-10 sm:h-10 sm:rounded-medium"
        onClick={handleToX}
      >
        <NextUiImage src="/twitterLogo.svg" className="md:w-6 w-5" />
      </Button>
      <div>X</div>
    </div>
    <div className="flex flex-col items-center justify-center gap-1 text-[14px]">
      <Button
        isIconOnly
        variant="bordered"
        className="border border-[#ffffff] min-w-8 w-8 h-8 rounded-small sm:min-w-10 sm:w-10 sm:h-10 sm:rounded-medium"
        onClick={handleToTG}
      >
        <NextUiImage src="/TG.svg" className="md:w-6 w-5" />
      </Button>
      <div>TG</div>
    </div>
    <div className="flex flex-col items-center justify-center gap-1 text-[14px]">
      <Button
        isIconOnly
        variant="bordered"
        className="border border-[#ffffff] min-w-8 w-8 h-8 rounded-small sm:min-w-10 sm:w-10 sm:h-10 sm:rounded-medium"
        onClick={handleDownload}
      >
        <NextUiImage src="/download.svg" className="md:w-7 w-6" />
      </Button>
      <div>Download</div>
    </div>
    <div className="flex flex-col items-center justify-center gap-1 text-[14px]">
      <Button
        isIconOnly
        variant="bordered"
        className="border border-[#ffffff] min-w-8 w-8 h-8 rounded-small sm:min-w-10 sm:w-10 sm:h-10 sm:rounded-medium"
      >
        <div id="image"><NextUiImage id="image" src="/Copy.svg" className="md:w-5 w-4 rounded-none" onClick={handleCopy} /></div>
      </Button>
      <div>Copy</div>
    </div>
    <span className="md:hidden inline-block absolute top-3 right-3" onMouseUp={() => { onClose(); setClose(); }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4L20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20L20 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </div>

  return (
    <>
      <Modal
        placement="center"
        backdrop="transparent"
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        hideCloseButton
        className="w-[480px] md:m-6 md:py-6 py-0 bg-[#14111C] m-0"
      >
        <ModalContent>
          <ModalBody className="flex flex-col justify-center h-[100%] md:flex-1 md:gap-3 md:px-6 md:py-2 flex-1 gap-0 px-0 py-0">
            <div className="md:flex flex-row justify-between md:mb-5 mb-0 hidden">
              <div className="md:text-2xl text-xl">Share</div>
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
            <div className="flex flex-col justify-center items-center w-[100%] md:gap-2 gap-0 h-[100%]">
              <div ref={componentRef} className="px-2 md:h-[565px] md:w-[72%] overflow-auto bg-[url('/tokenShare.png')]  bg-no-repeat bg-center bg-[length:100%_100%] relative">
                <div className="flex flex-row items-center justify-start p-1 border-[#0C0C16E0] rounded-3xl  gap-1 relative md:top-[9px] top-[11px] left-[-2px]">
                  <NextUiImage src={userAvatar} className="w-[14px] h-[14px] rounded-full" />
                  <div className="max-w-[72px] text-[#130D23] md:text-[10px] text-[11px] font-medium">{address?.slice(0, 4) + "..." + address?.slice(-4)}</div>
                </div>
                <div className="flex flex-row justify-start items-center gap-2 md:mt-[7rem] mt-[7rem]"><img src={tokenAvatar} className="w-[32px] h-[32px] rounded-full inline-block" /><span className="md:text-[20px] text-[21px] font-normal">${detailData?.ticker}</span></div>
                <div className="mt-4 w-full justify-between text-left items-start grid grid-cols-2 sm:grid-cols- gap-3">
                  {data.map((item, index) => (
                    <div key={index} className="border-0 border-[#9191AA] py-3 px-3 md:pl-[1.4rem] pl-[1.4rem] rounded-lg flex flex-col gap-2 bg-[url('/tokenShareBlock.svg')] bg-no-repeat bg-cover ">
                      <h1 className="md:text-[13px] font-2xl font-normal text-nowrap">{item.name}{item.id == '2' ? <span className={`${detailData?.markup?.indexOf('-') > -1 ? 'text-[#ff3e80]' : 'text-[#10F4B1]'} ml-2`}>{detailData?.markup}</span> : null}</h1>
                      <p className="text-[#5a58f2] md:text-[14px] font-2xl font-semibold">{index == 2 || index == 1 ? `` : '$'}{item.num}{index == 1 || index == 2 ? `Sol` : ''}</p>
                    </div>
                  ))}
                </div>
                <div className="scale-[0.8] flex flex-row justify-center items-center w-full md:mt-[154px] mt-[200px]">
                  <div className="flex flex-row items-center justify-end p-1 border-1 border-[#0C0C16E0] rounded-3xl  gap-1 mt-5 mr-4">
                    <NextUiImage src={userAvatar} className="w-[14px] h-[14px] rounded-full" />
                    <div className="max-w-[72px] text-[#130D23] text-[10px] font-medium">{address?.slice(0, 4) + "..." + address?.slice(-4)}</div>
                  </div>
                </div>
                {/* <div className="w-full flex flex-col justify-center items-center gap-2 px-5 absolute bottom-20 left-0">
                  <div className="w-full text-left text-[12px]">30D Realized Profit</div>
                  <div className="w-full text-left text-[20px] font-semibold">$20.8K</div>
                  <div className="w-full text-left text-[#95959F]">Unrealized Profits:<span className="text-[#F9F9FF] text-[16px]">$80.9</span></div>
                  <div className="flex flex-row justify-between items-center w-full text-[14px] text-[#95959F]">
                    <div>Total Profit: $0</div>
                    <div>30D TXs: <span className="text-[#10F4B1]">4</span>/<span className="text-[#FF3E80]">1</span></div>
                  </div>
                </div> */}
              </div>
              {shareButton}
              {showCopySuccessAlert && (
                <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#0A251D] text-[#42BE65] border-l-4 border-[#42BE65] flex-1 px-8 py-3">
                  Copy successfully
                </div>
              )}
              {showDownloadSuccessAlert && (
                <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#0A251D] text-[#42BE65] border-l-4 border-[#42BE65] flex-1 px-8 py-3">
                  Download successfully
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
