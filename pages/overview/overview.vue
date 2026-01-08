<template>
	<view class="overview-container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 顶部操作栏 -->
		<view class="top-bar">
			<view class="top-icons">
				<view class="icon-wrapper">
					<text>☰</text>
				</view>
			</view>
			<view class="top-icons-right">
				<view class="icon-wrapper">
					<text>⋯</text>
				</view>
				<view class="icon-wrapper">
					<text>◎</text>
				</view>
			</view>
		</view>
		
		<!-- 用户ID -->
		<view class="user-id">{{ userId }}</view>
		
		<!-- 提示信息 -->
		<view class="notice-bar">
			<text class="notice-icon">🔊</text>
			<text class="notice-text">点击【更多】菜单,查看详情。</text>
		</view>
		
		<!-- 搜索栏 -->
		<view class="search-bar" @click="handleSearch">
			<image class="search-icon" src="/static/搜索.png" mode="aspectFit"></image>
			<text class="search-placeholder">搜索</text>
		</view>
		
		<!-- 状态卡片 -->
		<view class="status-cards">
			<view class="card-item" @click="navigateToItemList('all')">
				<image class="card-icon" src="/static/全部.png" mode="aspectFit"></image>
				<view class="card-content">
					<view class="card-number">{{ stats.itemCount }}</view>
					<view class="card-label">全部</view>
				</view>
			</view>
			<view class="card-item" @click="navigateToItemList('expiring')">
				<image class="card-icon" src="/static/临期过期.png" mode="aspectFit"></image>
				<view class="card-content">
					<view class="card-number">{{ stats.expiring }}</view>
					<view class="card-label">临期</view>
				</view>
			</view>
			<view class="card-item" @click="navigateToItemList('notExpired')">
				<image class="card-icon" src="/static/未过期.png" mode="aspectFit"></image>
				<view class="card-content">
					<view class="card-number">{{ stats.notExpired }}</view>
					<view class="card-label">未过期</view>
				</view>
			</view>
			<view class="card-item" @click="navigateToItemList('expired')">
				<image class="card-icon" src="/static/已过期.png" mode="aspectFit"></image>
				<view class="card-content">
					<view class="card-number">{{ stats.expired }}</view>
					<view class="card-label">已过期</view>
				</view>
			</view>
		</view>
		
		<!-- 列表 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">列表</text>
				<view class="section-actions">
					<text class="action-icon" @click="handleAddList">+</text>
					<text class="action-icon" @click="handleListSettings">⚙</text>
				</view>
			</view>
			<view class="section-content">
				<view class="list-item" @click="navigateToItemList('all')">
					<image class="list-icon" src="/static/项目综合.png" mode="aspectFit"></image>
					<text class="list-text">综合</text>
					<text class="list-arrow">›</text>
				</view>
			</view>
		</view>
		
		
		<!-- 浮动操作按钮 -->
		<view class="fab-container" v-if="!showFabMenu">
			<view class="fab-button" @click="toggleFabMenu">
				<text class="fab-icon">+</text>
			</view>
		</view>
		
		<!-- 浮动菜单 -->
		<view class="fab-menu" v-if="showFabMenu">
			<view class="fab-menu-item" @click="handleManualEntry">
				<text class="fab-menu-text">手动录入</text>
				<view class="fab-menu-icon">📝</view>
			</view>
			<view class="fab-menu-item" @click="handleScanImport">
				<text class="fab-menu-text">扫码导入</text>
				<view class="fab-menu-icon">📷</view>
			</view>
			<view class="fab-menu-item" @click="handleFileImport">
				<text class="fab-menu-text">文件导入</text>
				<view class="fab-menu-icon">📄</view>
			</view>
			<view class="fab-close" @click="toggleFabMenu">
				<text class="fab-close-icon">×</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getStats } from '../../utils/dbConfig.js'
