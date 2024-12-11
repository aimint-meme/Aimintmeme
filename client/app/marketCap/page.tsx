"use client";
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Pagination,
  Spinner,
  Link
} from "@nextui-org/react";
import { ArrowDown } from "@/components/icons";
import { Input } from "@nextui-org/input";
import { SearchIcon } from "./SearchIcon";
import { columns, sortKeyMap } from "./data";
import { MarketCapFilter } from "@/components/MarketCapFilter";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import { formatTokenCount } from '@/src/utils/globalUtils';
const apiUrl = "/token/list", pageSize = 10, apiUrlSol = "/token/sqlPrice";

export default function BlogPage() {
  const [selectedKeys, setSelectedKeys] = React.useState(new Set(["24_HOUR"]));
  const [tableColumns, setTableColumns] = React.useState(columns);
  const selectedValue = React.useMemo(
    () => [Array.from(selectedKeys).join(", ").split('_')?.[0], Array.from(selectedKeys).join(", ").split('_')?.[1]?.[0]?.toLocaleLowerCase()],
    [selectedKeys]
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "marketCap",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketCapRange, setMarketCapRange] = useState([0, 100000]);
  const [volumnRange, setVolumnRange] = useState([0, 100000]);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [spam, setSpam] = useState(false);
  const [following, setFollowing] = useState(false);
  const [filterExpand, setFilterExpand] = useState(true);
  const [selectedValueHover, setSelectedValueHover] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solPrice, setSolPrice] = useState(0)
  const userId = useLocalGlobalStore(state => state.wallet.userId);

  useEffect(() => {
    Api.post(apiUrlSol, {}, userId).then(res => {
      setSolPrice(res?.solPrice);
    }).catch(error => {
    });
  }, [])


  const handleInputEnter = (event) => {
    if (event.key === 'Enter') {
      setSearchTerm(event.target.value);
    }
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        input: [
          "bg-transparent",
          , "border-[#191D24]",
          "hover:bg-[#07050A]", "rounded-lg"
        ],
        innerWrapper: ["bg-transparent", "border", "border-[#191D24]", "hover:bg-[#07050A]", "px-5", "rounded-lg"],
        inputWrapper: [
          "bg-transparent",
          "border-[#191D24]",
          "hover:bg-[#07050A]",
          "dark:hover:bg-[#07050A]",
          "group-data-[focus=true]:bg-[#07050A]",
          "dark:group-data-[focus=true]:[#07050A]",
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

  //请求代币列表接口
  const handleFetchData = async (pageOne) => {
    setLoading(true);
    setError(null);
    const responseData = await Api.post(apiUrl, { "page": pageOne ? pageOne : page, "limit": pageSize, searchTerm, marketCap: marketCapRange, volume: volumnRange, completed, completing, spam, following, time: Array.from(selectedKeys)?.[0]?.split('_')?.[0], unit: Array.from(selectedKeys)?.[0]?.split('_')?.[1], orderBy: sortKeyMap[sortDescriptor?.column], orderDirection: sortKeyMap[sortDescriptor?.direction], solPrice }, userId);
    setResponseData(responseData);
    setData(Array.isArray(responseData?.item) ? responseData?.item : []);
    setLoading(false);
  };

  //首次加载页面调用代币列表接口
  useEffect(() => {
    if (solPrice) {
      handleFetchData(undefined);//调用代币列表接口
    }
  }, [page])

  //首次加载页面调用代币列表接口
  useEffect(() => {
    if (solPrice) {
      handleFetchData(1);//调用代币列表接口
    }
  }, [userId, selectedKeys, searchTerm, marketCapRange, volumnRange, spam, following, sortDescriptor, completed, completing, solPrice])

  const formatNumberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const handleSortDescriptor = ((column, direction) => {
    setSortDescriptor({
      column,
      direction
    })
    setTableColumns(tableColumns?.map(item => {
      if (item == column) {
        return {
          ...item,
          direction
        }
      } else {
        delete item.direction;
        return {
          ...item,
        }
      }
    }))
  })

  const renderCell = React.useCallback((user, columnKey, solPrice) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case "ticker":
        return (
          <div className="relative flex flex-row justify-start items-center gap-2">
            <User avatarProps={{ radius: "lg", src: user.image, className: "md:ml-14 rounded-[50%]" }}>
              {user.ticker}
            </User>
            <div className="text-[18px] text-bold cursor-pointer">
              <Link
                href={`/tokensDetail?id=${user.id}`}
                underline="hover"
                className="text-sm sm:text-base bg-transparent text-[#fff]"
              >
                {user.ticker}
              </Link>
            </div>
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
  }, [solPrice]);

  const bottomContent = React.useMemo(() => {
    return responseData?.total > 10 && (
      <div className="py-2 px-2 flex justify-center items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={Math.ceil(responseData?.total / pageSize)}
          onChange={(page) => {
            setPage(page)
          }}
          classNames={{
            cursor: "bg-[#5a58f2] text-[#ffffff]",
          }}
        />
      </div>
    );
  }, [selectedKeys, responseData, page]);

  //数据为空时显示内容
  const emptyContent = (
    <div className="flex flex-col justify-center items-center  my-20">
      <img
        className="w-[90px] max-w-[90px] h-[90px]"
        src={'/noData.gif'}
      />
      No Data
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row items-center gap-8 mb-4 justify-between w-full">
        <div className="flex flex-row gap-8 w-full">
          <Dropdown>
            <DropdownTrigger>
              <Button onMouseOver={() => { setSelectedValueHover(true) }} onMouseOut={() => { setSelectedValueHover(false) }} variant="bordered" className={selectedValueHover ? "capitalize border-box" : "capitalize"} >
                {selectedValue}
                <ArrowDown />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Single selection example"
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            >
              <DropdownItem key="5_MINUTE">5m</DropdownItem>
              <DropdownItem key="30_MINUTE">30m</DropdownItem>
              <DropdownItem key="1_HOUR">1h</DropdownItem>
              <DropdownItem key="6_HOUR">6h</DropdownItem>
              <DropdownItem key="24_HOUR">24h</DropdownItem>
              <DropdownItem key="48_HOUR">48h</DropdownItem>
              <DropdownItem key="1_WEEK">1w</DropdownItem>
              <DropdownItem key="30_DAY">30d</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {searchInput}
          <Button size="md" className={`${filterExpand ? 'bg-[#5A58F2]' : 'bg-[#1A1425]'} px-6 hover:bg-[#5A58F2]`} onClick={() => { setFilterExpand(!filterExpand) }}>
            <img src="/Filters.svg" />
            Filters
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-8">
        <div className={filterExpand ? "w-[71%]" : 'w-[100%]'}>
          {solPrice != 0 && <Table
            aria-label="Example table with custom cells, pagination and sorting"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
              wrapper: "bg-[#14111C]",
              th: ["bg-transparent", "text-[#637592]", "border-b", "border-divider", "text-left"],
              td: ["border-b", "border-divider", "border-[#191D24]", "max-w-[140px]"]
            }}
          >
            <TableHeader columns={tableColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                >
                  <div className="flex flex-start justify-center items-center gap-1 cursor-pointer" onClick={handleSortDescriptor.bind(this, column.uid, sortDescriptor?.column == column.uid ? sortDescriptor?.direction == 'ascending' ? 'descending' : 'ascending' : 'ascending')}>
                    {column.name}
                    {column.uid != 'ticker' && <div className="flex flex-col flex-start justify-center items-center gap-1" >
                      <svg xmlns="http://www.w3.org/2000/svg" width="7" height="5" viewBox="0 0 8 6" fill="none" onClick={handleSortDescriptor.bind(this, column.uid, 'ascending')}>
                        <path d="M4 0L7.4641 6H0.535898L4 0Z" fill={sortDescriptor?.column == column.uid && sortDescriptor?.direction == 'ascending' ? '#5A58F2' : '#D9D9D9'} />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="7" height="5" viewBox="0 0 8 6" fill="none" onClick={handleSortDescriptor.bind(this, column.uid, 'descending')}>
                        <path d="M4 6L7.4641 0H0.535898L4 6Z" fill={sortDescriptor?.column == column.uid && sortDescriptor?.direction == 'descending' ? '#5A58F2' : '#D9D9D9'} />
                      </svg>
                    </div>}
                  </div>
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={emptyContent}
              items={data}
              isLoading={loading}
              loadingContent={<Spinner label="Loading..." />}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey, solPrice)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>}
        </div>
        <div className={filterExpand ? "w-[31%]" : "hidden"}>
          <MarketCapFilter setMarketCapRange={setMarketCapRange} setVolumnRange={setVolumnRange} setCompleted={setCompleted} setCompleting={setCompleting} setSpam={setSpam} setFollowing={setFollowing} completed={completed} completing={completing} spam={spam} />
        </div>
      </div>
    </div >
  );
}
