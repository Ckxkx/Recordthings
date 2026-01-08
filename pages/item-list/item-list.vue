<template>
	<view class="item-list-container">
		<!-- 头部 -->
		<view class="header">
			<text class="header-title">食品保质期管家</text>
		</view>
		
		<!-- 搜索栏 -->
		<view class="search-bar-wrapper">
			<view class="search-bar">
				<input 
					class="search-input" 
					v-model="searchKeyword" 
					placeholder="搜索食品名称或品牌"
					@input="handleSearchInput"
					@confirm="handleSearchConfirm"
				/>
				<view v-if="searchKeyword" class="clear-icon" @click="clearSearch">
					<text>×</text>
				</view>
			</view>
		</view>
		
		<view class="filter-tabs">
			<view 
				class="filter-tab" 
				:class="{ 'filter-tab-active': activeFilter === 'all' }"
				@click="setFilter('all')"
			>
				<text class="filter-tab-text">全部</text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ 'filter-tab-active': activeFilter === 'expiring' }"
				@click="setFilter('expiring')"
			>
				<text class="filter-tab-text">临期</text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ 'filter-tab-active': activeFilter === 'notExpired' }"
				@click="setFilter('notExpired')"
			>
				<text class="filter-tab-text">未过期</text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ 'filter-tab-active': activeFilter === 'expired' }"
				@click="setFilter('expired')"
			>
				<text class="filter-tab-text">已过期</text>
			</view>
		</view>
		
		<!-- 筛选菜单 -->
		<view v-if="showFilterMenu" class="filter-menu" @click.stop>
			<view class="filter-menu-item" @click="handleSort">
				<text class="filter-menu-text">排序</text>
				<text class="filter-menu-arrow">›</text>
			</view>
			<view class="filter-menu-item" @click="handleBatchOperation">
				<text class="filter-menu-text">批量操作</text>
				<text class="filter-menu-arrow">›</text>
			</view>
		</view>
		
		<!-- 排序菜单 -->
		<view v-if="showSortMenu" class="sort-menu" @click.stop>
			<view 
				class="sort-menu-item" 
				:class="{ 'sort-menu-item-active': sortField === 'expirationDate' && sortOrder === 'asc' }"
				@click="applySort('expirationDate', 'asc')"
			>
				<text class="sort-menu-text">到期日期</text>
				<text v-if="sortField === 'expirationDate' && sortOrder === 'asc'" class="sort-menu-check">✓</text>
			</view>
			<view 
				class="sort-menu-item" 
				:class="{ 'sort-menu-item-active': sortField === 'updateTime' && sortOrder === 'asc' }"
				@click="applySort('updateTime', 'asc')"
			>
				<text class="sort-menu-text">更新日期</text>
				<text v-if="sortField === 'updateTime' && sortOrder === 'asc'" class="sort-menu-check">✓</text>
			</view>
			<view 
				class="sort-menu-item" 
				:class="{ 'sort-menu-item-active': sortField === 'default' }"
				@click="applySort('default', 'asc')"
			>
				<text class="sort-menu-text">默认</text>
				<text v-if="sortField === 'default'" class="sort-menu-check">✓</text>
			</view>
			<view 
				class="sort-menu-item" 
				:class="{ 'sort-menu-item-active': sortOrder === 'asc' && sortField !== 'default' }"
				@click="applySort(sortField || 'expirationDate', 'asc')"
			>
				<text class="sort-menu-text">升序</text>
				<text v-if="sortOrder === 'asc' && sortField !== 'default'" class="sort-menu-check">✓</text>
			</view>
			<view 
				class="sort-menu-item" 
				:class="{ 'sort-menu-item-active': sortOrder === 'desc' && sortField !== 'default' }"
				@click="applySort(sortField || 'expirationDate', 'desc')"
			>
				<text class="sort-menu-text">降序</text>
				<text v-if="sortOrder === 'desc' && sortField !== 'default'" class="sort-menu-check">✓</text>
			</view>
		</view>
		
		<!-- 批量操作模式头部 -->
		<view v-if="batchMode" class="batch-header">
			<view class="batch-header-left">
				<text class="batch-title">{{ title }}</text>
				<text class="batch-select-all" @click="toggleSelectAll">取消全选</text>
			</view>
			<view class="batch-header-right">
				<text class="batch-count">选中{{ selectedItems.length }}项</text>
				<text class="batch-done" @click="exitBatchMode">完成</text>
			</view>
		</view>
		
		<!-- 物品列表 -->
		<view class="item-list">
			<view 
				class="item-card" 
				:class="{ 
					'item-card-selected': batchMode && isItemSelected(item.id),
					'item-card-expired': item.statusType === 'expired'
				}"
				v-for="(item, index) in filteredList" 
				:key="index" 
				@click="handleItemClick(item)"
			>
				<!-- 批量选择框 -->
				<view v-if="batchMode" class="item-checkbox" @click.stop="toggleItemSelect(item.id)">
					<view class="checkbox" :class="{ 'checkbox-checked': isItemSelected(item.id) }">
						<text v-if="isItemSelected(item.id)" class="checkbox-icon">✓</text>
					</view>
				</view>
				
				<view class="item-content">
					<view class="item-header">
						<view class="item-name">{{ item.name }}</view>
						<view class="item-status-tag" :class="'status-tag-' + item.statusType">
							<text class="status-tag-text">{{ item.statusLabel }}</text>
						</view>
					</view>
					<view class="item-expiration">
						<text class="expiration-label">过期时间: </text>
						<text class="expiration-date">{{ item.endDate }}</text>
					</view>
					<view class="item-days" :class="'days-' + item.statusType">
						<text>{{ item.daysText }}</text>
					</view>
				</view>
				
				<!-- 进度条横跨整个卡片 -->
				<view class="progress-bar-container" v-if="item.progressPercent !== undefined && item.endDate">
					<view class="progress-bar" :class="'progress-bar-' + item.statusType" :style="{ width: item.progressPercent + '%' }"></view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view v-if="filteredList.length === 0" class="empty-state">
				<text class="empty-text">没有物品</text>
			</view>
		</view>
		
		<!-- 批量操作底部栏 -->
		<view v-if="batchMode" class="batch-footer">
			<view class="batch-action" @click="handleBatchProcess">
				<text class="batch-action-icon">📄</text>
				<text class="batch-action-text">处理</text>
			</view>
			<view class="batch-action" @click="handleBatchMove">
				<text class="batch-action-icon">📁</text>
				<text class="batch-action-text">移动</text>
			</view>
			<view class="batch-action batch-action-danger" @click="handleBatchDelete">
				<text class="batch-action-icon">🗑</text>
				<text class="batch-action-text">删除</text>
			</view>
		</view>
		
		<!-- 浮动操作按钮 -->
		<view v-if="!batchMode" class="fab-container">
			<view class="fab-button" @click="handleAddItem">
				<text class="fab-icon">+</text>
			</view>
		</view>
		
		<!-- 遮罩层 -->
		<view v-if="showFilterMenu || showSortMenu || showProcessDialog || showMoveDialog" class="mask" @click="closeAllDialogs"></view>
		
		<!-- 处理对话框 -->
		<view v-if="showProcessDialog" class="dialog-container" @click.stop>
			<view class="dialog">
				<view class="dialog-header">
					<text class="dialog-title">批量处理</text>
					<text class="dialog-close" @click="closeProcessDialog">×</text>
				</view>
				<view class="dialog-content">
					<text class="dialog-text">已选择 {{ selectedItems.length }} 个物品</text>
					<view class="dialog-options">
						<view class="dialog-option" @click="handleProcessMark">
							<text class="dialog-option-text">标记为已处理</text>
						</view>
						<view class="dialog-option" @click="handleProcessNote">
							<text class="dialog-option-text">添加处理备注</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 处理备注输入对话框 -->
		<view v-if="showProcessNoteDialog" class="dialog-container" @click.stop>
			<view class="dialog dialog-large">
				<view class="dialog-header">
					<text class="dialog-title">添加处理备注</text>
					<text class="dialog-close" @click="closeProcessNoteDialog">×</text>
				</view>
				<view class="dialog-content">
					<textarea 
						class="dialog-textarea" 
						v-model="processNote" 
						placeholder="请输入处理备注（可选）"
						maxlength="200"
					></textarea>
				</view>
				<view class="dialog-footer">
					<view class="dialog-button dialog-button-cancel" @click="closeProcessNoteDialog">取消</view>
					<view class="dialog-button dialog-button-confirm" @click="confirmProcessNote">确定</view>
				</view>
			</view>
		</view>
		
		<!-- 移动对话框 -->
		<view v-if="showMoveDialog" class="dialog-container" @click.stop>
			<view class="dialog">
				<view class="dialog-header">
					<text class="dialog-title">移动到分类</text>
					<text class="dialog-close" @click="closeMoveDialog">×</text>
				</view>
				<view class="dialog-content">
					<text class="dialog-text">已选择 {{ selectedItems.length }} 个物品</text>
					<view class="category-list">
						<view 
							class="category-item" 
							v-for="(category, index) in categoryList" 
							:key="index"
							:class="{ 'category-item-active': selectedCategory === category }"
							@click="selectCategory(category)"
						>
							<text class="category-text">{{ category }}</text>
							<text v-if="selectedCategory === category" class="category-check">✓</text>
						</view>
					</view>
				</view>
				<view class="dialog-footer">
					<view class="dialog-button dialog-button-cancel" @click="closeMoveDialog">取消</view>
					<view class="dialog-button dialog-button-confirm" @click="confirmMove">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getItemsByType, getAllItems, deleteItem, updateItem, searchItems } from '../../utils/dbConfig.js'

