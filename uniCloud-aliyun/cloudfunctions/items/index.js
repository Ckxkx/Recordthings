'use strict';

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { action, data } = event
  const userId = context.OPENID || event.userId // 使用微信openid作为用户标识
  
  // 获取items集合
  const itemsCollection = db.collection('items')
  
  try {
    switch (action) {
      // 添加物品
      case 'add':
        const addResult = await itemsCollection.add({
          ...data,
          userId,
          createTime: Date.now(),
          updateTime: Date.now()
        })
        return {
          code: 0,
          message: '添加成功',
          data: addResult
        }
      
      // 更新物品
      case 'update':
        const { id, ...updateData } = data
        const updateResult = await itemsCollection.doc(id).update({
          ...updateData,
          updateTime: Date.now()
        })
        return {
          code: 0,
          message: '更新成功',
          data: updateResult
        }
      
      // 删除物品
      case 'delete':
        const deleteResult = await itemsCollection.doc(data.id).remove()
        return {
          code: 0,
          message: '删除成功',
          data: deleteResult
        }
      
      // 获取物品列表
      case 'list':
        const { category, keyword, page = 1, pageSize = 20 } = data || {}
        let query = itemsCollection.where({ userId })
        
        // 分类筛选
        if (category && category !== '全部') {
          if (category === '未过期') {
            query = query.where({
              expirationDate: dbCmd.gte(new Date().toISOString().split('T')[0])
            })
          } else if (category === '临期过期') {
            const today = new Date().toISOString().split('T')[0]
            query = query.where({
              expiringDate: dbCmd.lte(today),
              expirationDate: dbCmd.gte(today)
            })
          } else if (category === '已过期') {
            query = query.where({
              expirationDate: dbCmd.lt(new Date().toISOString().split('T')[0])
            })
          }
        }
        
        // 关键词搜索
        if (keyword) {
          query = query.where(dbCmd.or([
            { name: new RegExp(keyword, 'i') },
            { brand: new RegExp(keyword, 'i') },
            { barcode: new RegExp(keyword, 'i') }
          ]))
        }
        
        // 分页查询
        const listResult = await query
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .orderBy('createTime', 'desc')
          .get()
        
        // 获取总数
        const countResult = await query.count()
        
        return {
          code: 0,
          message: '查询成功',
          data: {
            list: listResult.data,
            total: countResult.total,
            page,
            pageSize
          }
        }
      
      // 获取单个物品详情
      case 'detail':
        const detailResult = await itemsCollection.doc(data.id).get()
        return {
          code: 0,
          message: '查询成功',
          data: detailResult.data[0] || null
        }
      
      // 获取统计数据
      case 'stats':
        const today = new Date().toISOString().split('T')[0]
        
        // 总数
        const totalCount = await itemsCollection.where({ userId }).count()
        
        // 未过期
        const validCount = await itemsCollection.where({
          userId,
          expirationDate: dbCmd.gte(today)
        }).count()
        
        // 临期
        const expiringCount = await itemsCollection.where({
          userId,
          expiringDate: dbCmd.lte(today),
          expirationDate: dbCmd.gte(today)
        }).count()
        
        // 已过期
        const expiredCount = await itemsCollection.where({
          userId,
          expirationDate: dbCmd.lt(today)
        }).count()
        
        return {
          code: 0,
          message: '查询成功',
          data: {
            total: totalCount.total,
            valid: validCount.total,
            expiring: expiringCount.total,
            expired: expiredCount.total
          }
        }
      
      default:
        return {
          code: -1,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      code: -1,
      message: error.message || '操作失败',
      error
    }
  }
}
