<template>
	<view class="statistics-container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 顶部操作栏 -->
		<view class="top-bar">
			<view class="back-btn" @click="handleBack">
				<text class="back-icon">‹</text>
			</view>
			<view class="page-title">数据统计</view>
			<view class="top-icons-right"></view>
		</view>
		
		<!-- 统计内容 -->
		<scroll-view class="content-scroll" scroll-y>
			<!-- 总览卡片 -->
			<view class="overview-card">
				<view class="overview-item" v-for="(item, index) in overviewItems" :key="index">
					<view class="overview-icon" :style="{ background: item.gradient }">
						<text class="icon-text">{{ item.icon }}</text>
					</view>
					<text class="overview-value">{{ item.value }}</text>
					<text class="overview-label">{{ item.label }}</text>
				</view>
			</view>
			
			<!-- 状态分布 -->
			<view class="chart-card">
				<view class="card-header">
					<view class="header-dot"></view>
					<text class="chart-title">状态分布</text>
				</view>
				
				<!-- CSS 饼图 -->
				<view class="pie-chart-container">
					<view class="pie-chart" :style="{ background: getPieChartGradient() }">
						<view class="pie-center">
							<text class="pie-label">总计</text>
							<text class="pie-value">{{ stats.itemCount }}</text>
						</view>
					</view>
				</view>
				
				<view class="chart-legend">
					<view class="legend-item" v-for="(item, index) in pieData" :key="index">
						<view class="legend-color" :style="{ backgroundColor: item.color }"></view>
						<text class="legend-text">{{ item.name }}</text>
						<text class="legend-value">{{ item.value }}</text>
					</view>
				</view>
			</view>
			
			<!-- 分类统计 -->
			<view class="chart-card" v-if="barData.length > 0">
				<view class="card-header">
					<view class="header-dot"></view>
					<text class="chart-title">分类统计</text>
				</view>
				
				<view class="bar-chart">
					<view class="bar-item" v-for="(item, index) in barData" :key="index">
						<view class="bar-label">{{ item.name }}</view>
						<view class="bar-wrapper">
							<view 
								class="bar-fill" 
								:style="{ 
									width: (item.value / maxBarValue * 100) + '%',
									background: barGradients[index % barGradients.length]
								}"
							>
								<text class="bar-value">{{ item.value }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部间距 -->
			<view style="height: 40rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
import { getAllItems, getStats } from '../../utils/dbConfig.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			stats: {
				itemCount: 0,
				expired: 0,
				expiring: 0,
				notExpired: 0
			},
			overviewItems: [],
			pieData: [],
			barData: [],
			maxBarValue: 0,
			barGradients: [
				'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
				'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
				'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
				'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
				'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
				'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
				'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
			]
		}
	},
	onLoad() {
		try {
			const windowInfo = uni.getWindowInfo()
			this.statusBarHeight = windowInfo.statusBarHeight || 0
		} catch (e) {
			this.statusBarHeight = 0
		}
		this.loadStatistics()
	},
	methods: {
		handleBack() {
			uni.navigateBack()
		},
		loadStatistics() {
			this.stats = getStats()
			
			// 准备总览数据
			this.overviewItems = [
				{
					icon: '📦',
					value: this.stats.itemCount,
					label: '物品总数',
					gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
				},
				{
					icon: '❌',
					value: this.stats.expired,
					label: '已过期',
					gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
				},
				{
					icon: '⚠️',
					value: this.stats.expiring,
					label: '临期',
					gradient: 'linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)'
				},
				{
					icon: '✅',
					value: this.stats.notExpired,
					label: '正常',
					gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
				}
			]
			
			// 准备饼图数据
			this.pieData = [
				{ name: '正常', value: this.stats.notExpired, color: '#4cd964' },
				{ name: '临期', value: this.stats.expiring, color: '#ff9500' },
				{ name: '已过期', value: this.stats.expired, color: '#ff3b30' }
			].filter(item => item.value > 0)
			
			// 准备分类统计数据
			const items = getAllItems()
			const categoryMap = {}
			
			items.forEach(item => {
				const category = item.category || '未分类'
				categoryMap[category] = (categoryMap[category] || 0) + 1
			})
			
			this.barData = Object.keys(categoryMap)
				.map(category => ({
					name: category,
					value: categoryMap[category]
				}))
				.sort((a, b) => b.value - a.value)
				.slice(0, 8)
			
			this.maxBarValue = Math.max(...this.barData.map(item => item.value), 1)
		},
		getPieChartGradient() {
			if (this.pieData.length === 0) return '#f0f0f0'
			
			const total = this.pieData.reduce((sum, item) => sum + item.value, 0)
			let percentage = 0
			const stops = []
			
			this.pieData.forEach((item) => {
				const itemPercentage = (item.value / total) * 100
				stops.push(`${item.color} ${percentage}% ${percentage + itemPercentage}%`)
				percentage += itemPercentage
			})
			
			return `conic-gradient(${stops.join(', ')})`
		}
	}
}
</script>

