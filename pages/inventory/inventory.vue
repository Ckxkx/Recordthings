<template>
	<view class="inventory-container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 顶部栏 -->
		<view class="top-bar">
			<text class="page-title">库存</text>
			<view class="top-icons-right">
				<view class="icon-wrapper">⋯</view>
				<view class="icon-wrapper">◎</view>
			</view>
		</view>
		
		<!-- 库存摘要卡片 -->
		<view class="summary-card">
			<view class="summary-item">
				<view class="summary-number">{{ summary.items }}</view>
				<view class="summary-label">物品</view>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<view class="summary-number">{{ summary.total }}</view>
				<view class="summary-label">总库存</view>
			</view>
			<view class="summary-divider"></view>
			<view class="summary-item">
				<view class="summary-number">{{ summary.processed }}</view>
				<view class="summary-label">已处理</view>
			</view>
		</view>
		
		<!-- 物品列表 -->
		<view class="item-list">
			<view class="item-card" v-for="(item, index) in itemList" :key="index" @click="handleItemClick(item)">
				<view class="item-info">
					<view class="item-name">{{ item.name }}</view>
					<view class="item-detail">
						<text class="item-expiry">{{ item.expiry || '暂无保质期' }}</text>
					</view>
					<view class="item-meta">
						<text class="item-brand">{{ item.brand }}</text>
						<text class="item-stock">📄 库存{{ item.stock }}件</text>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view v-if="itemList.length === 0" class="empty-state">
				<text class="empty-text">暂无物品</text>
			</view>
		</view>
		
		<!-- 浮动操作按钮 -->
		<view class="fab-container">
			<view class="fab-button" @click="handleAddItem">
				<text class="fab-icon">+</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getAllItems, getStats } from '../../utils/dbConfig.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			summary: {
				items: 0,
				total: 0,
				processed: 0
			},
			itemList: []
		}
	},
	onLoad() {
		try {
			const windowInfo = uni.getWindowInfo()
			this.statusBarHeight = windowInfo.statusBarHeight || 20
		} catch (e) {
			this.statusBarHeight = 20
		}
		this.loadInventoryData()
	},
	onShow() {
		// 页面显示时刷新数据
		this.loadInventoryData()
	},
	methods: {
		async loadInventoryData() {
			try {
				// 从数据库加载库存数据
				const items = await getAllItems()
				const stats = await getStats()
				
				this.summary = {
					items: stats.itemCount,
					total: stats.itemCount, // 总库存显示物品数量
					processed: 0 // 可以根据实际需求计算
				}
				
				// 格式化物品列表
				this.itemList = items.map(item => ({
					id: item._id || item.id,
					name: item.name,
					brand: item.brand || '',
					stock: item.stock || 1,
					expiry: item.expirationDate || '暂无保质期',
					image: item.image || '/static/pepsi.png'
				}))
			} catch (error) {
				console.error('加载库存数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		handleItemClick(item) {
			uni.navigateTo({
				url: `/pages/add-item/add-item?id=${item.id}`
			})
		},
		handleAddItem() {
			uni.navigateTo({
				url: '/pages/add-item/add-item'
			})
		}
	}
}
</script>

<style scoped>
.inventory-container {
	min-height: 100vh;
	background: linear-gradient(180deg, #667eea 0%, #f5f7fa 25%);
	padding-bottom: 100rpx;
}

.status-bar {
	background-color: transparent;
}

.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}

.top-icons-right {
	display: flex;
	gap: 20rpx;
}

.icon-wrapper {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: #fff;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	backdrop-filter: blur(10rpx);
}

.summary-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	margin: 20rpx 30rpx;
	padding: 35rpx 0;
	display: flex;
	justify-content: space-around;
	align-items: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
}

.summary-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.summary-divider {
	width: 2rpx;
	height: 80rpx;
	background: linear-gradient(180deg, transparent, #e5e5e5, transparent);
}

.summary-number {
	font-size: 48rpx;
	font-weight: bold;
	background: linear-gradient(135deg, #667eea, #764ba2);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 8rpx;
}

.summary-label {
	font-size: 24rpx;
	color: #666;
}

.item-list {
	padding: 0 30rpx;
	margin-top: 10rpx;
}

.item-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	display: flex;
	align-items: flex-start;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	backdrop-filter: blur(20rpx);
	transition: transform 0.3s ease;
}

.item-card:active {
	transform: scale(0.98);
}

.item-info {
	width: 100%;
	display: flex;
	flex-direction: column;
}

.item-name {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 12rpx;
}

.item-detail {
	margin-bottom: 12rpx;
}

.item-expiry {
	font-size: 24rpx;
	color: #667eea;
	background: rgba(102, 126, 234, 0.08);
	padding: 6rpx 12rpx;
	border-radius: 6rpx;
	display: inline-block;
}

.item-meta {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.item-brand, .item-stock {
	font-size: 22rpx;
	color: #999;
}

.empty-state {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 120rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	margin-top: 20rpx;
}

.fab-container {
	position: fixed;
	bottom: 120rpx;
	right: 40rpx;
	z-index: 999;
}

.fab-button {
	width: 110rpx;
	height: 110rpx;
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.fab-icon {
	font-size: 60rpx;
	color: #fff;
	font-weight: 300;
}
</style>

