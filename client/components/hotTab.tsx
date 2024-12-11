"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Listbox,
  ListboxItem,
  Textarea, Spinner
} from "@nextui-org/react";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { Api } from "@/src/utils/api";
import {AlertBox} from "@/components/AlertBox";

export const HotTab = ({ setValue }) => {
  const [selected, setSelected] = React.useState("all");
  const [selectedKeys, setSelectedKeys] = React.useState("");
  const [data, setData] = React.useState({ "type": "", "limit": 20 });
  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", "),
    [selectedKeys]
  );
  const [responseData, setResponseData] = useState({ "types": [], "items": [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = useLocalGlobalStore(state => state.wallet.userId);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  const simulateTransactionFailure = (message) => {
    setShowAlert(true);
    setAlertMessage(message);
  };
  const apiUrl = "/hot/spot";
  //请求热点数据接口
  const handleHotData = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await Api.post(apiUrl, data, userId);
      setResponseData(responseData);
    } catch (error) {
      setError(error);
      simulateTransactionFailure(error.message)
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setData({
      ...data,
      "type": selected,
    });
    handleHotData({ "type": selected == "all" ? '' : selected, "limit": 20 });
  }, [selected])
  // if (loading) return <Spinner />;  
  return (
    <div className="flex text-center items-start w-full gap-7 md:w-11/12">
      <div className="flex flex-col w-full text-center justify-center">
        <Tabs
          key="light"
          variant="light"
          aria-label="Tabs variants"
          selectedKey={selected}
          onSelectionChange={setSelected}
          classNames={{
            base: "text-[#ffffff] bg-[#1A1425] rounded-t-lg border-none",
            tabList: "gap-4 px-2 relative rounded-none text-[#ffffff] border-none",
            cursor: "w-full dark:bg-[#4f4cf01a] rounded-none border-none text-[#ffffff] ",
            tab: "h-9 rounded-none dark:text-[#ffffff] dark:bg-[transparent] border-none",
            tabContent: "text-[#DFE2EA] group-data-[selected=true]:text-[#5a58f2] border-none font-semibold"
          }}
        >
          {responseData.types.map((item, index) => (<Tab
            key={item}
            title={item}
            className="bg-[#1A1425] border-transparent border-none rounded-b-lg"
          >
            <div className="flex flex-col gap-2 text-left border-none h-[190px] overflow-auto">
              {loading ? <Spinner className="h-[190px]" /> : <Listbox
                aria-label="Single selection example"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedKeys}
                classNames={{
                  base: 'border-none',
                  list: 'w-full flex flex-col gap-2 border-none '
                }}
                onSelectionChange={(keys) => {setSelectedKeys; setValue(responseData.items?.find(item => item.id == Array.from(keys).join(", "))?.prompt) }}
              >
                {responseData.items.map((data, i) => (<ListboxItem key={data.id} classNames={{
                  base: 'bg-[#221F2E] rounded-3xl text-sm py-2.5'
                }}>{i + 1}、{data.keyword}</ListboxItem>))}
              </Listbox>}
            </div>
          </Tab>))}
        </Tabs>
      </div>
      <div className="flex flex-row md:gap-6 justify-center" >
        {/* <div className="hidden md:block text-center justify-center items-center w-20 m-2 md:m-0"></div> */}
        <div className="hidden md:block text-center justify-center items-center w-20 m-2  md:m-0"></div>
      </div>
      <AlertBox
        showAlert={showAlert}
        alertMessage={alertMessage}
        handleCloseAlert={handleCloseAlert}
      />
    </div >
  );
};