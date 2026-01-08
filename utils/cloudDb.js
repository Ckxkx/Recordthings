/**
 * 云数据库管理工具
 * 使用 uniCloud 云函数实现数据存储
 * 集成缓存机制，减少云函数调用
 */

import {
	cacheItemsList,
	getCachedItemsList,
	cacheStats,
	getCachedStats,
	cacheItemDetail,
	getCachedItemDetail,
	removeCachedItemDetail,
	invalidateCache
} from './cache.js'

/**
 * 调用云函数
 */
async function callCloudFunction(action, data = {}) {
	try {
		const result = await uniCloud.callFunction({
			name: 'items',
			data: {
				action,
				data
			}
		})
		
		if (result.result.code === 0) {
			return result.result.data
		} else {
			throw new Error(result.result.message || '操作失败')
		}
	} catch (error) {
		console.error('云函数调用失败:', error)
		throw error
	}
}

/**
 * 获取所有物品（带缓存）
 */
async function getAllItems(options = {}) {
	try {
		const { category = '全部', keyword = '', page = 1, pageSize = 100, useCache = true } = options
		
		// 如果没有筛选条件且启用缓存，尝试从缓存获取
		if (useCache && category === '全部' && !keyword && page === 1) {
			const cached = getCachedItemsList()
			if (cached) {
				console.log('使用缓存的物品列表')
				return cached
			}
		}
		
		// 从云端获取
		const result = await callCloudFunction('list', {
			category,
			keyword,
			page,
			pageSize
		})
		
		const items = result.list || []
		
		// 缓存结果（仅缓存全部数据）
		if (category === '全部' && !keyword && page === 1) {
			cacheItemsList(items)
		}
		
		return items
	} catch (error) {
		console.error('获取物品列表失败:', error)
		// 如果云端失败，尝试返回缓存数据
		const cached = getCachedItemsList()
		if (cached) {
			console.log('云端失败，使用缓存数据')
			return cached
		}
		return []
	}
}

/**
 * 添加物品（添加后清除缓存）
 */
async function addItem(item) {
	try {
		const result = await callCloudFunction('add', item)
		// 清除缓存，下次获取最新数据
		invalidateCache('items')
		return result
	} catch (error) {
		console.error('添加物品失败:', error)
		throw error
	}
}

/**
 * 更新物品（更新后清除缓存）
 */
async function updateItem(id, updates) {
	try {
		const result = await callCloudFunction('update', {
			id,
			...updates
		})
		// 清除相关缓存
		invalidateCache('items')
		removeCachedItemDetail(id)
		return result
	} catch (error) {
		console.error('更新物品失败:', error)
		throw error
	}
}

/**
 * 删除物品（删除后清除缓存）
 */
async function deleteItem(id) {
	try {
		await callCloudFunction('delete', { id })
		// 清除相关缓存
		invalidateCache('items')
		removeCachedItemDetail(id)
		return true
	} catch (error) {
		console.error('删除物品失败:', error)
		return false
	}
}

/**
 * 根据ID获取物品（带缓存）
 */
async function getItemById(id, useCache = true) {
	try {
		// 尝试从缓存获取
		if (useCache) {
			const cached = getCachedItemDetail(id)
			if (cached) {
				console.log('使用缓存的物品详情')
				return cached
			}
		}
		
		// 从云端获取
		const result = await callCloudFunction('detail', { id })
		
		// 缓存结果
		if (result) {
			cacheItemDetail(id, result)
		}
		
		return result
	} catch (error) {
		console.error('获取物品详情失败:', error)
		// 如果云端失败，尝试返回缓存数据
		const cached = getCachedItemDetail(id)
		if (cached) {
			console.log('云端失败，使用缓存数据')
			return cached
		}
		return null
	}
}

/**
 * 计算统计信息（带缓存）
 */
async function getStats(useCache = true) {
	try {
		// 尝试从缓存获取
		if (useCache) {
			const cached = getCachedStats()
			if (cached) {
				console.log('使用缓存的统计数据')
				return cached
			}
		}
		
		// 从云端获取
		const result = await callCloudFunction('stats')
		const stats = {
			expiring: result.expiring || 0,
			notExpired: result.valid || 0,
			expired: result.expired || 0,
			itemCount: result.total || 0
		}
		
		// 缓存结果
		cacheStats(stats)
		
		return stats
	} catch (error) {
		console.error('获取统计信息失败:', error)
		// 如果云端失败，尝试返回缓存数据
		const cached = getCachedStats()
		if (cached) {
			console.log('云端失败，使用缓存数据')
			return cached
		}
		return {
			expiring: 0,
			notExpired: 0,
			expired: 0,
			itemCount: 0
		}
	}
}

/**
 * 根据类型获取物品列表
 */
async function getItemsByType(type) {
	try {
		let category = '全部'
		if (type === 'expiring') {
			category = '临期过期'
		} else if (type === 'notExpired') {
			category = '未过期'
		} else if (type === 'expired') {
			category = '已过期'
		}
		
		const result = await callCloudFunction('list', {
			category,
			page: 1,
			pageSize: 100
		})
		return result.list || []
	} catch (error) {
		console.error('获取物品列表失败:', error)
		return []
	}
}

/**
 * 搜索物品
 */
async function searchItems(keyword) {
	try {
		const result = await callCloudFunction('list', {
			keyword,
			page: 1,
			pageSize: 100
		})
		return result.list || []
	} catch (error) {
		console.error('搜索物品失败:', error)
		return []
	}
}

export {
	getAllItems,
	addItem,
	updateItem,
	deleteItem,
	getItemById,
	getStats,
	getItemsByType,
	searchItems
}
