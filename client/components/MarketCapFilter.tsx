"use client";
import React, { useState, useEffect } from "react";
import { Input, Card, CardHeader, CardBody, Slider, Tooltip, Switch, Link } from "@nextui-org/react";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
const apiUrl = "/user/refreshFollowList", followUrl = "/user/followUser";  //关注接口;
let time = 0;

export const MarketCapFilter = ({ setMarketCapRange, setVolumnRange, setCompleted, setCompleting, setSpam, setFollowing, completed, completing, spam }) => {
  const [marketCapValue, setMarketCapValue] = useState([0, 100000]);
  const [volumnValue, setVolumnValue] = useState([0, 100000]);
  const [responseData, setResponseData] = useState(null);
  const [data, setData] = useState([]);
  const [followedList, setFollowedList] = useState([]);
  const userId = useLocalGlobalStore(state => state.wallet.userId);

  //请求关注人列表接口
  const handleFetchData = async () => {
    const responseData = await Api.post(apiUrl, { "page": 1, "limit": 4 }, userId);
    setResponseData(responseData);
    setData(Array.isArray(responseData) ? responseData : []);
  };

  //首次加载页面调用代币列表接口
  useEffect(() => {
    if (userId) {
      handleFetchData();//调用代币列表接口
    }
  }, [userId])

  //关注
  const handleFollow = async (followedId) => {
    await Api.post(followUrl, { followedId }, userId);
    setFollowedList([...followedList, followedId])
    // handleFetchData()
  }


  /** 父子组件Silder和Input联动
   * @param {*Number} value  输入框值
   * @param {*Function} setKeyFun  当前组件设置值
   * @param {*Array} lastKeyValue 最近一次组件值
   * @param {*Number} index   下标
   * @param {*Function} setRangeFun   回调设置父组件函数值
   */
  const handleInputChange = (value, setKeyFun, lastKeyValue, index, setRangeFun) => {
    let newKeyValue = JSON.parse(JSON.stringify(lastKeyValue))
    if (value >= 0 && value <= 100000) {
      newKeyValue[index] = value
    }
    setKeyFun(newKeyValue)
    // 输入节流
    time = new Date().getTime();
    let timeId = setTimeout(() => {
      let currentTime = new Date().getTime();
      if ((currentTime - time) > 600) {
        setRangeFun(newKeyValue)
      }
      clearTimeout(timeId)
    }, 600)
  }

  //input框样式
  const inputStyle = {
    input: [
      "bg-transparent",
      , "border-[#5B667E]",
      "rounded-none", "pl-3", "hover:bg-[#14111C]",
    ],
    innerWrapper: ["bg-transparent", "border", "border-[#5B667E]", "hover:bg-[#14111C]", "pr-3"],
    inputWrapper: [
      "bg-transparent",
      "border-[#5B667E]",
      "hover:bg-[#14111C]",
      "hover:rounded-none",
      "dark:hover:bg-[#14111C]",
      "p-0",
      "group-data-[focus=true]:bg-[#14111C]",
      "dark:group-data-[focus=true]:bg-[#14111C]",
    ]
  }
  console.log(followedList, "followedList")
  return (
    <>
      <div>
        <div className="flex flex-col w-full">
          <Card className="w-full p-5 bg-[#14111C] mb-4">
            <CardHeader className="flex flex-col gap-3 justify-start items-start p-2">
              <div className="w-full flex flex-col gap-5 border-b-[0.4px] border-[#9d9fa3] pb-3">
                <p className="flex flex-col gap-5 text-left">Market Cap</p>
                <div className="flex flex-col gap-5 w-full h-full max-w-md items-start justify-center">
                  <Slider
                    formatOptions={{ style: "currency", currency: "USD" }}
                    step={10}
                    maxValue={100000}
                    minValue={0}
                    size="sm"
                    value={marketCapValue}
                    classNames={{
                      base: "max-w-md",
                      track: "bg-[#ffffff]",
                      filler: "bg-[#5a58f2]",
                    }}
                    renderThumb={(props) => (
                      <div
                        {...props}
                        className="group p-1 top-1/2 bg-[#E2E2E2] border-small border-[#E2E2E2] dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                      >
                        <span className="transition-transform bg-gradient-to-br shadow-small from-[#5a58f2] to-[#5a58f2] rounded-full w-2 h-2 block group-data-[dragging=true]:scale-80" />
                      </div>
                    )}
                    onChange={setMarketCapValue}
                    onChangeEnd={setMarketCapRange}
                    className="max-w-md"
                  />
                  <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-16">
                    <Input
                      label="MIN"
                      type="number"
                      placeholder="0"
                      min={0}
                      max={100000}
                      defaultValue={marketCapValue[0]}
                      value={marketCapValue[0]}
                      labelPlacement="outside"
                      classNames={inputStyle}
                      onValueChange={(value) => { handleInputChange(Number(value), setMarketCapValue, marketCapValue, 0, setMarketCapRange) }}
                    />
                    <Input
                      label="MAX"
                      type="number"
                      placeholder="100000"
                      min={0}
                      max={100000}
                      defaultValue={marketCapValue[1]}
                      value={marketCapValue[1]}
                      labelPlacement="outside"
                      classNames={inputStyle}
                      onValueChange={(value) => { handleInputChange(Number(value), setMarketCapValue, marketCapValue, 1, setMarketCapRange) }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5 border-b-[0.4px] border-[#9d9fa3] pb-3">
                <p className="flex flex-col gap-5 text-left">Volume</p>
                <div className="flex flex-col gap-5 w-full h-full max-w-md items-start justify-center">
                  <Slider
                    formatOptions={{ style: "currency", currency: "USD" }}
                    step={10}
                    minValue={0}
                    maxValue={100000}
                    size="sm"
                    value={volumnValue}
                    classNames={{
                      base: "max-w-md",
                      track: "bg-[#ffffff]",
                      filler: "bg-[#5a58f2]",
                    }}
                    renderThumb={(props) => (
                      <div
                        {...props}
                        className="group p-1 top-1/2 bg-[#E2E2E2] border-small border-[#E2E2E2] dark:border-default-400/50 shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                      >
                        <span className="transition-transform bg-gradient-to-br shadow-small from-[#5a58f2] to-[#5a58f2] rounded-full w-2 h-2 block group-data-[dragging=true]:scale-80" />
                      </div>
                    )}
                    onChange={setVolumnValue}
                    onChangeEnd={setVolumnRange}
                    className="max-w-md"
                  />
                  <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-16">
                    <Input
                      label="MIN"
                      type="number"
                      placeholder="0"
                      minValue={0}
                      maxValue={100000}
                      defaultValue={volumnValue[0]}
                      value={volumnValue[0]}
                      labelPlacement="outside"
                      classNames={inputStyle}
                      onValueChange={(value) => { handleInputChange(Number(value), setVolumnValue, volumnValue, 0, setVolumnRange) }}
                    />
                    <Input
                      label="MAX"
                      placeholder="100000"
                      minValue={0}
                      maxValue={100000}
                      type="number"
                      defaultValue={volumnValue[1]}
                      value={volumnValue[1]}
                      labelPlacement="outside"
                      classNames={inputStyle}
                      onValueChange={(value) => { handleInputChange(Number(value), setVolumnValue, volumnValue, 1, setVolumnRange) }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-start items-start gap-4">
                <div className="flex flex-row items-center" >
                  Completed
                  <Switch classNames={{ wrapper: "group-data-[selected=true]:bg-[#5a58f2]" }} isSelected={completed} onChange={(e) => { setCompleted(e.target.checked); if (e.target.checked) { setCompleting(false); setSpam(false) } }} className="ml-6" size="sm" />
                </div>
                <div className="flex flex-row items-center" >
                  Completing
                  <Switch classNames={{ wrapper: "group-data-[selected=true]:bg-[#5a58f2]" }} isSelected={completing} onChange={(e) => { setCompleting(e.target.checked); if (e.target.checked) { setCompleted(false); setSpam(false) } }} className="ml-6" size="sm" />
                </div>
                <div className="flex flex-row items-center" >
                  Spam Filter
                  <Tooltip
                    showArrow
                    key={'bottom'}
                    placement={'bottom'}
                    content={'Hide 0 holders and MEMEs with no trading volume.'}
                    size="md"
                    classNames={{
                      content: "w-72 h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                    }}
                  >
                    <span className="inline-block ml-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 16C6.89673 16 5.86144 15.7908 4.89412 15.3725C3.9268 14.9595 3.07712 14.3869 2.3451 13.6549C1.61307 12.9229 1.03791 12.0732 0.619608 11.1059C0.206536 10.1386 0 9.10327 0 8C0 6.89673 0.206536 5.86144 0.619608 4.89412C1.03791 3.9268 1.61307 3.07712 2.3451 2.3451C3.07712 1.60784 3.9268 1.03268 4.89412 0.619608C5.86144 0.206536 6.89673 0 8 0C9.10327 0 10.1386 0.206536 11.1059 0.619608C12.0732 1.03268 12.9229 1.60784 13.6549 2.3451C14.3869 3.07712 14.9595 3.9268 15.3725 4.89412C15.7908 5.86144 16 6.89673 16 8C16 9.10327 15.7908 10.1386 15.3725 11.1059C14.9595 12.0732 14.3869 12.9229 13.6549 13.6549C12.9229 14.3869 12.0732 14.9595 11.1059 15.3725C10.1386 15.7908 9.10327 16 8 16ZM8 14.6667C8.92026 14.6667 9.78301 14.4941 10.5882 14.149C11.3935 13.8039 12.102 13.3255 12.7137 12.7137C13.3255 12.102 13.8039 11.3935 14.149 10.5882C14.4941 9.78301 14.6667 8.92026 14.6667 8C14.6667 7.07974 14.4941 6.21699 14.149 5.41176C13.8039 4.60131 13.3255 3.89281 12.7137 3.28627C12.102 2.67451 11.3935 2.19608 10.5882 1.85098C9.78301 1.50588 8.92026 1.33333 8 1.33333C7.07974 1.33333 6.21699 1.50588 5.41176 1.85098C4.60654 2.19608 3.89804 2.67451 3.28627 3.28627C2.67451 3.89281 2.19608 4.60131 1.85098 5.41176C1.50588 6.21699 1.33333 7.07974 1.33333 8C1.33333 8.92026 1.50588 9.78301 1.85098 10.5882C2.19608 11.3935 2.67451 12.102 3.28627 12.7137C3.89804 13.3255 4.60654 13.8039 5.41176 14.149C6.21699 14.4941 7.07974 14.6667 8 14.6667ZM6.62745 12.3843C6.46536 12.3843 6.32941 12.332 6.21961 12.2275C6.1098 12.1229 6.0549 11.9922 6.0549 11.8353C6.0549 11.6784 6.1098 11.5477 6.21961 11.4431C6.32941 11.3386 6.46536 11.2863 6.62745 11.2863H7.6V7.68627H6.76078C6.59869 7.68627 6.46274 7.63399 6.35294 7.52941C6.24314 7.42484 6.18823 7.29412 6.18823 7.13725C6.18823 6.98039 6.24314 6.84967 6.35294 6.7451C6.46274 6.64052 6.59869 6.58823 6.76078 6.58823H8.23529C8.43399 6.58823 8.58562 6.65359 8.6902 6.78431C8.79477 6.9098 8.84706 7.07974 8.84706 7.29412V11.2863H9.81961C9.9817 11.2863 10.1176 11.3386 10.2275 11.4431C10.3373 11.5477 10.3922 11.6784 10.3922 11.8353C10.3922 11.9922 10.3373 12.1229 10.2275 12.2275C10.1176 12.332 9.9817 12.3843 9.81961 12.3843H6.62745ZM7.92941 5.27843C7.64706 5.27843 7.40654 5.17908 7.20784 4.98039C7.00915 4.7817 6.9098 4.54118 6.9098 4.25882C6.9098 3.97124 7.00915 3.7281 7.20784 3.52941C7.40654 3.33072 7.64706 3.23137 7.92941 3.23137C8.21699 3.23137 8.45752 3.33072 8.65098 3.52941C8.84967 3.7281 8.94902 3.97124 8.94902 4.25882C8.94902 4.54118 8.84967 4.7817 8.65098 4.98039C8.45752 5.17908 8.21699 5.27843 7.92941 5.27843Z" fill="#565663" />
                      </svg>
                    </span>
                  </Tooltip>
                  <Switch classNames={{ wrapper: "group-data-[selected=true]:bg-[#5a58f2]" }} isSelected={spam} onChange={(e) => { setSpam(e.target.checked); if (e.target.checked) { setCompleted(false); setCompleting(false) } }} className="ml-6" size="sm" />
                </div>
                <div>Following<Switch classNames={{ wrapper: "group-data-[selected=true]:bg-[#5a58f2]" }} onChange={(e) => { setFollowing(e.target.checked) }} className="ml-6" size="sm" /></div>
              </div>
            </CardHeader>
          </Card>
          <Card className="w-full p-5 bg-[#14111C]">
            <CardHeader className="flex flex-col gap-3 justify-start items-start">
              <div className="w-full flex flex-row justify-between">
                <div className="font-semibold">Following</div>
                <div className="text-[#5A58F2] cursor-pointer" onClick={handleFetchData}><img className="inline-block mr-1" src="/repeat.svg" />Refresh</div>
              </div>
              <div className="text-left">Latest MEMEer that everyone is following</div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-2">
                {data?.map((item) => {
                  console.log(followedList, followedList.indexOf(item.userId), item.userId)
                  return <div className="flex flex-row justify-between gap-5 items-center">
                    <div className="flex flex-row justify-start items-center gap-2 bg-[#1A1425] p-1 border-box border-1 rounded-[8px] w-[180px]">
                      <img src={item.avatar} className="w-12 h-12 rounded-full" />
                      <div className="flex flex-col justify-between">
                        <div className="underline text-[#5A58F2] w-[104px] overflow-hidden whitespace-nowrap text-ellipsis">
                          <Link
                            href={`/personalCenter?userId=${item.userId}`}
                            underline="always"
                            className="text-sm sm:text-base bg-transparent text-[#5a58fa]"
                          >
                            {item.username}
                          </Link>
                        </div>
                        <div className="text-[#757083]">Followers: {item.followers ? item.followers : '--'}</div>
                      </div>
                    </div>
                    {followedList.indexOf(item.userId) > -1 ? <div className="border-[#5A58F2] border-1 px-2 py-0.5 rounded-[4px] text-[#5A58F2]" >Followed</div> :
                      <div className="border-[#5A58F2] border-1 px-2 py-0.5 rounded-[4px] text-[#5A58F2] cursor-pointer" onClick={handleFollow.bind(this, item.userId)}>Follow</div>}
                  </div>
                })}
                {/* <div className="flex flex-row justify-center gap-5 items-center">
                  <div className="flex flex-row justify-between items-center gap-2 bg-[#1A1425] p-1 border-box border-1">
                    <img src="/Polygon 1.svg" className="w-12 h-12" />
                    <div className="flex flex-col justify-between">
                      <div className="underline text-[#5A58F2]">Vector</div>
                      <div className="text-[#757083]">Followers: 7,620</div>
                    </div>
                  </div>
                  <div className="border-[#5A58F2] border-1 px-2 py-0.5 rounded-[4px] text-[#5A58F2] cursor-pointer" onClick={handleFollow.bind(this, '53253270-d536-46b3-94f2-3080e985f3c3')}>Follow</div>
                </div>
                <div className="flex flex-row justify-center gap-5 items-center">
                  <div className="flex flex-row justify-between items-center gap-2 bg-[#1A1425] p-1 border-box border-1">
                    <img src="/Polygon 1.svg" className="w-12 h-12" />
                    <div className="flex flex-col justify-between">
                      <div className="underline text-[#5A58F2]">Vector</div>
                      <div className="text-[#757083]">Followers: 7,620</div>
                    </div>
                  </div>
                  <div className="border-[#5A58F2] border-1 px-2 py-0.5 rounded-[4px] text-[#5A58F2] cursor-pointer">Follow</div>
                </div>
                <div className="flex flex-row justify-center gap-5 items-center">
                  <div className="flex flex-row justify-between items-center gap-2 bg-[#1A1425] p-1 border-box border-1">
                    <img src="/Polygon 1.svg" className="w-12 h-12" />
                    <div className="flex flex-col justify-between">
                      <div className="underline text-[#5A58F2]">Vector</div>
                      <div className="text-[#757083]">Followers: 7,620</div>
                    </div>
                  </div>
                  <div className="border-[#5A58F2] border-1 px-2 py-0.5 rounded-[4px] text-[#5A58F2] cursor-pointer">Follow</div>
                </div> */}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
};