"use client";
import React, { useState, useEffect, useRef,useLayoutEffect } from "react";
import { Image, Button, Link, Input, Spinner, user,Pagination } from "@nextui-org/react";
import {
  PolygonIcon,
  ArrowUpIcon,
  SendIcon,
  MessageIcon,
  UploadIcon,
  HeartIcon,
  HeartFillIcon,
} from "@/components/icons";
import { ProgressBar } from "@/components/progress";
import { MarketCap } from "@/components/marketCap";
import {useLocalGlobalStore} from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import {AlertBox} from "@/components/AlertBox";
import { formatRelativeToNow } from '@/src/utils/timeFormat';

const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export const Thread = (props) => {
  const inputStyle = {
    base: "w-full text-left hidden sm:flex",
    input: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    inputWrapper: [
      "bg-[#221F2E]",
      "hover:bg-[#221F2E]",
      "dark:hover:bg-[#221F2E]",
      "group-data-[focus=true]:bg-[#221F2E]",
      "dark:group-data-[focus=true]:bg-[#221F2E]",
      "h-[56px]",
      "sm:h-[72px]",
    ],
  };
  const inputStyleB = {
    base: "w-full text-left flex sm:hidden rounded-md rounded-lg",
    input: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]"],
    inputWrapper: [
      "bg-[#221F2E]",
      "hover:bg-[#221F2E]",
      "dark:hover:bg-[#221F2E]",
      "group-data-[focus=true]:bg-[#221F2E]",
      "dark:group-data-[focus=true]:bg-[#221F2E]",
      "rounded-lg",
    ],
  };
  const threadRef = useRef(null);
  const scrollRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Please connect your wallet first."); //提示信息
  const [value, setValue] = React.useState("");
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLike, setIsLike] = useState(false); //是否点赞
  const [likeIds, setLikeIds] = useState([]); //当前点赞评论id
  const [scrollToInput, setScrollToInput] = useState(false);
  const [isReplay, setIsReplay] = useState(false); //是否回复评论
  const [selectedFile, setSelectedFile] = useState(null);
  const ImgInputRef = useRef(null); //上传图片inpput
  const inputRef = useRef(null); //评论输入框
  const [replyUserId, setReplyUserId] = useState(null); // 存储要回复的用户ID
  const [replyUserName, setReplyUserName] = useState(null); 
  const userId=useLocalGlobalStore(state => state.wallet.userId); 
  const [hasMore, setHasMore] = useState(true); 
  const [commentImage, setCommentImage] = useState(null);//评论图片
  const [page, setPage] = useState(1);
  const [total,setTotal] = useState(1);
  const [totals,setTotals] = useState(0);
  const [topData, setTopData] = useState({});
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState('');
  const apiUrl = "/token/topicList",topUrl="/token/topicListTop"; //评论列表查询接口
  const topicUrl = PRE_URL + "/token/topic"; //评论接口
  const likeUrl = "/user/likeComment"; //点赞接口
  const unLikeUrl = "/user/unlikeComment"; //取消点赞接口
  const replayUrl = PRE_URL + "/user/replyToComment"; //回复评论接口
  const limit = 10; // 每页显示的评论数 
  // 使用 useLayoutEffect 而不是 useEffect，以便在 DOM 更新后同步运行  
  useLayoutEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768); // 根据你的断点设置  
    }

    handleResize(); // 组件挂载时立即调用  
    window.addEventListener('resize', handleResize); // 添加事件监听器  

    return () => {
      window.removeEventListener('resize', handleResize); // 组件卸载时移除监听器  
    };
  }, []);
  const handleCloseAlert = () => {
    setShowErrorAlert(false);
  };
 
  const simulateTransactionFailure = (message) => {
    setShowErrorAlert(true);
    setAlertErrorMessage(message);
  };
  //输入框输入内容
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  //选中图片
  const handleImgFileChange = (event) => {
    setSelectedFile(window.URL.createObjectURL(event.target.files[0]));
    setCommentImage(event.target.files[0]);
  };
  const handleUploadImg = () => {
    ImgInputRef.current.click();
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
  // 分页改变时的处理函数
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  //查询评论列表接口
  const handleTopicList = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await Api.post(apiUrl, {
        tokenId: props.tokenId,
        page:page,
        limit
      },userId);
      const topData = await Api.post(topUrl, {
        tokenId: props.tokenId,
      },userId);
      setTopData(topData);
      if (!responseData.items) {
        setLoading(false);
        setHasMoreData(true)
        return;
      }
      if(responseData.items.length > 0){
        setTotals(responseData.total);
      const pages = Math.ceil(responseData.total / limit);
      setTotal(pages)
      if(isMobile){
        setResponseData((prevItems) => [...prevItems, ...responseData.items]);
      }else{
        setResponseData([...responseData.items]);
      }
        setHasMoreData(true)
      }else{
        setHasMoreData(false)
      }
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message);
    } finally {
      setLoading(false);
    }
  };
  //评论接口
  const handleTopic = async () => {
    if(!userId) {
      setShowAlert(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if(isReplay){//回复评论
        formData.append('commentId', replyUserId);
        formData.append('replyContent', value);
        formData.append('image', commentImage);
      }else{//评论
        formData.append('tokenId', props.tokenId);
        formData.append('content', value);
        formData.append('image', commentImage);
      }
      const response = await fetch(isReplay ? replayUrl : topicUrl, {  
        method: 'POST', // 指定请求方法为 POST  
        headers: {  
          'userid':userId
        },  
        body: formData, // 将参数对象序列化为 JSON 格式并作为请求主体发送  
      });  
  
      if (!response.ok) {  
        throw new Error('Network response was not ok');  
      }  
  
      const newItem = await response.json(); // 解析响应为 JSON 格式  
      if(isMobile){
        const pages = Math.ceil(totals / limit);
        setTotal(pages)
        setTotals(prevTotal => prevTotal + 1);
        setResponseData([...responseData,newItem?.data]);
      }else{
        handleTopicList(1);
      }
      setIsReplay(false);
      setReplyUserId(null);
      setReplyUserName(null);
      setSelectedFile(null);
      setCommentImage(null);
      setValue("");
      if (threadRef.current) {
        threadRef.current.scrollTop = threadRef.current.scrollHeight;
      }
      
      //handleTopicList(); //调用评论列表接口
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message);
    } finally {
      setLoading(false);
    }
  };
  //点赞
  const handleLike = async (id, index) => {
    if(!userId) {
      setShowAlert(true);
      return;
    }
    try {
      const resData= await Api.post(likeUrl, {commentId: id},userId); 
      const newComments = [...responseData];
      newComments[index].likeCount += 1;
      newComments[index].isLike = true;
      setResponseData(newComments);
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message);
    } finally {
      setLoading(false);
    }
  };
  //取消点赞
  const handleUnlike = async (id, index) => {
    if(!userId) {
      setShowAlert(true);
      return;
    }
    try {
      const resData = await Api.post(unLikeUrl, {commentId: id},userId); 
        const newComments = [...responseData];
        newComments[index].likeCount -= 1;
        newComments[index].isLike = false;
        setResponseData(newComments);
      
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message);
    } finally {
      setLoading(false);
    }
  };
  //首次加载页面调用评论页列表接口
  useEffect(() => {
    handleTopicList(page); //调用评论列表接口
  }, [page]);
  useEffect(() => {
    if (scrollToInput) {
      const inputElement = inputRef.current;
      if (inputElement) {
        debugger
        inputElement.focus(); // 使输入框获得焦点
        inputElement.scrollIntoView({ behavior: "smooth", block: "nearest" }); // 平滑滚动到输入框
        setIsReplay(true);
      }
      setScrollToInput(false); // 重置状态，避免重复滚动
    }
  }, [scrollToInput]);
  const prevPage = usePrevious(page);
  useEffect(() => {
    // 检查 page 是否与前一个值不同
    if (prevPage !== undefined && prevPage !== page && !isMobile) {
      const inputElement = threadRef.current;
      if (inputElement) {
        inputElement.scrollIntoView({ behavior: "smooth", block: "nearest" }); // 平滑滚动到输入框
      }
    }
  }, [page, prevPage]);
  //点击评论按钮滚动到输入框位置
  const handleCommentButtonClick = (item) => {
    setScrollToInput(true);
    setReplyUserId(item.id); // 设置要回复的用户ID
    setReplyUserName(item.username);
    setIsReplay(true);
  };
  useEffect(() => {
    let isCurrent = true; // 这是一个辅助变量，用于确保在组件卸载时不会调用过时的回调
   
    const handleScroll = () => {
      if (isCurrent && scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMoreData) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };
   
    if (isMobile && scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
   
      // 清理函数
      return () => {
        if (isCurrent && scrollRef.current) {
          scrollRef.current.removeEventListener('scroll', handleScroll);
        }
        isCurrent = false; // 标记为过时，以防在组件卸载后意外调用
      };
    }
   
    // 注意：通常不需要将 scrollRef.current 添加到依赖数组中
  }, [loading, isMobile]); // 依赖数组只包含可能影响 effect 的变量

  return (
    <div  className="w-full flex flex-col gap-6 h-auto">
      <div className="flex flex-col w-full gap-4 height-calc sm:h-auto overflow-auto sm:overscroll-hidden" ref={scrollRef}>
        <div className="flex flex-col gap-0 w-full justify-center items-center">
          {selectedFile && (
            <div className="md:flex inline-block text-center justify-start w-full relative z-9">
              <div className="flex w-full md:w-[100%] h-14 md:h-24 rounded-[12px] p-6">
                <img
                  src={selectedFile}
                  alt=""
                  className="preview md:w-[62px] md:h-[62px] w-[32px] h-[32px] rounded-[8.4px] mr-[12px]"
                ></img>
                <div className="bg-[#ff3e801a] rounded-[52.571px] md:w-[32px] md:h-[32px]  flex justify-center content-center items-center">
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
          <Input
            placeholder={replyUserId ? `Reply to ${replyUserName}` : "Review"}
            ref={inputRef}
            labelPlacement="outside"
            classNames={inputStyle}
            value={value}
            onChange={handleChange}
            startContent={
              !selectedFile && (
                <>
                  <input
                    type="file"
                    onChange={handleImgFileChange}
                    className="hidden"
                    ref={ImgInputRef}
                  />
                  <div
                    className="w-auto cursor-pointer"
                    onClick={handleUploadImg}
                  >
                    <UploadIcon className="text-2xl pointer-events-none flex-shrink-0 w-6 h-5 md:w-6 md:h-6" />
                  </div>
                </>
              )
            }
            endContent={
              value !== "" ? (
                <div className="w-auto cursor-pointer" onClick={handleTopic}>
                  <SendIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 w-6 h-5 md:w-8 md:h-8" />
                </div>
              ) : (
                ""
              )
            }
          />
        </div>
        <div
        ref={threadRef}
            className="flex flex-col gap-4 w-full justify-between text-left items-start bg-[#221F2E] p-4 mb-4 rounded-2xl"
          >
            <div className="flex flex-row gap-3 w-full items-center justify-between  text-sm">
              <div className="flex flex-row gap-2 items-center justify-start">
                <Image
                  shadow="none"
                  width="100%"
                  radius="none"
                  className="w-[24px] object-over"
                  src={topData.avatar}
                />
                <Link
                  href={`/personalCenter?userId=${topData.userId}`}
                  underline="always"
                  className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
                >
                  {topData.username}
                </Link>
                {topData.repliedUid !== "" && <div className="flex flex-row gap-3 justify-center items-center">
                  <div>replyed</div>
                  <Image
                  shadow="none"
                  width="100%"
                  radius="none"
                  className="w-[24px] object-over"
                  src={topData.repliedAvatar}
                />
                <Link
                  href={`/personalCenter?userId=${topData.repliedUid}`}
                  underline="always"
                  className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
                >
                  {topData.repliedUsername}
                </Link>
                </div>}
                <p className="text-sm">{formatRelativeToNow(topData.createdTime,topData.currentTime)}</p>
              </div>
              <div className="">
                  <div className="flex flex-row items-center gap-1">
                    <ArrowUpIcon /> TOP{" "}
                  </div>
               
              </div>
            </div>
            <div className="justify-start items-start flex flex-row gap-4">
              {typeof topData.image === 'string' && topData.image.includes("https") && (<Image
                shadow="none"
                radius="none"
                className="w-[80px] max-w-20 object-cover "
                src={topData.image}
              />)}
              <div className="flex flex-col gap-2 col-span-2">
                <p className={`text-left text-[#ffffff] text-sm font-normal ${typeof topData.image === 'string' && !topData.image.includes("https") && "ml-8" }`}>
                  {topData.comment}
                </p>
              </div>
            </div>
          </div>
        <div className="flex flex-col w-full">
        {responseData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 w-full justify-between text-left items-start bg-[#221F2E] p-4 mb-4 rounded-2xl"
          >
            <div className="flex flex-row gap-3 w-full items-center justify-between  text-sm">
              <div className="flex flex-row gap-2 items-center justify-start">
                <Image
                  shadow="none"
                  width="100%"
                  radius="none"
                  className="w-[24px] object-over"
                  src={item.avatar}
                />
                <Link
                  href={`/personalCenter?userId=${item.userId}`}
                  underline="always"
                  className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
                >
                  {item.username}
                </Link>
                {item.repliedUid !== "" && <div className="flex flex-row gap-3 justify-center items-center">
                  <div>replyed</div>
                  <Image
                  shadow="none"
                  width="100%"
                  radius="none"
                  className="w-[24px] object-over"
                  src={item.repliedAvatar}
                />
                <Link
                  href={`/personalCenter?userId=${item.repliedUid}`}
                  underline="always"
                  className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
                >
                  {item.repliedUsername}
                </Link>
                </div>}
                <p className="text-sm">{formatRelativeToNow(item.createdTime,item.currentTime)}</p>
              </div>
              <div className="">
                {/* {index == 0 ? (
                  <div className="flex flex-row items-center gap-1">
                    <ArrowUpIcon /> TOP{" "}
                  </div>
                ) : ( */}
                  <div className="flex flex-row items-center gap-2">
                    <div
                      onClick={() => handleCommentButtonClick(item)}
                    >
                      <MessageIcon />
                    </div>
                    <div
                      className="flex flex-row items-center gap-0 text-[18px] cursor-pointer"
                      onClick={() => {
                        item.isLike
                          ? handleUnlike(item.id, index)
                          : handleLike(item.id, index);
                      }}
                    >
                      {item.likeCount != 0 && item.isLike ? (
                        <>
                          <HeartFillIcon />
                          <span className="text-[#DA1E28]">
                            {item.likeCount}
                          </span>
                        </>
                      ) : (
                        <>
                          <HeartIcon />
                          {item.likeCount}
                        </>
                      )}
                    </div>
                    {/* {item.likeCount != 0 && isLike && likeIds.includes(item.id)  ? (
                      <div className="flex flex-row items-center gap-0 text-[#DA1E28] text-[18px] cursor-pointer" onClick={() => handleUnLike(item.id)}>
                        <HeartFillIcon />
                        {item.likeCount + 1}
                      </div>
                    ) : (
                      <div className="flex flex-row items-center gap-0 text-[18px] cursor-pointer" onClick={() => handleLike(item.id)} >
                        <HeartIcon />{item.likeCount}
                      </div>
                    )} */}
                  </div>
                {/* )} */}
              </div>
            </div>
            <div className="justify-start items-start flex flex-row gap-4">
              {typeof item.image === 'string' && item.image.includes("https") && (<Image
                shadow="none"
                radius="none"
                className="w-[80px] max-w-20 object-cover "
                src={item.image}
              />)}
              <div className="flex flex-col gap-2 col-span-2">
                <p className={`text-left text-[#ffffff] text-sm font-normal ${typeof item.image === 'string' && !item.image.includes("https") && "ml-8" }`}>
                  {item.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
        </div>
        {(isMobile && loading) && <p>Loading...</p>}  
        {(!hasMoreData && isMobile) && <p>No more comments.</p>}  
      </div>
      {(totals > 10 && !isMobile)  && (<div className="flex w-full justify-center">
            <Pagination
            showControls
              page={page}
              total={total}
              initialPage={1}
              onChange={handlePageChange}
              // onChange={(page) => { setPage(page);setScrollToInput(true) }}
              classNames={{
                cursor: "bg-[#5a58f2] text-[#ffffff]",
              }}
              variant="bordered"
            />
          </div>)}
      
      <div className="sm:hidden w-full fixed bottom-16 left-0 z-10 text-left px-6 ">
        <div className="text-[#757083] py-1">Review:{totals}</div>
        <div className="flex flex-col gap-0 w-full justify-center items-center pb-2">
          {selectedFile && (
            <div className="md:flex inline-block text-center justify-start w-full relative z-9">
              <div className="flex w-full md:w-[100%] h-14 md:h-24 rounded-[12px] p-6">
                <img
                  src={selectedFile}
                  alt=""
                  className="preview md:w-[62px] md:h-[62px] w-[32px] h-[32px] rounded-[8.4px] mr-[12px]"
                ></img>
                <div className="bg-[#ff3e801a] rounded-[52.571px] md:w-[32px] md:h-[32px]  flex justify-center content-center items-center">
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
          <Input
            placeholder={replyUserId ? `Reply to ${replyUserName}` : "Review"}
            placeholder="Review"
            labelPlacement="outside"
            classNames={inputStyleB}
            value={value}
            onChange={handleChange}
            startContent={
              !selectedFile && (
                <>
                  <input
                    type="file"
                    onChange={handleImgFileChange}
                    className="hidden"
                    ref={ImgInputRef}
                  />
                  <div
                    className="w-auto cursor-pointer"
                    onClick={handleUploadImg}
                  >
                    <UploadIcon className="text-2xl pointer-events-none flex-shrink-0 w-6 h-5 md:w-6 md:h-6" />
                  </div>
                </>
              )
            }
            endContent={
              value !== "" ? (
                <div className="w-auto cursor-pointer" onClick={handleTopic}>
                  <SendIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0 w-6 h-5 md:w-8 md:h-8" />
                </div>
              ) : (
                ""
              )
            }
          />
        </div>
      </div>
      {showAlert && (
        <div className="fixed z-50 text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
          <Image src="/StatusIcon.svg" className="w-5" />
          {alertMessage}
        </div>
      )}
      <AlertBox
        showAlert={showErrorAlert}
        alertMessage={alertErrorMessage}
        handleCloseAlert={handleCloseAlert}
      />
    </div>
  );
};