export default {
	data() {
		return {
			type: 'all',
			title: '全部',
			itemList: [],
			allItems: [], // 原始数据
			searchKeyword: '',
			activeFilter: 'all', // 'all', 'expiring', 'notExpired', 'expired'
			showFilterMenu: false,
			showSortMenu: false,
			sortField: 'default', // 'expirationDate', 'updateTime', 'default'
			sortOrder: 'asc', // 'asc', 'desc'
			batchMode: false,
			selectedItems: [], // 选中的物品ID数组
			showProcessDialog: false, // 处理对话框
			showProcessNoteDialog: false, // 处理备注对话框
			processNote: '', // 处理备注
			showMoveDialog: false, // 移动对话框
			selectedCategory: '', // 选中的分类
			categoryList: ['综合', '饮料', '食品', '乳制品', '零食', '日用品', '其他'] // 分类列表
		}
	},
	computed: {
		filteredList() {
			let list = [...this.itemList]
			
			// 筛选过滤
			if (this.activeFilter === 'expiring') {
				list = list.filter(item => item.statusType === 'expiring')
			} else if (this.activeFilter === 'notExpired') {
				list = list.filter(item => item.statusType === 'notExpired')
			} else if (this.activeFilter === 'expired') {
				list = list.filter(item => item.statusType === 'expired')
			}
			
			// 搜索过滤
			if (this.searchKeyword && this.searchKeyword.trim()) {
				const keyword = this.searchKeyword.trim().toLowerCase()
				list = list.filter(item => {
					return item.name.toLowerCase().includes(keyword) ||
						(item.brand && item.brand.toLowerCase().includes(keyword)) ||
						(item.category && item.category.toLowerCase().includes(keyword))
				})
			}
			
			// 排序
			if (this.sortField !== 'default') {
				list.sort((a, b) => {
					let aValue, bValue
					
					if (this.sortField === 'expirationDate') {
						aValue = a.endDate ? new Date(a.endDate + 'T00:00:00').getTime() : 0
						bValue = b.endDate ? new Date(b.endDate + 'T00:00:00').getTime() : 0
					} else if (this.sortField === 'updateTime') {
						// 从原始数据中获取updateTime
						const aItem = this.allItems.find(i => i.id === a.id)
						const bItem = this.allItems.find(i => i.id === b.id)
						aValue = aItem?.updateTime || 0
						bValue = bItem?.updateTime || 0
					}
					
					if (this.sortOrder === 'asc') {
						return aValue - bValue
					} else {
						return bValue - aValue
					}
				})
			}
			
			return list
		}
	},
	onLoad(options) {
		if (options.type) {
			this.type = options.type
			// 根据传入的type设置默认的activeFilter
			if (this.type === 'expiring') {
				this.activeFilter = 'expiring'
			} else if (this.type === 'notExpired') {
				this.activeFilter = 'notExpired'
			} else if (this.type === 'expired') {
				this.activeFilter = 'expired'
			} else {
				this.activeFilter = 'all'
			}
		}
		if (options.title) {
			this.title = options.title
			uni.setNavigationBarTitle({
				title: this.title
			})
		}
		this.loadItemList()
	},
	onShow() {
		// 页面显示时刷新数据
		this.loadItemList()
	},
	methods: {
		async loadItemList() {
			try {
				// 始终加载所有物品
				const items = await getAllItems()
				this.allItems = items // 保存原始数据用于排序
				const now = new Date()
				const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
				
				console.log(`加载所有物品，共${items.length}个`)
				
				// 格式化物品列表
				this.itemList = items.map(item => {
				let statusType = 'notExpired' // 'expiring', 'notExpired', 'expired'
				let statusLabel = '未过期'
				let daysText = ''
				let progressPercent = 0 // 进度百分比
				
				if (item.expirationDate) {
					const expDate = new Date(item.expirationDate + 'T00:00:00').getTime()
					const daysDiff = Math.ceil((expDate - today) / (24 * 60 * 60 * 1000))
					
					// 计算进度条百分比（显示剩余时间，从左到右）
					if (item.productionDate) {
						const prodDate = new Date(item.productionDate + 'T00:00:00').getTime()
						const totalDays = Math.ceil((expDate - prodDate) / (24 * 60 * 60 * 1000))
						const remainingDays = Math.max(0, daysDiff)
						if (totalDays > 0) {
							progressPercent = Math.min(100, Math.max(0, (remainingDays / totalDays) * 100))
						}
					}
					
					if (daysDiff < 0) {
						statusType = 'expired'
						statusLabel = '已过期'
						daysText = `已过期${Math.abs(daysDiff)}天`
						progressPercent = 0
					} else if (daysDiff === 0) {
						statusType = 'expiring'
						statusLabel = '临期'
						daysText = '还有0天过期'
						progressPercent = 0
					} else if (daysDiff <= 7) {
						statusType = 'expiring'
						statusLabel = '临期'
						daysText = `还有${daysDiff}天过期`
					} else {
						statusType = 'notExpired'
						statusLabel = '未过期'
						daysText = `还有${daysDiff}天过期`
					}
				} else {
					statusType = 'notExpired'
					statusLabel = '未过期'
					daysText = ''
				}
				
				return {
					id: item._id || item.id,
					name: item.name,
					brand: item.brand || '',
					category: item.category || '综合',
					stock: item.stock || 1,
					startDate: item.productionDate || '',
					endDate: item.expirationDate || '',
					statusType: statusType,
					statusLabel: statusLabel,
					daysText: daysText,
					progressPercent: progressPercent,
					updateTime: item.updateTime || item.createTime || 0
				}
			})
			} catch (error) {
				console.error('加载物品列表失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		handleSearchInput(e) {
			this.searchKeyword = e.detail.value
		},
		handleSearchConfirm() {
			// 搜索确认，可以在这里添加搜索历史等功能
		},
		clearSearch() {
			this.searchKeyword = ''
		},
		setFilter(filter) {
			this.activeFilter = filter
		},
		toggleFilterMenu() {
			this.showFilterMenu = !this.showFilterMenu
			this.showSortMenu = false
		},
		closeAllMenus() {
			this.showFilterMenu = false
			this.showSortMenu = false
		},
		closeAllDialogs() {
			this.showFilterMenu = false
			this.showSortMenu = false
			this.showProcessDialog = false
			this.showProcessNoteDialog = false
			this.showMoveDialog = false
		},
		handleSort() {
			this.showFilterMenu = false
			this.showSortMenu = true
		},
		applySort(field, order) {
			this.sortField = field
			this.sortOrder = order
			this.showSortMenu = false
		},
		handleBatchOperation() {
			this.showFilterMenu = false
			this.batchMode = true
			this.selectedItems = []
		},
		exitBatchMode() {
			this.batchMode = false
			this.selectedItems = []
		},
		toggleItemSelect(itemId) {
			const index = this.selectedItems.indexOf(itemId)
			if (index > -1) {
				this.selectedItems.splice(index, 1)
			} else {
				this.selectedItems.push(itemId)
			}
		},
		isItemSelected(itemId) {
			return this.selectedItems.includes(itemId)
		},
		toggleSelectAll() {
			if (this.selectedItems.length === this.filteredList.length) {
				this.selectedItems = []
			} else {
				this.selectedItems = this.filteredList.map(item => item.id)
			}
		},
		handleItemClick(item) {
			if (this.batchMode) {
				this.toggleItemSelect(item.id)
			} else {
				uni.navigateTo({
					url: `/pages/add-item/add-item?id=${item.id}`
				})
			}
		},
		handleBatchProcess() {
			if (this.selectedItems.length === 0) {
				uni.showToast({
					title: '请选择要处理的物品',
					icon: 'none'
				})
				return
			}
			this.showProcessDialog = true
		},
		closeProcessDialog() {
			this.showProcessDialog = false
		},
		async handleProcessMark() {
			// 标记为已处理
			const processTime = new Date().getTime()
			let successCount = 0
			
			try {
				for (const id of this.selectedItems) {
					const item = this.allItems.find(i => (i._id || i.id) === id)
					if (item) {
						await updateItem(id, {
							processed: true,
							processedTime: processTime
						})
						successCount++
					}
				}
				
				uni.showToast({
					title: `已处理 ${successCount} 个物品`,
					icon: 'success'
				})
				
				this.closeProcessDialog()
				this.exitBatchMode()
				await this.loadItemList()
			} catch (error) {
				console.error('处理失败:', error)
				uni.showToast({
					title: '处理失败',
					icon: 'none'
				})
			}
		},
		handleProcessNote() {
			// 打开处理备注输入对话框
			this.showProcessDialog = false
			this.showProcessNoteDialog = true
			this.processNote = ''
		},
		closeProcessNoteDialog() {
			this.showProcessNoteDialog = false
			this.processNote = ''
		},
		async confirmProcessNote() {
			// 确认添加处理备注
			const processTime = new Date().getTime()
			let successCount = 0
			
			try {
				for (const id of this.selectedItems) {
					const item = this.allItems.find(i => (i._id || i.id) === id)
					if (item) {
						await updateItem(id, {
							processed: true,
							processedTime: processTime,
							processedNote: this.processNote.trim() || undefined
						})
						successCount++
					}
				}
				
				uni.showToast({
					title: `已处理 ${successCount} 个物品`,
					icon: 'success'
				})
				
				this.closeProcessNoteDialog()
				this.exitBatchMode()
				await this.loadItemList()
			} catch (error) {
				console.error('处理失败:', error)
				uni.showToast({
					title: '处理失败',
					icon: 'none'
				})
			}
		},
		handleBatchMove() {
			if (this.selectedItems.length === 0) {
				uni.showToast({
					title: '请选择要移动的物品',
					icon: 'none'
				})
				return
			}
			// 获取第一个选中物品的当前分类作为默认值
			const firstItem = this.allItems.find(i => this.selectedItems.includes(i._id || i.id))
			this.selectedCategory = firstItem?.category || '综合'
			this.showMoveDialog = true
		},
		closeMoveDialog() {
			this.showMoveDialog = false
			this.selectedCategory = ''
		},
		selectCategory(category) {
			this.selectedCategory = category
		},
		async confirmMove() {
			if (!this.selectedCategory) {
				uni.showToast({
					title: '请选择分类',
					icon: 'none'
				})
				return
			}
			
			let successCount = 0
			try {
				for (const id of this.selectedItems) {
					await updateItem(id, {
						category: this.selectedCategory
					})
					successCount++
				}
				
				uni.showToast({
					title: `已移动 ${successCount} 个物品到"${this.selectedCategory}"`,
					icon: 'success'
				})
				
				this.closeMoveDialog()
				this.exitBatchMode()
				await this.loadItemList()
			} catch (error) {
				console.error('移动失败:', error)
				uni.showToast({
					title: '移动失败',
					icon: 'none'
				})
			}
		},
		async handleBatchDelete() {
			if (this.selectedItems.length === 0) {
				uni.showToast({
					title: '请选择要删除的物品',
					icon: 'none'
				})
				return
			}
			
			uni.showModal({
				title: '确认删除',
				content: `确定要删除选中的${this.selectedItems.length}个物品吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							// 删除选中的物品
							for (const id of this.selectedItems) {
								await deleteItem(id)
							}
							
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
							
							// 退出批量模式并刷新列表
							this.exitBatchMode()
							await this.loadItemList()
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
		handleAddItem() {
			uni.navigateTo({
				url: '/pages/add-item/add-item'
			})
		}
	}
}
</script>

<style scoped>
.item-list-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 100rpx;
	position: relative;
}

/* 头部 */
.header {
	background: linear-gradient(135deg, #667eea, #764ba2);
	padding: 30rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #fff;
}

/* 搜索栏 */
.search-bar-wrapper {
	padding: 20rpx 30rpx;
	background-color: #f5f5f5;
}

.search-bar {
	display: flex;
	align-items: center;
	background-color: #e8e8e8;
	border-radius: 50rpx;
	padding: 20rpx 30rpx;
	position: relative;
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

.filter-tabs {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #f5f5f5;
	gap: 20rpx;
}

.filter-tab {
	flex: 1;
	padding: 16rpx 0;
	border-radius: 50rpx;
	background-color: #e8e8e8;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.filter-tab-active {
	background: linear-gradient(135deg, #667eea, #764ba2);
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.filter-tab-text {
	font-size: 28rpx;
	color: #666;
}

.filter-tab-active .filter-tab-text {
	color: #fff;
	font-weight: 500;
}

/* 筛选菜单 */
.filter-menu {
	position: absolute;
	top: 100rpx;
	right: 30rpx;
	background-color: #fff;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	z-index: 200;
	min-width: 200rpx;
	overflow: hidden;
}

.filter-menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.filter-menu-item:last-child {
	border-bottom: none;
}

.filter-menu-text {
	font-size: 28rpx;
	color: #333;
}

.filter-menu-arrow {
	font-size: 28rpx;
	color: #999;
	margin-left: 20rpx;
}

/* 排序菜单 */
.sort-menu {
	position: absolute;
	top: 100rpx;
	right: 30rpx;
	background-color: #fff;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	z-index: 200;
	min-width: 200rpx;
	overflow: hidden;
}

.sort-menu-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.sort-menu-item:last-child {
	border-bottom: none;
}

.sort-menu-item-active {
	background-color: #f5f5f5;
}

.sort-menu-text {
	font-size: 28rpx;
	color: #333;
}

.sort-menu-check {
	font-size: 28rpx;
	color: #7ABAFF;
	margin-left: 20rpx;
}

/* 批量操作头部 */
.batch-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #f0f0f0;
}

.batch-header-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.batch-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.batch-select-all {
	font-size: 28rpx;
	color: #7ABAFF;
}

.batch-header-right {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.batch-count {
	font-size: 28rpx;
	color: #666;
}

.batch-done {
	font-size: 28rpx;
	color: #7ABAFF;
}

/* 批量操作底部栏 */
.batch-footer {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 20rpx 30rpx;
	background-color: #fff;
	border-top: 1rpx solid #f0f0f0;
	z-index: 999;
}

.batch-action {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.batch-action-icon {
	font-size: 40rpx;
}

.batch-action-text {
	font-size: 24rpx;
	color: #333;
}

.batch-action-danger .batch-action-text {
	color: #ff3b30;
}

.item-list {
	padding: 20rpx 30rpx;
}

.item-card {
	background-color: #fff;
	border-radius: 16rpx;
	border: 2rpx solid #e8e8e8;
	padding: 20rpx 30rpx;
	padding-bottom: 26rpx;
	margin-bottom: 20rpx;
	position: relative;
	display: flex;
	align-items: flex-start;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}

.item-card:active {
	transform: scale(0.98);
}

.item-card-expired {
	border-color: #ff3b30;
	background-color: #fff5f5;
}

.item-card-selected {
	background-color: #f0f7ff;
	border: 2rpx solid #667eea;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.2);
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.item-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.item-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #000;
}

.item-status-tag {
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.status-tag-expiring {
	background: linear-gradient(135deg, #ffd89b, #ff9a9e);
}

.status-tag-notExpired {
	background: linear-gradient(135deg, #4ade80, #22c55e);
}

.status-tag-notExpired .status-tag-text {
	color: #fff;
}

.status-tag-expired {
	background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
}

.status-tag-text {
	font-size: 24rpx;
	color: #000;
}

.status-tag-expired .status-tag-text {
	color: #fff;
}

.item-expiration {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 8rpx;
}

.expiration-label {
	color: #666;
}

.expiration-date {
	color: #666;
}

.item-days {
	font-size: 26rpx;
	margin-top: 4rpx;
}

.days-expiring {
	color: #43b244;
}

.days-notExpired {
	color: #43b244;
}

.days-expired {
	color: #ff3b30;
}

.item-checkbox {
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkbox {
	width: 40rpx;
	height: 40rpx;
	border: 2rpx solid #ddd;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkbox-checked {
	background-color: #7ABAFF;
	border-color: #7ABAFF;
}

.checkbox-icon {
	color: #fff;
	font-size: 28rpx;
	font-weight: bold;
}

.item-info {
	flex: 1;
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
}

.item-status {
	align-self: flex-end;
	text-align: right;
	margin-bottom: 10rpx;
}

.status-text {
	font-size: 24rpx;
	color: #ff9500;
}

.progress-bar-container {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 6rpx;
	background-color: #f0f0f0;
	border-radius: 0 0 8rpx 8rpx;
	overflow: hidden;
}

.progress-bar {
	height: 100%;
	border-radius: 3rpx;
	transition: width 0.6s ease-in-out;
	animation: progressAnimation 1.5s ease-out forwards;
	position: absolute;
	right: 0;
	top: 0;
}

.progress-bar-expired {
	background: linear-gradient(90deg, #ff6b6b, #ee5a6f);
}

.progress-bar-expiring {
	background: linear-gradient(90deg, #ffd89b, #ff9a9e);
}

.progress-bar-notExpired {
	background: linear-gradient(90deg, #4ade80, #22c55e);
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
	padding: 100rpx 0;
}

.empty-text {
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

/* 遮罩层 */
.mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.3);
	z-index: 150;
}

/* 对话框 */
.dialog-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 300;
}

.dialog {
	background-color: #fff;
	border-radius: 16rpx;
	width: 600rpx;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
}

.dialog-large {
	width: 700rpx;
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.dialog-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.dialog-close {
	font-size: 48rpx;
	color: #999;
	line-height: 1;
}

.dialog-content {
	padding: 30rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.dialog-text {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 30rpx;
}

.dialog-options {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.dialog-option {
	padding: 24rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dialog-option-text {
	font-size: 28rpx;
	color: #333;
}

.dialog-textarea {
	width: 100%;
	min-height: 200rpx;
	padding: 20rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}

.dialog-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-top: 1rpx solid #f0f0f0;
	gap: 20rpx;
}

.dialog-button {
	flex: 1;
	padding: 24rpx;
	border-radius: 8rpx;
	text-align: center;
	font-size: 28rpx;
}

.dialog-button-cancel {
	background-color: #f5f5f5;
	color: #666;
}

.dialog-button-confirm {
	background-color: #7ABAFF;
	color: #fff;
}

/* 分类列表 */
.category-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-top: 20rpx;
}

.category-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx;
	border: 2rpx solid transparent;
}

.category-item-active {
	background-color: #f0f7ff;
	border-color: #7ABAFF;
}

.category-text {
	font-size: 28rpx;
	color: #333;
}

.category-check {
	font-size: 28rpx;
	color: #7ABAFF;
	font-weight: bold;
}
</style>
