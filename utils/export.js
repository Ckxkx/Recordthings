/**
 * 导出工具
 * 支持导出为PDF和Markdown格式
 */

import { getAllItems } from './db.js'
import { formatDate } from './common.js'

/**
 * 生成Markdown格式的导出内容
 * @param {Array} items 物品列表
 * @returns {string} Markdown内容
 */
function generateMarkdown(items) {
	if (!items || items.length === 0) {
		return '# 物品清单\n\n暂无物品数据\n'
	}
	
	let markdown = '# 物品清单\n\n'
	markdown += `**导出时间**: ${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}\n\n`
	markdown += `**物品总数**: ${items.length}\n\n`
	markdown += '---\n\n'
	
	items.forEach((item, index) => {
		markdown += `## ${index + 1}. ${item.name || '未命名物品'}\n\n`
		
		if (item.brand) {
			markdown += `- **品牌**: ${item.brand}\n`
		}
		
		if (item.barcode) {
			markdown += `- **条形码**: ${item.barcode}\n`
		}
		
		if (item.supplier) {
			markdown += `- **供应商**: ${item.supplier}\n`
		}
		
		if (item.category) {
			markdown += `- **分类**: ${item.category}\n`
		}
		
		if (item.stock) {
			markdown += `- **库存**: ${item.stock}\n`
		}
		
		if (item.productionDate) {
			markdown += `- **生产日期**: ${item.productionDate}\n`
		}
		
		if (item.expirationDate) {
			markdown += `- **过期日期**: ${item.expirationDate}\n`
			
			// 计算剩余天数
			const today = new Date()
			const expDate = new Date(item.expirationDate)
			const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
			
			if (diffDays < 0) {
				markdown += `- **状态**: ⚠️ 已过期 (${Math.abs(diffDays)}天前)\n`
			} else if (diffDays <= 7) {
				markdown += `- **状态**: 🔴 临期 (剩余${diffDays}天)\n`
			} else {
				markdown += `- **状态**: ✅ 正常 (剩余${diffDays}天)\n`
			}
		}
		
		if (item.reminder && item.reminder !== '无') {
			markdown += `- **提醒**: ${item.reminder}\n`
		}
		
		if (item.tag) {
			markdown += `- **标签**: ${item.tag}\n`
		}
		
		markdown += '\n'
	})
	
	markdown += '---\n\n'
	markdown += `*由 RecordThings 生成*\n`
	
	return markdown
}

/**
 * 生成HTML格式的内容（用于PDF导出）
 * @param {Array} items 物品列表
 * @returns {string} HTML内容
 */