<style scoped>
.statistics-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-bar {
	background-color: transparent;
}

.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 20rpx;
	box-sizing: border-box;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10rpx);
}

.back-icon {
	font-size: 48rpx;
	color: #fff;
	font-weight: bold;
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
	flex: 1;
	text-align: center;
	letter-spacing: 2rpx;
}

.top-icons-right {
	width: 60rpx;
}

.content-scroll {
	height: calc(100vh - 120rpx);
	padding: 0 20rpx 30rpx 20rpx;
	box-sizing: border-box;
}

/* 总览卡片 */
.overview-card {
	background: rgba(255, 255, 255, 0.98);
	border-radius: 32rpx;
	padding: 40rpx 20rpx;
	margin-bottom: 30rpx;
	display: flex;
	justify-content: space-between;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
	backdrop-filter: blur(20rpx);
	box-sizing: border-box;
}

.overview-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	flex: 1;
	min-width: 0;
}

.overview-icon {
	width: 70rpx;
	height: 70rpx;
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 6rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.icon-text {
	font-size: 36rpx;
}

.overview-value {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	line-height: 1;
}

.overview-label {
	font-size: 20rpx;
	color: #999;
	letter-spacing: 1rpx;
}

/* 图表卡片 */
.chart-card {
	background: rgba(255, 255, 255, 0.98);
	border-radius: 32rpx;
	padding: 35rpx 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
	backdrop-filter: blur(20rpx);
	box-sizing: border-box;
	width: 100%;
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	gap: 12rpx;
}

.header-dot {
	width: 8rpx;
	height: 32rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 4rpx;
}

.chart-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	letter-spacing: 1rpx;
}

.chart-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 25rpx;
	padding: 10rpx 0;
}

.chart-canvas {
	background: transparent;
	border-radius: 12rpx;
}

/* CSS 饼图 */
.pie-chart-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx 0;
}

.pie-chart {
	width: 280rpx;
	height: 280rpx;
	border-radius: 50%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.pie-center {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	background: #fff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.pie-label {
	font-size: 22rpx;
	color: #999;
	margin-bottom: 6rpx;
}

.pie-value {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
}

/* 柱状图 */
.bar-chart {
	padding: 20rpx 0;
}

.bar-item {
	display: flex;
	align-items: center;
	margin-bottom: 28rpx;
	gap: 12rpx;
}

.bar-label {
	width: 80rpx;
	flex-shrink: 0;
	font-size: 22rpx;
	color: #333;
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.bar-wrapper {
	flex: 1;
	min-width: 0;
	height: 44rpx;
	background: #f0f0f0;
	border-radius: 22rpx;
	overflow: hidden;
	box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.bar-fill {
	height: 100%;
	border-radius: 22rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 8rpx;
	min-width: 40rpx;
	transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	box-sizing: border-box;
}

.bar-value {
	font-size: 20rpx;
	color: #fff;
	font-weight: bold;
	white-space: nowrap;
}

/* 图例 */
.chart-legend {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	padding: 16rpx;
	background: #f8f9fa;
	border-radius: 20rpx;
	box-sizing: border-box;
	width: 100%;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 10rpx 14rpx;
	background: #fff;
	border-radius: 12rpx;
	box-sizing: border-box;
	width: 100%;
	min-width: 0;
}

.legend-color {
	width: 32rpx;
	height: 32rpx;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.legend-text {
	flex: 1;
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.legend-value {
	font-size: 26rpx;
	color: #667eea;
	font-weight: bold;
	flex-shrink: 0;
}

</style>

