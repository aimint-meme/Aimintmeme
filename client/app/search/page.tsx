"use client";
import React, { useState, useEffect } from "react";
import { Image } from "@nextui-org/react";
import { useOverLayer } from "@/components/overlayer";
import { useRouter } from "next/navigation";
import { useLocalGlobalStore } from "@/components/LocalSessionStorageContext";
import { getCookie } from "@/src/utils/api";
import { PoliciesAndTerms } from "@/components/PoliciesAndTerms";

export default function PricingPage() {
  const [showAlert, setShowAlert] = useState(false);
  const [guideStatus, setGuideStatus] = useState(''); //提示信息  
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
  useEffect(() => {
    setGuideStatus(getCookie('guideStatus'))
  }, [])
  return (
    <>
      <section className="flex flex-col items-center justify-center pt-2 relative">
        <div className="flex flex-col items-center justify-center  w-full  sm:max-w-[1280px] mt-[27px]">
          <div className="text-center flex flex-row justify-center">
            <Image
              alt=""
              src="/bg.png"
              className="flex flex-row text-center justify-center"
            />
          </div>
        </div>
      </section>
      {/* <PoliciesAndTerms />  */}
    </>
  );
}
