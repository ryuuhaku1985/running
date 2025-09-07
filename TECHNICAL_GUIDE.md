# 技术实现指南

## 🏗️ 架构重构详细步骤

### 第一步: HTML结构重构 (index.html)

#### 当前结构分析
```html
<!-- 现有结构 -->
<div class="navbar">...</div>
<div class="page" id="inputPage">...</div>
<div class="page" id="resultsPage">...</div>
<div class="page" id="galleryPage">...</div>
<div class="page" id="settingsPage">...</div>
```

#### 目标结构设计
```html
<!-- 新的统一工作台结构 -->
<div class="navbar">
  <div class="nav-left">
    <div class="logo">🎨 小红书内容生成器</div>
  </div>
  <div class="nav-right">
    <button class="settings-btn" id="settingsBtn">⚙️ 设置</button>
  </div>
</div>

<div class="workspace-container">
  <!-- 左侧面板 -->
  <div class="left-panel" id="leftPanel">
    <div class="panel-header">
      <h3>📝 内容输入</h3>
      <button class="collapse-btn" data-target="leftPanel">−</button>
    </div>
    
    <!-- JSON输入区 -->
    <div class="json-input-section">
      <div class="section-header">
        <h4>JSON数据输入</h4>
        <button class="load-example-btn">加载示例</button>
      </div>
      <textarea id="jsonInput" class="json-textarea"></textarea>
      <div class="input-footer">
        <span class="char-count" id="charCount">0 字符</span>
        <button class="parse-btn" id="parseBtn">解析JSON</button>
      </div>
    </div>
    
    <!-- 解析结果区 -->
    <div class="parse-result-section" id="parseResultSection" style="display: none;">
      <div class="section-header">
        <h4>解析结果</h4>
        <button class="edit-btn" id="editContentBtn">✏️ 编辑</button>
      </div>
      <div class="content-preview" id="contentPreview"></div>
    </div>
    
    <!-- 提示词列表区 -->
    <div class="prompt-list-section" id="promptListSection" style="display: none;">
      <div class="section-header">
        <h4>提示词管理</h4>
        <div class="prompt-actions">
          <button class="select-all-btn" id="selectAllPrompts">全选</button>
          <button class="generate-selected-btn" id="generateSelectedBtn">生成选中</button>
        </div>
      </div>
      <div class="prompt-list" id="promptList"></div>
    </div>
  </div>
  
  <!-- 中央工作区 -->
  <div class="center-workspace" id="centerWorkspace">
    <div class="workspace-header">
      <h3>🎨 生成工作区</h3>
      <div class="workspace-actions">
        <button class="batch-generate-btn" id="batchGenerateBtn">批量生成</button>
        <button class="clear-all-btn" id="clearAllBtn">清空结果</button>
      </div>
    </div>
    
    <!-- 批量操作面板 -->
    <div class="batch-panel" id="batchPanel" style="display: none;">
      <div class="generation-queue" id="generationQueue"></div>
      <div class="progress-bar" id="progressBar"></div>
    </div>
    
    <!-- 结果展示网格 -->
    <div class="results-grid" id="resultsGrid">
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <h4>准备开始创作</h4>
        <p>输入JSON数据并选择提示词开始生成图片</p>
      </div>
    </div>
  </div>
  
  <!-- 右侧面板 -->
  <div class="right-panel" id="rightPanel">
    <div class="panel-header">
      <h3>🖼️ 编辑工具</h3>
      <button class="collapse-btn" data-target="rightPanel">−</button>
    </div>
    
    <!-- 选中图片信息 -->
    <div class="selected-image-info" id="selectedImageInfo" style="display: none;">
      <img class="selected-image-preview" id="selectedImagePreview" />
      <div class="image-meta" id="imageMeta"></div>
    </div>
    
    <!-- 文字编辑工具 -->
    <div class="text-editor-panel" id="textEditorPanel">
      <!-- 复用现有的文字编辑器组件 -->
    </div>
    
    <!-- 样式模板 -->
    <div class="template-section" id="templateSection">
      <div class="section-header">
        <h4>样式模板</h4>
        <button class="save-template-btn" id="saveTemplateBtn">💾 保存当前</button>
      </div>
      <div class="template-list" id="templateList"></div>
    </div>
    
    <!-- 导出设置 -->
    <div class="export-section" id="exportSection">
      <div class="section-header">
        <h4>导出设置</h4>
      </div>
      <div class="export-options">
        <div class="format-selector">
          <label>格式:</label>
          <select id="exportFormat">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </div>
        <div class="naming-rule">
          <label>命名规则:</label>
          <select id="namingRule">
            <option value="timestamp">时间戳</option>
            <option value="sequence">序号</option>
            <option value="title">标题</option>
          </select>
        </div>
        <button class="export-all-btn" id="exportAllBtn">📦 批量导出</button>
        <button class="copy-content-btn" id="copyContentBtn">📋 复制内容</button>
      </div>
    </div>
  </div>
</div>

<!-- 设置模态框 -->
<div class="modal" id="settingsModal" style="display: none;">
  <div class="modal-content">
    <!-- 现有设置内容 -->
  </div>
</div>
```

