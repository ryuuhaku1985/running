# 小红书内容生成器 - 详细开发计划

## 📋 总体架构改进目标

从现有的四页面结构改为统一的三栏式工作台，提升用户工作流程效率和空间利用率。

```
当前架构: 数据输入页 → 结果展示页 → 图片编辑中心 → 设置页
目标架构: 统一工作台 (左侧面板 + 中央工作区 + 右侧面板)
```

## 🚀 第一期开发 (预计2周)

### 任务1: 三栏式布局重构
**目标**: 将现有多页面结构改为统一工作台

#### 1.1 HTML结构重构
- **文件**: `index.html`
- **任务**:
  ```html
  <!-- 新的主体结构 -->
  <div class="workspace-container">
    <div class="left-panel"><!-- JSON输入和解析结果 --></div>
    <div class="center-workspace"><!-- 内容预览和批量操作 --></div>
    <div class="right-panel"><!-- 图片编辑和导出 --></div>
  </div>
  ```
- **具体步骤**:
  1. 移除现有的页面导航系统
  2. 创建三栏式布局容器
  3. 保留顶部导航栏（Logo + 设置入口）
  4. 添加面板折叠/展开功能

#### 1.2 CSS样式系统重写
- **文件**: `style.css`
- **任务**:
  ```css
  .workspace-container {
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    height: calc(100vh - 60px);
    gap: 1rem;
  }
  ```
- **响应式断点**:
  - 大屏 (>1200px): 三栏完整显示
  - 中屏 (768px-1200px): 可折叠侧边栏
  - 小屏 (<768px): 单栏切换显示

### 任务2: 左侧面板开发
**目标**: JSON输入、解析结果、提示词管理

#### 2.1 JSON输入区域
- **功能组件**:
  ```javascript
  // 在XiaohongshuGenerator类中添加
  initializeLeftPanel() {
    this.createJsonInputSection();
    this.createParseResultSection();
    this.createPromptListSection();
  }
  ```
- **具体功能**:
  1. 可折叠的JSON输入框
  2. 字符计数和格式验证
  3. 示例数据快速加载
  4. 解析按钮和状态指示

#### 2.2 解析结果展示
- **数据结构化展示**:
  ```javascript
  displayParsedContent(data) {
    // 展示标题、内容、话题
    // 结构化显示poster_prompts
    // 支持编辑和修改
  }
  ```

#### 2.3 提示词列表管理
- **多选功能**:
  ```javascript
  createPromptList(prompts) {
    // 复选框列表
    // 全选/反选功能
    // 批量生成按钮
  }
  ```

### 任务3: 中央工作区开发
**目标**: 内容预览、批量操作、生成状态管理

#### 3.1 内容预览区
- **卡片式展示**:
  ```javascript
  displayContentPreview(title, content, topics) {
    // 小红书风格的内容预览卡片
    // 字数统计和格式检查
    // 话题标签高亮显示
  }
  ```

#### 3.2 批量生成管理
- **生成队列系统**:
  ```javascript
  class BatchGenerationManager {
    constructor() {
      this.queue = [];
      this.processing = false;
      this.results = [];
    }
    
    addToQueue(prompts) { /* 添加到队列 */ }
    processQueue() { /* 处理队列 */ }
    updateProgress() { /* 更新进度 */ }
  }
  ```

#### 3.3 结果展示网格
- **响应式网格布局**:
  ```css
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  ```

### 任务4: 右侧面板开发
**目标**: 图片编辑、样式设置、导出功能

#### 4.1 图片编辑工具集成
- **复用现有编辑器**:
  ```javascript
  // 将现有的文字编辑功能集成到右侧面板
  integrateImageEditor() {
    // 选中图片时显示编辑工具
    // 实时预览功能
    // 应用到多张图片选项
  }
  ```

#### 4.2 导出配置面板
- **多格式导出**:
  ```javascript
  createExportPanel() {
    // 格式选择 (PNG/JPG)
    // 质量设置
    // 命名规则配置
    // 批量下载按钮
  }
  ```

### 任务5: 基础批量生成功能
**目标**: 支持多选提示词同时生成图片

#### 5.1 多选机制
- **选择状态管理**:
  ```javascript
  class PromptSelector {
    constructor() {
      this.selectedPrompts = new Set();
    }
    
    selectPrompt(id) { /* 选择提示词 */ }
    selectAll() { /* 全选 */ }
    getSelected() { /* 获取选中项 */ }
  }
  ```

#### 5.2 批量请求处理
- **并发控制**:
  ```javascript
  async batchGenerate(prompts) {
    const MAX_CONCURRENT = 3; // 限制并发数
    const chunks = this.chunkArray(prompts, MAX_CONCURRENT);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(prompt => this.generateImage(prompt)));
    }
  }
  ```

## 🎯 第二期开发 (预计1周)

### 任务6: 样式模板系统
**目标**: 保存和应用常用文字样式组合

