import * as React from 'react';
import { widget } from '../../public/static/charting_library';

const WEBSOCKET_API_KEY = process.env.NEXT_PUBLIC_APP_WEBSOCKET_URL;
// 当前重连次数
let reconnectAttempts = 0;
// 最大重连次数
const maxReconnectAttempts = 10;
// 重连间隔（毫秒）
const reconnectInterval = 1000; // 秒
export class TVChartContainer extends React.PureComponent {
	static defaultProps = {
		symbol: 'AIMint', // 商品设置
		interval: '1', // 请求间隔
		// datafeedUrl: 'http://127.0.0.1:3345/kline',
		// datafeedUrl: 'https://demo_feed.tradingview.com',
		libraryPath: '/static/charting_library/',
		chartsStorageUrl: '',
		chartsStorageApiVersion: '1.1',
		clientId: '',
		userId: 'public_user_id',
		fullscreen: false, // 是否全屏
		autosize: true, // 是否自适应
		studiesOverrides: {},
	};

	tvWidget = null;
	socket = null;
	isUserDisconnected = false;

	constructor(props) {
		super(props);
		this.kLineData = [];
		this.widgetOptions = {};

		this.ref = React.createRef();
	}

	componentDidMount() {
		this.widgetOptions = {
			symbol: this.props.detailData.ticker, // 产品
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: this.createFeed(),//new window.Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl), // 图表设置，可以自定义。当您创建一个实现接口的对象时，只需将它传递给图表库Widget的构造函数。
			interval: this.props.interval, // 时间间隔
			container: this.ref.current, // 指定要包含widget的DOM元素
			library_path: this.props.libraryPath,
			locale: 'en', //  语言
			disabled_features: [
				'use_localstorage_for_settings',
				// "volume_force_overlay",
				// "create_volume_indicator_by_default"
			],
			enabled_features: [],//['determine_first_data_request_size_using_visible_range'],// ['study_templates'],
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.clientId,
			user_id: this.props.userId,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			studies_overrides: this.props.studiesOverrides,
			theme: 'dark', // 设置为暗黑主题  
			overrides: {
				"paneProperties.background": "#191919", // 更改图表背景颜色为深黑色  
				"paneProperties.backgroundType": "solid", // 设置为纯色背景  
				// 其他可能的覆盖选项...  
			},
			time_frames: [
				{ text: "5d", resolution: "5", description: "3 Days" },
				{ text: "1d", resolution: "5", description: "3 Days" },
			],
			// timezone: 'America/New_York',     // 这个商品的交易所时区,eg.Asia/Shanghai
		};
		// ws更新
		this.handleSocket()
	}

	// ws更新
	handleSocket = () => {
		this.socket = new WebSocket(WEBSOCKET_API_KEY);
		this.socket.onopen = () => {
			console.log('Connected to WebSocket server');
			// 发送参数给后端
			const params = {
				tokenId: this.props.detailData.id
			};
			this.socket.send(JSON.stringify(params));
			reconnectAttempts = 0; // 重置重连次数
		};
		let firstDataRequest = false;
		this.socket.onmessage = (event) => {
			let kLineData = JSON.parse(event.data)
			if (kLineData?.t) {
				kLineData = this.transformData(kLineData);
				console.log("🚀 ~ TVChartContainer ~ componentDidMount ~ kLineData:", kLineData)
				if (!firstDataRequest) {
					this.kLineData = kLineData;
					const tvWidget = new widget(this.widgetOptions);
					this.tvWidget = tvWidget;
					firstDataRequest = true;
				} else {
					let historyKlineData = this.kLineData;
					if (historyKlineData?.length && kLineData?.length == 1) {
						if (historyKlineData?.[historyKlineData?.length - 1]?.time == kLineData?.[0]?.time) {
							historyKlineData[historyKlineData?.length - 1] = kLineData?.[0]
						} else if (historyKlineData?.[historyKlineData?.length - 1]?.time < kLineData?.[0]?.time) {
							historyKlineData.push(kLineData?.[0])
						}
						historyKlineData = historyKlineData.sort(function (a, b) {
							return a.time - b.time; // 升序排序，如果需要降序则改为 b.time - a.time
						})
						this.kLineData = historyKlineData
						// this.setState({
						// 	kLineData: historyKlineData
						// })
					} else if (historyKlineData?.length == 0 && kLineData?.length == 1) {
						historyKlineData = kLineData;
						this.kLineData = historyKlineData;
					}
					if (historyKlineData?.length == 1) {
						this.callbacks?.[0]?.(
							{
								time: historyKlineData?.[0]?.time, // 时间  
								low: historyKlineData?.[0]?.low,  // 最低价  
								high: historyKlineData?.[0]?.high, // 最高价  
								open: historyKlineData?.[0]?.open, // 开盘价  
								close: historyKlineData?.[0]?.close, // 收盘价  
							})
					} else {
						this.callbacks?.[0]?.(
							{
								time: kLineData?.[0]?.time, // 时间  
								low: kLineData?.[0]?.low,  // 最低价  
								high: kLineData?.[0]?.high, // 最高价  
								open: historyKlineData?.[historyKlineData?.length - 2]?.close ? historyKlineData?.[historyKlineData?.length - 2]?.close : kLineData?.[0]?.open, // 开盘价  
								close: kLineData?.[0]?.close, // 收盘价  
							})
					}
				}
				// 在这里更新你的 K 线图
			}
		};
		this.socket.onclose = () => {
			console.log('Disconnected from WebSocket server');
			if (reconnectAttempts < maxReconnectAttempts && !this.isUserDisconnected) {
				setTimeout(() => {
					console.log('Reconnecting...');
					reconnectAttempts++;
					// ws更新
					this.handleSocket()
				}, reconnectInterval);
			} else {
				console.log('Max reconnect attempts reached. Giving up.');
			}
		};
		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}

