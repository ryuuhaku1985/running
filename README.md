# 小红书内容生成器

一个功能强大的小红书内容生成工具，支持JSON数据解析、提示词管理和AI图片生成。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动代理服务器

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动

### 3. 访问应用

打开浏览器访问：`http://localhost:3001/index.html`

## 🔧 配置API Key

1. 点击页面上的"显示配置"按钮
2. 输入您的ModelScope API Key
3. 点击"保存配置"
4. 点击"测试连接"验证配置

**注意**: API Key会保存在浏览器本地存储中，可以随时修改。

## 📋 功能特性

### ✨ 内容解析
- JSON数据解析和验证
- 自动提取标题、内容、话题标签
- 统计信息显示（句子数、标签数、提示词数）

### 🎨 提示词管理
- 中英文提示词切换
- 一键复制提示词功能
- 提示词分类展示

### 🖼️ AI图片生成
- 集成ModelScope Qwen-Image API
- 支持中英文提示词生成图片
- 异步任务处理和进度显示
- 图片下载和链接复制

### 💻 用户体验
- 响应式设计，支持移动设备
- 智能输入区域收回功能
- 键盘快捷键支持
- 流畅的动画效果

## 🔑 键盘快捷键

- `Ctrl + Enter`: 快速解析JSON
- `Ctrl + Shift + C`: 清空输入
- `Ctrl + Shift + E`: 加载示例数据

## 🛠️ 技术架构

### 前端
- 原生JavaScript (ES6+)
- CSS3 动画和响应式设计
- LocalStorage API 数据持久化

### 后端代理
- Node.js + Express
- CORS 跨域处理
- ModelScope API 代理转发

## 📝 API接口

### 图片生成
```
POST /api/image-synthesis
```

### 任务查询
```
GET /api/tasks/:taskId
```

## ⚠️ 注意事项

1. **代理服务器**: 由于浏览器CORS限制，必须启动本地代理服务器
2. **API Key**: 请确保您的ModelScope API Key有足够的额度
3. **网络连接**: 图片生成需要稳定的网络连接

## 🐛 常见问题

### Q: API连接失败
A: 请检查：
- 代理服务器是否启动 (`npm start`)
- API Key是否正确配置
- 网络连接是否正常

### Q: 图片生成超时
A: 可能原因：
- 网络连接不稳定
- API服务繁忙
- 提示词过于复杂

### Q: 无法保存API Key
A: 请检查：
- 浏览器是否支持LocalStorage
- 是否在隐私模式下使用

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！