import { initSampleData } from '../../utils/initData.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			userId: '138****3673',
			stats: {
				itemCount: 0,
				expiring: 0,
				notExpired: 0,
				expired: 0
			},
			showFabMenu: false
		}
	},
	onLoad() {
		// 获取状态栏高度
		try {
			const windowInfo = uni.getWindowInfo()
			this.statusBarHeight = windowInfo.statusBarHeight || 20
		} catch (e) {
			this.statusBarHeight = 20
		}
		
		// 加载统计数据
		this.loadStats()
		
		// 初始化示例数据（延迟执行，避免阻塞页面加载）
		setTimeout(() => {
			try {
				if (typeof initSampleData === 'function') {
					initSampleData()
					// 初始化后刷新统计数据
					this.loadStats()
				}
			} catch (e) {
				console.error('初始化数据失败:', e)
			}
		}, 500)
	},
	onShow() {
		// 页面显示时刷新统计数据
		this.loadStats()
		// 确保浮动菜单关闭
		this.showFabMenu = false
	},
	methods: {
		async loadStats() {
			try {
				// 从数据库加载统计数据
				const stats = await getStats()
				this.stats = {
					itemCount: stats.itemCount,
					expiring: stats.expiring,
					notExpired: stats.notExpired,
					expired: stats.expired
				}
			} catch (error) {
				console.error('加载统计数据失败:', error)
			}
		},
		handleSearch() {
			// 跳转到搜索页面
			uni.navigateTo({
				url: '/pages/search/search'
			})
		},
		navigateToItemList(type) {
			let title = '全部'
			if (type === 'expiring') title = '临期'
			else if (type === 'notExpired') title = '未过期'
			else if (type === 'expired') title = '已过期'
			
			uni.navigateTo({
				url: `/pages/item-list/item-list?type=${type}&title=${title}`
			})
		},
		handleAddList() {
			uni.showToast({
				title: '添加列表',
				icon: 'none'
			})
		},
		handleListSettings() {
			uni.showToast({
				title: '列表设置',
				icon: 'none'
			})
		},
		toggleFabMenu() {
			this.showFabMenu = !this.showFabMenu
		},
		handleManualEntry() {
			this.showFabMenu = false
			uni.navigateTo({
				url: '/pages/add-item/add-item'
			})
		},
		handleScanImport() {
			this.showFabMenu = false
			// 扫码功能
			uni.scanCode({
				success: (res) => {
					console.log('扫码结果:', res)
					uni.navigateTo({
						url: `/pages/add-item/add-item?barcode=${res.result}`
					})
				}
			})
		},
		handleFileImport() {
			this.showFabMenu = false
			uni.navigateTo({
				url: '/pages/item-import/item-import'
			})
		}
	}
}
</script>

<style scoped>
.overview-container {
	min-height: 100vh;
	background: linear-gradient(180deg, #667eea 0%, #f5f7fa 30%);
	padding-bottom: 100rpx;
	box-sizing: border-box;
}

.status-bar {
	background-color: transparent;
	width: 100%;
}

.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
}

.top-icons, .top-icons-right {
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

.user-id {
	font-size: 48rpx;
	font-weight: bold;
	text-align: center;
	margin: 20rpx 0;
	color: #fff;
	text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.notice-bar {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #ffd89b, #19547b);
	padding: 15rpx 20rpx;
	margin: 0 30rpx 30rpx;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(255, 216, 155, 0.3);
}

.notice-icon {
	margin-right: 10rpx;
	font-size: 28rpx;
}

.notice-text {
	font-size: 26rpx;
	color: #fff;
	font-weight: 500;
}

.search-bar {
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.95);
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
	margin: 0 30rpx 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(20rpx);
}

.search-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 15rpx;
}

.search-placeholder {
	font-size: 28rpx;
	color: #999;
}

.status-cards {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	padding: 0 30rpx 30rpx;
}

.card-item {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 30rpx 24rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(20rpx);
	transition: transform 0.3s ease;
}

.card-item:active {
	transform: scale(0.98);
}

.card-icon {
	width: 50rpx;
	height: 50rpx;
	flex-shrink: 0;
}

.card-content {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	flex: 1;
}

.card-number {
	font-size: 42rpx;
	font-weight: bold;
	color: #333;
	line-height: 1;
}

.card-label {
	font-size: 24rpx;
	color: #666;
	margin-top: 10rpx;
}

.section {
	margin: 30rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(20rpx);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 25rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.section-actions {
	display: flex;
	gap: 20rpx;
}

.action-icon {
	font-size: 36rpx;
	color: #667eea;
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(102, 126, 234, 0.1);
	border-radius: 50%;
}

.list-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	transition: background-color 0.3s ease;
	border-radius: 12rpx;
	margin: 0 -10rpx;
	padding-left: 10rpx;
	padding-right: 10rpx;
}

.list-item:active {
	background-color: rgba(0, 0, 0, 0.02);
}

.list-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 20rpx;
}

.list-text {
	font-size: 30rpx;
	color: #333;
	flex: 1;
}

.list-arrow {
	font-size: 32rpx;
	color: #ccc;
	font-weight: bold;
}

.tags-container {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
}

.tag-chip {
	padding: 12rpx 24rpx;
	background: linear-gradient(135deg, #a8edea, #fed6e3);
	border-radius: 50rpx;
	transition: transform 0.2s ease;
}

.tag-chip:active {
	transform: scale(0.95);
}

.tag-chip-text {
	font-size: 26rpx;
	color: #333;
}

.tag-button {
	background-color: #f5f5f5;
	border-radius: 8rpx;
	padding: 20rpx 30rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
}

.supplier-input {
	padding: 20rpx 0;
}

.supplier-placeholder {
	font-size: 28rpx;
	color: #999;
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

.fab-menu {
	position: fixed;
	bottom: 120rpx;
	right: 40rpx;
	z-index: 999;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 20rpx;
}

.fab-menu-item {
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 50rpx;
	padding: 18rpx 35rpx 18rpx 25rpx;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.fab-menu-text {
	font-size: 28rpx;
	color: #fff;
	margin-right: 15rpx;
	font-weight: 500;
}

.fab-menu-icon {
	font-size: 32rpx;
}

.fab-close {
	width: 110rpx;
	height: 110rpx;
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
	margin-top: 20rpx;
}

.fab-close-icon {
	font-size: 60rpx;
	color: #fff;
	font-weight: 300;
}
</style>

