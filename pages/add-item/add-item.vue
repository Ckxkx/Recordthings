<template>
	<view class="add-item-container">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 自定义导航栏（仅编辑模式显示删除按钮） -->
		<view v-if="isEditMode" class="custom-navbar">
			<view class="navbar-content">
				<view class="navbar-back" @click="handleBack">
					<text class="back-icon">‹</text>
				</view>
				<text class="navbar-title">编辑物品</text>
				<view class="navbar-delete" @click="handleDeleteItem">
					<text class="delete-icon">🗑</text>
				</view>
			</view>
		</view>
		
		<!-- 顶部标题（非编辑模式） -->
		<view v-else class="page-header">
			<view class="navbar-back" @click="handleBack">
				<text class="back-icon">‹</text>
			</view>
			<text class="page-title">添加物品</text>
			<view class="navbar-placeholder-right"></view>
		</view>
		
		<!-- 物品名称 -->
		<view class="form-section">
			<input class="item-name-input" v-model="formData.name" placeholder="请输入名称" />
		</view>
		
		<!-- 日期 -->
		<view class="form-section">
			<view class="section-title">日期</view>
			
			<!-- 生产日期 -->
			<picker mode="date" :value="formData.productionDate" @change="handleProductionDateChange">
				<view class="form-item clickable">
					<text class="label-icon">📅</text>
					<text class="label-text">生产日期</text>
					<text class="value-text">{{ formData.productionDate || '请选择' }}</text>
					<text class="arrow">›</text>
				</view>
			</picker>
			
			<!-- 过期日期 -->
			<picker mode="date" :value="formData.expirationDate" @change="handleExpirationDateChange">
				<view class="form-item clickable">
					<text class="label-icon">📅</text>
					<text class="label-text">过期日期</text>
					<text class="value-text">{{ formData.expirationDate || '请选择' }}</text>
					<text class="arrow">›</text>
				</view>
			</picker>
			
			<!-- 物品提醒 -->
			<view class="form-item clickable" @click="handleSelectReminder">
				<text class="label-icon">⏰</text>
				<text class="label-text">物品提醒</text>
				<text class="value-text">{{ formData.reminder || '无' }}</text>
				<text class="arrow">›</text>
			</view>
		</view>
		
		<!-- 基础信息 -->
		<view class="form-section">
			<view class="section-title">基础信息</view>
			
			<!-- 条形码 -->
			<view class="form-item">
				<text class="label-icon">📊</text>
				<text class="label-text">条形码</text>
				<input class="value-input" v-model="formData.barcode" placeholder="请输入条形码" @blur="handleBarcodeBlur" />
				<view class="query-btn" @click="handleQueryBarcode" v-if="formData.barcode">
					<text class="query-btn-text">查询</text>
				</view>
			</view>
			
			<!-- 品牌 -->
			<view class="form-item">
				<text class="label-icon">🏷</text>
				<text class="label-text">品牌</text>
				<input class="value-input" v-model="formData.brand" placeholder="请输入品牌" />
			</view>
			
		</view>
		
		<!-- 保存按钮 -->
		<view class="save-button" @click="handleSave">
			<text class="save-button-text">保存</text>
		</view>
	</view>
</template>

<script>
import { getBarcodeInfo, formatGoodsInfo } from '../../utils/barcodeApi.js'
import { addItem, updateItem, getItemById, deleteItem } from '../../utils/dbConfig.js'

