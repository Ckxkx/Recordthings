/**
 * 数据库管理工具
 * 使用 uni.setStorageSync 实现本地数据存储
 */

const STORAGE_KEY = 'items_db'
const STORAGE_VERSION = '1.0'

/**
 * 获取所有物品
 */
export function getAllItems() {
	try {
		const data = uni.getStorageSync(STORAGE_KEY)
		if (!data) {
			return []
		}
		// 兼容旧数据格式
		if (Array.isArray(data)) {
			return data
		}
		if (data.items && Array.isArray(data.items)) {
			return data.items
		}
		return []
	} catch (e) {
		console.error('获取物品列表失败:', e)
		return []
	}
}

/**
 * 保存所有物品
 */
function saveAllItems(items) {
	try {
		uni.setStorageSync(STORAGE_KEY, {
			version: STORAGE_VERSION,
			items: items,
			updateTime: new Date().getTime()
		})
		return true
	} catch (e) {
		console.error('保存物品列表失败:', e)
		return false
	}
}

/**
 * 添加物品
 */
export function addItem(item) {
	const items = getAllItems()
	
	// 生成ID
	const maxId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) : 0
	const newItem = {
		...item,
		id: item.id || (maxId + 1),
		createTime: item.createTime || new Date().getTime(),
		updateTime: new Date().getTime()
	}
	
	items.push(newItem)
	
	if (saveAllItems(items)) {
		return newItem
	}
	return null
}

/**
 * 更新物品
 */
export function updateItem(id, updates) {
	const items = getAllItems()
	const index = items.findIndex(item => item.id === id)
	
	if (index === -1) {
		return null
	}
	
	items[index] = {
		...items[index],
		...updates,
		id: id, // 确保ID不变
		updateTime: new Date().getTime()
	}
	
	if (saveAllItems(items)) {
		return items[index]
	}
	return null
}

/**
 * 删除物品
 */
export function deleteItem(id) {
	const items = getAllItems()
	const newItems = items.filter(item => item.id !== id)
	
	return saveAllItems(newItems)
}

/**
 * 根据ID获取物品
 */
export function getItemById(id) {
	const items = getAllItems()
	return items.find(item => item.id === id) || null
}

/**
 * 计算统计信息
 */
export function getStats() {
	const items = getAllItems()
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
	
	let expiring = 0
	let notExpired = 0
	let expired = 0
	
	items.forEach(item => {
		if (item.expirationDate) {
			const expDate = new Date(item.expirationDate + 'T00:00:00').getTime() // 确保是当天的0点
			
			// 使用固定的7天作为临期判断标准
			const expiringDays = 7
			const expiringThreshold = today + (expiringDays * 24 * 60 * 60 * 1000)
			
			// 判断已过期（过期日期 < 今天）
			if (expDate < today) {
				expired++
			}
			// 判断临期（过期日期 >= 今天 且 <= 今天+7天）
			else if (expDate >= today && expDate <= expiringThreshold) {
				expiring++
			}
			// 判断未过期（过期日期 > 今天+7天）
			else if (expDate > expiringThreshold) {
				notExpired++
			}
		} else {
			// 没有过期日期的物品，算作未过期
			notExpired++
		}
	})
	
	return {
		expiring: expiring,
		notExpired: notExpired,
		expired: expired,
		itemCount: items.length
	}
}

/**
 * 根据类型获取物品列表
 */
export function getItemsByType(type) {
	const items = getAllItems()
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
	
	if (type === 'all') {
		return items
	}
	
	return items.filter(item => {
		if (!item.expirationDate) {
			// 没有过期日期的物品，只在"全部"或"未过期"中显示
			return type === 'all' || type === 'notExpired'
		}
		
		const expDate = new Date(item.expirationDate + 'T00:00:00').getTime()
		// 使用固定的7天作为临期判断标准
		const expiringDays = 7
		const expiringThreshold = today + (expiringDays * 24 * 60 * 60 * 1000)
		
		switch (type) {
			case 'expiring':
				// 临期：过期日期 >= 今天 且 <= 今天+7天
				return expDate >= today && expDate <= expiringThreshold
			case 'notExpired':
				// 未过期：过期日期 > 今天+7天
				return expDate > expiringThreshold
			case 'expired':
				// 已过期：过期日期 < 今天
				return expDate < today
			default:
				return true
		}
	})
}

/**
 * 搜索物品
 */
export function searchItems(keyword) {
	const items = getAllItems()
	if (!keyword || !keyword.trim()) {
		return items
	}
	
	const searchKeyword = keyword.trim().toLowerCase()
	return items.filter(item => {
		// 搜索物品名称
		if (item.name && item.name.toLowerCase().includes(searchKeyword)) {
			return true
		}
		// 搜索品牌
		if (item.brand && item.brand.toLowerCase().includes(searchKeyword)) {
			return true
		}
		// 搜索条形码
		if (item.barcode && item.barcode.includes(searchKeyword)) {
			return true
		}
		return false
	})
}

/**
 * 清空所有数据
 */
export function clearAll() {
	try {
		uni.removeStorageSync(STORAGE_KEY)
		return true
	} catch (e) {
		console.error('清空数据失败:', e)
		return false
	}
}

/**
 * 获取数据库调试信息
 */
export function getDebugInfo() {
	try {
		const data = uni.getStorageSync(STORAGE_KEY)
		const storageInfo = uni.getStorageInfoSync()
		
		return {
			hasData: !!data,
			dataType: Array.isArray(data) ? 'array' : typeof data,
			itemCount: getAllItems().length,
			rawData: data,
			storageKeys: storageInfo.keys,
			currentSize: storageInfo.currentSize,
			limitSize: storageInfo.limitSize
		}
	} catch (e) {
		return {
			error: e.message
		}
	}
}

/**
 * 导出所有数据为JSON字符串
 */
export function exportData() {
	try {
		const items = getAllItems()
		return JSON.stringify({
			version: STORAGE_VERSION,
			exportTime: new Date().toISOString(),
			itemCount: items.length,
			items: items
		}, null, 2)
	} catch (e) {
		console.error('导出数据失败:', e)
		return null
	}
}

/**
 * 导入数据
 */
export function importData(jsonString) {
	try {
		const data = JSON.parse(jsonString)
		if (data.items && Array.isArray(data.items)) {
			return saveAllItems(data.items)
		}
		return false
	} catch (e) {
		console.error('导入数据失败:', e)
		return false
	}
}