#### 6.1 模板数据结构
```javascript
const StyleTemplate = {
  id: 'template_001',
  name: '标题样式',
  fontFamily: 'Microsoft YaHei',
  fontSize: 48,
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2,
  position: 'top-center'
};
```

#### 6.2 模板管理功能
```javascript
class TemplateManager {
  saveTemplate(style, name) { /* 保存模板 */ }
  loadTemplate(id) { /* 加载模板 */ }
  deleteTemplate(id) { /* 删除模板 */ }
  applyToSelected(templateId) { /* 应用到选中图片 */ }
}
```

### 任务7: 批量文字编辑
**目标**: 统一样式应用和批量内容设置

#### 7.1 统一样式应用
```javascript
applyStyleToAll(style) {
  this.selectedImages.forEach(imageId => {
    this.applyTextStyle(imageId, style);
  });
}
```

#### 7.2 批量文字内容
```javascript
addTextToAll(text, position = 'center') {
  this.selectedImages.forEach(imageId => {
    this.addTextToImage(imageId, text, position);
  });
}
```

### 任务8: 剪贴板集成
**目标**: 一键复制小红书格式内容

#### 8.1 格式化输出
```javascript
generateXiaohongshuFormat(data) {
  const { title, content, topics } = data;
  
  return `${title}

${content}

${topics.map(topic => `#${topic}`).join(' ')}
  
📸 图片已生成，请手动上传到小红书`;
}
```

#### 8.2 剪贴板操作
```javascript
async copyToClipboard() {
  const formattedContent = this.generateXiaohongshuFormat(this.currentData);
  await navigator.clipboard.writeText(formattedContent);
  this.showToast('内容已复制到剪贴板', 'success');
}
```

## 🔧 第三期开发 (预计1周)

### 任务9: 完善批量导出
**目标**: ZIP打包、格式转换、自定义命名

#### 9.1 ZIP打包功能
```javascript
// 需要引入JSZip库
async createZipDownload() {
  const zip = new JSZip();
  
  this.generatedImages.forEach((image, index) => {
    const filename = this.generateFilename(image, index);
    zip.file(filename, image.blob);
  });
  
  const content = await zip.generateAsync({type: 'blob'});
  this.downloadBlob(content, 'xiaohongshu_images.zip');
}
```

#### 9.2 命名规则系统
```javascript
class FileNamingRule {
  static patterns = {
    timestamp: () => new Date().toISOString().slice(0, 19).replace(/[:-]/g, ''),
    sequence: (index) => String(index + 1).padStart(3, '0'),
    title: (data) => data.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')
  };
  
  generate(pattern, data, index) {
    // 根据规则生成文件名
  }
}
```

### 任务10: 性能优化
**目标**: 提升大量图片处理的性能

#### 10.1 图片懒加载
```javascript
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }
  
  observe(imageElement) {
    this.observer.observe(imageElement);
  }
}
```

#### 10.2 内存管理
```javascript
class MemoryManager {
  static MAX_IMAGES = 50;
  
  static cleanup() {
    // 清理超出限制的图片
    // 释放Canvas内存
    // 清理临时对象URL
  }
}
```

### 任务11: 用户体验打磨
**目标**: 快捷键、动画、错误处理优化

#### 11.1 快捷键系统
```javascript
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = {
      'Ctrl+Enter': () => this.parseJSON(),
      'Ctrl+G': () => this.batchGenerate(),
      'Ctrl+S': () => this.exportAll(),
      'Escape': () => this.closeModal()
    };
  }
}
```

## 📁 文件结构调整

```
/Users/jdxl/code/running/
├── index.html (重构为三栏布局)
├── style.css (新增workspace样式)
├── script.js (重构类结构)
├── proxy-server.js (保持不变)
├── package.json (可能需要添加JSZip依赖)
├── DEVELOPMENT_PLAN.md (本文档)
└── assets/ (新增)
    ├── templates/ (样式模板)
    └── examples/ (示例JSON文件)
```

## 🧪 测试计划

### 功能测试
1. **布局响应式测试**: 不同屏幕尺寸下的显示效果
2. **批量生成测试**: 多个提示词同时生成的稳定性
3. **内存压力测试**: 大量图片生成和编辑的内存使用
4. **导出功能测试**: ZIP打包和文件命名的正确性

### 用户体验测试
1. **工作流程测试**: 完整创作流程的时间和步骤
2. **操作直觉性测试**: 新用户的上手难度
3. **性能基准测试**: 页面加载和操作响应时间

## 📊 开发里程碑

- **第1周结束**: 三栏布局完成，基础批量生成可用
- **第2周结束**: 完整的第一期功能，可进行内部测试
- **第3周结束**: 样式模板和批量编辑功能完成
- **第4周结束**: 所有功能完成，进行最终测试和优化

每个里程碑都应该有可演示的功能版本，确保开发进度可控。