### 第二步: CSS样式重构 (style.css)

#### 工作台布局样式
```css
/* 工作台容器 */
.workspace-container {
  display: grid;
  grid-template-columns: 300px 1fr 320px;
  height: calc(100vh - 60px);
  gap: 0;
  background: var(--background);
}

/* 面板通用样式 */
.left-panel,
.right-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-panel {
  border-right: none;
  border-left: 1px solid rgba(102, 126, 234, 0.1);
}

/* 中央工作区 */
.center-workspace {
  background: var(--background);
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 面板折叠功能 */
.left-panel.collapsed {
  grid-template-columns: 0 1fr 320px;
}

.right-panel.collapsed {
  grid-template-columns: 300px 1fr 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workspace-container {
    grid-template-columns: 280px 1fr 300px;
  }
}

@media (max-width: 768px) {
  .workspace-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .left-panel,
  .right-panel {
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  }
}

/* 结果网格布局 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

.result-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 1rem;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  cursor: pointer;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.result-card.selected {
  border: 2px solid #667eea;
  background: rgba(102, 126, 234, 0.1);
}
```

### 第三步: JavaScript重构 (script.js)

#### 主类结构重构
```javascript
class XiaohongshuGenerator {
  constructor() {
    // 现有属性保持
    this.apiKey = localStorage.getItem('modelscope_api_key') || '';
    this.generatedImages = JSON.parse(localStorage.getItem('generated_images') || '[]');
    this.currentData = null;
    
    // 新增属性
    this.selectedPrompts = new Set();
    this.selectedImages = new Set();
    this.generationQueue = [];
    this.isGenerating = false;
    this.styleTemplates = JSON.parse(localStorage.getItem('style_templates') || '[]');
    
    this.initializeWorkspace();
    this.bindWorkspaceEvents();
  }
  
  // 新的初始化方法
  initializeWorkspace() {
    this.initializeElements();
    this.initializeLeftPanel();
    this.initializeCenterWorkspace();
    this.initializeRightPanel();
    this.initializeModals();
  }
  
  // 左侧面板初始化
  initializeLeftPanel() {
    this.jsonInput = document.getElementById('jsonInput');
    this.charCount = document.getElementById('charCount');
    this.parseBtn = document.getElementById('parseBtn');
    this.contentPreview = document.getElementById('contentPreview');
    this.promptList = document.getElementById('promptList');
    
    // 绑定JSON输入事件
    this.jsonInput.addEventListener('input', () => this.updateCharCount());
    this.parseBtn.addEventListener('click', () => this.parseJSON());
  }
  
  // 中央工作区初始化
  initializeCenterWorkspace() {
    this.resultsGrid = document.getElementById('resultsGrid');
    this.batchPanel = document.getElementById('batchPanel');
    this.progressBar = document.getElementById('progressBar');
    this.batchGenerateBtn = document.getElementById('batchGenerateBtn');
    
    this.batchGenerateBtn.addEventListener('click', () => this.startBatchGeneration());
  }
  
  // 右侧面板初始化
  initializeRightPanel() {
    this.selectedImageInfo = document.getElementById('selectedImageInfo');
    this.textEditorPanel = document.getElementById('textEditorPanel');
    this.templateList = document.getElementById('templateList');
    this.exportSection = document.getElementById('exportSection');
    
    this.loadStyleTemplates();
    this.bindExportEvents();
  }
}
```