function generateHTML(items) {
	if (!items || items.length === 0) {
		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<title>物品清单</title>
				<style>
					body { font-family: Arial, sans-serif; padding: 20px; }
					h1 { color: #333; }
					table { width: 100%; border-collapse: collapse; margin-top: 20px; }
					th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
					th { background-color: #667eea; color: white; }
					tr:nth-child(even) { background-color: #f5f5f5; }
					.status-expired { color: #ff4444; }
					.status-expiring { color: #ff9500; }
					.status-normal { color: #4cd964; }
				</style>
			</head>
			<body>
				<h1>物品清单</h1>
				<p>暂无物品数据</p>
			</body>
			</html>
		`
	}
	
	let html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>物品清单</title>
			<style>
				body { 
					font-family: "Microsoft YaHei", Arial, sans-serif; 
					padding: 20px; 
					font-size: 12px;
				}
				.header {
					margin-bottom: 30px;
					padding-bottom: 20px;
					border-bottom: 2px solid #667eea;
				}
				h1 { 
					color: #333; 
					margin: 0 0 10px 0;
				}
				.meta {
					color: #666;
					font-size: 14px;
				}
				table { 
					width: 100%; 
					border-collapse: collapse; 
					margin-top: 20px; 
				}
				th, td { 
					border: 1px solid #ddd; 
					padding: 10px; 
					text-align: left; 
					font-size: 11px;
				}
				th { 
					background-color: #667eea; 
					color: white; 
					font-weight: bold;
				}
				tr:nth-child(even) { 
					background-color: #f9f9f9; 
				}
				.status-expired { 
					color: #ff4444; 
					font-weight: bold;
				}
				.status-expiring { 
					color: #ff9500; 
					font-weight: bold;
				}
				.status-normal { 
					color: #4cd964; 
				}
				.footer {
					margin-top: 30px;
					padding-top: 20px;
					border-top: 1px solid #ddd;
					text-align: center;
					color: #999;
					font-size: 11px;
				}
			</style>
		</head>
		<body>
			<div class="header">
				<h1>物品清单</h1>
				<div class="meta">
					<p>导出时间: ${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}</p>
					<p>物品总数: ${items.length}</p>
				</div>
			</div>
			<table>
				<thead>
					<tr>
						<th>序号</th>
						<th>名称</th>
						<th>品牌</th>
						<th>条形码</th>
						<th>供应商</th>
						<th>库存</th>
						<th>生产日期</th>
						<th>过期日期</th>
						<th>状态</th>
					</tr>
				</thead>
				<tbody>
	`
	
	items.forEach((item, index) => {
		let status = ''
		let statusClass = 'status-normal'
		let statusText = '正常'
		
		if (item.expirationDate) {
			const today = new Date()
			const expDate = new Date(item.expirationDate)
			const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
			
			if (diffDays < 0) {
				statusClass = 'status-expired'
				statusText = `已过期(${Math.abs(diffDays)}天)`
			} else if (diffDays <= 7) {
				statusClass = 'status-expiring'
				statusText = `临期(${diffDays}天)`
			} else {
				statusText = `正常(${diffDays}天)`
			}
		}
		
		html += `
			<tr>
				<td>${index + 1}</td>
				<td>${item.name || '未命名'}</td>
				<td>${item.brand || '-'}</td>
				<td>${item.barcode || '-'}</td>
				<td>${item.supplier || '-'}</td>
				<td>${item.stock || 1}</td>
				<td>${item.productionDate || '-'}</td>
				<td>${item.expirationDate || '-'}</td>
				<td class="${statusClass}">${statusText}</td>
			</tr>
		`
	})
	
	html += `
				</tbody>
			</table>
			<div class="footer">
				<p>由 RecordThings 生成</p>
			</div>
		</body>
		</html>
	`
	
	return html
}

/**
 * 导出为Markdown文件
 * @param {Array} items 物品列表，如果不传则获取所有物品
 */
function exportToMarkdown(items = null) {
	try {
		const itemsToExport = items || getAllItems()
		
		if (itemsToExport.length === 0) {
			uni.showToast({
				title: '暂无数据可导出',
				icon: 'none'
			})
			return
		}
		
		const markdown = generateMarkdown(itemsToExport)
		const fileName = `物品清单_${formatDate(new Date(), 'YYYY-MM-DD')}.md`
		
		// 在uni-app中，可以使用uni.downloadFile或uni.shareFile
		// 对于小程序，需要先保存到临时文件，然后分享
		// #ifdef MP-WEIXIN
		// 小程序环境：使用文件系统API
		try {
			const fs = wx.getFileSystemManager()
			const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
			
			fs.writeFileSync(filePath, markdown, 'utf8')
			
			uni.showToast({
				title: '导出成功',
				icon: 'success'
			})
			
			// 尝试分享文件
			// 注意：shareFileMessage需要用户触发，这里先提示用户
			setTimeout(() => {
				uni.showModal({
					title: '导出成功',
					content: 'Markdown文件已生成，请使用"转发"功能分享文件',
					showCancel: false,
					confirmText: '知道了'
				})
			}, 1500)
		} catch (err) {
			console.error('导出失败:', err)
			// 如果文件系统API不可用，尝试复制到剪贴板
			uni.setClipboardData({
				data: markdown,
				success: () => {
					uni.showToast({
						title: '内容已复制到剪贴板',
						icon: 'success'
					})
				},
				fail: () => {
					uni.showToast({
						title: '导出失败',
						icon: 'none'
					})
				}
			})
		}
		// #endif
		
		// #ifdef H5
		// H5环境：直接下载
		const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = fileName
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
		
		uni.showToast({
			title: '导出成功',
			icon: 'success'
		})
		// #endif
		
		// #ifdef APP-PLUS
		// App环境：保存到文件系统
		const savePath = plus.io.convertLocalFileSystemURL(`_downloads/${fileName}`)
		plus.io.resolveLocalFileSystemURL(savePath, (entry) => {
			entry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
				fileEntry.createWriter((writer) => {
					writer.write(markdown)
					writer.onwriteend = () => {
						uni.showToast({
							title: '导出成功',
							icon: 'success'
						})
					}
				})
			})
		})
		// #endif
		
	} catch (error) {
		console.error('导出Markdown失败:', error)
		uni.showToast({
			title: '导出失败',
			icon: 'none'
		})
	}
}

/**
 * 导出为PDF文件
 * @param {Array} items 物品列表，如果不传则获取所有物品
 */
function exportToPDF(items = null) {
	try {
		const itemsToExport = items || getAllItems()
		
		if (itemsToExport.length === 0) {
			uni.showToast({
				title: '暂无数据可导出',
				icon: 'none'
			})
			return
		}
		
		uni.showLoading({
			title: '正在生成PDF...'
		})
		
		const html = generateHTML(itemsToExport)
		const fileName = `物品清单_${formatDate(new Date(), 'YYYY-MM-DD')}.pdf`
		
		// #ifdef H5
		// H5环境：使用html2pdf.js或jsPDF
		// 需要先引入相关库
		import('html2pdf.js').then((html2pdf) => {
			const element = document.createElement('div')
			element.innerHTML = html
			document.body.appendChild(element)
			
			const opt = {
				margin: 10,
				filename: fileName,
				image: { type: 'jpeg', quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
			}
			
			html2pdf.default().set(opt).from(element).save().then(() => {
				document.body.removeChild(element)
				uni.hideLoading()
				uni.showToast({
					title: '导出成功',
					icon: 'success'
				})
			}).catch((err) => {
				document.body.removeChild(element)
				uni.hideLoading()
				console.error('PDF导出失败:', err)
				uni.showToast({
					title: '导出失败，请安装html2pdf.js',
					icon: 'none',
					duration: 3000
				})
			})
		}).catch(() => {
			uni.hideLoading()
			// 如果库不存在，使用打印功能
			const printWindow = window.open('', '_blank')
			printWindow.document.write(html)
			printWindow.document.close()
			printWindow.print()
			uni.showToast({
				title: '已打开打印预览',
				icon: 'none'
			})
		})
		// #endif
		
		// #ifdef MP-WEIXIN
		// 小程序环境：提示用户使用打印功能或分享HTML
		uni.hideLoading()
		uni.showModal({
			title: 'PDF导出',
			content: '小程序暂不支持直接导出PDF。\n\n建议：\n1. 使用Markdown格式导出\n2. 复制HTML内容到其他应用生成PDF',
			showCancel: true,
			confirmText: '复制HTML',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					// 复制HTML到剪贴板
					uni.setClipboardData({
						data: html,
						success: () => {
							uni.showToast({
								title: 'HTML已复制到剪贴板',
								icon: 'success'
							})
						}
					})
				}
			}
		})
		// #endif
		
		// #ifdef APP-PLUS
		// App环境：使用plus.html转PDF或第三方插件
		uni.hideLoading()
		uni.showModal({
			title: 'PDF导出',
			content: 'App环境需要安装PDF生成插件，建议使用Markdown格式导出',
			showCancel: false
		})
		// #endif
		
	} catch (error) {
		uni.hideLoading()
		console.error('导出PDF失败:', error)
		uni.showToast({
			title: '导出失败',
			icon: 'none'
		})
	}
}

/**
 * 显示导出格式选择对话框
 * @param {Array} items 物品列表，如果不传则获取所有物品
 */
function showExportDialog(items = null) {
	const itemsToExport = items || getAllItems()
	
	if (itemsToExport.length === 0) {
		uni.showToast({
			title: '暂无数据可导出',
			icon: 'none'
		})
		return
	}
	
	uni.showActionSheet({
		itemList: ['导出为 Markdown', '导出为 PDF'],
		success: (res) => {
			if (res.tapIndex === 0) {
				// Markdown
				exportToMarkdown(itemsToExport)
			} else if (res.tapIndex === 1) {
				// PDF
				exportToPDF(itemsToExport)
			}
		}
	})
}


export {
	generateMarkdown,
	generateHTML,
	exportToMarkdown,
	exportToPDF,
	showExportDialog
}
