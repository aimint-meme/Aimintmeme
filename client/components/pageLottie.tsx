
import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { Image } from "@nextui-org/react";
import aimint from '@/public/aimint.json'; // 假设你的动画JSON文件名为your-animation.json
import coin_g from '@/public/coin_g.json'; // 假设你的动画JSON文件名为your-animation.json
import coin_y from '@/public/coin_y.json'; // 假设你的动画JSON文件名为your-animation.json

const LottieAnimation = ({ className, animationData, loop, autoplay }) => {
  const animationContainer = useRef(null);

  useEffect(() => {
    if (animationContainer.current) {
      const animation = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: loop || false,
        autoplay: autoplay || false,
        animationData: animationData // 这里是从LottieFiles导出的JSON对象
      });
    }
  }, [animationData]);

  return <div className={className} ref={animationContainer} />;
};

const PageLottie = () => {
  return (
    <div className='relative mb-2'>
      <LottieAnimation className={'absolute left-[237px] top-[35px] z-50'} animationData={aimint} loop={false} autoplay={true} />
      <LottieAnimation className={'absolute left-[468px] top-[0px] z-50 w-[200px] h-[71px]'} animationData={coin_g} loop={true} autoplay={true} />
      <LottieAnimation className={'absolute left-[140px] top-[109px] z-50 w-[121px] h-[44px]'} animationData={coin_y} loop={true} autoplay={true} />
      <Image
        src="/pageLottieBg.png"
        width="100%"
        className="h-[529px] w-[850px] object-cover"
      />
    </div>
  );
};

export default PageLottie;