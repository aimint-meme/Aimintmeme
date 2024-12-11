import React, { useEffect, useState } from 'react';
import { Image } from "@nextui-org/image";
import AutoplayCarousel from "./AutoplayCarousel";

const data = new Array(2).fill(0).map((item, index) => {
  return { num: index };
});

function Welcome() {
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    setViewportWidth(window.innerWidth)
    // 定义处理视口变化的函数
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      // 在这里可以执行其他逻辑，比如调整布局等
    };
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    // 清理函数，组件卸载时执行
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 空依赖数组表示这个effect只在组件挂载和卸载时运行一次

  const Item = () => {
    return <div className='mr-6'>
      <Image
        width={1500}
        src={'/welcome.svg'}
        className="rounded-none"
      />
    </div>;
  };

  return (
    <AutoplayCarousel
      Item={Item}
      containerWidth={viewportWidth}
      showNum={2}
      speed={15}
      data={data}
    />
  );
}

export default Welcome;
