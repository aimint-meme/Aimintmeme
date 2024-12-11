import React from 'react';
import dynamic from 'next/dynamic';
import { Api } from "@/src/utils/api";
import { useResolutionsData } from "@/components/overlayer";

const TVChartContainer = dynamic(
	() =>
		import('./TVChartContainer').then(mod => mod.TVChartContainer),
	{ ssr: false },
);

const TVChart = ({detailData}) => {
	const { resolutionsData, setResolutionsData } = useResolutionsData();
	// return (<TVChartContainer detailData={detailData} />);
	const apiUrl = '/token/getMarkup';
	console.log("detailData====",detailData);
	const convertTimeUnit = (time) => {
		let timeFormat;
		let unit;
		if (time === "1D") {
			timeFormat = "1";
			unit = "DAY";
		} else if (time === "1W") {
			timeFormat = "1";
			unit = "WEEK";
		} else {
			timeFormat = time; // 假设其他输入是格式化的时间字符串
			unit = "MINUTE"; // 或根据需要调整默认单位
		}
		return { timeFormat, unit };
	};
	 
	const getMarkupForResolution = async (time) => {
		console.log("Original time:", time);
		const { timeFormat, unit } = convertTimeUnit(time);
		const data = {
			tokenId: detailData.id, // 确保 detailData 和 id 已经被定义
			time: timeFormat,
			unit: unit,
		};
		try {
			const responseData = await Api.post(apiUrl, data);
			setResolutionsData(responseData);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};
	return (
		detailData && detailData.isOutside !== undefined && detailData.isOutside === 1 ? (
			<iframe
			id="dextools-widget"
			title="DEXTools Trading Chart"
			width="100%"
			height="100%"
			src={`https://www.dextools.io/widget-chart/cn/solana/pe-light/${detailData.mintPdaAddress}?theme=dark&chartType=2&chartResolution=30&drawingToolbars=false`}
			frameBorder="0" // 通常还需要添加这个属性来移除iframe的边框
		  />
		) : (
		  <TVChartContainer detailData={detailData} getMarkupForResolution={getMarkupForResolution} />
		)
	  );
};

export default TVChart;