	// 转换函数  
	transformData(data) {
		// 假设每个数组都只有一个元素（为了简化，我们不处理多个元素的情况）  
		let result = [];
		if (data?.t?.length) {
			data?.t?.map((_, index) => {
				result.push({
					time: data.t[index], // 时间  
					low: data.l[index],  // 最低价  
					high: data.h[index], // 最高价  
					open: data.o[index], // 开盘价  
					close: data.c[index], // 收盘价  
					// volume: data.v[index] // 交易量  
				})
			});
		}
		return result
	}

	componentWillReceiveProps = (props, newprops) => {
		if (!props?.detailData?.ticker) {
			if (this.tvWidget !== null) {
				this.tvWidget.remove();
				this.tvWidget = null;
			}
			if (this.socket) {
				this.isUserDisconnected = true
				this.socket.close()
				this.socket = null;
			}
		}
	}

	componentWillUnmount = () => {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
		if (this.socket) {
			this.isUserDisconnected = true
			this.socket.close()
			this.socket = null;
		}
	}

	getChartData(resolution, periodParams) {
		return [
			// { time: 1730835900000, low: 0.0000001010101, high: 0.0000001010101, open: 0.0000001010101, close: 0.0000001010101, volume: 42790148.79802704 },
			// { time: 1730836800000, low: 25.63797791, high: 28.62358873, open: 25.63797791, close: 28.62358873, volume: 98102008.26649883 },
			// { time: new Date().getTime(), low: 0.0000001010101, high: 0.0000001010101, open: 0.0000001010101, close: 0.0000001010101, volume: 42790148.79802704 },
			// { time: 1730943900000, low: 28.81841816, high: 28.81841816, open: 28.81841816, close: 28.81841816, volume: 624600.555893898 },
			// { time: 1730947500000, low: 29.01419463, high: 29.63224648, open: 29.01419463, close: 29.63224648, volume: 17382123.53614056 },
			// { time: 1731002400000, low: 34.88388571, high: 34.88388571, open: 34.88388571, close: 34.88388571, volume: 143332656.29401815 },
			// { time: 1731003300000, low: 39.97241706, high: 40.25865097, open: 40.25865097, close: 39.97241706, volume: 4068022.237981048 },
			// { time: 1731004200000, low: 39.87678764, high: 39.87678764, open: 39.87678764, close: 39.87678764, volume: 2018396.105093177 },
			// { time: 1731018600000, low: 51.9, high: 82, open: 51.9, close: 82, volume: 314815423.21046746 }
			// 	{
			// 	time: 1731982993000,
			// 	low: 23.36,
			// 	high: 23.36,
			// 	open: 23.36,
			// 	close: 172.77,
			// 	volume: 42790148,
			// }, {
			// 	time: 1522108800,
			// 	low: 166.92,
			// 	high: 175.15,
			// 	open: 173.68,
			// 	close: 168.34,
			// 	volume: 38962839,
			// }, {
			// 	time: 1522309800,
			// 	low: 166.92,
			// 	high: 175.15,
			// 	open: 173.68,
			// 	close: 168.34,
			// 	volume: 38962839,
			// }
		];
	}

