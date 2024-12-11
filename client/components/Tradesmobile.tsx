"use client";
import React, { useState,useEffect,useLayoutEffect,useRef } from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow,Image, TableCell, Pagination, Spinner, getKeyValue,User } from "@nextui-org/react";
import {useInfiniteScroll} from "@nextui-org/use-infinite-scroll";
import {useAsyncList} from "@react-stately/data";
import { Link } from "@nextui-org/link";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatRelativeToNow } from '@/src/utils/timeFormat';
import { formatTokenCount,formattedNumber } from '@/src/utils/globalUtils';

const solScanTxUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_TX_URL;
const clusterParam = process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM ? `?${process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM}` : '';


export const Tradesmobile = (props) => {
  // const scrollDivRef = useRef(null);
  const [page, setPage] = React.useState(1);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasMoreData, setHasMoreData] = useState(true);
  const apiUrl = "/token/trades";
  const rowsPerPage = 10;
  const [hasMore, setHasMore] = React.useState(false);

  
  let list = useAsyncList({
    async load({signal, cursor}) {
      if (cursor) {
        setIsLoading(false);
      }
      // const res = await fetch(cursor || "https://swapi.py4e.com/api/people/?search=", {signal});
      const res = await Api.post(apiUrl, { "tokenId": props.tokenId, "page":page, "limit":rowsPerPage }, userId);
      
      const hasNextPage = (page * rowsPerPage) < res.total;
      console.log("hasNextPage",hasNextPage)
      setHasMore(hasNextPage);
      if(hasNextPage){
        setPage((prevPage) => prevPage + 1);
      }
      setIsLoading(false);
      return {
        items: res.items,
        cursor: hasNextPage,
      };
    },
  });
  
  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "username":
        return (
          <User
            avatarProps={{ radius: "lg", src: `${user.avatar}`,className:"w-6 h-6 text-tiny" }}
            name={(
              <Link href={`/personalCenter?userId=${user.userId}`} size="sm">
                <div className="text-xs sm:text-sm text-[#585af2]">{user.username}</div>
              </Link>
            )}
          >
            
          </User>
        );
      case "transactionType":
        return (
          <div className="flex flex-col">
            <p className={`text-xs sm:text-small capitalize ${cellValue == 'buy' ? 'text-[#10F4B1]' : 'text-[#FF3E80]'}`}>
              {cellValue}
            </p>
          </div>
        );
        case "tokenAmount":
        return (
          <div className="flex flex-col">
              {formatTokenCount(cellValue)}
          </div>
        );
        case "solAmount":
        return (
          <div className="flex flex-col">
            <p className="max-w-[200px] ">
              {formattedNumber(parseFloat(cellValue).toFixed(5))}
            </p>
          </div>
        );
        case "transactionTime":
        return (
          <div className="flex flex-col">
            <p className="max-w-[200px] ">
              {formatRelativeToNow(cellValue,user.currentTime)}
            </p>
          </div>
        );
        case "tx":
        return (
          <div className="flex flex-row gap-2 items-center">
            <Link href={`${solScanTxUrl}${cellValue}${clusterParam}`} size="sm" isExternal>
                <div className="text-xs sm:text-sm text-[#585af2]">{cellValue.substr(-4)}</div>
            </Link>
            {user.frequent == 1 && <Image src="/markTriangle.svg" className="w-3 rounded-none" />}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

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
const [loaderRef, scrollerRef] = useInfiniteScroll({hasMore, onLoadMore: list.loadMore});
  return (
    <div className="flex flex-row gap-4 w-full justify-between text-left items-start md:h-auto holder-mobile-h overflow-auto bg-[#14111C] h-[100%]">
    <Table
      isHeaderSticky
      baseRef={scrollerRef}
      aria-label="Example table with infinite pagination"
      classNames={{
        base: ["p-0", "w-full","h-[100%]"],
        wrapper: "bg-[#14111C] pb-4 h-[100%] p-0",
        // base:["p-0","w-full","h-[100%]"],
        // wrapper: "p-0 bg-[#14111C] pb-4 h-[100%]",
        thead:'bg-[#14111C]',
        th: ["bg-transparent", "text-[#637592]","text-xs", "sm:text-sm","p-1"],
        td:["border-t","border-[#191D24]","gap-1", "border-b", "border-[#07050A]","text-[#637592]","text-xs", "sm:text-sm","p-1"]
      }}
      // baseRef={scrollerRef}
      bottomContent={
        hasMore ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white" />
          </div>
        ) : null
      }
    //   classNames={{
    //     base: "max-h-[520px] overflow-scroll",
    //     table: "min-h-[400px]",
    //   }}
    >
      <TableHeader>
        <TableColumn key="username">Account</TableColumn>
        <TableColumn key="transactionType">Type</TableColumn>
        <TableColumn key="solAmount">SOL</TableColumn>
        <TableColumn key="tokenAmount">STICKER</TableColumn>
        <TableColumn key="transactionTime">Date</TableColumn>
        <TableColumn key="tx">Transaction</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        items={list.items}
        emptyContent={emptyContent}
        loadingContent={<Spinner color="white" />}
      >
        {(item) => (
          <TableRow key={item.name}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