export default {
		data() {
		return {
			statusBarHeight: 0,
			itemId: null,
			isEditMode: false,
			formData: {
				id: null,
				name: '',
				tag: '',
				productionDate: '',
				expirationDate: '',
				reminder: '无',
				barcode: '',
				brand: '',
				supplier: '',
				stock: 1,
				image: '',
				category: '综合'
			},
			isQuerying: false
		}
	},
	onLoad(options) {
		// 获取状态栏高度
		try {
			const windowInfo = uni.getWindowInfo()
			this.statusBarHeight = windowInfo.statusBarHeight || 20
		} catch (e) {
			this.statusBarHeight = 20
		}
		
		if (options.barcode) {
			this.formData.barcode = options.barcode
			// 如果有条形码，自动查询
			this.queryBarcodeInfo(options.barcode)
		}
		if (options.id) {
			this.itemId = parseInt(options.id)
			this.loadItemData(this.itemId)
			// 编辑模式
			this.isEditMode = true
		} else {
			this.isEditMode = false
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack()
		},
		async loadItemData(id) {
			try {
				// 加载物品数据
				const item = await getItemById(id)
				if (item) {
					this.formData = {
						...this.formData,
						...item,
						id: item._id || item.id
					}
					this.itemId = item._id || id
				}
			} catch (error) {
				console.error('加载物品数据失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		async handleDeleteItem() {
			if (!this.itemId) {
				return
			}
			
			uni.showModal({
				title: '提示',
				content: '确定要删除该物品吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const success = await deleteItem(this.itemId)
							if (success) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								setTimeout(() => {
									uni.navigateBack()
								}, 1500)
							} else {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						} catch (error) {
							console.error('删除失败:', error)
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		handleProductionDateChange(e) {
			this.formData.productionDate = e.detail.value
		},
		handleExpirationDateChange(e) {
			this.formData.expirationDate = e.detail.value
		},
		handleSelectReminder() {
			uni.showActionSheet({
				itemList: ['无', '每天', '每周', '每月'],
				success: (res) => {
					const options = ['无', '每天', '每周', '每月']
					this.formData.reminder = options[res.tapIndex]
				}
			})
		},
		handleBarcodeBlur(e) {
			// 输入框失焦时，如果条形码长度足够，可以自动查询
			const barcode = e.detail.value.trim()
			if (barcode && barcode.length >= 8) {
				// 可以选择自动查询，这里先不自动查询，等用户点击查询按钮
			}
		},
		handleQueryBarcode() {
			if (!this.formData.barcode || !this.formData.barcode.trim()) {
				uni.showToast({
					title: '请输入条形码',
					icon: 'none'
				})
				return
			}
			this.queryBarcodeInfo(this.formData.barcode.trim())
		},
		queryBarcodeInfo(barcode) {
			if (!barcode || !barcode.trim()) {
				return
			}
			
			if (this.isQuerying) {
				return
			}
			
			this.isQuerying = true
			uni.showLoading({
				title: '查询中...'
			})
			
			getBarcodeInfo(barcode)
				.then((goodsInfo) => {
					uni.hideLoading()
					this.isQuerying = false
					
					// 格式化并填充数据
					const formatted = formatGoodsInfo(goodsInfo)
					
					// 填充表单数据（只在字段为空时填充，避免覆盖用户已输入的内容）
					if (formatted.name && !this.formData.name) {
						this.formData.name = formatted.name
					}
					if (formatted.brand && !this.formData.brand) {
						this.formData.brand = formatted.brand
					}
					if (formatted.supplier && !this.formData.supplier) {
						this.formData.supplier = formatted.supplier
					}
					// 确保条形码正确
					if (formatted.barcode) {
						this.formData.barcode = formatted.barcode
					}
					
					uni.showToast({
						title: '查询成功',
						icon: 'success'
					})
				})
				.catch((err) => {
					uni.hideLoading()
					this.isQuerying = false
					
					console.error('查询条形码失败:', err)
					uni.showToast({
						title: err.message || '查询失败，请检查条形码是否正确',
						icon: 'none',
						duration: 2000
					})
				})
		},
		async handleSave() {
			// 验证数据
			if (!this.formData.name) {
				uni.showToast({
					title: '请输入物品名称',
					icon: 'none'
				})
				return
			}
			
			// 自动计算保质期和临期规则
			let shelfLife = { year: 0, month: 0, day: 0 }
			let expiringRule = { year: 0, month: 0, day: 30 } // 默认30天
			let removeRule = { year: 0, month: 0, day: 0 }
			let expiringDate = ''
			let removeDate = ''
			
			// 如果填写了生产日期和过期日期，自动计算保质期
			if (this.formData.productionDate && this.formData.expirationDate) {
				const prodDate = new Date(this.formData.productionDate)
				const expDate = new Date(this.formData.expirationDate)
				const diffTime = expDate.getTime() - prodDate.getTime()
				const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
				
				if (diffDays > 0) {
					// 计算保质期天数
					shelfLife.day = diffDays
					
					// 计算临期日期（过期日期前30天）
					const expiringDateObj = new Date(expDate.getTime() - (expiringRule.day * 24 * 60 * 60 * 1000))
					expiringDate = expiringDateObj.toISOString().split('T')[0]
					
					// 计算下架日期（过期日期后0天，即过期日期当天）
					removeDate = this.formData.expirationDate
				}
			}
			
			// 准备保存的数据
			const itemData = {
				name: this.formData.name,
				tag: this.formData.tag || '',
				barcode: this.formData.barcode || '',
				brand: this.formData.brand || '',
				supplier: this.formData.supplier || '',
				stock: this.formData.stock || 1,
				image: this.formData.image || '',
				category: this.formData.category || '综合',
				hasShelfLife: true,
				shelfLife: shelfLife,
				productionDate: this.formData.productionDate || '',
				expirationDate: this.formData.expirationDate || '',
				reminder: this.formData.reminder || '无',
				hasExpiringRule: true,
				expiringRule: expiringRule,
				expiringDate: expiringDate,
				hasRemoveRule: true,
				removeRule: removeRule,
				removeDate: removeDate
			}
			
			try {
				let result
				if (this.formData.id) {
					// 更新物品
					result = await updateItem(this.formData.id, itemData)
				} else {
					// 新增物品
					result = await addItem(itemData)
				}
				
				console.log('保存物品数据:', result)
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				})
				
				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			} catch (error) {
				console.error('保存失败:', error)
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
.add-item-container {
	min-height: 100vh;
	background: linear-gradient(180deg, #667eea 0%, #f5f7fa 25%);
	padding-bottom: 120rpx;
}

.custom-navbar {
	background: transparent;
	padding: 0 30rpx 20rpx;
}

.navbar-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
}

.navbar-back {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	backdrop-filter: blur(10rpx);
}

.back-icon {
	font-size: 48rpx;
	color: #fff;
	line-height: 1;
}

.navbar-title {
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}

.navbar-delete {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	backdrop-filter: blur(10rpx);
}

.delete-icon {
	font-size: 40rpx;
}

.page-header {
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.navbar-placeholder-right {
	width: 60rpx;
	height: 60rpx;
}

.page-title {
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}

.form-section {
	background: rgba(255, 255, 255, 0.95);
	margin: 20rpx 30rpx;
	padding: 30rpx;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(20rpx);
}

.status-bar {
	background-color: transparent;
}

.navbar-placeholder {
	background-color: transparent;
}

.form-section:first-child {
	margin-top: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
}

.item-name-input {
	width: 100%;
	font-size: 32rpx;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #e5e5e5;
	margin-bottom: 30rpx;
}

.form-item {
	display: flex;
	align-items: center;
	padding: 25rpx 0;
	border-bottom: 2rpx solid #f5f5f5;
}

.form-item:last-child {
	border-bottom: none;
}

.form-item.clickable {
	cursor: pointer;
}


.label-icon {
	font-size: 32rpx;
	margin-right: 20rpx;
}

.label-text {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}

.value-text {
	font-size: 28rpx;
	color: #999;
	margin-right: 15rpx;
}

.value-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	text-align: right;
	margin-right: 20rpx;
}

.query-btn {
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 8rpx;
	padding: 10rpx 20rpx;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.query-btn-text {
	font-size: 24rpx;
	color: #fff;
}

.arrow {
	font-size: 32rpx;
	color: #ccc;
}


.save-button {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(135deg, #667eea, #764ba2);
	padding: 30rpx;
	text-align: center;
	box-shadow: 0 -4rpx 16rpx rgba(102, 126, 234, 0.2);
}

.save-button-text {
	font-size: 32rpx;
	color: #fff;
	font-weight: bold;
}
</style>

