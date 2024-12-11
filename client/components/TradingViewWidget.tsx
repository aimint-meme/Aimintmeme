// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react";
import {
  Spinner
} from "@nextui-org/react";


function TradingViewWidget() {
  const container = useRef();
  const [isLoading, setIsLoading] = React.useState(true);
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "autosize": true,
          "symbol": "NASDAQ:AAPL",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "withdateranges": true,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;
    container.current.appendChild(script);
    setTimeout(() => {  
      // 假设这里已经完成了图表的初始化  
      setIsLoading(false);  
    }, 3000); // 假设加载需要3秒  
  }, []);

  return (
        <div
          className="tradingview-widget-container"
          ref={container}
          style={{ height: "100%", width: "100%" }}
        >
          {isLoading ? (<Spinner className="flex w-full justify-center items-center" />) :(<div
            className="tradingview-widget-container__widget"
            style={{ height: "100%", width: "100%" }}
          ></div>)}
        </div>
  );
}

export default memo(TradingViewWidget);
