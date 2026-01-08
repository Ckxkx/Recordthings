/**
 * 条形码API工具函数
 * 使用 rolltools API: https://www.mxnzp.com/api/barcode/goods/details
 */

const API_CONFIG = {
	baseUrl: 'https://www.mxnzp.com/api/barcode/goods/details',
	appId: 'pidzmtfzxiyxkcti',
	appSecret: '4s9BsrtaqKPBbBZruw71tGzRhCTITlvf'
}

/**
 * 根据条形码查询商品信息
 * @param {string} barcode 条形码
 * @returns {Promise} 返回商品信息
 */
export function getBarcodeInfo(barcode) {
	return new Promise((resolve, reject) => {
		if (!barcode || !barcode.trim()) {
			reject(new Error('条形码不能为空'))
			return
		}
		
		uni.request({
			url: API_CONFIG.baseUrl,
			method: 'GET',
			data: {
				barcode: barcode.trim(),
				app_id: API_CONFIG.appId,
				app_secret: API_CONFIG.appSecret
			},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.code === 1 && res.data.data) {
						// API返回成功，返回商品信息
						resolve(res.data.data)
					} else {
						// API返回失败
						reject(new Error(res.data.msg || '查询失败'))
					}
				} else {
					reject(new Error('网络请求失败'))
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

/**
 * 格式化商品信息，适配表单数据
 * @param {Object} goodsInfo API返回的商品信息
 * @returns {Object} 格式化后的数据
 */
export function formatGoodsInfo(goodsInfo) {
	return {
		name: goodsInfo.goodsName || '',
		barcode: goodsInfo.barcode || '',
		brand: goodsInfo.brand || '',
		supplier: goodsInfo.supplier || '',
		standard: goodsInfo.standard || '',
		price: goodsInfo.price || ''
	}
}

