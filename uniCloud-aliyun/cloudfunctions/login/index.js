'use strict';

/**
 * 微信手机号登录云函数
 * 用于获取用户手机号并创建/更新用户信息
 */

exports.main = async (event, context) => {
	const { code, appId, appSecret } = event;
	
	// 验证参数
	if (!code) {
		return {
			success: false,
			message: '缺少code参数'
		};
	}
	
	if (!appId || !appSecret) {
		return {
			success: false,
			message: '缺少小程序配置信息'
		};
	}
	
	try {
		// 1. 先获取 access_token
		const tokenResult = await uniCloud.httpclient.request(
			`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
			{
				method: 'GET',
				dataType: 'json'
			}
		);
		
		if (tokenResult.status !== 200 || !tokenResult.data.access_token) {
			console.error('获取access_token失败:', tokenResult.data);
			return {
				success: false,
				message: '获取access_token失败',
				error: tokenResult.data
			};
		}
		
		const accessToken = tokenResult.data.access_token;
		
		// 2. 使用 access_token 和 code 获取手机号
		const phoneResult = await uniCloud.httpclient.request(
			`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
			{
				method: 'POST',
				data: {
					code: code
				},
				headers: {
					'Content-Type': 'application/json'
				},
				dataType: 'json',
				contentType: 'json'
			}
		);
		
		if (phoneResult.status !== 200 || phoneResult.data.errcode !== 0) {
			console.error('获取手机号失败:', phoneResult.data);
			return {
				success: false,
				message: '获取手机号失败',
				error: phoneResult.data
			};
		}
		
		const phoneInfo = phoneResult.data.phone_info;
		const phoneNumber = phoneInfo.phoneNumber;
		
		// 3. 查询或创建用户
		const db = uniCloud.database();
		const usersCollection = db.collection('users');
		
		// 查询用户是否存在
		const userQuery = await usersCollection.where({
			phoneNumber: phoneNumber
		}).get();
		
		let userId;
		if (userQuery.data.length > 0) {
			// 用户已存在，更新登录时间
			userId = userQuery.data[0]._id;
			await usersCollection.doc(userId).update({
				lastLoginTime: Date.now()
			});
		} else {
			// 新用户，创建记录
			const addResult = await usersCollection.add({
				phoneNumber: phoneNumber,
				createTime: Date.now(),
				lastLoginTime: Date.now()
			});
			userId = addResult.id;
		}
		
		return {
			success: true,
			phoneNumber: phoneNumber,
			userId: userId
		};
		
	} catch (error) {
		console.error('登录失败:', error);
		return {
			success: false,
			message: '登录失败',
			error: error.message
		};
	}
};
