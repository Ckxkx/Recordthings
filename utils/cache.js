/**
 * 数据缓存管理工具
 * 使用 uni.setStorageSync 缓存云端数据，减少云函数调用
 */

const CACHE_KEYS = {
	ITEMS_LIST: 'cache_items_list',
	STATS: 'cache_stats',
	ITEM_DETAIL: 'cache_item_detail_',
	LAST_SYNC: 'cache_last_sync'
}

// 缓存过期时间（毫秒）
const CACHE_EXPIRE_TIME = {
	ITEMS_LIST: 5 * 60 * 1000,  // 物品列表：5分钟
	STATS: 3 * 60 * 1000,        // 统计数据：3分钟
	ITEM_DETAIL: 10 * 60 * 1000  // 物品详情：10分钟
}

/**
 * 设置缓存
 */
function setCache(key, data, expireTime = null) {
	try {
		const cacheData = {
			data: data,
			timestamp: Date.now(),
			expireTime: expireTime
		}
		uni.setStorageSync(key, cacheData)
		return true
	} catch (e) {
		console.error('设置缓存失败:', e)
		return false
	}
}

/**
 * 获取缓存
 */
function getCache(key, expireTime = null) {
	try {
		const cacheData = uni.getStorageSync(key)
		if (!cacheData) {
			return null
		}
		
		// 检查是否过期
		const now = Date.now()
		const expire = expireTime || cacheData.expireTime
		
		if (expire && (now - cacheData.timestamp) > expire) {
			// 缓存已过期，删除
			removeCache(key)
			return null
		}
		
		return cacheData.data
	} catch (e) {
		console.error('获取缓存失败:', e)
		return null
	}
}

/**
 * 删除缓存
 */
function removeCache(key) {
	try {
		uni.removeStorageSync(key)
		return true
	} catch (e) {
		console.error('删除缓存失败:', e)
		return false
	}
}

/**
 * 清空所有缓存
 */
function clearAllCache() {
	try {
		Object.values(CACHE_KEYS).forEach(key => {
			if (!key.includes('_')) {
				uni.removeStorageSync(key)
			}
		})
		// 清除所有物品详情缓存
		const keys = uni.getStorageInfoSync().keys
		keys.forEach(key => {
			if (key.startsWith(CACHE_KEYS.ITEM_DETAIL)) {
				uni.removeStorageSync(key)
			}
		})
		return true
	} catch (e) {
		console.error('清空缓存失败:', e)
		return false
	}
}

/**
 * 缓存物品列表
 */
function cacheItemsList(items) {
	return setCache(CACHE_KEYS.ITEMS_LIST, items, CACHE_EXPIRE_TIME.ITEMS_LIST)
}

/**
 * 获取缓存的物品列表
 */
function getCachedItemsList() {
	return getCache(CACHE_KEYS.ITEMS_LIST, CACHE_EXPIRE_TIME.ITEMS_LIST)
}

/**
 * 缓存统计数据
 */
function cacheStats(stats) {
	return setCache(CACHE_KEYS.STATS, stats, CACHE_EXPIRE_TIME.STATS)
}

/**
 * 获取缓存的统计数据
 */
function getCachedStats() {
	return getCache(CACHE_KEYS.STATS, CACHE_EXPIRE_TIME.STATS)
}

/**
 * 缓存物品详情
 */
function cacheItemDetail(id, item) {
	return setCache(CACHE_KEYS.ITEM_DETAIL + id, item, CACHE_EXPIRE_TIME.ITEM_DETAIL)
}

/**
 * 获取缓存的物品详情
 */
function getCachedItemDetail(id) {
	return getCache(CACHE_KEYS.ITEM_DETAIL + id, CACHE_EXPIRE_TIME.ITEM_DETAIL)
}

/**
 * 删除物品详情缓存
 */
function removeCachedItemDetail(id) {
	return removeCache(CACHE_KEYS.ITEM_DETAIL + id)
}

/**
 * 记录最后同步时间
 */
function setLastSyncTime() {
	return setCache(CACHE_KEYS.LAST_SYNC, Date.now(), null)
}

/**
 * 获取最后同步时间
 */
function getLastSyncTime() {
	return getCache(CACHE_KEYS.LAST_SYNC, null)
}

/**
 * 检查是否需要刷新
 */
function shouldRefresh(lastRefreshTime, interval = 60000) {
	if (!lastRefreshTime) {
		return true
	}
	return (Date.now() - lastRefreshTime) > interval
}

/**
 * 使缓存失效（数据更新后调用）
 */
function invalidateCache(type = 'all') {
	switch (type) {
		case 'items':
			removeCache(CACHE_KEYS.ITEMS_LIST)
			removeCache(CACHE_KEYS.STATS)
			break
		case 'stats':
			removeCache(CACHE_KEYS.STATS)
			break
		case 'all':
			clearAllCache()
			break
	}
}

export {
	setCache,
	getCache,
	removeCache,
	clearAllCache,
	cacheItemsList,
	getCachedItemsList,
	cacheStats,
	getCachedStats,
	cacheItemDetail,
	getCachedItemDetail,
	removeCachedItemDetail,
	setLastSyncTime,
	getLastSyncTime,
	shouldRefresh,
	invalidateCache
}
