#!/usr/bin/env node

/**
 * 📊 RecordThings 项目统计脚本
 * 用于生成项目的代码统计信息
 */

const fs = require('fs');
const path = require('path');

class ProjectStats {
  constructor() {
    this.stats = {
      files: {
        total: 0,
        vue: 0,
        js: 0,
        css: 0,
        json: 0,
        md: 0
      },
      lines: {
        total: 0,
        code: 0,
        comments: 0,
        blank: 0
      },
      pages: 0,
      components: 0,
      utils: 0
    };
  }

  // 获取文件扩展名
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  // 判断是否为代码文件
  isCodeFile(filename) {
    const codeExtensions = ['.vue', '.js', '.css', '.scss', '.json', '.md'];
    return codeExtensions.includes(this.getFileExtension(filename));
  }

  // 统计文件行数
  countLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let codeLines = 0;
      let commentLines = 0;
      let blankLines = 0;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed === '') {
          blankLines++;
        } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
          commentLines++;
        } else {
          codeLines++;
        }
      });

      return {
        total: lines.length,
        code: codeLines,
        comments: commentLines,
        blank: blankLines
      };
    } catch (error) {
      return { total: 0, code: 0, comments: 0, blank: 0 };
    }
  }

  // 递归扫描目录
  scanDirectory(dirPath, basePath = '') {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);
        
        // 跳过不需要统计的目录
        if (this.shouldSkip(item)) {
          return;
        }

        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 统计特殊目录
          if (item === 'pages') {
            this.countPages(fullPath);
          } else if (item === 'components') {
            this.countComponents(fullPath);
          } else if (item === 'utils') {
            this.countUtils(fullPath);
          }
          
          // 递归扫描子目录
          this.scanDirectory(fullPath, relativePath);
        } else if (stat.isFile() && this.isCodeFile(item)) {
          this.processFile(fullPath, item);
        }
      });
    } catch (error) {
      console.error(`扫描目录失败: ${dirPath}`, error.message);
    }
  }

  // 判断是否跳过文件/目录
  shouldSkip(name) {
    const skipList = [
      'node_modules',
      '.git',
      '.hbuilderx',
      'unpackage',
      'dist',
      '.DS_Store',
      'Thumbs.db'
    ];
    return skipList.includes(name);
  }

  // 处理单个文件
  processFile(filePath, filename) {
    const ext = this.getFileExtension(filename);
    const lines = this.countLines(filePath);

    // 统计文件数量
    this.stats.files.total++;
    switch (ext) {
      case '.vue':
        this.stats.files.vue++;
        break;
      case '.js':
        this.stats.files.js++;
        break;
      case '.css':
      case '.scss':
        this.stats.files.css++;
        break;
      case '.json':
        this.stats.files.json++;
        break;
      case '.md':
        this.stats.files.md++;
        break;
    }

    // 统计行数
    this.stats.lines.total += lines.total;
    this.stats.lines.code += lines.code;
    this.stats.lines.comments += lines.comments;
    this.stats.lines.blank += lines.blank;
  }

  // 统计页面数量
  countPages(pagesDir) {
    try {
      const pages = fs.readdirSync(pagesDir);
      this.stats.pages = pages.filter(page => {
        const pagePath = path.join(pagesDir, page);
        return fs.statSync(pagePath).isDirectory();
      }).length;
    } catch (error) {
      console.error('统计页面失败:', error.message);
    }
  }

  // 统计组件数量
  countComponents(componentsDir) {
    try {
      const components = fs.readdirSync(componentsDir);
      this.stats.components = components.filter(component => {
        const componentPath = path.join(componentsDir, component);
        return fs.statSync(componentPath).isDirectory();
      }).length;
    } catch (error) {
      console.error('统计组件失败:', error.message);
    }
  }

  // 统计工具函数数量
  countUtils(utilsDir) {
    try {
      const utils = fs.readdirSync(utilsDir);
      this.stats.utils = utils.filter(util => {
        return util.endsWith('.js');
      }).length;
    } catch (error) {
      console.error('统计工具函数失败:', error.message);
    }
  }

  // 生成统计报告
  generateReport() {
    const report = `
# 📊 RecordThings 项目统计报告

## 📁 文件统计
- **总文件数**: ${this.stats.files.total}
- **Vue组件**: ${this.stats.files.vue}
- **JavaScript**: ${this.stats.files.js}
- **样式文件**: ${this.stats.files.css}
- **配置文件**: ${this.stats.files.json}
- **文档文件**: ${this.stats.files.md}

## 📝 代码行数
- **总行数**: ${this.stats.lines.total.toLocaleString()}
- **代码行数**: ${this.stats.lines.code.toLocaleString()}
- **注释行数**: ${this.stats.lines.comments.toLocaleString()}
- **空白行数**: ${this.stats.lines.blank.toLocaleString()}

## 🏗️ 项目结构
- **页面数量**: ${this.stats.pages}
- **组件数量**: ${this.stats.components}
- **工具函数**: ${this.stats.utils}

## 📈 代码质量指标
- **注释率**: ${((this.stats.lines.comments / this.stats.lines.total) * 100).toFixed(1)}%
- **代码密度**: ${((this.stats.lines.code / this.stats.lines.total) * 100).toFixed(1)}%
- **平均文件行数**: ${Math.round(this.stats.lines.total / this.stats.files.total)}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    return report;
  }

  // 运行统计
  run(projectPath = '.') {
    console.log('🚀 开始统计项目...');
    
    const startTime = Date.now();
    this.scanDirectory(projectPath);
    const endTime = Date.now();
    
    console.log(`✅ 统计完成，耗时 ${endTime - startTime}ms`);
    
    const report = this.generateReport();
    
    // 输出到控制台
    console.log(report);
    
    // 保存到文件
    try {
      fs.writeFileSync('docs/PROJECT_STATS.md', report);
      console.log('📄 统计报告已保存到 docs/PROJECT_STATS.md');
    } catch (error) {
      console.error('保存报告失败:', error.message);
    }
    
    return this.stats;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const stats = new ProjectStats();
  stats.run();
}

module.exports = ProjectStats;