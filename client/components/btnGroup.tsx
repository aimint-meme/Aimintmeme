"use client";
import React, { useState,useEffect,useRef } from "react";
import {
  Button,
  ButtonGroup,Pagination
} from "@nextui-org/react";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { MemesCard } from "@/components/memesCard";
import { Api } from "@/src/utils/api";

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export const BtnGroup = (props) => {
  const [classify, setClassify] = useState(0);
  const [items, setItems] = useState([]);  
  const [page, setPage] = useState(1);  
  const [total,setTotal] = useState(1);
  const [loading, setLoading] = useState(false);  
  const [hasMoreData, setHasMoreData] = useState(true);
  const LIMIT = 10; // 每页显示的项目数量  
  const [solPrice, setSolPrice] = useState(1)
  const scrollableDivRef = useRef(null);
  const apiUrl = "/token/list",apiUrlSol = "/token/sqlPrice";
  const userId = useLocalGlobalStore((state) => state.wallet.userId);
  const data = {page: 1, limit: 10 ,orderBy:"market_cap",orderDirection:"DESC"};
  
  const fetchData = async (page,classify) => {  
    setLoading(true);  
    try { 
      let params;
      if(classify == 0){
        params = { page: page, limit: LIMIT,orderBy:"market_cap"}
      }else if(classify == 1){
        params = { page: page, limit: LIMIT,orderBy:"quantity"}
      }else{
        params = { page: page, limit: LIMIT,time:"1",unit:"DAY"}
      }
      const data = await Api.post(apiUrl, params, userId); 
      if(!data.item){
        setHasMoreData(false)
        return;
      }
      if(data.item){
        const pages = Math.ceil(data.total / LIMIT);
        setTotal(pages)
        setHasMoreData(true)
        // if(page == 1){
          setItems([...data.item]);
        // }else{
        //   setItems((prevItems) => [...prevItems, ...data.item]);
        // }   
      }else{
        setHasMoreData(false)
      }
    } catch (error) {  
      console.error('Error fetching data:', error);  
    }  
    setLoading(false);  
  };  
  
  useEffect(() => {  
    fetchData(page,classify);  
    Api.post(apiUrlSol, {}, userId).then(res => {
      setSolPrice(res?.solPrice);
    }).catch(error => {
    });
  }, [page,classify]);  
  const prevPage = usePrevious(page);
 
  useEffect(() => {
    // 检查 page 是否与前一个值不同
    if (prevPage !== undefined && prevPage !== page) {
      if (scrollableDivRef.current) {
        scrollableDivRef.current.scrollIntoView({ behavior: 'smooth', block: "nearest" });
      }
    }
  }, [page, prevPage]);
  
  // const handleScroll = () => {  
  //   const { scrollTop, scrollHeight, clientHeight } = document.documentElement;  
  //   if (scrollTop + clientHeight >= scrollHeight - 50 && !loading  && hasMoreData) {  
  //     setPage((prevPage) => prevPage + 1);  
  //   }  
  // };  
  
  // useEffect(() => {  
  //   window.addEventListener('scroll', handleScroll);  
  //   return () => {  
  //     window.removeEventListener('scroll', handleScroll);  
  //   };  
  // }, [loading]);  
    const btnClassify = [
      {index:'1',name:'Trending'},{index:'2',name:'Hot'},{index:'3',name:'New'}
    ]
    
    return (
        <div className="gap-4 grid grid-cols-1 sm:hidden rounded-t-lg mb-5">
          <ButtonGroup className="flex sm:hidden flex-row w-full grid grid-cols-3 box-border" variant="bordered" ref={scrollableDivRef}>
            {btnClassify.map((item,index) => (
              <Button key={index} className={`${index == classify ? 'bg-[#5A58F2] font-semibold border-[#5A58F2]' : 'font-light' } text-[#fff]`} onClick={()=> {setClassify(index),setPage(1)}}>{item.name}</Button>
            ))}
          </ButtonGroup>
          <MemesCard list={items} solPrice={solPrice} />
          {/* {loading && <div>Loading...</div>}  */}
          {total > 0 && (<div className="flex w-full justify-center">
            <Pagination
            showControls
              page={page}
              total={total}
              initialPage={1}
              onChange={(page) => setPage(page)}
              // onChange={(page) => { setPage(page);setScrollToInput(true) }}
              classNames={{
                cursor: "bg-[#5a58f2] text-[#ffffff]",
              }}
              variant="bordered"
            />
          </div>)}
        </div>
      );
  };