<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	page {
		background-color: #f5f5f5;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	}
	
	/* 通用容器 */
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
	}
	
	/* 通用按钮样式 */
	.btn-primary {
		background-color: #007AFF;
		color: #fff;
		border-radius: 8rpx;
		padding: 20rpx 40rpx;
		text-align: center;
		font-size: 30rpx;
	}
	
	.btn-primary:active {
		opacity: 0.8;
	}
</style>
