"use client";
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Progress, Pagination, Spinner,Image } from "@nextui-org/react";
import { PolygonIcon, MyTwitterIcon } from "@/components/icons";
import { ProgressBar } from '@/components/progress';
import { MarketCap } from '@/components/marketCap';
import { Link } from "@nextui-org/link";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatTokenCount,formattedNumber } from '@/src/utils/globalUtils';
import { useSolBalance } from '@/src/utils/getWallet';
import {AlertBox} from "@/components/AlertBox";

const solScanBaseUrl = process.env.NEXT_PUBLIC_APP_SOLSCAN_BASE_URL;
const clusterParam = process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM ? `?${process.env.NEXT_PUBLIC_APP_SOLSCAN_CLUSTER_PARAM}` : '';

export const Holder = (props) => {
  const [page, setPage] = React.useState(1);
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const { getTop20Holder } = useSolBalance();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  const simulateTransactionFailure = (message) => {
    setShowAlert(true);
    setAlertMessage(message);
  };
  const apiUrl = "/token/holder";
  const rowsPerPage = 10;
  const data = { "tokenId": 10, "page": page, "limit": rowsPerPage };

  const rows = [
    {
      key: "1",
      rank: "1",
      address: "CEO",
      per: "Active",
      amount: "999",
      value: '$59.5K'
    },
    {
      key: "2",
      rank: "2",
      address: "CEO",
      per: "Active",
      amount: "999",
      value: '$59.5K'
    },
    {
      key: "3",
      rank: "3",
      address: "CEO",
      per: "Active",
      amount: "999",
      value: '$59.5K'
    },
    {
      key: "4",
      rank: "4",
      address: "CEO",
      per: "Active",
      amount: "999",
      value: '$59.5K'
    },
  ];

  const columns = [
    {
      key: "rank",
      label: "Rank",
    },
    {
      key: "address",
      label: "Address",
    },
    {
      key: "accountPercentage",
      label: "%",
    },
    {
      key: "amount",
      label: "Amount",
    },
    {
      key: "uiAmount",
      label: "Value",
    },
  ];
  //查询前20名持有数据
  const handleFetchHolder = async (mint) => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await getTop20Holder(mint);
      const processedData = responseData.map((item, index) => ({
        ...item,
        rank: index + 1, // 从1开始计数  
        accountPercentage:`${((Number((item.uiAmountString)) / 1000000000) * 100).toFixed(6)}%`,
        address:item.address && item.address.toBase58()
      }));
      setResponseData([...processedData]);
      const pages = Math.ceil(processedData.length / rowsPerPage);
      setTotal(pages)
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
      setLoading(false);
    }
  };

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
                  <span className="border-b-2 border-b-[#5A58F2]">Bonding curve</span>
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

// 计算当前页应该显示的数据项
const paginatedData = responseData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  //首次加载页面调用代币列表接口
  useEffect(() => {
    // 首次加载时获取数据
    if(props.mintPdaAddress){
      handleFetchHolder(props.mintPdaAddress);
    }
  }, [props.mintPdaAddress]);
  if (loading) return <Spinner />;
  return (
    <div className="flex flex-row gap-4 w-full justify-between text-left items-start md:h-auto holder-mobile-h bg-[#14111C] h-[100%]">
      <Table aria-label="Example table with dynamic content"
        classNames={{
          base: ["p-0", "w-full","h-[100%]"],
          wrapper: "bg-[#14111C] pb-4 h-[100%]",
          th: ["bg-transparent", "text-[#637592]", "text-xs", "sm:text-sm"],
          td: ["border-t", "border-[#191D24]", "gap-1", "border-b", "border-[#07050A]", "text-[#F2F2FC]", "text-xs", "sm:text-sm"]
        }}
        bottomContent={
          <div className="flex w-full justify-center">
            {total > 0 && (<Pagination
            showControls
              page={page}
              total={total}
              onChange={(page) => { setPage(page) }}
              classNames={{
                cursor: "bg-[#5a58f2] text-[#ffffff]",
              }}
              variant="bordered"
            />)}
          </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key} className={`${column.key == 'amount' ? 'hidden sm:table-cell' : ''}`}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={paginatedData} emptyContent={
          <div className="flex flex-col justify-center items-center">
            <img
              className="w-[90px] max-w-[90px] h-[90px] mt-20"
              src={'/noData.gif'}
            />
            No Data
          </div>
        }>
          {(item) => (
            <TableRow key={item.address}>
              {(columnKey) => <TableCell className={`${columnKey == 'amount' ? 'hidden sm:table-cell' : ''}`}>{renderCell(item, columnKey)}</TableCell>}
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