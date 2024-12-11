"use client";
import React, { useState, useEffect } from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, getKeyValue,User,Image } from "@nextui-org/react";
import {useInfiniteScroll} from "@nextui-org/use-infinite-scroll";
import {useAsyncList} from "@react-stately/data";
import { Link } from "@nextui-org/link";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatTokenCount,formattedNumber } from '@/src/utils/globalUtils';
import { useSolBalance } from '@/src/utils/getWallet';

const solScanBaseUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_BASE_URL;
const clusterParam = process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM ? `?${process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM}` : '';


export const Holdermobile = (props) => {
  const [page, setPage] = React.useState(1);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [error, setError] = useState(null);
  const { getTop20Holder } = useSolBalance();
  const apiUrl = "/token/holder";
  const rowsPerPage = 20;

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case "rank":
        return (
          <div className="flex flex-row">
            {cellValue}
          </div>
        );
      case "address":
        return (
          <div className="flex flex-row">
            <Link
              isExternal
              className="flex items-center gap-1 text-current text-[#5a58f2]"
              href={`${solScanBaseUrl}${cellValue}${clusterParam}`}
            >
              {cellValue === props.tokenAddress ? (
                <>
                  <span className="border-b-2 border-b-[#5A58F2] text-nowrap">Bonding curve</span>
                  <img src="/bondingCurve.svg" className="w-5 rounded-none" />
                </>
              ) : (
                `${cellValue.slice(0, 6)}...${cellValue.slice(-4)}`
              )}
            </Link>
          </div>
        );
        case "accountPercentage":
        return (
          <div className="flex flex-row">
            {formattedNumber(parseFloat(cellValue.replace('%', '')))}%
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-row items-center gap-1 text-[#ffffff]">
            <Progress aria-label="Loading..." value={Number(user.accountPercentage && user.accountPercentage.slice(0, -1))} className="max-w-md" classNames={{
              base: "max-w-md",
              track: "drop-shadow-md border border-default",
              indicator: "bg-[#5a58f2]",
            }} />
          </div>
        );
      case "uiAmount":
        return (
          <div className="flex flex-col">
            {formatTokenCount(cellValue)}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  //请求代币持有列表数据
  const handleFetchHolder = async (mint) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTop20Holder(mint);
      if (!data) {
        setHasMoreData(false)
        return;
      }
      if (data && data.length > 0) {
        setHasMoreData(true)
        const processedData = data.map((item, index) => ({
          ...item,
          rank: index + 1, // 从1开始计数  
          accountPercentage:`${((Number((item.uiAmountString)) / 1000000000) * 100).toFixed(6)}%`,
          address:item.address && item.address.toBase58()
        }));
        setResponseData((prevItems) => [...prevItems, ...processedData]);
      } else {
        setHasMoreData(false)
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首次加载时获取数据
    if(props.mintPdaAddress){
      handleFetchHolder(props.mintPdaAddress);
    }
  }, [props.mintPdaAddress]);
  // const handleScroll = () => {
  //   const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  //   if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMoreData) {
  //     setPage((prevPage) => prevPage + 1);
  //   }
  // };
  
  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll);
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [loading]);
  //数据为空时显示内容
const emptyContent = (
  <div className="flex flex-col justify-center items-center">
        <img
          className="w-[90px] max-w-[90px] h-[90px] mt-20"
          src={'/noData.gif'}
        />
        No Data
      </div>
);

  return (
    <div className="flex flex-row gap-4 w-full justify-between text-left items-start md:h-auto holder-mobile-h overflow-auto bg-[#14111C] h-[100%]">
    <Table
      isHeaderSticky
      aria-label="Example table with infinite pagination"
      classNames={{
        base: ["p-0", "w-full","h-[100%]"],
        wrapper: "bg-[#14111C] pb-4 h-[100%] p-0",
        thead:'bg-[#14111C]',
        th: ["bg-transparent", "text-[#637592]","text-[14px]", "sm:text-sm"],
        td:["border-t","border-[#191D24]","gap-1", "border-b", "border-[#07050A]","text-[#F2F2FC]","font-normal","text-[12px]", "sm:text-sm"]
      }}
      // bottomContent={
      //   hasMoreData ? (
      //     <div className="flex w-full justify-center">
      //       <Spinner color="white" />
      //     </div>
      //   ) : null
      // }
    //   classNames={{
    //     base: "max-h-[520px] overflow-scroll",
    //     table: "min-h-[400px]",
    //   }}
    >
      <TableHeader>
        <TableColumn key="rank">Rank</TableColumn>
        <TableColumn key="address">Address</TableColumn>
        <TableColumn key="accountPercentage">%</TableColumn>
        <TableColumn key="uiAmount">Value</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={loading}
        items={responseData}
        emptyContent={emptyContent}
        loadingContent={<Spinner color="white" />}
      >
        {(item) => (
          <TableRow key={item.rank}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
