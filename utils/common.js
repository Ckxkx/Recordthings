/**
 * 通用工具函数
 */

/**
 * 格式化日期
 * @param {Date|string} date 日期
 * @param {string} format 格式，默认 'YYYY-MM-DD'
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
	if (!date) return ''
	
	const d = typeof date === 'string' ? new Date(date) : date
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	const hours = String(d.getHours()).padStart(2, '0')
	const minutes = String(d.getMinutes()).padStart(2, '0')
	const seconds = String(d.getSeconds()).padStart(2, '0')
	
	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hours)
		.replace('mm', minutes)
		.replace('ss', seconds)
}

/**
 * 计算日期差
 * @param {Date|string} date1 日期1
 * @param {Date|string} date2 日期2
 * @returns {number} 天数差
 */
export function getDaysDiff(date1, date2) {
	const d1 = typeof date1 === 'string' ? new Date(date1) : date1
	const d2 = typeof date2 === 'string' ? new Date(date2) : date2
	const diff = d2.getTime() - d1.getTime()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 判断是否临期
 * @param {string} expirationDate 过期日期
 * @param {number} days 临期天数，默认30
 */
export function isExpiringSoon(expirationDate, days = 30) {
	if (!expirationDate) return false
	const today = new Date()
	const expDate = new Date(expirationDate)
	const diff = getDaysDiff(today, expDate)
	return diff > 0 && diff <= days
}

/**
 * 判断是否已过期
 * @param {string} expirationDate 过期日期
 */
export function isExpired(expirationDate) {
	if (!expirationDate) return false
	const today = new Date()
	const expDate = new Date(expirationDate)
	return expDate < today
}

/**
 * 判断是否需要下架
 * @param {string} expirationDate 过期日期
 * @param {number} removeDays 下架规则天数，默认0
 */
export function needRemove(expirationDate, removeDays = 0) {
	if (!expirationDate) return false
	const today = new Date()
	const removeDate = new Date(expirationDate)
	removeDate.setDate(removeDate.getDate() - removeDays)
	return removeDate <= today
}

/**
 * 防抖函数
 * @param {Function} func 函数
 * @param {number} wait 等待时间
 */
export function debounce(func, wait) {
	let timeout
	return function(...args) {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			func.apply(this, args)
		}, wait)
	}
}

/**
 * 节流函数
 * @param {Function} func 函数
 * @param {number} wait 等待时间
 */
export function throttle(func, wait) {
	let previous = 0
	return function(...args) {
		const now = Date.now()
		if (now - previous > wait) {
			previous = now
			func.apply(this, args)
		}
	}
}

