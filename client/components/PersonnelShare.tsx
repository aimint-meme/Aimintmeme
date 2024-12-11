"use client";
import React, { useEffect, useState, useRef } from "react";
import html2canvas from 'html2canvas';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure, Spinner,
  Image as NextUiImage,
} from "@nextui-org/react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;

export const PersonnelShare = ({ handleOpen, setClose, id, username }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  // 控制提示框的显示
  const [showCopySuccessAlert, setShowCopySuccessAlert] = useState(false);
  const componentRef = useRef(null);
  const [showDownloadSuccessAlert, setShowDownloadSuccessAlert] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [baseAvatar, setBaseAvatar] = useState(null);
  const avatar = useLocalGlobalStore(state => state.wallet.avatar);
  const address = useLocalGlobalStore(state => state.wallet.address);
  const userId = useLocalGlobalStore(state => state.wallet.userId);
  const apiUrl = "/user/sharePoster";

  useEffect(() => {
    if (avatar) {
      getBase64(avatar)
    }
  }, [avatar]);
  const getBase64 = async (imgUrl) => {
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
          setBaseAvatar(base64)
        };
        oFileReader.readAsDataURL(blob);
      }
    }
    xhr.send();
  }
  const handleCaptureClick = async () => {
    if (componentRef.current) {
      try {
        const canvas = await html2canvas(componentRef.current, { removeContainer: true });
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
  //分享内容接口
  const handleSharePoster = async () => {
    setLoading(true);
    try {
      const data = await Api.post(apiUrl, { "userId": id }, userId);
      setItems({ ...data });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }
  useEffect(() => {
    if (address !== null && userId !== null && id !== null && isOpen) {
      handleSharePoster();
    }
  }, [id, address, userId, isOpen])
  useEffect(() => {
    setTimeout(() => {
      handleCaptureClick()
    }, 500);
  })
  // 使用useEffect来设置定时器，自动隐藏提示框
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

  useEffect(() => {
    handleOpen && onOpen();
  }, [handleOpen]);
  //分享到推特
  const handleToX = () => {
    window.open(`https://x.com/intent/post?text=${username} 24H Volume:$${items.volume} ，aimint.meme uses AI to quickly launch tokens, $48,000 to external transactions easier, share and create your meme it will be free! @ai_mint_ %23aimint %23meme ${window.location.href}`, '_blank');
  }

  const handleToTG = () => {
    window.open(`https://t.me/share/url?url=aimint.meme&text=${username} 24H Volume:$${items.volume} ，aimint.meme uses AI to quickly launch tokens, $48,000 to external transactions easier, share and create your meme it will be free! @ai_mint_ %23aimint %23meme ${window.location.href}`, '_blank');
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
  //下载图片
  const handleDownload = () => {
    downloadImage(imageSrc, 'image')
  }
  //复制
  const handleCopy = () => {
    copyImageToClipboard(imageSrc)
  }

  if (loading) return <Spinner />;
  // if (error) return <div>Error: {error.message}</div>; 

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
        className="w-[480px] m-6 md:py-6 py-3 bg-[#14111C]"
      >
        <ModalContent>
          <ModalBody className="flex flex-col justify-center h-[90%]">
            <div className="flex flex-row justify-between md:mb-5 mb-0">
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
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M4 20L20 4"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center w-[100%] gap-2 h-[100%]">
              <div ref={componentRef} className="h-[390px] w-[280px] sm:w-[320px] sm:h-[441px] bg-[url('/share3.svg')] bg-no-repeat bg-center bg-[length:100%_100%] relative">
                <div className="flex flex-row justify-end items-center w-full">
                  <div className="flex flex-row items-center justify-center p-2 w-[93px] h-[20px] leading-7 gap-1 mt-[15px]">
                    <img src={baseAvatar} className="w-[16px] h-[16px] rounded-full" />
                    <p className="max-w-[72px] text-[#000] text-[10px] font-medium h-[28px] leading-7 text-ellipsis overflow-hidden">{address}</p>
                  </div>
                </div>
                <div className="w-full flex flex-col justify-center items-center gap-2 px-9 absolute top-[47%] left-0">
                  <div className="w-full text-left text-[12px]">30D TO DEX:</div>
                  <div className="w-full text-left text-[20px] font-semibold">{items.toDex}</div>
                  <div className="flex flex-row justify-between items-center w-full text-left text-[#95959F]">
                    <div>Held:<span className="text-[#F9F9FF] text-[16px]">{items.held}</span></div>
                    <div>24H TXs: <span className="text-[#10F4B1]">{items.heldbuyTotal}</span>/<span className="text-[#FF3E80]">{items.heldsellTotal}</span></div>
                  </div>
                  <div className="flex flex-row justify-between items-center w-full text-[#95959F]">
                    <div>Created: <span className="text-[#F9F9FF] text-[16px]">{items.created}</span></div>
                    <div>24H TXs: <span className="text-[#10F4B1]">{items.createdbuyTotal}</span>/<span className="text-[#FF3E80]">{items.createdsellTotal}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-center items-center w-[80%] gap-4 sm:gap-9 pt-4 pb-4">
                <div className="flex flex-col items-center justify-center gap-1 text-[14px]">
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
                    <div id="image"><NextUiImage id="image" src="/Copy.svg" className="sm:w-5 w-4 rounded-none" onClick={handleCopy} /></div>
                  </Button>
                  <div>Copy</div>
                </div>
              </div>
            </div>
            {showDownloadSuccessAlert && (
              <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#0A251D] text-[#42BE65] border-l-4 border-[#42BE65] flex-1 px-8 py-3">
                Download successfully
              </div>
            )}
            {showCopySuccessAlert && (
              <div className="absolute text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#0A251D] text-[#42BE65] border-l-4 border-[#42BE65] flex-1 px-8 py-3">
                Successfully copied.
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
