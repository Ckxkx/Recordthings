<template>
	<view class="search-container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 搜索和筛选栏 -->
		<view class="search-filter-bar">
			<view class="back-button" @click="handleCancel">
				<image class="back-icon" src="/static/返回.png" mode="aspectFit"></image>
			</view>
			<view class="search-input-wrapper">
				<image class="search-icon" src="/static/搜索.png" mode="aspectFit"></image>
				<input 
					class="search-input" 
					v-model="searchKeyword" 
					placeholder="搜索"
					@input="handleSearchInput"
					@confirm="handleSearchConfirm"
					:focus="autoFocus"
				/>
				<view v-if="searchKeyword" class="clear-icon" @click="clearSearch">
					<text>×</text>
				</view>
			</view>
		</view>
		
		<!-- 物品列表 -->
		<view class="item-list">
			<view v-if="searchKeyword && searchResults.length > 0">
				<view 
					class="item-card" 
					v-for="(item, index) in searchResults" 
					:key="index"
					@click="handleItemClick(item)"
				>
					<view class="item-info">
						<view class="item-name">{{ item.name }}</view>
						<view class="item-detail">
							<text>{{ item.stock }}件 {{ item.startDate }} 至 {{ item.endDate }}</text>
						</view>
						<view class="item-meta">
							<text class="item-category">{{ item.category }}</text>
							<text class="item-brand">{{ item.brand }}</text>
						</view>
						<view class="item-status" v-if="item.status">
							<text class="status-text">{{ item.status }}</text>
						</view>
					</view>
					
					<!-- 进度条横跨整个卡片 -->
					<view class="progress-bar-container" v-if="item.progressPercent !== undefined && item.endDate">
						<view class="progress-bar" :style="{ width: item.progressPercent + '%' }"></view>
					</view>
				</view>
			</view>
			<view v-else-if="searchKeyword && searchResults.length === 0" class="empty-state">
				<text class="empty-text">未找到相关物品</text>
			</view>
			<view v-else class="empty-state">
				<text class="empty-text">请输入关键词搜索</text>
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
import { getAllItems, searchItems } from '../../utils/dbConfig.js'

