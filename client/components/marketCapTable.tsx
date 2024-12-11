"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Link
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { SearchIcon } from "../app/marketCap/SearchIcon";
import { columns, sortKeyMap } from "../app/marketCap/data";
import { useRouter } from "next/navigation";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatTokenCount } from '@/src/utils/globalUtils';
const apiUrl = "/token/search", apiUrlSol = "/token/sqlPrice";

export const MarketCapTable = ({ handleOpen, setClose }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedKeys, setSelectedKeys] = useState(new Set(["24h"]));
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "marketCap",
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solPrice, setSolPrice] = useState(1)
  const userId = useLocalGlobalStore(state => state.wallet.userId);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    Api.post(apiUrlSol, {}, userId).then(res => {
      setSolPrice(res?.solPrice);
    }).catch(error => {
    });
  }, [])

  const handleInputEnter = (event) => {
    if (event.key === 'Enter') {
      setSearchTerm(event.target.value);
      handleFetchData(event.target.value)
    }
  };

  //请求代币列表接口
  const handleFetchData = async (searchTerm) => {
    setLoading(true);
    setError(null);
    const responseData = await Api.post(apiUrl, { searchTerm, orderBy: sortKeyMap[sortDescriptor?.column], orderDirection: sortKeyMap[sortDescriptor?.direction] }, userId);
    console.log(responseData, "responseData")
    setResponseData(responseData);
    setData(Array.isArray(responseData?.items) ? responseData?.items : []);
    setLoading(false);
  };

  const formatNumberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    if (handleOpen) {
      onOpen()
      const timer = setTimeout(() => {
        // 触发焦点聚焦
        if (inputRef.current) {
          inputRef.current.focus();
          handleFetchData(null)
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [handleOpen, sortDescriptor]);

  const searchInput = (
    <Input
      ref={inputRef}
      aria-label="Search"
      classNames={{
        input: [
          "bg-[#221f2e]",
          "hover:bg-[#221f2e]", "rounded-lg", "px-1"
        ],
        innerWrapper: ["bg-[#221f2e]", "border", "border-[#221f2e]", "hover:bg-[#221f2e]", "rounded-lg", "h-5"],
        inputWrapper: [
          "bg-[#221f2e]",
          "border-[#221f2e]",
          "hover:bg-[#221f2e]",
          "dark:hover:bg-[#221f2e]",
          "group-data-[focus=true]:bg-[#221f2e]",
          "dark:group-data-[focus=true]:[#221f2e]",
        ],
      }}
      labelPlacement="outside"
      placeholder="Enter name/Ticker/Address"
      startContent={
        <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      onKeyUp={handleInputEnter}
    />
  );

  const renderCell = React.useCallback((user, columnKey, solPrice) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "ticker":
        return (
          <div className="relative flex flex-row justify-start items-center md:gap-2 gap-0">
            <User avatarProps={{ radius: "sm", src: user.image, className: "md:w-10 md:h-10 w-7 h-7 rounded-[50%] md:ml-20" }}>
              {user.ticker}
            </User>
            <Link
              href={`/tokensDetail?id=${user.id}`}
              underline="hover"
              className="md:text-[18px] text-[12px] text-bold"
            >
              <span onClick={() => { onClose(); setClose() }}>{user.ticker}</span>
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19" height="20" viewBox="0 0 19 20"
            >
              <path
                d="M8.08313 1.67673C8.56247 1.11101 9.43499 1.11101 9.91433 1.67673L10.4919 2.35846C10.7858 2.70537 11.2505 2.85637 11.6923 2.74848L12.5602 2.53644C13.2805 2.36049 13.9864 2.87336 14.0417 3.61276L14.1082 4.5038C14.1421 4.9572 14.4293 5.35253 14.8501 5.52486L15.6769 5.86352C16.3631 6.14452 16.6327 6.97438 16.2428 7.60504L15.7729 8.365C15.5338 8.75176 15.5338 9.2404 15.7729 9.62716L16.2428 10.3871C16.6327 11.0178 16.3631 11.8476 15.6769 12.1286L14.8501 12.4673C14.4293 12.6396 14.1421 13.035 14.1082 13.4883L14.0417 14.3794C13.9864 15.1188 13.2805 15.6317 12.5602 15.4557L11.6923 15.2437C11.2505 15.1358 10.7858 15.2868 10.4919 15.6337L9.91433 16.3154C9.43499 16.8812 8.56247 16.8812 8.08313 16.3154L7.50557 15.6337C7.21163 15.2868 6.74693 15.1358 6.30521 15.2437L5.43724 15.4557C4.71696 15.6317 4.01105 15.1188 3.95581 14.3794L3.88925 13.4883C3.85537 13.035 3.56815 12.6396 3.1474 12.4673L2.32055 12.1286C1.63441 11.8476 1.36477 11.0178 1.75469 10.3871L2.22457 9.62716C2.46368 9.2404 2.46368 8.75176 2.22457 8.365L1.75469 7.60504C1.36477 6.97438 1.63441 6.14452 2.32055 5.86352L3.1474 5.52486C3.56815 5.35253 3.85537 4.9572 3.88925 4.5038L3.95581 3.61276C4.01105 2.87336 4.71696 2.36049 5.43724 2.53644L6.30521 2.74848C6.74693 2.85637 7.21163 2.70537 7.50557 2.35846L8.08313 1.67673Z"
                fill={`${user.badge == 1 ? "#5A58F233" : user.badge == 2 ? '#2081E2' : user.badge == 3 ? "#5B667E" : user.badge == 4 ? '#10F4B1' : user.badge == 5 ? "#FFC300" : '#FF3E80'}`}
              />
              <path
                d="M8.10122 10.5712L6.52622 8.99619L6.00122 9.52119L8.10122 11.6212L12.6012 7.12119L12.0762 6.59619L8.10122 10.5712Z"
                fill={`${user.badge == 2 ? "#5a58f2" : "#F2F2FC"}`}
                stroke="white"
                strokeWidth="0.6"
              />
            </svg>
          </div>
        );
      case "marketCap":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <p className="md:text-base text-[12px] text-tiny capitalize text-center">
              $ {formatTokenCount((Number(user.marketCap) * solPrice)?.toFixed(2))}
            </p>
          </div>
        );
      case "volume":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <p className="md:text-base text-[12px] text-tiny font-thin capitalize text-center">
              $ {formatTokenCount(Number(user.volume)?.toFixed(2))}
            </p>
          </div>
        );
      case "holders":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <p className="md:text-base text-[12px] text-tiny capitalize font-thin text-center">
              {formatNumberWithCommas(Number(user.holders))}
            </p>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const handleToDetail = (key) => {
    onClose()
    setClose()
    router.push(`tokensDetail?id=${key?.values()?.next()?.value}`);
  }

  //数据为空时显示内容
  const emptyContent = (
    <div className="flex flex-col justify-center items-center mt-20">
      <img
        className="w-[90px] max-w-[90px] h-[90px]"
        src={'/noData.gif'}
      />
      No Data
    </div>
  );

  return (
    <Modal placement="top" backdrop="transparent" isDismissable={true} hideCloseButton isOpen={isOpen} onOpenChange={() => { setClose(false); onOpenChange() }} size='5xl' className="overflow-y-scroll md:mt-36 m-3 mt-[115px] md:py-3 py-3 md:px-0 px-0  md:h-[550px] h-[500px] bg-[#1A1425]" >
      <ModalContent>
        <ModalBody className="px-3">
          <div className="flex flex-col w-full">
            <div className="flex flex-row items-center gap-8 mb-4 justify-between w-full">
              <div className="flex flex-row w-full">
                {searchInput}
              </div>
            </div>
            <div className="flex flex-row justify-between">
              <Table
                // selectionMode="single"
                isHeaderSticky="true"
                aria-label="Example table with custom cells, pagination and sorting"
                classNames={{
                  wrapper: "p-0 bg-[#1a1425]",
                  th: ["bg-[#130D23]", "text-[#637592]", "text-center", "px-0", "p-l-1"],
                  td: ["bg-[#130D23]", "border-b", "border-divider", "border-[#0e1116]","max-w-[140px]"],
                  base: "md:max-h-[450px] max-h-[405px] overflow-scroll",
                  // table: "md:min-h-[400px] min-h-[300px]",
                  sortIcon: "ml-1",

                }}
                selectedKeys={selectedKeys}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                onSelectionChange={handleToDetail}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      allowsSorting={column.sortable}
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody
                  emptyContent={emptyContent}
                  items={data}
                  isLoading={loading}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => (
                        <TableCell>{renderCell(item, columnKey, solPrice)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal >
  );
}
