/**
 * 用户认证工具函数
 */

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
	const userInfo = uni.getStorageSync('userInfo')
	return !!(userInfo && userInfo.phoneNumber)
}

/**
 * 获取当前用户信息
 * @returns {Object|null}
 */
export function getUserInfo() {
	return uni.getStorageSync('userInfo') || null
}

/**
 * 获取用户手机号（用于显示）
 * @returns {string}
 */
export function getUserPhone() {
	const userInfo = getUserInfo()
	return userInfo ? userInfo.phoneNumber : ''
}

/**
 * 退出登录
 */
export function logout() {
	uni.removeStorageSync('userInfo')
	uni.reLaunch({
		url: '/pages/login/login'
	})
}

/**
 * 检查登录状态，未登录则跳转到登录页
 */
export function checkLogin() {
	if (!isLoggedIn()) {
		uni.reLaunch({
			url: '/pages/login/login'
		})
		return false
	}
	return true
}
