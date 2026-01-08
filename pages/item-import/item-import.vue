<template>
	<view class="import-container">
		<!-- 提示信息 -->
		<view class="prompt-text">请选择待导入的物品文件</view>
		
		<!-- 文件选择按钮 -->
		<view class="file-select-button" @click="handleSelectFile">
			<text class="button-text">选择文件(不超过200条)</text>
			<view class="button-right">
				<text class="upload-icon">📤</text>
				<text class="arrow-icon">›</text>
			</view>
		</view>
		
		<!-- 使用帮助 -->
		<view class="help-section">
			<view class="help-header">
				<text class="help-title">使用帮助</text>
				<view class="download-template" @click="handleDownloadTemplate">
					<text class="download-icon">☁️</text>
					<text class="download-text">下载模板</text>
				</view>
			</view>
			
			<view class="help-steps">
				<view class="step-item">
					<text class="step-number">1.</text>
					<text class="step-text">点击【下载模板】将模板文件发送到微信文件助手或微信联系人,然后下载文件;</text>
				</view>
				<view class="step-item">
					<text class="step-number">2.</text>
					<text class="step-text">按照样例格式填入需要导入的物品信息,然后发送到微信文件助手或微信联系人;</text>
				</view>
				<view class="step-item">
					<text class="step-number">3.</text>
					<text class="step-text">点击【选择文件】选择步骤2的聊天文件上传;</text>
				</view>
				<view class="step-item">
					<text class="step-number">4.</text>
					<text class="step-text">解析完成后,确认需要导入的物品条目,点击底部的【开始导入】,即可完成。</text>
				</view>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<text class="item-count">共{{ itemCount }}个物品条目</text>
			<view class="import-button" @click="handleStartImport">
				<text class="import-button-text">开始导入</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			itemCount: 0,
			selectedFile: null
		}
	},
	methods: {
		handleSelectFile() {
			// 选择文件
			uni.chooseMessageFile({
				count: 1,
				type: 'file',
				success: (res) => {
					this.selectedFile = res.tempFiles[0]
					// 这里可以解析文件内容
					uni.showToast({
						title: '文件选择成功',
						icon: 'success'
					})
					// 模拟解析后的物品数量
					this.itemCount = 10
				},
				fail: (err) => {
					console.log('选择文件失败:', err)
					uni.showToast({
						title: '选择文件失败',
						icon: 'none'
					})
				}
			})
		},
		handleDownloadTemplate() {
			uni.showToast({
				title: '下载模板',
				icon: 'none'
			})
			// 这里可以实现模板下载功能
		},
		handleStartImport() {
			if (this.itemCount === 0) {
				uni.showToast({
					title: '请先选择文件',
					icon: 'none'
				})
				return
			}
			
			uni.showLoading({
				title: '导入中...'
			})
			
			// 模拟导入过程
			setTimeout(() => {
				uni.hideLoading()
				uni.showToast({
					title: '导入成功',
					icon: 'success'
				})
				
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			}, 2000)
		}
	}
}
</script>

<style scoped>
.import-container {
	min-height: 100vh;
	background-color: #fff;
	padding: 30rpx;
	padding-bottom: 120rpx;
}

.prompt-text {
	font-size: 30rpx;
	color: #333;
	margin-bottom: 30rpx;
}

.file-select-button {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	margin-bottom: 40rpx;
}

.button-text {
	font-size: 28rpx;
	color: #333;
}

.button-right {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.upload-icon {
	font-size: 32rpx;
}

.arrow-icon {
	font-size: 28rpx;
	color: #999;
}

.help-section {
	margin-top: 40rpx;
}

.help-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.help-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.download-template {
	display: flex;
	align-items: center;
	gap: 10rpx;
	color: #7ABAFF;
}

.download-icon {
	font-size: 28rpx;
}

.download-text {
	font-size: 28rpx;
	color: #7ABAFF;
}

.help-steps {
	display: flex;
	flex-direction: column;
	gap: 25rpx;
}

.step-item {
	display: flex;
	align-items: flex-start;
}

.step-number {
	font-size: 28rpx;
	color: #333;
	margin-right: 15rpx;
	font-weight: bold;
}

.step-text {
	flex: 1;
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-top: 2rpx solid #f5f5f5;
}

.item-count {
	font-size: 28rpx;
	color: #333;
}

.import-button {
	background-color: #7ABAFF;
	padding: 20rpx 60rpx;
	border-radius: 8rpx;
}

.import-button-text {
	font-size: 30rpx;
	color: #fff;
	font-weight: bold;
}
</style>

