"use client";
import React, { useRef, useEffect, useState } from "react";
import { title } from "@/components/primitives";
import {
  Input,
  ImageUploader,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Listbox,
  ListboxItem,
  Textarea,
  Spinner,
  Image,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {useLocalGlobalStore} from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;

export default function PersonEditPage() {
  const router = useRouter();
  const ImgInputRef = useRef(null);//头像上传框
  const ImgBgRef = useRef(null);//背景上传框
  const [selectedFile, setSelectedFile] = useState(null); //用户头像
  const [selectedBgFile, setSelectedBgFile] = useState(null); //背景图片
  const dafaultData = { username: '', intro: '', avatar: null, coverImage: null, xLink: '', telegramLink: '', discordLink: '', website: '' };
  const [formData, setFormData] = useState(dafaultData); //表单数据
  const [responseData, setResponseData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [errors, setErrors] = useState(null);
  //获取localStore中的setState方法
  const setState = useLocalGlobalStore((state) => state.setState);
  const apiUrl = "/user/personal";//查询个人主页信息接口
  const editUrl = PRE_URL+"/user/personal/edit";//编辑个人主页信息接口
  const address=useLocalGlobalStore(state => state.wallet.address);
  const userId=useLocalGlobalStore(state => state.wallet.userId);
  const data={"address":address, "userId":userId};
  //表单必填项
  const initialFormData = {
    username: "",
    avatar: null,
    coverImage: null,
  };
  const emailFormData = {
    xLink: "",
    telegramLink: "",
    discordLink: "",
    website: "",
  };
  //上传用户头像
  const handleFileChange = (event) => {
    if(event.target.files[0]){
      setSelectedFile(window.URL.createObjectURL(event.target.files[0]));
      setFormData({  
        ...formData,  
        avatar: event.target.files[0],  
      }); 
    }
  };
  //上传背景图片
  const handleBgFileChange = (event) => {
    if(event.target.files[0]){
      setSelectedBgFile(window.URL.createObjectURL(event.target.files[0]));   
      setFormData({  
        ...formData,  
        coverImage: event.target.files[0],  
      }); 
    }
  };
  // 用户头像上传
  const handleUpload = () => {
    ImgInputRef.current.click();
  };
  //背景图片上传
  const handleBgUpload = () => {
    ImgBgRef.current.click();
  };
  //获取表单填入的数据
  const handleChange = (e) => {  
    const { name, value } = e.target;  
    setFormData({  
      ...formData,  
      [name]: value,  
    });  
  }; 
  //请求个人主页列表接口
  const handlePersonalData = async () => {
    setLoading(true);
    setErrors(null);
    try {
      // const response = await fetch(apiUrl, {
      //   method: "POST", // 指定请求方法为 POST
      //   headers: {
      //     "Content-Type": "application/json", // 设置内容类型为 JSON
      //   },
      //   body: JSON.stringify({
      //     address: "C2iHw1YauCTuax392Fn9xqjRGGKbHtgN4iH4S9W2UCuV",
      //   }), // 将参数对象序列化为 JSON 格式并作为请求主体发送
      // });

      // if (!response.ok) {
      //   throw new Error("Network response was not ok");
      // }

      // const responseData = await response.json(); // 解析响应为 JSON 格式
      const responseData = await Api.post(apiUrl, data,userId);
      setResponseData(responseData);
      // 处理数据，只保留默认对象中的属性  
        const filteredData = {};  
        for (const key in dafaultData) {  
          if (dafaultData.hasOwnProperty(key) && responseData.hasOwnProperty(key)) {  
            filteredData[key] = responseData[key];  
          }  
        }  
        // 更新表单数据
        setFormData(filteredData); 
      
    } catch (error) {
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };
  //首次加载页面调用个人主页列表接口
  useEffect(() => {
    if(address !== null && userId !== null) {
      handlePersonalData(); //调用个人主页列表接口
    }
  }, [address,userId]);
  // 校验网址格式  
  const validateURL = (url) => {
    // 这是一个简单的URL正则表达式，它可能不涵盖所有有效的URL格式  
    // 根据需要，你可以使用更复杂的正则表达式或库来校验URL  
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  };
  const handleBlur = () => {
    let formErrors = {};
    Object.keys(emailFormData).forEach((key) => {
      if (formData[key] !== "" && !validateURL("https://"+formData[key])) {
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
      }else if(key == "username" || key == "intro"){
        if(key == "intro" && formData[key].length > 500){
          formErrors[key] = `${key} must be 500 characters or less.`;
        }else if(key !== "intro" && formData[key].length > 100){
          formErrors[key] = `${key} must be 100 characters or less.`;
        }
        
      }
    });

    setError(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  //提交表单
  const handleSubmit = async (e) => {  
    if (validateForm() && handleBlur()) {
      e.preventDefault();
    setLoading(true);  
    setErrors(null);  
  
    try {

      const { username, intro, avatar, coverImage, xLink, telegramLink, discordLink, website } = formData;  
        const formDataToSend = new FormData();  
        formDataToSend.append('username', username);  
        formDataToSend.append('intro', intro);  
        formDataToSend.append('avatar', avatar);  
        formDataToSend.append('coverImage', coverImage);  
        formDataToSend.append('xLink', xLink);  
        formDataToSend.append('telegramLink', telegramLink);  
        formDataToSend.append('discordLink', discordLink);  
        formDataToSend.append('website', website);  
        const response = await fetch(editUrl, {  
          method: 'POST', // 指定请求方法为 POST  
          headers: {  
            'userid':userId
          },  
          body: formDataToSend, // 将参数对象序列化为 JSON 格式并作为请求主体发送  
        });  
    
        if (!response.ok) {  
          throw new Error('Network response was not ok');  
        }  
    
        const responseData = await response.json(); // 解析响应为 JSON 格式  
        setResponseData(responseData);  
        setState((preState) => {
          return {
            ...preState,
            wallet: {
              ...preState.wallet,
              avatar: responseData.data && responseData.data.avatar,
              username: responseData.data && responseData.data.username,
            },
          };
        });
        router.push('/personalCenter');//跳转到个人主页
      
    } catch (error) {  
      setErrors(error);  
    } finally {  
      setLoading(false);  
    } 
    }
     
  };  
  if (loading) return <Spinner />;
  if (errors) return <div>Error: {errors.message}</div>;

  //input框样式
  // const inputStyle = {
  //   label: "text-[#757083]",
  //   base: "w-full text-left border rounded-xl text-[#757083]",
  //   input: [
  //     "bg-[#221F2E]",
  //     "hover:bg-[#221F2E]",
  //     "rounded-xl",
  //     "text-[#757083]","px-2"
  //   ],
  //   innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]", "text-[#757083]"],
  //   inputWrapper: [
  //     "bg-[#221F2E]",
  //     "hover:bg-[#221F2E]",
  //     "dark:hover:bg-[#221F2E]",
  //     "group-data-[focus=true]:bg-[#221F2E]",
  //     "dark:group-data-[focus=true]:bg-[#221F2E]",
  //     "text-[#757083]",
  //   ],
  // };
  //input框样式
  const inputStyle = {
    label: "text-[#757083]",
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
      "text-[#757083]",
      "px-0",
    ],
  };
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row items-center gap-8 mb-4 justify-between w-full">
        <div className="flex flex-row gap-8 justify-between w-full">
          <h1 className="text-[#5A58F2] text-2xl font-bold">Profile</h1>
          <Button
            variant="bordered"
            className="border-[#5A58F2] text-[#5A58F2] px-12 hidden md:flex"
            onClick={handleSubmit}
          >
            save
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-8">
        <form className="flex flex-col md:flex-row w-full gap-10"  onSubmit={handleSubmit}>
          <div className="w-full md:w-2/5">
            <div className="flex flex-col justify-start text-left gap-4">
              <h1 className="text-[#757083] text-xl">Avatar<span className="text-[#f31260]">*</span>{" "}</h1>
              {responseData.avatar || selectedFile  ? (
                <div
                  className="w-full h-96 flex justify-center items-center"
                  onClick={handleUpload}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={ImgInputRef}
                  />
                  <Image
                    src={selectedFile ? selectedFile : responseData.avatar}
                    className="w-full h-96 object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-[#221F2E] rounded-lg border border-dashed border-[#757083] flex flex-col justify-center items-center gap-1">
                  <div className="text-xs text-[#757083] leading-6">
                    Drag and drop an image <br />
                    JPG or PNG.150x150px
                  </div>
                  {/* <div className="inline-block text-center justify-center items-center m-2 md:m-0">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={ImgInputRef}
                    />
                    <Button
                      variant="bordered"
                      onClick={handleUpload}
                      className="border-[#5A58F2] text-[#5A58F2] px-6 h-[31px]"
                    >
                      Choose File
                    </Button>
                  </div> */}
                </div>
              )}
              <h1 className="text-[#757083] text-xl">Cover image <span className="text-[#f31260]">*</span>{" "}</h1>
              {
                responseData.coverImage || selectedBgFile ? <div
                className="w-full h-28 flex justify-center items-center"
                onClick={handleBgUpload}
              >
                <input
                  type="file"
                  onChange={handleBgFileChange}
                  className="hidden"
                  ref={ImgBgRef}
                />
                <Image
                  src={selectedBgFile ? selectedBgFile : responseData.coverImage}
                  className="w-full h-28 object-cover"
                />
              </div> : <div className="w-full h-28 bg-[#221F2E] rounded-lg border border-dashed border-[#757083] flex flex-col justify-center items-center gap-2">
                <div className="text-xs text-[#757083] leading-6">
                  Drag and drop an image <br />
                  JPG or PNG.150x150px
                </div>
                <Button
                  variant="bordered"
                  className="border-[#5A58F2] text-[#5A58F2] px-6 h-[31px]"
                >
                  Choose File
                </Button>
              </div>
              }
              
            </div>
          </div>
          <div className="w-full md:w-3/5">
            <div className="flex flex-col justify-start text-left gap-4">
              <h1 className="text-[#757083] text-xl">Basic infomation</h1>
              <Input
                label="Username"
                name="username"
                isRequired
                value={formData.username}  
                onChange={handleChange}
                labelPlacement="outside"
                placeholder="Your username"
                classNames={inputStyle}
                isInvalid={error.username ? true : false}
                errorMessage={error.username}
              />
              <Textarea
                label="Intro"
                variant="faded"
                name="intro"
                value={formData.intro}  
                onChange={handleChange}
                placeholder="info"
                disableAnimation
                labelPlacement="outside"
                classNames={inputStyle}
              />
              <h1 className="text-[#757083] text-xl">Social links</h1>
              <Input
                type="url"
                label="X link"
                name="xLink"
                value={formData.xLink} 
                onBlur={handleBlur} 
                onChange={handleChange}
                placeholder=""
                labelPlacement="outside"
                classNames={inputStyle}
                isInvalid={error.xLink ? true : false}
                errorMessage={error.xLink}
                startContent={<div className="pl-3">https://</div>}
              />
              <Input
                label="Telegram link"
                type="url"
                name="telegramLink"
                value={formData.telegramLink}  
                onBlur={handleBlur}
                onChange={handleChange}
                labelPlacement="outside"
                classNames={inputStyle}
                startContent={<div className="pl-3">https://</div>}
                isInvalid={error.telegramLink ? true : false}
                errorMessage={error.telegramLink}
              />
              <Input
                label="Discord link"
                type="url"
                name="discordLink"
                value={formData.discordLink}  
                onBlur={handleBlur}
                onChange={handleChange}
                labelPlacement="outside"
                classNames={inputStyle}
                startContent={<div className="pl-3">https://</div>}
                isInvalid={error.discordLink ? true : false}
                errorMessage={error.discordLink}
              />
              <Input
                label="Website"
                type="url"
                name="website"
                value={formData.website}  
                onBlur={handleBlur}
                onChange={handleChange}
                labelPlacement="outside"
                classNames={inputStyle}
                startContent={<div className="pl-3">https://</div>}
                isInvalid={error.website ? true : false}
                errorMessage={error.website}
              />
            </div>
          </div>
        </form>
      </div>
      <div className="flex flex-row items-center gap-8 mb-4 justify-center w-full pt-5">
        <Button className="bg-[#5A58F2] px-12 md:hidden" type="submit"
          variant="bordered"
          isLoading={loading} onClick={handleSubmit}>save</Button>
      </div>
    </div>
  );
}
