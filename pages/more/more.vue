<template>
	<view class="more-container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 顶部操作栏 -->
		<view class="top-bar">
			<view class="page-title">更多</view>
			<view class="top-icons-right">
				<view class="icon-wrapper" @click="handleSettings">
					<text class="iconfont">⚙️</text>
				</view>
			</view>
		</view>
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<image class="user-avatar" src="/static/头像.jpg" mode="aspectFill"></image>
			<view class="user-info">
				<text class="user-id">{{ userId }}</text>
				<text class="user-status">普通用户</text>
			</view>
			<view class="user-actions">
				<view class="action-btn" @click="handleEditProfile">
					<text class="action-icon">✏️</text>
				</view>
				<view class="action-btn" @click="handleShare">
					<text class="action-icon">📤</text>
				</view>
			</view>
		</view>
		
		<!-- 快捷功能 -->
		<view class="quick-actions">
			<view class="quick-item" @click="handleStatistics">
				<view class="quick-icon statistics">
					<text>📊</text>
				</view>
				<text class="quick-text">数据统计</text>
			</view>
			<view class="quick-item" @click="handleExportItems">
				<view class="quick-icon export">
					<text>📤</text>
				</view>
				<text class="quick-text">物品导出</text>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="section-title">服务与支持</view>
			<view class="menu-list">
				<view class="menu-item" @click="handleFeedback">
					<view class="menu-icon-wrapper feedback">
						<text class="menu-icon">💬</text>
					</view>
					<view class="menu-content">
						<text class="menu-text">反馈建议</text>
						<text class="menu-desc">告诉我们您的想法</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-item" @click="handleCustomerService">
					<view class="menu-icon-wrapper service">
						<text class="menu-icon">🎧</text>
					</view>
					<view class="menu-content">
						<text class="menu-text">客服服务</text>
						<text class="menu-desc">在线客服为您解答</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-item" @click="handlePrivacy">
					<view class="menu-icon-wrapper privacy">
						<text class="menu-icon">🛡️</text>
					</view>
					<view class="menu-content">
						<text class="menu-text">隐私策略</text>
						<text class="menu-desc">了解我们如何保护您的隐私</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-item" @click="handleDatabaseDebug">
					<view class="menu-icon-wrapper debug">
						<text class="menu-icon">🔧</text>
					</view>
					<view class="menu-content">
						<text class="menu-text">数据库调试</text>
						<text class="menu-desc">查看和管理本地数据</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-item" @click="handleClearCache">
					<view class="menu-icon-wrapper cache">
						<text class="menu-icon">🗑️</text>
					</view>
					<view class="menu-content">
						<text class="menu-text">清除缓存</text>
						<text class="menu-desc">清除本地缓存数据</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				
				<view class="menu-item" @click="handleLogout">
					<view class="menu-icon-wrapper logout">
						<text class="menu-icon">🚪</text>
					</view>
					<view class="menu-content">
						<text class="menu-text">退出登录</text>
						<text class="menu-desc">退出当前账号</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>
		</view>
		
		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">版本 1.0.0</text>
		</view>
	</view>
</template>

