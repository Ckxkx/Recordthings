/**
 * 初始化示例数据
 */
import { getAllItems, addItem } from './db.js'

/**
 * 初始化示例数据
 */
function initSampleData() {
	const existingItems = getAllItems()
	
	// 如果已有数据，不重复初始化
	if (existingItems.length > 0) {
		return
	}
	
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	
	// 示例数据
	const sampleItems = [
		// 已过期物品
		{
			name: '牛奶',
			brand: '蒙牛',
			category: '乳制品',
			stock: 2,
			productionDate: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567890',
			expiringRule: { day: 7 }
		},
		{
			name: '酸奶',
			brand: '伊利',
			category: '乳制品',
			stock: 3,
			productionDate: formatDate(new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567891',
			expiringRule: { day: 7 }
		},
		
		// 临期物品（7天内过期）
		{
			name: '面包',
			brand: '桃李',
			category: '烘焙食品',
			stock: 5,
			productionDate: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567892',
			expiringRule: { day: 7 }
		},
		{
			name: '蛋糕',
			brand: '好利来',
			category: '烘焙食品',
			stock: 1,
			productionDate: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567893',
			expiringRule: { day: 7 }
		},
		{
			name: '香蕉',
			brand: '进口',
			category: '水果',
			stock: 10,
			productionDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567894',
			expiringRule: { day: 7 }
		},
		{
			name: '苹果',
			brand: '红富士',
			category: '水果',
			stock: 8,
			productionDate: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567895',
			expiringRule: { day: 7 }
		},
		
		// 未过期物品（7天后过期）
		{
			name: '大米',
			brand: '五常',
			category: '粮食',
			stock: 20,
			productionDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567896',
			expiringRule: { day: 7 }
		},
		{
			name: '食用油',
			brand: '金龙鱼',
			category: '调料',
			stock: 3,
			productionDate: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 540 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567897',
			expiringRule: { day: 7 }
		},
		{
			name: '方便面',
			brand: '康师傅',
			category: '方便食品',
			stock: 12,
			productionDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
			expirationDate: formatDate(new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000)),
			barcode: '6901234567898',
			expiringRule: { day: 7 }
		}
	]
	
	// 添加示例数据到数据库
	sampleItems.forEach(item => {
		addItem(item)
	})
	
	console.log('示例数据初始化完成')
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
function formatDate(date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 导出函数
export {
	initSampleData
}