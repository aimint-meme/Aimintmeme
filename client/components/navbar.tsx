"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
  Accordion,
  AccordionItem,
  Avatar,
  Image,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  User,
  Listbox,
  ListboxItem,
  Spinner, ButtonGroup
} from "@nextui-org/react";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { useHover } from "react-aria";
import { useRouter } from "next/navigation";
// import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";
import { clusterApiUrl,PublicKey } from "@solana/web3.js";
import { getCookie, setCookie } from "@/src/utils/api";
import { Api } from "@/src/utils/api";
const WalletDisconnectButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletDisconnectButton,
  { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
  ArrowDown,
  UnitedIcon,
  GroupIcon,
  NoticeIcon,
  PolygonIcon,
  ToogleIcon,
  CloseIcon,
  MyMeIcon,
  MyPointIcon,
  SetIcon,
  MenuIcon,
  LogoText,
} from "@/components/icons";
import base58 from "bs58";
import { useWallet,useConnection } from "@solana/wallet-adapter-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { HowWorkModal } from "@/components/howWork";
import { MarketCapTable } from "@/components/marketCapTable";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";

const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;

export const Navbar = () => {
  const { connected, wallet, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();
  const [selected, setSelected] = React.useState("Create Coin");
  const [isOpen, setIsOpen] = useState(false);
  const [leftBar, setLeftBar] = useState(false);
  const [rightBar, setRightBar] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [handleOpen, setHandleOpen] = React.useState(false);
  const [handleWorkOpen, setHandleWorkOpen] = React.useState(false);
  const [handleMarketCapTable, setHandleMarketCapTable] = React.useState(false);
  // const [isConnect, setIsConnect] = React.useState(false);
  const [isTooltipOpen, setTooltipOpen] = React.useState(false);
  const [guidePage, setGuidePage] = React.useState(0);
  const [isConnected, setIsConnected] = useState(connected);
  const [responseData, setResponseData] = useState({});
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const walletMultiButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const startDropdownRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCreateTooltip, setShowCreateTooltip] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); //提示信息
  const [isNewUser, setIsNewUser] = useState("");
  //获取localStore中的setState方法
  const setState = useLocalGlobalStore((state) => state.setState);
  const router = useRouter();
  const isConnect = useLocalGlobalStore((state) => state.isConnect);
  const avatar = useLocalGlobalStore((state) => state.wallet.avatar);
  const sol = useLocalGlobalStore((state) => state.wallet.sol);
  const address = useLocalGlobalStore((state) => state.wallet.address);
  const username = useLocalGlobalStore((state) => state.wallet.username);
  const apiUrl = "/user/connect";

  console.log("是否连接", isConnect);
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
  //存储钱包连接成功后地址以及状态
  const handleUseLocalStore = (userId, address, signature, avatar, username,sol) => {
    setState((preState) => {
      return {
        ...preState,
        isConnect: true,
        wallet: {
          address: address,
          signature: signature,
          userId: userId,
          avatar: avatar,
          username,
          sol
        },
      };
    });
    router.push("/");
  };
  //查询钱包余额
  const handleBalance = async (address) => {
    if (!address) {
      throw new Error("Address is required");
    }
    const solVaultPda = new PublicKey(address);
    const balanceValue = await connection.getBalance(solVaultPda);
    return balanceValue / 1e9; // 直接返回 SOL 余额
  };
  
  const fetchData = async (apiUrl, data) => {
    try {
      const responseData = await Api.post(apiUrl, data);
      return responseData; // 返回解析后的响应数据
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  };
  
  const handleConnectWallet = async (data) => {
    setLoading(true);
    setError(null);
  
    try {
      const solBalance = await handleBalance(data.address); // 等待 handleBalance 的结果
      const responseData = await fetchData(apiUrl, data); // 调用封装的 fetch 函数
      handleUseLocalStore(
        responseData.userId,
        data.address,
        data.signature,
        responseData.avatar,
        responseData.username,
        solBalance
      );
  
      console.log(responseData.isNewUser, responseData);
      setCookie("isNewUser", responseData.isNewUser, 365);
      setIsNewUser(responseData.isNewUser);
      handleConnect(responseData.isNewUser);
    } catch (error) {
      setError(error);
      setAlertMessage(error.message);
      if (wallet && connected) {
        disconnect();
      }
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };
  // 连接成功后的回调函数
  const onWalletConnectSuccess = async (walletInstance, publicKey) => {
    console.log("Wallet connected successfully:", walletInstance);
    const message = `Hello ${publicKey.toBase58()}, Welcome to AIMint!`;

    const encodedMessage = new TextEncoder().encode(message);
    // const signature = await walletInstance.adapter.signMessage(encodedMessage, 'utf8');
    try {
      const signature = await walletInstance.adapter.signMessage(
        encodedMessage,
        "utf8"
      );
      console.log("signature", base58.encode(signature));
      handleConnectWallet({
        address: publicKey.toBase58(),
        signature: base58.encode(signature),
      });
    } catch (error) {
      setError(error.message);
      handleDisconnect();
      setAlertMessage(error.message);
      setShowAlert(true);
    }

    // 在这里执行连接成功后的逻辑
  };

  useEffect(() => {
    // 当 connected 状态变化时执行
    console.log("isConnect---------------", isConnect);
    if (connected && publicKey !== null) {
      // 确保只在首次连接时调用回调函数
      // 如果切换钱包账户，则重新调用后台
      if (
        (currentAccount !== null && currentAccount !== publicKey?.toBase58()) ||
        !isConnect
      ) {
        setIsConnected(true);
        onWalletConnectSuccess(wallet, publicKey);
      }
      setCurrentAccount(publicKey?.toBase58());
    } else if (!connected && isConnect) {
      // 钱包已断开连接，执行你的逻辑
      console.log("钱包已断开连接！");
      handleDisconnect();
    }
  }, [connected, wallet, publicKey]);
  const searchInput = (
    <Input
      isReadOnly
      aria-label="Search"
      classNames={{
        // inputWrapper: "w-80",
        innerWrapper: ["bg-[#221F2E]", "hover:bg-[#221F2E]", "text-[#757083]"],
        inputWrapper: [
          "bg-[#221F2E]",
          "hover:bg-[#221F2E]",
          "dark:hover:bg-[#221F2E]",
          "group-data-[focus=true]:bg-[#221F2E]",
          "dark:group-data-[focus=true]:bg-[#221F2E]",
          "text-[#757083]",
          "w-96",
          "cursor",
        ],
        input: [
          "bg-[#221F2E]",
          "hover:bg-[#221F2E]",
          "rounded-xl",
          "text-[#757083]",
        ],
      }}
      color="#221F2E"
      // endContent={
      //   <Kbd className="hidden lg:inline-block" keys={["command"]}>
      //     K
      //   </Kbd>
      // }
      labelPlacement="outside"
      placeholder="Enter name/Ticker/Address"
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      onClick={() => {
        setHandleMarketCapTable(true);
      }}
    />
  );
  const searchInputSm = (
    <Input
      isReadOnly
      size="sm"
      aria-label="Search"
      classNames={{
        input: ["bg-[#221f2e]", "hover:bg-[#221f2e]", "rounded-lg", "px-1"],
        innerWrapper: [
          "bg-[#221f2e]",
          "border",
          "border-[#221f2e]",
          "hover:bg-[#221f2e]",
          "rounded-lg",
          "h-5",
        ],
        inputWrapper: [
          "bg-[#221f2e]",
          "border-[#221f2e]",
          "hover:bg-[#221f2e]",
          "dark:hover:bg-[#221f2e]",
          "group-data-[focus=true]:bg-[#221f2e]",
          "dark:group-data-[focus=true]:[#221f2e]",
        ],
        clearButton: ["bg-transparent"],
      }}
      className="md:hidden block"
      isClearable={true}
      color="#637592"
      labelPlacement="outside"
      placeholder="Token, item or User"
      startContent={
        <div className="scale-[0.65]">
          <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
        </div>
      }
      type="search"
      onClick={() => {
        setHandleMarketCapTable(true);
      }}
    />
  );

  useEffect(() => {
    setIsNewUser(getCookie("isNewUser"));
  }, []);

  const disableScrollFun = (enable) => {
    document.body.style.overflow = enable ? "auto" : "hidden";
  };

  //连接状态
  const handleConnect = (isNewUser) => {
    if (isNewUser) {
      // 禁用页面滚动
      disableScrollFun(false)
      setGuidePage(1)
    } else {
      setGuidePage(0)
    }
  };

  const handleMouseEnter = () => {
    setShowCreateTooltip(false);
    setShowTooltip(true);

  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  //跳转个人中心
  const handleView = () => {
    router.push("/personalCenter");
    setIsMenuOpen(false);
    setLeftBar(false);
    setRightBar(false);
  };

  //点击创建按钮显示下拉遮罩
  const handleCreate = () => {
    setShowTooltip(false);
    setShowCreateTooltip(true);
    // router.push("/search/form?isSearch=true");
  };
  //点击跳转创建
  const handleCreateForm = () => {
    router.push("/search/form?isSearch=true");
    setShowCreateTooltip(false);
  };
  //点击创建面板之外的区域
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowCreateTooltip(false);
    }
  };
  //点击start面板之外的区域
  const handleStartClickOutside = (event) => {
    if (startDropdownRef.current && !startDropdownRef.current.contains(event.target)) {
      setShowTooltip(false);
    }
  };
  const handleGenerateEImg = () => {
    router.push(`/search`);
    setShowCreateTooltip(false);
  };
  useEffect(() => {
    // 添加点击事件监听器到文档
    document.addEventListener("mousedown", handleStartClickOutside);

    // 在组件卸载时移除监听器
    return () => {
      document.removeEventListener("mousedown", handleStartClickOutside);
    };
  }, []); // 空依赖数组确保这个 effect 只在组件挂载和卸载时运行一次

  useEffect(() => {
    // 添加点击事件监听器到文档
    document.addEventListener("mousedown", handleClickOutside);

    // 在组件卸载时移除监听器
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // 空依赖数组确保这个 effect 只在组件挂载和卸载时运行一次
  const handleToggle = (value: boolean | ((prevState: boolean) => boolean)) => {
    setTimeout(() => {
      setLeftBar(value);
    }, 10);
    // 延时时间根据需要调整
  };
  //点击home返回首页，关闭侧边弹框
  const handleHome = () => {
    setLeftBar(false);
    setIsMenuOpen(false);
  };
  const handleRightToggle = (
    value: boolean | ((prevState: boolean) => boolean)
  ) => {
    setTimeout(() => {
      setRightBar(value);
    }, 10);
  };
  const handleToggler = (
    value: boolean | ((prevState: boolean) => boolean)
  ) => {
    // setHandleOpen(true)
    // 触发 WalletMultiButton 的点击事件
    if (walletMultiButtonRef.current) {
      walletMultiButtonRef.current.click();
    }
  };
  //点击how it work
  const handleHowWork = (
    value: boolean | ((prevState: boolean) => boolean)
  ) => {
    setHandleWorkOpen(true);
  };
  //点击FAQ跳转到FAQ页面
  const handleFaqPage = () => {
    router.push("/faqPage");
    setShowTooltip(false);
  };
  //移动端点击how it work
  const handleWorks = () => {
    setIsMenuOpen(false);
    setHandleWorkOpen(true);
    setLeftBar(false);
    setRightBar(false);
  };

  //点击断开钱包按钮
  const handleDisconnect = async () => {
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
    if (wallet && connected) {
      disconnect();
    }
    setIsMenuOpen(false);
    setLeftBar(false);
    setRightBar(false);
    router.push("/");
  };
  if (loading) return <Spinner />;
  // if (error) return <div>Error: {error.message}</div>;
  const iconClasses =
    "text-3xl text-default-500 pointer-events-none flex-shrink-0 gap-7.2";
  return (
    <>
      <NextUINavbar
        maxWidth="xl"
        position="sticky"
        isMenuOpen={isMenuOpen}
        isBordered
        onMenuOpenChange={setIsMenuOpen}
        className="w-full flex flex-row bg-[#14111C] relative"
      >
        {!rightBar ? (
          <NavbarContent
            className="sm:hidden w-full flex flex-row justify-between"
            justify={isMenuOpen ? "between" : "start"}
          >
            {isMenuOpen ? (
              <NextLink className="flex items-center gap-1" href="">
                <Image
                  shadow="none"
                  radius="none"
                  className="w-[32px] sm:w-[48px] object-cover"
                  src="/logo.svg"
                />
              </NextLink>
            ) : (
              <></>
            )}
            <NavbarMenuToggle
              className="bg-[transparent]"
              icon={
                isMenuOpen ? (
                  <CloseIcon />
                ) : (
                  <Tooltip
                    isOpen={guidePage == 1}
                    key={"bottom-start"}
                    placement={"bottom-start"}
                    content={
                      <div className="m-4 mx-2">
                        <div className="font-semibold text-[17px] mb-2">
                          Easy Creation
                        </div>
                        <div className="mb-4">
                          If you are an artist or designer, you don't need to
                          quickly generate MEMEs images through AI. After
                          connecting your wallet, you can click the "menu
                          button".
                        </div>
                        <div className="flex flex-row justify-start items-center ">
                          <div className="text-[#757083]">1/2</div>
                          <div
                            className="w-24 h-8 flex justify-center items-center border-[#5A58F2] border-1 rounded-[8px] text-[#5A58F2] ml-12 cursor-pointer"
                            onClick={() => {
                              setGuidePage(0);
                            }}
                          >
                            Skip
                          </div>
                          <div
                            className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer"
                            onClick={() => {
                              handleToggle(true);
                              setIsMenuOpen(true);
                              setGuidePage(2);
                            }}
                          >
                            Next
                          </div>
                        </div>
                      </div>
                    }
                    size="md"
                    classNames={{
                      content:
                        "md:hidden w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                    }}
                    offset={10}
                    showArrow
                  >
                    <div
                      className={
                        guidePage == 1
                          ? "border-box border-2 rounded-[1] md:w-[48px] md:h-[48px] w-[40px] h-[34px] flex justify-center items-center p-2 px-1"
                          : "bg-[#181320] rounded-[4px] w-[40px] h-[34px] flex justify-center items-center p-2 px-1"
                      }
                    >
                      <MenuIcon color={guidePage == 1 ? "#5A58F2" : "white"} />
                    </div>
                  </Tooltip>
                )
              }
              onChange={handleToggle}
            />
          </NavbarContent>
        ) : (
          <></>
        )}
        {leftBar ? (
          <NavbarMenu>
            <div className="mx-4 mt-2 flex flex-col gap-3">
              {/* <Tabs
                aria-label="Options"
                fullWidth
                variant="bordered"
                selectedKey={selected}
                onSelectionChange={setSelected}
                classNames={{
                  tabList:
                    "gap-6 w-full relative p-0 text-lg border-[#221F2E] bg-[#221F2E]",
                  cursor: "w-full dark:bg-[#221F2E] text-lg rounded-none",
                  tab: " px-0 h-10 text-lg",
                  tabContent:
                    "text-[#ffffff] font-light group-data-[selected=true]:text-[#5A58F2] group-data-[selected=true]:font-semibold",
                  panel: "border-none bg-none",
                }}
              >
                <Tab
                  key="Create Coin"
                  title="Create Coin"
                  className={guidePage == 2 ? "border-box border-2" : ""}
                > */}
              <ButtonGroup variant="bordered" className="w-full">
                <Link
                  aria-label="Discord"
                  href="/search/form?isSearch=true"
                  className="cursor-default w-[50%]"
                >
                  <Button className="w-full border-[#221F2E] border-r-0 last:rounded-e-none">Create Coin</Button>
                </Link>

                <Tooltip
                  showArrow={true}
                  content="comming soon"
                  placement="right"
                >
                  <Button className="w-[50%] border-[#221F2E]">Create Live</Button>
                </Tooltip>

              </ButtonGroup>
              <Tooltip
                isOpen={guidePage == 2}
                key={"bottom"}
                placement={"bottom"}
                content={
                  <div className="m-4 mx-2">
                    <div className="font-semibold text-[17px] mb-2">
                      Create Coin
                    </div>
                    <div className="mb-4">
                      Click "Create Coin" to get started immediately.
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <div className="text-[#757083]">2/2</div>
                      <div
                        className="w-24 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] ml-3 cursor-pointer"
                        onClick={() => {
                          handleToggle(false);
                          setIsMenuOpen(false);
                          setGuidePage(0);
                        }}
                      >
                        Start Now
                      </div>
                    </div>
                  </div>
                }
                size="md"
                classNames={{
                  content:
                    "md:hidden border-0 w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                }}
                offset={-50}
                crossOffset={-18}
                showArrow
              >
                <Button
                  variant="bordered"
                  className="w-full border border-[#221F2E] rounded text-lg font-normal"
                  onClick={handleWorks}
                >
                  How it works
                </Button>
              </Tooltip>
              <Listbox
                aria-label="Actions"
                classNames={{
                  base: "w-full pt-3",
                  list: "gap-2",
                }}
              >
                <ListboxItem
                  key="Home"
                  href="/"
                  classNames={{ title: "text-lg" }}
                  onClick={handleHome}
                >
                  Home
                </ListboxItem>
                <ListboxItem
                  key="Whitepaper"
                  href="/"
                  classNames={{ title: "text-lg" }}
                >
                  Whitepaper
                </ListboxItem>
                {/* <ListboxItem
                      key="Wallet"
                      href="/"
                      classNames={{ title: "text-lg" }}
                    >
                      Wallet
                    </ListboxItem> */}
              </Listbox>
              {/* </Tab>
                <Tab key="Create Live" title="Create Live"> */}
              {/* <Card>
                    <CardBody>coming soon</CardBody>
                  </Card> */}
              {/* </Tab>
              </Tabs> */}
            </div>
          </NavbarMenu>
        ) : (
          <></>
        )}

        {!isMenuOpen ? (
          <NavbarContent
            className="flex sm:hidden sm:basis-36"
            justify="center"
          >
            <NavbarBrand as="li" className="gap-20">
              <NextLink className="flex items-center gap-1" href="">
                {!isConnect ? (
                  <Image
                    shadow="none"
                    width="100%"
                    radius="none"
                    className="w-[32px] sm:w-[48px]"
                    src="/logo.svg"
                  />
                ) : (
                  <>
                    <div>
                      <Image
                        shadow="none"
                        width="100%"
                        radius="none"
                        className="w-[32px] sm:w-[48px] md:block hidden"
                        src="/logo.svg"
                      />
                      <div
                        className="scale-[0.9] md:hidden block bg-[#181320] rounded-[4px] w-[40px] h-[3
6px] flex justify-center items-center py-3"
                      >
                        <div onClick={() => { !isMenuOpen && setHandleMarketCapTable(true); }}>
                          {" "}
                          <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </NextLink>
            </NavbarBrand>
          </NavbarContent>
        ) : (
          <></>
        )}
        <NavbarContent className="hidden sm:flex sm:basis-36" justify="center">
          <NavbarBrand as="li" className="gap-20">
            <NextLink className="flex items-center gap-1" href="//">
              <Image
                shadow="none"
                width="100%"
                radius="none"
                className="w-[32px] sm:w-[48px]"
                src="/logo.svg"
              />
            </NextLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent
          className="hidden lg:flex gap-4 justify-start ml-2"
          justify="center"
        >
          <NavbarItem>{searchInput}</NavbarItem>
          <NavbarItem>
            {/* <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            > */}
            <div ref={startDropdownRef}>
              <Button
                className={`text-base bg-transparent rounded-none ${showTooltip ? "border-b-2 border-[#5A58F2]" : ""} h-[65px]`}
                // onMouseEnter={handleMouseEnter}
                onClick={handleMouseEnter}
              >
                Start A New MEMEs <ArrowDown />
              </Button>
              {showTooltip && (
                <div className="bg-[#1A1425] flex flex-col w-[1280px] justify-between items-start absolute z-100 left-[0] pt-[3%] pb-[4%] px-[15%] h-[320px] rounded-b-xl cursor-pointer">
                  <div className="grid grid-cols-2 gap-5 ">
                    <div
                      className="flex flex-row gap-3 hover:bg-[#221F2E] p-5 rounded-lg box-border"
                      onClick={handleHowWork}
                    >
                      <Image
                        shadow="none"
                        radius="none"
                        src="/work2.svg"
                        classNames={{ img: "w-16 max-w-16" }}
                      />
                      <div className="flex flex-col gap7 justify-start">
                        <p className="text-md text-[#f2f2f2] text-xl">
                          How it Works
                        </p>
                        <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal">
                          Aimint is the best place to discover The next trending
                          token!
                        </p>
                      </div>
                    </div>
                    {/* <div className="flex gap-3 hover:bg-[#221F2E] p-5 rounded-lg box-border">
                        <Image
                          shadow="none"
                          radius="none"
                          src="/whitepaper.svg"
                          classNames={{ img: "w-16 max-w-16" }}
                        />
                        <div className="flex flex-col gap7 justify-start">
                          <p className="text-md text-[#f2f2f2] text-xl">
                            Whitepaper
                          </p>
                          <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal">
                            Fully audited smart contracts
                          </p>
                        </div>
                      </div> */}
                    <div
                      className="flex gap-3 hover:bg-[#221F2E] p-5 rounded-lg box-border"
                      onClick={handleFaqPage}
                    >
                      <Image
                        shadow="none"
                        radius="none"
                        src="/faq.svg"
                        classNames={{ img: "w-16 max-w-16" }}
                      />
                      <div className="flex flex-col gap7 justify-start">
                        <p className="text-md text-[#f2f2f2] text-xl">FAQ</p>
                        <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal">
                          Ownership renounced, immutable. Buy and sell at any
                          time.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row justify-center items-center w-full gap-6 pt-6">
                    <Link
                      isExternal
                      aria-label="Discord"
                      href={siteConfig.links.twitter}
                      className="cursor-default"
                    >
                      <Image
                        src="/twitterLogo.svg"
                        className="bg-[#5a58f240] w-10 h-10 p-2 rounded-lg"
                      />
                    </Link>
                    <Link
                      isExternal
                      aria-label="Discord"
                      href={siteConfig.links.tg}
                      className="cursor-default"
                    >
                      <Image
                        src="/telegramLogo.svg"
                        className="bg-[#5a58f240] w-10 h-10 p-2 rounded-lg"
                      />
                    </Link>
                    <Link
                      isExternal
                      aria-label="Discord"
                      href={siteConfig.links.ins}
                      className="cursor-default"
                    >
                      <Image
                        src="/ins.svg"
                        className="bg-[#5a58f240] w-10 h-10 p-2 rounded-lg"
                      />
                    </Link>

                    <Link
                      isExternal
                      aria-label="Discord"
                      href={siteConfig.links.facebook}
                      className="cursor-default"
                    >
                      <Image
                        src="/uiw_facebook.svg"
                        className="bg-[#5a58f240] w-10 h-10 p-2 rounded-lg"
                      />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {/* </div> */}
          </NavbarItem>
        </NavbarContent>
        <NavbarContent className="hidden lg:flex basis-1 pl-4" justify="end">
          <NavbarItem className="hidden sm:flex gap-3">
            {/* <Link
              isExternal
              aria-label="Discord"
              // href={siteConfig.links.discord}
              className="cursor-default"
            >
              <UnitedIcon className="text-default-500 gap-7.2" />
            </Link> */}
            {/* <Link isExternal aria-label="Github" href={siteConfig.links.github}>
              <NoticeIcon className="text-default-500 gap-7.2" />
            </Link> */}
          </NavbarItem>
          <NavbarItem>
            {isConnect ? (
              <Tooltip
                isOpen={isConnect && guidePage !== 0 ? true : false}
                key={"bottom"}
                placement={"bottom"}
                content={
                  <div className="m-4 mx-2">
                    <div className="font-semibold text-[17px] mb-2">
                      Easy Creation
                    </div>
                    <div className="mb-4">
                      If you are an artist or designer, you don't need to
                      quickly generate MEMEs images through AI. After connecting
                      your wallet, you can click this button to directly enter
                      the creation process.
                    </div>
                    <div className="flex flex-row justify-start items-center">
                      <div
                        className="w-60 h-8 flex justify-center items-center bg-[#5A58F2] rounded-[8px] cursor-pointer"
                        onClick={() => {
                          disableScrollFun(true);
                          setGuidePage(0);
                        }}
                      >
                        Start Now
                      </div>
                    </div>
                  </div>
                }
                size="md"
                classNames={{
                  content:
                    "hidden md:block w-[300px] h-27 p-4 rounded-1 bg-[#241E33] text-[15px] tracking-normal",
                }}
                offset={10}
                crossOffset={0}
                showArrow
              >
                <div>
                  <Button
                    color="primary"
                    className="bg-[#5A58F2] w-[10rem]"
                    onClick={handleCreate}
                  >
                    Create
                  </Button>
                  {showCreateTooltip && (
                    <div
                      ref={dropdownRef}
                      className="bg-[#1A1425] flex flex-col w-[1280px] justify-center items-center absolute z-100 left-[0] py-[5%] px-[15%] h-[192px] rounded-b-xl cursor-pointer"
                    >
                      <div className="grid grid-cols-2 gap-5 ">
                        <div
                          className="flex flex-row gap-3 hover:bg-[#221F2E] p-5 rounded-lg box-border"
                          onClick={handleGenerateEImg}
                        >
                          <Image
                            shadow="none"
                            radius="none"
                            src="/Group 120.svg"
                            classNames={{ img: "w-16 max-w-16" }}
                          />
                          <div className="flex flex-col gap7 justify-start">
                            <p className="text-md text-[#f2f2f2] text-xl">
                              Create MEMEs with AI
                            </p>
                            <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal">
                              Aimint is the best place to discover The next
                              trending token!
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex gap-3 hover:bg-[#221F2E] p-5 rounded-lg box-border"
                          onClick={handleCreateForm}
                        >
                          <Image
                            shadow="none"
                            radius="none"
                            src="/Group 121.svg"
                            classNames={{ img: "w-16 max-w-16" }}
                          />
                          <div className="flex flex-col gap7 justify-start">
                            <p className="text-md text-[#f2f2f2] text-xl">
                              Launch your token
                            </p>
                            <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal">
                              No pre-sale, no insiders, max 1B
                            </p>
                            <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal"    >
                              supply.
                            </p>
                          </div>
                        </div>

                        {/* <Tooltip
                          showArrow={true}
                          content="comming soon"
                          placement="right"
                        >
                          <div className="flex gap-3 hover:bg-[#221F2E] p-5 rounded-lg box-border">
                            <Image
                              shadow="none"
                              radius="none"
                              src="/Group 122.svg"
                              classNames={{ img: "w-16 max-w-16" }}
                            />
                            <div className="flex flex-col gap7 justify-start">
                              <p className="text-md text-[#f2f2f2] text-xl">
                                Create Live
                              </p>
                              <p className="text-small text-[#757083] overflow-wrap-normal whitespace-normal">
                                Associate your own created memecoin, and you can
                                start live streaming.
                              </p>
                            </div>
                          </div>
                        </Tooltip> */}
                      </div>
                    </div>
                  )}
                </div>
              </Tooltip>
            ) : (
              //   <Button color="primary" className="bg-[#5A58F2] w-[10rem]" onClick={() => { setHandleOpen(true) }}>
              //   Connect Wallet
              // </Button>
              <WalletMultiButtonDynamic ><span>Connect Wallet</span></WalletMultiButtonDynamic>
            )}
          </NavbarItem>
          {isConnect && (
            <NavbarItem>
              <Dropdown placement="bottom" className="w-64 bg-[#14111C] ">
                <DropdownTrigger>
                  <Button className="bg-transparent">
                    <Image
                      className="w-[32px] max-w-[32px] h-[32px]"
                      src={avatar}
                    /><div className="flex flex-col text-left"><p>{username}</p><p>{sol.toFixed(4)}SOL</p></div>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className="bg-[#14111C] rounded-xl">
                  <DropdownItem className=" data-[hover=true]:bg-transparent border-none py-2">
                    <User
                      as="button"
                      name={username && username.slice(-4)}
                      description={
                        <NextLink
                          className="flex items-center gap-1 text-base text-[#5A58F2] font-semibold"
                          href="/personalCenter"
                        >
                          view Profile
                        </NextLink>
                      }
                      className="transition-transform w-full flex flex-row justify-start text-sm"
                      avatarProps={{
                        src: avatar,
                      }}
                    />
                  </DropdownItem>
                  {/* <DropdownItem className=" data-[hover=true]:bg-default-100/40 border-none">
                    <div>
                  </DropdownItem>  */}
                  <DropdownItem className=" data-[hover=true]:bg-transparent border-none">
                    <div className="text-small font-bold bg-[#221F2E] rounded-xl">
                      <Listbox
                        variant="faded"
                        aria-label="Listbox menu with icons"
                        // disabledKeys={["point"]}
                        className="p-0 gap-0 rounded-medium border-none"
                        itemClasses={{
                          base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/40 border-none",
                        }}
                      >
                        <ListboxItem
                          key="personalCenter"
                          href="/personalCenter"
                          startContent={<MyMeIcon className={iconClasses} />}
                        >
                          My MEME
                        </ListboxItem>
                        <ListboxItem
                          key="point"
                          startContent={<MyPointIcon className={iconClasses} />}
                        >
                          <Tooltip
                            showArrow={true}
                            content="comming soon"
                            placement="right"
                          >
                            <Button className="bg-transparent p-0 m-0 gap-0 min-w-0">
                              My Points
                            </Button>
                          </Tooltip>
                        </ListboxItem>
                        {/* <ListboxItem
                        key="edit"
                        startContent={<SetIcon className={iconClasses} />}
                      >
                          Setting
                      </ListboxItem> */}
                      </Listbox>
                    </div>
                  </DropdownItem>
                  <DropdownItem className=" data-[hover=true]:bg-transparent border-none flex flex-row justify-center">
                    <div className="w-full flex justify-center items-center">
                      <WalletDisconnectButtonDynamic />
                    </div>
                    {/* <Button className="text-base w-full flex flex-row justify-center text-[#5a58f2] bg-transparent text-center" onClick={handleDisconnect}>
                  Disconnect
                  </Button> */}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarItem>
          )}
        </NavbarContent>
        {isConnect && !leftBar ? (
          <NavbarContent
            className="sm:hidden w-full flex flex-row justify-between"
            justify={isMenuOpen ? "between" : "end"}
          >
            {/* <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch /> */}

            <NavbarMenuToggle
              className="bg-[transparent]"
              icon={
                isMenuOpen ? (
                  <CloseIcon />
                ) : (
                  <Image
                    shadow="none"
                    radius="none"
                    className="w-[32px] max-w-[32px]"
                    src={avatar}
                  />
                )
              }
              onChange={handleRightToggle}
            />
            {isMenuOpen ? (
              <NextLink className="flex items-center gap-1" href="">
                <Image
                  shadow="none"
                  radius="none"
                  className="w-[32px] max-w-[32px] sm:w-[48px] object-cover"
                  src={avatar}
                />
                <p className="w-24 overflow-hidden text-ellipsis">{address}</p>
              </NextLink>
            ) : (
              <></>
            )}
          </NavbarContent>
        ) : (
          <NavbarContent
            className={`${leftBar ? "hidden" : "flex"} sm:hidden basis-1`}
            justify="end"
          >
            <div
              className={`w-8  ${leftBar ? "pointer-events-none" : "pointer-events-auto"} custom-wallet-button`}
            >
              <WalletMultiButtonDynamic />
            </div>
          </NavbarContent>
        )}

        {rightBar ? (
          <NavbarMenu>
            {/* {searchInput} */}
            <div className="mx-4 mt-2 flex flex-col gap-3">
              <Button
                variant="bordered"
                className="w-full border border-[#221F2E] rounded text-lg font-normal text-[#5A58F2] font-semibold"
                onClick={handleView}
              >
                View Profile
              </Button>
              <Listbox
                aria-label="Actions"
                classNames={{
                  base: "w-full pt-3",
                  list: "gap-4",
                }}
              >
                <ListboxItem
                  key="personalCenter"
                  href="/personalCenter"
                  classNames={{ title: "text-lg" }}
                  startContent={<MyMeIcon className={iconClasses} />}
                  onClick={handleView}
                >
                  My MEME
                </ListboxItem>
                <ListboxItem
                  key="Whitepaper"
                  href="/"
                  classNames={{ title: "text-lg" }}
                  startContent={<MyPointIcon className={iconClasses} />}
                >
                  My Points
                </ListboxItem>
                {/* <ListboxItem
                  key="Wallet"
                  href="/"
                  classNames={{ title: "text-lg" }}
                  startContent={<MyMeIcon className={iconClasses} />}
                >
                  Setting
                </ListboxItem> */}
              </Listbox>
              <div className="w-full flex justify-center items-center">
                <WalletDisconnectButtonDynamic />
              </div>
              {/* <Button variant="bordered" className="w-full border border-[#221F2E] rounded text-lg font-normal text-[#5A58F2] font-semibold" onClick={handleDisconnect}>
              Disconnect
            </Button> */}
              {/* {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    index === 2
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "danger"
                        : "foreground"
                  }
                  href="#"
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))} */}
            </div>
          </NavbarMenu>
        ) : (
          <></>
        )}
      </NextUINavbar>
      <ConnectWallet
        handleOpen={handleOpen}
        setClose={() => {
          setHandleOpen(false);
        }}
        setIsConnect={handleConnect}
      />
      <HowWorkModal
        handleOpen={handleWorkOpen}
        setClose={() => {
          setHandleWorkOpen(false);
        }}
      />
      <MarketCapTable
        handleOpen={handleMarketCapTable}
        setClose={() => {
          setHandleMarketCapTable(false);
        }}
      />
      {guidePage != 0 && (
        <div className="absolute w-[150%] h-[150%] z-[100]"></div>
      )}
      {showAlert && (
        <div className="fixed z-50 text-nowrap flex flex-row w-max h-[48px] justify-center items-center gap-4 top-[20%] left-[50%] translate-x-[-50%] translate-y-[-40%] bg-[#12111F] text-[#5A58F2] border-l-4 border-[#5A58F2] flex-1 px-8 py-3">
          <Image src="/StatusIcon.svg" className="w-5" />
          {alertMessage}
        </div>
      )}
    </>
  );
};