<script>
import { getUserPhone, logout } from '../../utils/auth.js'
import { showExportDialog } from '../../utils/export.js'
import { clearAllCache } from '../../utils/cache.js'
import { getDebugInfo, exportData, importData, clearAll } from '../../utils/dbConfig.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			userId: '',
			scanCount: 4,
			adToday: 0,
			shareToday: 0
		}
	},
	onLoad() {
		try {
			const windowInfo = uni.getWindowInfo()
			this.statusBarHeight = windowInfo.statusBarHeight || 0
		} catch (e) {
			this.statusBarHeight = 0
		}
		// 获取用户手机号
		this.userId = getUserPhone() || '未登录'
	},
	onShow() {
		// 页面显示时更新用户信息
		this.userId = getUserPhone() || '未登录'
	},
	methods: {
		handleSettings() {
			uni.showToast({
				title: '设置',
				icon: 'none'
			})
		},
		handleEditProfile() {
			uni.showToast({
				title: '编辑资料',
				icon: 'none'
			})
		},
		handleShare() {
			uni.showToast({
				title: '分享',
				icon: 'none'
			})
		},
		handleMemberUpgrade() {
			uni.showToast({
				title: '升级会员',
				icon: 'none'
			})
		},
		handleStatistics() {
			// 跳转到数据统计页面
			uni.navigateTo({
				url: '/pages/statistics/statistics'
			})
		},
		handleExportItems() {
			// 物品导出功能：显示导出对话框
			showExportDialog()
		},
		handleFeedback() {
			uni.showModal({
				title: '反馈建议',
				content: '感谢您的反馈！\n\n请通过以下方式联系我们：\n邮箱：huichen_zhu@qq.com\n\n我们会认真听取您的每一条建议',
				confirmText: '复制邮箱',
				cancelText: '关闭',
				success: (res) => {
					if (res.confirm) {
						uni.setClipboardData({
							data: 'huichen_zhu@qq.com',
							success: () => {
								uni.showToast({
									title: '邮箱已复制',
									icon: 'success'
								})
							}
						})
					}
				}
			})
		},
		handleCustomerService() {
			uni.showActionSheet({
				itemList: ['发送邮件', '复制邮箱地址'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 尝试打开邮件客户端
						uni.showModal({
							title: '联系客服',
							content: '客服邮箱：huichen_zhu@qq.com\n\n请使用您的邮件客户端发送邮件给我们，我们会尽快回复您！',
							confirmText: '复制邮箱',
							cancelText: '关闭',
							success: (modalRes) => {
								if (modalRes.confirm) {
									uni.setClipboardData({
										data: 'huichen_zhu@qq.com',
										success: () => {
											uni.showToast({
												title: '邮箱已复制',
												icon: 'success'
											})
										}
									})
								}
							}
						})
					} else if (res.tapIndex === 1) {
						// 直接复制邮箱
						uni.setClipboardData({
							data: 'huichen_zhu@qq.com',
							success: () => {
								uni.showToast({
									title: '邮箱已复制',
									icon: 'success'
								})
							}
						})
					}
				}
			})
		},
		handlePrivacy() {
			uni.showToast({
				title: '隐私策略',
				icon: 'none'
			})
		},
		handleDatabaseDebug() {
			const debugInfo = getDebugInfo()
			const message = `数据库状态：
有数据：${debugInfo.hasData ? '是' : '否'}
物品数量：${debugInfo.itemCount}
存储键数：${debugInfo.storageKeys?.length || 0}
存储大小：${debugInfo.currentSize || 0}KB`
			
			uni.showModal({
				title: '数据库调试信息',
				content: message,
				showCancel: true,
				cancelText: '关闭',
				confirmText: '更多操作',
				success: (res) => {
					if (res.confirm) {
						this.showDebugActions()
					}
				}
			})
		},
		showDebugActions() {
			uni.showActionSheet({
				itemList: ['导出数据', '导入数据', '清空数据', '查看原始数据'],
				success: (res) => {
					switch(res.tapIndex) {
						case 0:
							this.handleExportDebugData()
							break
						case 1:
							this.handleImportDebugData()
							break
						case 2:
							this.handleClearAllData()
							break
						case 3:
							this.handleViewRawData()
							break
					}
				}
			})
		},
		handleExportDebugData() {
			const data = exportData()
			if (data) {
				// 复制到剪贴板
				uni.setClipboardData({
					data: data,
					success: () => {
						uni.showToast({
							title: '数据已复制到剪贴板',
							icon: 'success'
						})
					}
				})
			} else {
				uni.showToast({
					title: '导出失败',
					icon: 'none'
				})
			}
		},
		handleImportDebugData() {
			uni.getClipboardData({
				success: (res) => {
					uni.showModal({
						title: '确认导入',
						content: '将从剪贴板导入数据，这会覆盖现有数据，确定继续吗？',
						success: (modalRes) => {
							if (modalRes.confirm) {
								const success = importData(res.data)
								if (success) {
									uni.showToast({
										title: '导入成功',
										icon: 'success'
									})
								} else {
									uni.showToast({
										title: '导入失败，请检查数据格式',
										icon: 'none'
									})
								}
							}
						}
					})
				}
			})
		},
		handleClearAllData() {
			uni.showModal({
				title: '警告',
				content: '确定要清空所有数据吗？此操作不可恢复！',
				confirmColor: '#ff3b30',
				success: (res) => {
					if (res.confirm) {
						const success = clearAll()
						if (success) {
							uni.showToast({
								title: '数据已清空',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '清空失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		handleViewRawData() {
			const debugInfo = getDebugInfo()
			console.log('数据库原始数据:', debugInfo)
			uni.showModal({
				title: '原始数据',
				content: `请在控制台查看详细信息\n\n物品数：${debugInfo.itemCount}\n存储键：${debugInfo.storageKeys?.join(', ') || '无'}`,
				showCancel: false
			})
		},
		handleClearCache() {
			uni.showModal({
				title: '清除缓存',
				content: '确定要清除所有缓存数据吗？清除后将重新从云端加载数据。',
				success: (res) => {
					if (res.confirm) {
						const success = clearAllCache()
						if (success) {
							uni.showToast({
								title: '缓存已清除',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '清除失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						logout()
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.more-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* 用户信息卡片 */
.user-card {
	background: rgba(255, 255, 255, 0.95);
	margin: 30rpx;
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
}

.user-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 30rpx;
	border: 3rpx solid rgba(102, 126, 234, 0.2);
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.user-id {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 8rpx;
}

.user-status {
	font-size: 24rpx;
	color: #999;
}

.user-actions {
	display: flex;
	gap: 15rpx;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	background: #f8f9fa;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #e9ecef;
}

.action-icon {
	font-size: 28rpx;
}

/* 快捷功能 */
.quick-actions {
	display: flex;
	justify-content: space-around;
	margin: 0 30rpx 40rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 24rpx;
	padding: 40rpx 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
}

.quick-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.quick-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-bottom: 16rpx;
}

.quick-icon.collaborate {
	background: linear-gradient(135deg, #ff9a9e, #fecfef);
}

.quick-icon.export {
	background: linear-gradient(135deg, #a8edea, #fed6e3);
}

.quick-icon.statistics {
	background: linear-gradient(135deg, #667eea, #764ba2);
}

.quick-text {
	font-size: 24rpx;
	color: #666;
	text-align: center;
}

/* 功能菜单 */
.menu-section {
	margin: 0 30rpx 40rpx;
}

.section-title {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 20rpx;
	padding-left: 10rpx;
	font-weight: 600;
}

.menu-list {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	transition: background-color 0.3s ease;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:active {
	background-color: rgba(0, 0, 0, 0.02);
}

.menu-icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
}

.menu-icon-wrapper.feedback {
	background: linear-gradient(135deg, #667eea, #764ba2);
}

.menu-icon-wrapper.service {
	background: linear-gradient(135deg, #f093fb, #f5576c);
}

.menu-icon-wrapper.privacy {
	background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.menu-icon-wrapper.debug {
	background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.menu-icon-wrapper.cache {
	background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.menu-icon-wrapper.logout {
	background: linear-gradient(135deg, #fa709a, #fee140);
}

.menu-icon {
	font-size: 32rpx;
	color: #fff;
}

.menu-content {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.menu-text {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 6rpx;
}

.menu-desc {
	font-size: 24rpx;
	color: #999;
}

.menu-arrow {
	font-size: 32rpx;
	color: #ccc;
	font-weight: bold;
}

/* 版本信息 */
.version-info {
	text-align: center;
	margin-top: 40rpx;
}

.version-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
}

/* 旧样式保留以防需要 */
.user-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
}

.edit-icon, .share-icon {
	font-size: 36rpx;
}

.member-banner {
	background-color: #7ABAFF;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	margin: 0 30rpx 30rpx;
	display: flex;
	flex-direction: column;
	position: relative;
}

.member-type {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 15rpx;
}

.member-desc {
	font-size: 26rpx;
	color: #fff;
	opacity: 0.9;
}

.member-arrow {
	position: absolute;
	right: 30rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 32rpx;
	color: #fff;
}

.activity-section {
	background-color: #fff;
	margin: 0 30rpx 30rpx;
	border-radius: 16rpx;
	padding: 30rpx;
}

.activity-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 25rpx 0;
	border-bottom: 2rpx solid #f5f5f5;
}

.activity-item:last-child {
	border-bottom: none;
}

.activity-item.clickable {
	cursor: pointer;
}

.activity-label {
	font-size: 30rpx;
	color: #333;
}

.activity-value {
	font-size: 28rpx;
}

.orange {
	color: #ff9500;
}

.support-section {
	background-color: #fff;
	margin: 0 30rpx;
	border-radius: 16rpx;
	overflow: hidden;
}

.support-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 2rpx solid #f5f5f5;
}

.support-item:last-child {
	border-bottom: none;
}

.support-text {
	font-size: 30rpx;
	color: #333;
}

.support-icon {
	font-size: 32rpx;
}
</style>