export default {
		data() {
		return {
			statusBarHeight: 0,
			searchKeyword: '',
			autoFocus: true,
			searchHistory: [],
			searchResults: [],
			allItems: [] // 所有物品数据，应该从存储中加载
		}
	},
	onLoad() {
		// 获取状态栏高度
		try {
			const windowInfo = uni.getWindowInfo()
			this.statusBarHeight = windowInfo.statusBarHeight || 45
		} catch (e) {
			this.statusBarHeight = 45
		}
		
		this.loadSearchHistory()
		this.loadAllItems()
	},
	onShow() {
		// 页面显示时刷新数据
		this.loadAllItems()
		if (this.searchKeyword) {
			this.performSearch()
		}
	},
	methods: {
		loadSearchHistory() {
			// 从本地存储加载搜索历史
			try {
				const history = uni.getStorageSync('searchHistory') || []
				this.searchHistory = history.slice(0, 10) // 最多显示10条
			} catch (e) {
				this.searchHistory = []
			}
		},
		async loadAllItems() {
			try {
				// 从数据库加载所有物品数据
				this.allItems = await getAllItems()
			} catch (error) {
				console.error('加载物品失败:', error)
			}
		},
		async handleSearchInput(e) {
			this.searchKeyword = e.detail.value
			if (this.searchKeyword) {
				await this.performSearch()
			} else {
				this.searchResults = []
			}
		},
		async handleSearchConfirm() {
			if (this.searchKeyword.trim()) {
				await this.performSearch()
				this.saveSearchHistory(this.searchKeyword.trim())
			}
		},
		async performSearch() {
			if (!this.searchKeyword.trim()) {
				this.searchResults = []
				return
			}
			
			try {
				// 使用数据库的搜索功能
				const results = await searchItems(this.searchKeyword.trim())
				
				// 格式化搜索结果（与item-list格式一致）
				const now = new Date()
				const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
				
				this.searchResults = results.map(item => {
					let status = ''
					let statusClass = ''
					let progressPercent = 0
					
					if (item.expirationDate) {
						const expDate = new Date(item.expirationDate + 'T00:00:00').getTime()
						const daysDiff = Math.ceil((expDate - today) / (24 * 60 * 60 * 1000))
						
						// 计算进度条百分比
						if (item.productionDate) {
							const prodDate = new Date(item.productionDate + 'T00:00:00').getTime()
							const totalDays = Math.ceil((expDate - prodDate) / (24 * 60 * 60 * 1000))
							const remainingDays = Math.max(0, daysDiff)
							if (totalDays > 0) {
								progressPercent = Math.min(100, Math.max(0, (remainingDays / totalDays) * 100))
							}
						}
						
						if (daysDiff < 0) {
							status = '已过期'
							statusClass = 'status-danger'
							progressPercent = 0
						} else if (daysDiff === 0) {
							status = '今日到期'
							statusClass = 'status-warning'
							progressPercent = 0
						} else if (daysDiff <= 7) {
							status = `${daysDiff}天后到期`
							statusClass = 'status-warning'
						}
					}
					
					return {
						id: item._id || item.id,
						name: item.name,
						brand: item.brand || '',
						category: item.category || '综合',
						stock: item.stock || 1,
						startDate: item.productionDate || '',
						endDate: item.expirationDate || '',
						status: status,
						statusClass: statusClass,
						progressPercent: progressPercent
					}
				})
			} catch (error) {
				console.error('搜索失败:', error)
				this.searchResults = []
			}
		},
		saveSearchHistory(keyword) {
			if (!keyword) return
			
			// 移除重复项
			let history = this.searchHistory.filter(item => item !== keyword)
			// 添加到最前面
			history.unshift(keyword)
			// 最多保存10条
			history = history.slice(0, 10)
			this.searchHistory = history
			
			// 保存到本地存储
			try {
				uni.setStorageSync('searchHistory', history)
			} catch (e) {
				console.error('保存搜索历史失败', e)
			}
		},
		async searchByHistory(keyword) {
			this.searchKeyword = keyword
			await this.performSearch()
		},
		clearSearch() {
			this.searchKeyword = ''
			this.searchResults = []
		},
		clearHistory() {
			this.searchHistory = []
			try {
				uni.removeStorageSync('searchHistory')
			} catch (e) {
				console.error('清除搜索历史失败', e)
			}
		},
		handleCancel() {
			uni.navigateBack()
		},
		handleAddItem() {
			uni.navigateTo({
				url: '/pages/add-item/add-item'
			})
		},
		handleItemClick(item) {
			uni.navigateTo({
				url: `/pages/add-item/add-item?id=${item.id}`
			})
		}
	}
}
</script>

<style scoped>
.search-container {
	min-height: 100vh;
	background: linear-gradient(180deg, #667eea 0%, #f5f7fa 20%);
	padding-bottom: 100rpx;
}

.status-bar {
	background-color: transparent;
	width: 100%;
}

.search-filter-bar {
	display: flex;
	align-items: center;
	padding-top: 2vh;
	padding-bottom: 20rpx;
	padding-left: 30rpx;
	padding-right: 30rpx;
	background-color: transparent;
	gap: 20rpx;
}

.search-input-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
	position: relative;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(20rpx);
}

.back-button {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	backdrop-filter: blur(10rpx);
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.search-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 15rpx;
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.clear-icon {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	color: #999;
	margin-left: 15rpx;
}

.item-list {
	padding: 0 30rpx;
}

.item-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 30rpx;
	padding-bottom: 36rpx;
	margin-bottom: 20rpx;
	display: flex;
	align-items: flex-start;
	position: relative;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
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
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.item-detail {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 10rpx;
}

.item-meta {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 10rpx;
}

.item-category, .item-brand {
	font-size: 24rpx;
	color: #999;
	background: rgba(102, 126, 234, 0.1);
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
}

.item-status {
	align-self: flex-end;
	text-align: right;
	margin-bottom: 10rpx;
}

.status-text {
	font-size: 24rpx;
	color: #ff9500;
	background: rgba(255, 149, 0, 0.1);
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
}

.progress-bar-container {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 6rpx;
	background-color: #f0f0f0;
	border-radius: 0 0 20rpx 20rpx;
	overflow: hidden;
}

.progress-bar {
	height: 100%;
	border-radius: 3rpx;
	background: linear-gradient(90deg, #667eea, #764ba2);
	transition: width 0.6s ease-in-out;
	animation: progressAnimation 1.5s ease-out forwards;
	position: absolute;
	right: 0;
	top: 0;
}

@keyframes progressAnimation {
	from {
		width: 100%;
	}
}

.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 120rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
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