	// 创建k线配置
	createFeed() {
		console.log("createFeed-----------------------------------------------")
		let that = this
		let Datafeed = {}
		Datafeed.Container = function (updateFrequency) {
			this._configuration = {
				supports_search: false,
				supports_group_request: false,
				supported_resolutions: [//支持的周期数组
					'1',
					'5',
					'15',
					'60',
					'120',
					'1D',
					'1W'
				],
				supports_marks: true,//来标识您的 datafeed 是否支持在K线上显示标记。
				supports_timescale_marks: true,//标识您的 datafeed 是否支持时间刻度标记。
				exchanges: ["AIMint.meme"]//交易所对象数组
			}
		}
		// onReady在图表Widget初始化之后立即调用，此方法可以设置图表库支持的图表配置
		Datafeed.Container.prototype.onReady = function (callback) {
			console.log("Datafeed.Container.prototype.onReady-----------------------------------------------------------------")
			let that = this
			if (this._configuration) {
				setTimeout(function () {
					callback(that._configuration)
				}, 0)
			} else {
				this.on('configuration_ready', function () {
					callback(that._configuration)
				})
			}
		}
		// 通过商品名称解析商品信息(SymbolInfo)，可以在此配置单个商品
		Datafeed.Container.prototype.resolveSymbol = function (
			symbolName,
			onSymbolResolvedCallback,
			onResolveErrorCallback
		) {
			Promise.resolve().then(() => {
				console.log("Datafeed.Container.prototype.resolveSymbol-----------------------------------------------------------------", symbolName)
				onSymbolResolvedCallback({
					// ticker: 10 / 100,
					name: "AIMint.meme",//that.projectDetail.productName,
					ticker: symbolName,            //商品体系中此商品的唯一标识符
					description: '',               //商品说明
					session: '24x7',               //商品交易时间
					timezone: 'America/New_York',     // 这个商品的交易所时区
					timeframe: '3M',
					pricescale: 10000000000,               // 价格精度
					minmov: 1,                     //最小波动
					minmov2: 0,
					type: 'bitcoin',               //  仪表的可选类型。
					exchange: "AIMint.meme",
					// 'exchange-traded': 'myExchange2',
					// 'exchange-listed': productName,
					has_intraday: true,            // 显示商品是否具有日内（分钟）历史数据
					// intraday_multipliers: ['1', '5'],     //日内周期(分钟单位)的数组
					has_weekly_and_monthly: true,  // 显示商品是否具有以W和M为单位的历史数据
					has_daily: true,               //显示商品是否具有以日为单位的历史数据
					// has_empty_bars: true,
					force_session_rebuild: false,   //是否会随着当前交易而过滤K柱
					// has_no_volume: false,       //已弃用   //表示商品是否拥有成交量数据。
					visible_plots_set: "ohlcv",
					regular_session: '24',
					// supported_resolutions: [//支持的周期数组
					// 	'1',
					// 	'5',
					// 	'15',
					// 	'60',
					// 	'120',
					// 	'1D',
					// 	'1W'
					// ],
				})
			})
		}
		// 从我们的API源获取图表数据并将其交给TradingView。
		Datafeed.Container.prototype.getBars = async function (
			symbolInfo,      // 商品信息对象
			resolution,      //（string （周期）
			periodParams,  // 
			onDataCallback,  // 历史数据的回调函数。每次请求只应被调用一次。
			onErrorCallback, // 错误的回调函数。
		) {
			console.log("Datafeed.Container.prototype.getBars-----------------------------------------------------------------", periodParams)
			// console.log(symbolInfo)
			// console.log(resolution)
			// console.log(periodParams)
			that.firstDataRequest = periodParams.firstDataRequest
			// console.log(rangeEndDate)
			// that.localresolution = resolution
			if (periodParams.firstDataRequest) {
				// let bars = await that.getChartData(resolution, periodParams)
				let bars = JSON.parse(JSON.stringify(that.kLineData))//that.copyData(that.kLineData)
				if (bars.length) {
					onDataCallback(bars)
				} else {
					onDataCallback([], { noData: true })
					// onErrorCallback([], { noData: true })
				}
			}
			else {
				onDataCallback([], { noData: true })
				// onErrorCallback([], { noData: true })
			}
		}
		// 订阅K线数据。图表库将调用onRealtimeCallback方法以更新实时数据。
		Datafeed.Container.prototype.subscribeBars = function (
			symbolInfo,         // ObjectsymbolInfo对象
			resolution,         // StringK线周期
			onRealtimeCallback, // Function将我们更新的K线传递给此回调以更新图表
			listenerGUID,       // String此交易对的唯一ID和表示订阅的分辨率，生成规则：ticker+'_'+周期
			onResetCacheNeededCallback // Function调用次回调让图表再次请求历史K线数据
		) {
			console.log("resolution", resolution);
			if (resolution) {
				that.props.getMarkupForResolution(resolution)
			}
			console.log("Datafeed.Container.prototype.subscribeBars-----------------------------------------------------------------")
			// console.log(resolution)
			that.callbacks = []
			that.callbacks.push(onRealtimeCallback)
			// that.updateBar(resolution, onRealtimeCallback)
			// // 更改线型
			// that.chart.activeChart().setChartType(1);
		}
		// 取消订阅K线数据
		Datafeed.Container.prototype.unsubscribeBars = function (listenerGUID) {
		}
		return new Datafeed.Container()
	}

	render() {
		return (
			<>
				{/* <header className={styles.VersionHeader}>
					<h1>TradingView Charting Library and Next.js Integration Example {version()}</h1>
				</header> */}
				<div ref={this.ref} id='tvchart' className="h-[300px] sm:h-[392px] w-full" />
			</>
		);
	}
}
