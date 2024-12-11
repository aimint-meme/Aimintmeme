"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalBody, Button, useDisclosure, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  Image,
} from "@nextui-org/react";
import { useAiImageSelected } from "@/components/overlayer";
import { useSearchParams } from 'next/navigation'
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import {AlertBox} from "@/components/AlertBox";
let timeId;

export const AICreateImage = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [useImageOne, setUseImageOne] = useState(false);
  // const [useImageTwo, setUseImageTwo] = useState(false);
  const { selectImage, setSelectImage } = useAiImageSelected();
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = useLocalGlobalStore(state => state.wallet.userId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiUrl = "/api/generateTaskId", apiUrlImage = "/api/getImage";//文生图
  const prompt = searchParams.get('prompt');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  const simulateTransactionFailure = (message) => {
    setShowAlert(true);
    setAlertMessage(message);
  };
  //文生图
  const handleenerateImage = async () => {
    setLoading(true);
    setError(null);
    try {
      setResponseData([])
      const taskData = await Api.post(apiUrl, { prompt }, userId);
      let responseDataOne, responseDataTwo;
      timeId = await setInterval(async () => {
        responseDataOne = await Api.post(apiUrlImage, { taskId: taskData?.[0]?.['taskId'] }, userId);
        if (responseDataOne?.url) {
          setResponseData(prevData => [responseDataOne?.url, prevData?.[1]]);
          setLoading(false);
          setUseImageOne(true)
          setSelectImage(1)
          clearInterval(timeId)
        }
      }, 5000)
      // let timeTwo = await setInterval(async () => {
      //   responseDataTwo = await Api.post(apiUrlImage, { taskId: taskData?.[1]?.['taskId'] }, userId);
      //   if (responseDataTwo?.url) {
      //     setResponseData(prevData => [prevData?.[0], responseDataTwo?.url]);
      //     setLoading(false);
      //     clearInterval(timeTwo)
      //   }
      // }, 5000)
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
    }
  }

  //点击事件
  const handleClick = () => {
    if (selectImage == 0) {
      // 重新生成
    } else {
      //创建meme
      setSelectImage(responseData?.[selectImage - 1])
      router.push("/search/form");
    }
  }

  useEffect(() => {
    if (prompt && userId) {
      handleenerateImage();
      return () => {
        clearInterval(timeId);
      };
    }
  }, [prompt, userId]);

  // if (loading) return <Spinner />;

  return (
    <>
      <div>
        <div className="flex flex-row text-center justify-center items-center w-full md:gap-7 gap-3">
          <div className={`group relative rounded-large box-border md:h-[511px] h-[88vw] max-h-[511px] w-[511px] ${responseData?.[0] ? 'border-0' : 'border-2'}  border-[#5A58F2]  bg-[url('/aiImageLoading.gif')] bg-contain bg-bottom bg-gray-950}`}
            onMouseEnter={() => { selectImage != 1 && setUseImageOne(true) }}
            onMouseLeave={() => { selectImage != 1 && setUseImageOne(false) }}
            onTouchStart={() => { setSelectImage(1); onOpen() }}>
            <div className="loader">Generating...</div>
            <Image
              width={510}
              src={responseData?.[0]}
              className={`box-border ${selectImage == 1 && responseData?.[0] ? 'border-3 border-[#5A58F2]' : 'border-0'} group-hover:border-3 group-hover:border-[#5A58F2] md:h-[511px] h-[88vw] max-h-[511px]`}
            // onClick={() => { setSelectImage(selectImage == 1 ? 0 : 1) }}
            />
            {/* {useImageOne && <div className="md:block hidden absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10">
              <Button color="primary" className="bg-[#0c0c16e6] w-[257px] h-[80px] rounded-[48px] text-[#5A58F2] text-[33px]" onClick={() => { setSelectImage(1); setUseImageOne(false) }}>
                Use it
              </Button>
            </div>} */}
            {/* {selectImage == 1 && <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10">
              <img
                width="100%"
                className="w-full md:w-[80px] md:h-[80px] w-[33px] h-[33px]"
                src="/checkmark.svg"
              />
            </div>} */}
          </div>
          {/* {responseData?.[1] && <div className="group relative rounded-large box-border"
            onMouseOver={() => { selectImage != 2 && setUseImageTwo(true) }}
            onMouseLeave={() => { selectImage != 2 && setUseImageTwo(false) }}
            onTouchStart={() => { setSelectImage(2); onOpen() }}>
            <Image
              width={511}
              src={responseData?.[1]}
              className="box-border group-hover:border-2 border-[#5A58F2]"
            />
            {useImageTwo && <div className="md:block hidden absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10">
              <Button color="primary" className="bg-[#0c0c16e6] w-[257px] h-[80px] rounded-[48px] text-[#5A58F2] text-[33px]" onClick={() => { setSelectImage(2); setUseImageTwo(false) }} >
                Use it
              </Button>
            </div>}
            {selectImage == 2 && <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-10">
              <img
                width="100%"
                className="w-full md:w-[80px] md:h-[80px] w-[33px] h-[33px]"
                src="/checkmark.svg"
              />
            </div>}
          </div>} */}
        </div>
        <div className="flex gap-2 justify-center md:mt-9 mt-3 mb-3">
          {selectImage != 0 ? <Button color="primary" className="bg-[#5A58F2] w-[10rem]" onClick={handleClick}>
            CREATE MEME
          </Button> : <Button color="primary" className="bg-[#221F2E] w-[10rem] cursor-default" >
            CREATE MEME
          </Button>}
        </div>
        <Modal placement="center" isOpen={isOpen} hideCloseButton onOpenChange={onOpenChange} size='lg' className="w-[500px] p-0 bg-transparent" >
          <ModalContent>
            <ModalBody className="p-3">
              <div className="rounded-[12px] overflow-hidden">
                <img
                  width={511}
                  src={responseData?.[selectImage - 1]}
                />
                {/* <div className="flex justify-center h-[40px]">
                  <div
                    className="bg-[#221F2E] flex justify-center content-center items-center flex-1"
                    onClick={() => { setSelectImage(0); onClose() }}
                  >
                    Cancel
                  </div>
                  <div color="primary" className="bg-[#5A58F2] flex justify-center content-center items-center flex-1"
                    onClick={() => { onClose() }}>
                    Use it
                  </div>
                </div> */}
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
        <AlertBox
        showAlert={showAlert}
        alertMessage={alertMessage}
        handleCloseAlert={handleCloseAlert}
      />
      </div>
    </>
  );
};