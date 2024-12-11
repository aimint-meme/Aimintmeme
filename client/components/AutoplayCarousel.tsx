import { ReactElement, useEffect } from "react";
import * as React from "react";

interface Props {
  Item: () => ReactElement;
  showNum: number;
  speed: number;
  containerWidth: number;
  data: Array<any>;
  itemWidth?: number;
  hoverStop?: boolean;
  direction?: "left" | "right";
}

const fillArray = (arr: any[], length: number): any[] => {
  const result: any[] = [];
  while (result.length < length) {
    result.push(...arr);
  }
  return result.concat(result);
};

function AutoplayCarousel({
  Item,
  showNum,
  speed,
  containerWidth,
  data,
  itemWidth = 1500,
  hoverStop = true,
  direction = "left"
}: Props) {
  const showData = fillArray(data, showNum);
  const length = showData.length;

  useEffect(() => {
    // 创建一个新的样式表对象
    const style = document.createElement("style");
    // 定义样式表的内容
    let start = "0";
    let end = `-${(itemWidth * length) / 2}`;
    if (direction === "right") {
      start = end;
      end = "0";
    }

    style.innerText = `
      @keyframes templates-partner-moving {
        0% {
           transform: translateX(${start}px);
        }
        100% {
          transform: translateX(${end}px);
        }
      }
    `;

    if (hoverStop) {
      style.innerText += `.welcome-list:hover {
      /*鼠标经过后，动画暂停*/
      animation-play-state: paused !important;
    }`;
    }
    // 将样式表插入到文档头部
    document.head.appendChild(style);

    // 组件卸载时清除样式表
    return () => document.head.removeChild(style) as any;
  }, []);

  return (
    <div style={{ width: `${containerWidth}px` }} className="overflow-hidden rounded-xl welcome-marquee-container">
      <div
        className="welcome-list relative h-[100%] flex"
        style={{
          width: `${itemWidth * length}px`,
          animation: `templates-partner-moving ${(length / showNum / 2) * speed
            }s infinite linear`
        }}
      >
        {showData.map((item) => (
          <div style={{ width: `${itemWidth}px` }}>
            <Item {...item} />
          </div>
        ))}
      </div>
    </div >
  );
}

export default AutoplayCarousel;
