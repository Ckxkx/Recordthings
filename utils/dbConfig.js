/**
 * 数据库配置
 * 可以在这里切换使用本地存储或云存储
 */

// 设置为 true 使用云存储，false 使用本地存储
export const USE_CLOUD = false

// 根据配置导入对应的数据库操作函数
import * as cloudDb from './cloudDb.js'
import * as localDb from './db.js'

// 根据配置选择使用的数据库模块
const dbModule = USE_CLOUD ? cloudDb : localDb

// 使用 ES6 导出
export const getAllItems = dbModule.getAllItems
export const addItem = dbModule.addItem
export const updateItem = dbModule.updateItem
export const deleteItem = dbModule.deleteItem
export const getItemById = dbModule.getItemById
export const getStats = dbModule.getStats
export const getItemsByType = dbModule.getItemsByType
export const searchItems = dbModule.searchItems
export const clearAll = dbModule.clearAll
export const getDebugInfo = dbModule.getDebugInfo
export const exportData = dbModule.exportData
export const importData = dbModule.importData