#### 批量生成管理器
```javascript
class BatchGenerationManager {
  constructor(generator) {
    this.generator = generator;
    this.queue = [];
    this.processing = false;
    this.results = [];
    this.maxConcurrent = 3;
  }
  
  addToQueue(prompts) {
    prompts.forEach(prompt => {
      this.queue.push({
        id: Date.now() + Math.random(),
        prompt: prompt,
        status: 'pending'
      });
    });
    this.updateQueueDisplay();
  }
  
  async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    this.generator.showBatchPanel();
    
    try {
      const chunks = this.chunkArray(this.queue, this.maxConcurrent);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        this.updateProgress(i, chunks.length);
        
        await Promise.allSettled(
          chunk.map(item => this.generateSingle(item))
        );
      }
      
      this.generator.showToast('批量生成完成！', 'success');
    } catch (error) {
      this.generator.showToast('批量生成出错: ' + error.message, 'error');
    } finally {
      this.processing = false;
      this.queue = [];
      this.updateQueueDisplay();
    }
  }
  
  async generateSingle(item) {
    try {
      item.status = 'generating';
      this.updateQueueDisplay();
      
      const result = await this.generator.generateImage(item.prompt.prompt_en);
      
      item.status = 'completed';
      item.result = result;
      this.results.push(result);
      
    } catch (error) {
      item.status = 'failed';
      item.error = error.message;
    }
    
    this.updateQueueDisplay();
  }
  
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  updateProgress(current, total) {
    const percentage = (current / total) * 100;
    this.generator.progressBar.style.width = percentage + '%';
  }
  
  updateQueueDisplay() {
    const queueContainer = document.getElementById('generationQueue');
    queueContainer.innerHTML = this.queue.map(item => `
      <div class="queue-item ${item.status}">
        <div class="item-title">${item.prompt.text}</div>
        <div class="item-status">${this.getStatusText(item.status)}</div>
      </div>
    `).join('');
  }
  
  getStatusText(status) {
    const statusMap = {
      pending: '⏳ 等待中',
      generating: '🎨 生成中',
      completed: '✅ 完成',
      failed: '❌ 失败'
    };
    return statusMap[status] || status;
  }
}
```

#### 样式模板管理器
```javascript
class StyleTemplateManager {
  constructor(generator) {
    this.generator = generator;
    this.templates = JSON.parse(localStorage.getItem('style_templates') || '[]');
  }
  
  saveTemplate(style, name) {
    const template = {
      id: 'template_' + Date.now(),
      name: name,
      ...style,
      createdAt: new Date().toISOString()
    };
    
    this.templates.push(template);
    this.saveToStorage();
    this.updateTemplateList();
    
    return template.id;
  }
  
  loadTemplate(id) {
    return this.templates.find(t => t.id === id);
  }
  
  deleteTemplate(id) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveToStorage();
    this.updateTemplateList();
  }
  
  applyToSelected(templateId) {
    const template = this.loadTemplate(templateId);
    if (!template) return;
    
    this.generator.selectedImages.forEach(imageId => {
      this.generator.applyTextStyle(imageId, template);
    });
    
    this.generator.showToast(`已应用样式模板: ${template.name}`, 'success');
  }
  
  updateTemplateList() {
    const container = document.getElementById('templateList');
    container.innerHTML = this.templates.map(template => `
      <div class="template-item" data-id="${template.id}">
        <div class="template-preview">
          <span style="
            font-family: ${template.fontFamily};
            font-size: 16px;
            color: ${template.color};
          ">Aa</span>
        </div>
        <div class="template-info">
          <div class="template-name">${template.name}</div>
          <div class="template-meta">${template.fontSize}px</div>
        </div>
        <div class="template-actions">
          <button onclick="styleManager.applyToSelected('${template.id}')">应用</button>
          <button onclick="styleManager.deleteTemplate('${template.id}')">删除</button>
        </div>
      </div>
    `).join('');
  }
  
  saveToStorage() {
    localStorage.setItem('style_templates', JSON.stringify(this.templates));
  }
}
```

### 第四步: 集成现有功能

#### 图片选择和编辑集成
```javascript
// 在XiaohongshuGenerator类中添加
selectImage(imageId) {
  if (this.selectedImages.has(imageId)) {
    this.selectedImages.delete(imageId);
  } else {
    this.selectedImages.add(imageId);
  }
  
  this.updateImageSelection();
  this.updateRightPanel();
}

updateImageSelection() {
  document.querySelectorAll('.result-card').forEach(card => {
    const imageId = card.dataset.imageId;
    if (this.selectedImages.has(imageId)) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

updateRightPanel() {
  if (this.selectedImages.size === 0) {
    this.selectedImageInfo.style.display = 'none';
    this.textEditorPanel.style.display = 'none';
  } else if (this.selectedImages.size === 1) {
    // 单张图片编辑
    this.showSingleImageEditor();
  } else {
    // 多张图片批量编辑
    this.showBatchImageEditor();
  }
}
```

这个技术指南提供了详细的实现步骤，你可以按照这个指南逐步重构现有代码。每个部分都有具体的代码示例，可以直接参考实现。
