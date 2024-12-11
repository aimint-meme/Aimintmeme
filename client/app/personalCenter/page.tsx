"use client";
import React, { useState, useEffect } from "react";
import { Button, Image, Snippet, Spinner } from "@nextui-org/react";
import { Link } from "@nextui-org/link";
import {
  MyTwitterIcon,
  TelegramIcon,
  MyVectorIcon,
  GlobeIcon,
  LighterIcon, ForwardIcon
} from "@/components/icons";
import { MemesCard } from "@/components/memesCard";
import { PersonMemesCard } from "@/components/personMemesCard";
import NextLink from "next/link";
import { useSearchParams } from 'next/navigation'
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { PersonnelShare } from "@/components/PersonnelShare";
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {AlertBox} from "@/components/AlertBox";

const solScanBaseUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_BASE_URL;
const clusterParam = process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM ? `?${process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM}` : '';


export default function PersonCenterPage() {
  const [isctive, setActive] = useState(1);
  const [responseData, setResponseData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollow, setIsfollow] = useState(null);
  const searchParams = useSearchParams();
  const otherUserId = searchParams.get('userId');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loadings, setLoadings] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [solPrice, setSolPrice] = useState(1)
  const LIMIT = 8; // 每页显示的项目数量  
  const apiUrl = "/user/personal";  //主页信息接口
  const unfollowUrl = "/user/unfollowUser";  //取消关注接口
  const followUrl = "/user/followUser";  //关注接口
  const tokenUrl = "/user/heldCreateToken";  //持有代币接口
  const apiUrlSol = "/token/sqlPrice";
  const [handleOpen, setHandleOpen] = React.useState(false);
  const [balancesRes, setBalancesRes] = useState([]);
  const { connection } = useConnection();
  const address = useLocalGlobalStore(state => state.wallet.address);
  const userId = useLocalGlobalStore(state => state.wallet.userId);
  const data = { "address": address, "userId": userId };
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  const simulateTransactionFailure = (message) => {
    setShowAlert(true);
    setAlertMessage(message);
  };

  useEffect(() => {
    Api.post(apiUrlSol, {}, userId).then(res => {
      setSolPrice(res?.solPrice);
    }).catch(error => {
    });
  }, []);

  //取消关注
  const handleUnfollow = async () => {
    setError(null);
    try {
      const responseData = await Api.post(unfollowUrl, { "followedId": otherUserId }, userId);
      //const responseData = await response.json(); // 解析响应为 JSON 格式  
      setIsfollow(false);
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
      setLoading(false);
    }
  }

  //关注
  const handleFollow = async () => {
    setError(null);
    try {
      const responseData = await Api.post(followUrl, { "followedId": otherUserId }, userId);
      setIsfollow(true);
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
      setLoading(false);
    }
  }

  //请求个人主页列表接口
  const handlePersonalData = async (data) => {
    setLoading(true);
    setError(null);
    try {
      let id = otherUserId ? otherUserId : userId;
      const responseData = await Api.post(apiUrl, { "userId": id }, userId);
      setResponseData(responseData);
      setIsfollow(responseData.isfollowed)
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
      setLoading(false);
    }
  };

  //切换创建与持有标签页
  const handleTab = (index) => {
    setActive(index);
    setItems([]);
    setPage(1);
    handleHeldToken(index, 1);
  }

  //首次加载页面调用个人主页列表接口
  useEffect(() => {
    handlePersonalData(data);//调用个人主页列表接口
  }, [otherUserId, address, userId]);

  //请求持有代币列表接口
  const handleHeldToken = async (index, page) => {
    setLoadings(true);
    try {
      let id = otherUserId ? otherUserId : userId;
      let type = index == 1 ? "helds" : "created";
      const data = await Api.post(tokenUrl, { page: page, limit: LIMIT, "userId": id, "type": type }, userId);
      if (!data.items) {
        setHasMoreData(false)
        return;
      }
      if (data.items && data.items.length > 0) {
        setHasMoreData(true)
        if (page == 1) {
          index == 1 && handleTokenBalances([...data.items])
          setItems([...data.items]);
        } else {
          setItems((prevItems) => [...prevItems, ...data.items]);
        }
      } else {
        setHasMoreData(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      simulateTransactionFailure(error.message)
    }
    setLoadings(false);
  };

  useEffect(() => {
    handleHeldToken(isctive, page);
  }, [page, otherUserId, address, userId]);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !loadings && hasMoreData) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadings]);

  // 获取与钱包关联的所有Token账户  
  async function getTokenAccountsForWallet(connection, walletPk, mintPdaAddress) {
    const response = await connection.getTokenAccountsByOwner(
      walletPk,
      {
        mint: new PublicKey(mintPdaAddress),
      },
      'confirmed'
    );
    return response.value.map(accountInfo => accountInfo);
  }

  //  切换到sell获取token余额
  const handleTokenBalances = async (dataList) => {
    if (address) {
      // try {
      //   // 钱包公钥  
      //   const walletPublicKey = new PublicKey(address);
      //   let res = [];
      //   dataList?.map(async item => {
      //     const tokenAccounts = await getTokenAccountsForWallet(connection, walletPublicKey, item.mintPdaAddress);
      //     // 找到与特定代币程序ID关联的Token账户 
      //     if (tokenAccounts.length > 0) {
      //       const pubkeyString = tokenAccounts[0].pubkey.toString();
      //       const balanceResponse = await connection.getTokenAccountBalance(new PublicKey(pubkeyString));
      //       res.push({ ...balanceResponse.value, mintPdaAddress: item.mintPdaAddress })
      //       setBalancesRes([...balancesRes, ...res])
      //     } else {
      //       return 0; // 或者抛出错误，表示没有找到与给定mint关联的Token账户  
      //     }
      //   })
      // } catch (error) {
      //   console.log(error, "error")
      // }

      try {
        const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        // 钱包公钥  
        const walletPublicKey = new PublicKey(address);
        // 获取钱包所有Token账户的地址
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
          programId: tokenProgramId,
        });

        if (tokenAccounts.value.length === 0) {
          console.log("没有找到任何SPL Token账户");
          return;
        }

        let res = [];

        // 打印所有Token账户的余额
        for (const { pubkey, account } of tokenAccounts.value) {
          const tokenAmount = account.data.parsed.info.tokenAmount.uiAmount;
          const mintAddress = account.data.parsed.info.mint;
          res.push({ pubkey: pubkey.toBase58(), mintPdaAddress:mintAddress, uiAmount:tokenAmount })
        }
        setBalancesRes(res)
      } catch (error) {
        simulateTransactionFailure(error.message)
        console.log("获取SPL Token余额时出错:", error);
      }
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col items-center w-full relative gap-5">
        <Image alt="NextUI hero Image" src={responseData.coverImage} className="w-full  sm:max-w-[1192px] h-[120px] sm:h-[240px] object-contain" />
        <Image
          src={responseData.avatar}
          className="object-cover maw-w-[80px] w-20 h-20 text-large -top-[62px]"
        />
        <p className="text-2xl font-bold text-[#DFE2EA] -mt-16">
          {responseData.username}
        </p>
        <div className="flex flex-row justify-center items-center">
          <ul className="flex flex-row gap-6 sm:gap-16 font-semibold text-[14px] font-semibold">
            <li>
              <p
                className="text-[#5A58F2] font-semibold"
              >
                {responseData.following}
              </p>
              <p className="text-[#DFE2EA]">
                Following
              </p>
            </li>
            <li>
              <p
                className="text-[#5A58F2] font-semibold"
              >
                {responseData.followers}
              </p>
              <p className="text-[#DFE2EA]">
                Followers
              </p>
            </li>
            <li>
              <p
                className="text-[#DFE2EA] font-semibold"
              >
                {responseData.likes}
              </p>
              <p className="text-[#DFE2EA]">
                Likes
              </p>
            </li>
            <li>
              <p
                className="text-[#DFE2EA] font-semibold"
              >
                {responseData.mentions}
              </p>
              <p className="text-[#DFE2EA]">
                Mentions
              </p>
            </li>
          </ul>
        </div>
        <div className="w-full flex flex-row justify-center items-center gap-5 cursor-pointer">
          {responseData.xLink !== "" && (<Link
            isExternal
            href={responseData.xLink}
          >
            <MyTwitterIcon />
          </Link>)}
          {responseData.telegramLink !== "" && (<Link
            isExternal
            href={responseData.telegramLink}
          >
            <TelegramIcon />
          </Link>)}
          {responseData.discordLink !== "" && (<Link
            isExternal
            href={responseData.discordLink}
          >
            <MyVectorIcon />
          </Link>)}
          {responseData.website !== "" && (<Link
            isExternal
            href={responseData.website}
          >
            <GlobeIcon />
          </Link>)}
        </div>
        <p className="max-w-2xl">
          {responseData.intro}
        </p>
        {!responseData.itself && userId && <div>
          <Button
            className={`${isFollow ? 'bg-transparent text-[#5a58f2] border border-[#5a58f2]' : 'bg-[#5a58f2] text-[#F2F2FC]'}  w-[80px] h-[32px] rounded-small sm:min-w-[80px] sm:w-[80px] sm:h-[32px] sm:rounded-medium`}
            onClick={() => {
              isFollow
                ? handleUnfollow()
                : handleFollow();
            }}
          >
            {isFollow ? 'Followed' : 'Follow'}
          </Button>
        </div>}
        <div className="flex flex-row justify-center items-center gap-5 cursor-pointer">
          <Snippet hideSymbol variant="bordered" classNames={{ base: 'w-26 h-8 sm:h-10 border border-[#5a58f2] text-[#5a58f2]', pre: 'w-[114px] overflow-hidden text-ellipsis', copyButton: 'w-6 h-6' }}>{responseData.address}</Snippet>
          {responseData.itself && userId && (<Button
            isIconOnly
            color="danger"
            variant="bordered"
            className="border border-[#5a58f2] min-w-8 w-8 h-8 rounded-small sm:min-w-10 sm:w-10 sm:h-10 sm:rounded-medium"
          >
            <NextLink
              className="flex items-center gap-1 text-base text-[#5A58F2] font-semibold"
              href="/personEdit"

            >
              <LighterIcon />
            </NextLink>
          </Button>)}
          {userId && (<Button
            isIconOnly
            color="danger"
            variant="bordered"
            className="border border-[#5a58f2] min-w-8 w-8 h-8 rounded-small sm:min-w-10 sm:w-10 sm:h-10 sm:rounded-medium"
            onClick={() => { setHandleOpen(true) }}
          >
            <ForwardIcon />
          </Button>)}
        </div>
        <div className="flex flex-row justify-center items-center gap-5 cursor-pointer">
          <Link
            isExternal
            href={`${solScanBaseUrl}${responseData.address}${clusterParam}`}
          >
            <Button
              variant="bordered"
              className="border-[#10f4b11a] text-[#10F4B1] bg-[#10f4b11a]"
            >
              View on solscan
            </Button>
          </Link>

        </div>
        <div className="flex flex-row justify-center items-center md:px-4 md:py-2 md:gap-5 cursor-pointer bg-[#221F2E] rounded-medium w-full md:w-72">
          <Button
            variant="bordered"
            className={`border-none text-[#F1F2F6] ${isctive == 1 ? "bg-[#5a58f2]" : "bg-transparent"} w-1/2 p-0`}
            onClick={() => { handleTab(1) }}
          >
            MEMEs Held
          </Button>
          <Button
            variant="bordered"
            className={`border-none text-[#F1F2F6] ${isctive == 2 ? "bg-[#5a58f2]" : "bg-transparent"} w-1/2 p-0`}
            onClick={() => { handleTab(2) }}
          >
            MEMEs Created
          </Button>
        </div>
        <div className="w-full flex flex-row justify-center items-center gap-5">
          {isctive == 1 ? <PersonMemesCard list={items} solPrice={solPrice} balancesRes={balancesRes} /> : <MemesCard list={items} solPrice={solPrice} balancesRes={balancesRes} />}
        </div>
      </div>
      {loadings && <div>Loading...</div>}
      <div className="flex flex-row justify-between gap-8"></div>
      {!loadings && !items?.length && <div className="flex flex-col justify-center items-center">
        <Image
          className="w-[90px] max-w-[90px] h-[90px] mt-20"
          src={'/noData.gif'}
        />
        No Data
      </div>}
      <PersonnelShare handleOpen={handleOpen} setClose={() => { setHandleOpen(false) }} id={otherUserId ? otherUserId : userId} username={responseData.username} />
      <AlertBox
        showAlert={showAlert}
        alertMessage={alertMessage}
        handleCloseAlert={handleCloseAlert}
      />
    </div>
  );
}
