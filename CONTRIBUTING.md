# 🤝 贡献指南

感谢你对 RecordThings 项目的关注！我们欢迎任何形式的贡献。

## 🚀 快速开始

### 环境准备

1. **Node.js** 14+ 
2. **HBuilderX** 或 **VS Code** + uni-app插件
3. **微信开发者工具**（用于小程序调试）

### 本地开发

```bash
# 1. Fork 并克隆项目
git clone https://github.com/your-username/RecordThings.git
cd RecordThings

# 2. 创建开发分支
git checkout -b feature/your-feature-name

# 3. 用 HBuilderX 打开项目
# 4. 运行到微信开发者工具进行调试
```

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

### 类型说明

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 示例

```bash
feat(add-item): 添加条形码扫描功能
fix(statistics): 修复饼图显示异常问题
docs(readme): 更新安装说明
```

## 🐛 Bug 报告

发现 Bug？请通过 [GitHub Issues](https://github.com/your-username/RecordThings/issues) 报告：

1. **使用 Bug 模板**
2. **详细描述问题**
3. **提供复现步骤**
4. **附上截图或视频**（如果可能）

## 💡 功能建议

有好想法？我们很乐意听到：

1. **检查现有 Issues** 避免重复
2. **使用功能请求模板**
3. **详细描述使用场景**
4. **说明预期效果**

## 🔧 代码规范

### JavaScript

- 使用 ES6+ 语法
- 优先使用 `const`，需要重新赋值时使用 `let`
- 函数命名使用驼峰命名法
- 添加必要的注释

```javascript
// ✅ 好的示例
const calculateExpiryDays = (expirationDate) => {
  const today = new Date();
  const expiry = new Date(expirationDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

// ❌ 避免这样
var calc = function(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};
```

### Vue 组件

- 组件名使用 PascalCase
- Props 使用 camelCase
- 事件名使用 kebab-case

```vue
<!-- ✅ 好的示例 -->
<template>
  <view class="item-card" @click="handleItemClick">
    <text>{{ itemName }}</text>
  </view>
</template>

<script>
export default {
  name: 'ItemCard',
  props: {
    itemName: {
      type: String,
      required: true
    }
  },
  methods: {
    handleItemClick() {
      this.$emit('item-selected', this.itemName);
    }
  }
};
</script>
```

### CSS

- 使用 BEM 命名规范
- 优先使用 Flexbox 布局
- 使用 CSS 变量定义主题色

```css
/* ✅ 好的示例 */
.item-card {
  display: flex;
  padding: 20rpx;
  background: var(--card-bg-color);
  border-radius: 20rpx;
}

.item-card__title {
  font-size: 32rpx;
  color: var(--text-primary-color);
}

.item-card--expired {
  border-left: 6rpx solid var(--danger-color);
}
```

## 📁 项目结构

```
pages/
├── overview/          # 总览页面
├── inventory/         # 库存页面
├── add-item/          # 添加物品
├── statistics/        # 数据统计
└── search/           # 搜索功能

utils/
├── dbConfig.js       # 数据库操作
├── barcodeApi.js     # 条形码API
├── auth.js           # 用户认证
└── common.js         # 通用工具函数

components/           # 公共组件
static/              # 静态资源
```

## 🧪 测试

在提交 PR 前，请确保：

1. **功能测试**：在微信开发者工具中测试所有相关功能
2. **兼容性测试**：测试不同屏幕尺寸的显示效果
3. **数据测试**：测试边界情况和异常数据

## 📋 Pull Request 流程

1. **确保代码质量**
   - 遵循代码规范
   - 添加必要注释
   - 测试功能正常

2. **提交 PR**
   - 使用清晰的标题
   - 详细描述更改内容
   - 关联相关 Issue

3. **代码审查**
   - 响应审查意见
   - 及时修改问题
   - 保持沟通

4. **合并**
   - 通过所有检查
   - 获得维护者批准
   - 自动合并到主分支

## 🎯 贡献方向

我们特别欢迎以下方面的贡献：

### 🔥 高优先级
- 🐛 Bug 修复
- 📱 移动端适配优化
- ⚡ 性能优化
- 🎨 UI/UX 改进

### 🌟 中优先级
- 🆕 新功能开发
- 📖 文档完善
- 🧪 测试用例
- 🌍 国际化支持

### 💡 低优先级
- 🛠️ 开发工具改进
- 📊 数据分析功能
- 🔌 第三方集成

## 🏆 贡献者

感谢所有为项目做出贡献的开发者！

<!-- 📸 需要添加贡献者头像墙 -->

## 📞 联系我们

- 💬 **讨论**：[GitHub Discussions](https://github.com/your-username/RecordThings/discussions)
- 📧 **邮箱**：huichen_zhu@qq.com
- 🐛 **Bug报告**：[GitHub Issues](https://github.com/your-username/RecordThings/issues)

---

再次感谢你的贡献！让我们一起让 RecordThings 变得更好！ 🚀