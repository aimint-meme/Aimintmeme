"use client";
import React, { useState,useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Chip,
  User,Spinner,Image
} from "@nextui-org/react";
import { PolygonIcon, MyTwitterIcon } from "@/components/icons";
import {useInfiniteScroll} from "@nextui-org/use-infinite-scroll";
import {useAsyncList} from "@react-stately/data";
import { ProgressBar } from "@/components/progress";
import { MarketCap } from "@/components/marketCap";
import { Link } from "@nextui-org/link";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatRelativeToNow } from '@/src/utils/timeFormat';
import { formatTokenCount,formattedNumber } from '@/src/utils/globalUtils';
import {AlertBox} from "@/components/AlertBox";

const solScanTxUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_TX_URL;
const clusterParam = process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM ? `?${process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM}` : '';

export const Trades = (props) => {
  const [page, setPage] = React.useState(1);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  const simulateTransactionFailure = (message) => {
    setShowAlert(true);
    setAlertMessage(message);
  };
  const apiUrl = "/token/trades";
  const rowsPerPage = 10;
  const data = { "tokenId": 10, "page":page, "limit":rowsPerPage };
  
  const columns = [
    {
      key: "username",
      label: "Account",
    },
    {
      key: "transactionType",
      label: "Type",
    },
    {
      key: "solAmount",
      label: "SOL",
    },
    {
      key: "tokenAmount",
      label: "STICKER",
    },
    {
      key: "transactionTime",
      label: "Date",
    },
    {
      key: "tx",
      label: "Transaction",
    },
  ];
  
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
            {user.frequent == 1 && <Image src="/markTriangle.svg" className="w-4 rounded-none" />}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  //请求代币交易列表数据
  const handleFetchData = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await Api.post(apiUrl, { "tokenId": props.tokenId, "page":page, "limit":rowsPerPage }, userId);
      setResponseData([...responseData.items]);
      const pages = Math.ceil(responseData.total / rowsPerPage);
      setTotal(pages)
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
      setLoading(false);
    }
  };

  //首次加载页面调用代币列表接口
  useEffect(() => {
      // 首次加载时获取数据
      handleFetchData(1);
  }, [userId]);
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
  if (loading) return <Spinner />;
  return (
    <div className="flex flex-row gap-4 w-full justify-between text-left items-center  text-xs sm:text-sm  h-[100%]">
      <Table
        aria-label="Example table with dynamic content"
        classNames={{
          // table:"table-height-calc",
          // base:["p-0","w-full","height-calc", "sm:h-auto"],
          // base: "table-height-calc overflow-scroll scroll-mb-5",
          // table: "min-h-[150px] mb-8",
          // wrapper: "bg-[#14111C] pb-4 h-[100%]",
          base: ["p-0", "w-full","h-[100%]"],
          wrapper: "bg-[#14111C] pb-4 h-[100%]",
          th: ["bg-transparent", "text-[#637592]","text-xs", "sm:text-sm"],
          td:["border-t","border-[#191D24]","gap-1", "border-b", "border-[#07050A]","text-[#637592]","text-xs", "sm:text-sm"]
        }}
        bottomContent={
          <div className="flex w-full justify-center">
            {total > 0 && (<Pagination
            showControls
              page={page}
              total={total}
              onChange={(page) => { setPage(page); handleFetchData(page) }}
              classNames={{
                cursor: "bg-[#5a58f2] text-[#ffffff]",
              }}
              variant="bordered"
            />)}
          </div>
          // responseData.length > 0 && (<div className="flex w-full justify-center fixed sm:static bottom-[56px] left-[50%] translate-x-[-50%] box-border">
          //   <div className="mx-6 bg-[#14111C] w-[100%] flex justify-center">
          //   <Pagination
          //   isCompact 
          //   showControls
          //     page={page}
          //     total={total}
          //     onChange={(page) => {setPage(page);handleFetchData(page)}}
          //     classNames={{
          //       prev: "bg-transparent",
          //       next: "bg-transparent",
          //       item: "bg-transparent",
          //       cursor: "bg-[#5a58f2] text-[#ffffff]",
          //     }}
          //     // variant="bordered"
          //   />
          //   </div>
            
          // </div>)
          
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
        items={responseData}
        emptyContent={emptyContent}
        loadingContent={<Spinner color="white" />}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AlertBox
        showAlert={showAlert}
        alertMessage={alertMessage}
        handleCloseAlert={handleCloseAlert}
      />
    </div>
  );
};
