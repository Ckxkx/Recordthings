<template>
	<view class="login-container">
		<view class="login-content">
			<view class="logo">
				<text class="logo-icon">📦</text>
			</view>
			<view class="app-name">物品管理</view>
			<view class="welcome-text">欢迎使用物品管理系统</view>
			
			<!-- 微信授权登录按钮 -->
			<button 
				class="login-btn" 
				open-type="getPhoneNumber" 
				@getphonenumber="handleGetPhoneNumber"
			>
				<text class="btn-icon">📱</text>
				<text class="btn-text">微信手机号登录</text>
			</button>
			
			<!-- 开发环境提示 -->
			<view class="dev-tips" v-if="isDev">
				<text class="tips-text">开发环境下无法获取真实手机号</text>
				<button class="mock-login-btn" @click="handleMockLogin">
					<text>使用模拟登录</text>
				</button>
			</view>
			
			<!-- 说明文字 -->
			<view class="tips">
				<text class="tips-item">• 仅用于账号识别，不会泄露隐私</text>
				<text class="tips-item">• 首次登录自动创建账号</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isDev: true // 开发环境标识
		}
	},
	onLoad() {
		// 检查是否已登录
		const userInfo = uni.getStorageSync('userInfo')
		if (userInfo && userInfo.phoneNumber) {
			// 已登录，跳转到首页
			uni.switchTab({
				url: '/pages/overview/overview'
			})
		}
	},
	methods: {
		/**
		 * 处理微信手机号授权
		 * 注意：此功能需要小程序上线后才能正常使用
		 */
		handleGetPhoneNumber(e) {
			console.log('获取手机号回调:', e)
			
			if (e.detail.errMsg === 'getPhoneNumber:ok') {
				// 用户同意授权
				const { code } = e.detail
				
				// 将 code 发送到后端服务器
				// 后端通过 code 调用微信接口获取手机号
				this.loginWithCode(code)
			} else {
				// 用户拒绝授权
				uni.showToast({
					title: '需要授权手机号才能使用',
					icon: 'none'
				})
			}
		},
		
		/**
		 * 使用 code 登录
		 * 需要配合云函数或后端服务器
		 */
		loginWithCode(code) {
			uni.showLoading({
				title: '登录中...'
			})
			
			// 从 manifest.json 获取小程序配置
			// 注意：实际使用时需要替换为你的小程序 AppID 和 AppSecret
			const appId = 'your_appid' // 替换为你的小程序AppID
			const appSecret = 'your_appsecret' // 替换为你的小程序AppSecret
			
			// 调用云函数获取手机号
			uniCloud.callFunction({
				name: 'login',
				data: {
					code: code,
					appId: appId,
					appSecret: appSecret
				}
			}).then(res => {
				uni.hideLoading()
				
				if (res.result.success) {
					const phoneNumber = res.result.phoneNumber
					
					// 保存用户信息
					const userInfo = {
						phoneNumber: phoneNumber,
						userId: res.result.userId,
						loginTime: new Date().getTime()
					}
					uni.setStorageSync('userInfo', userInfo)
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
					
					// 跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/overview/overview'
						})
					}, 1500)
				} else {
					uni.showToast({
						title: res.result.message || '登录失败，请重试',
						icon: 'none',
						duration: 2000
					})
				}
			}).catch(err => {
				uni.hideLoading()
				console.error('登录失败:', err)
				uni.showToast({
					title: '登录失败',
					icon: 'none'
				})
			})
		},
		
		/**
		 * 模拟登录（仅用于开发环境）
		 */
		handleMockLogin() {
			const mockPhone = '138****3673'
			
			const userInfo = {
				phoneNumber: mockPhone,
				loginTime: new Date().getTime(),
				isMock: true
			}
			uni.setStorageSync('userInfo', userInfo)
			
			uni.showToast({
				title: '模拟登录成功',
				icon: 'success'
			})
			
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/overview/overview'
				})
			}, 1500)
		}
	}
}
</script>

<style scoped>
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx;
}

.login-content {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	backdrop-filter: blur(20rpx);
}

.logo-icon {
	font-size: 80rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 20rpx;
}

.welcome-text {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 80rpx;
}

.login-btn {
	width: 100%;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 50rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
	border: none;
	margin-bottom: 40rpx;
}

.login-btn::after {
	border: none;
}

.btn-icon {
	font-size: 36rpx;
	margin-right: 15rpx;
}

.btn-text {
	font-size: 32rpx;
	color: #667eea;
	font-weight: 600;
}

.dev-tips {
	width: 100%;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
	backdrop-filter: blur(10rpx);
}

.tips-text {
	display: block;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
	text-align: center;
	margin-bottom: 20rpx;
}

.mock-login-btn {
	width: 100%;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50rpx;
	padding: 20rpx;
	font-size: 28rpx;
	color: #fff;
	border: none;
}

.mock-login-btn::after {
	border: none;
}

.tips {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.tips-item {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
	text-align: center;
}
</style>
