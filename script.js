class XiaohongshuGenerator {
    constructor() {
        this.apiKey = localStorage.getItem('modelscope_api_key') || '';
        this.currentPage = 'input';
        this.generatedImages = JSON.parse(localStorage.getItem('generated_images') || '[]');
        
        this.initializeElements();
        this.bindEvents();
        this.loadApiConfig();
        this.updateApiStatus();
        this.updateGallery();
    }

    initializeElements() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.apiStatusIndicator = document.getElementById('apiStatusIndicator');
        
        this.jsonInput = document.getElementById('jsonInput');
        this.parseBtn = document.getElementById('parseBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.loadExampleBtn = document.getElementById('loadExampleBtn');
        this.charCount = document.getElementById('charCount');
        
        this.resultsContainer = document.getElementById('resultsContainer');
        this.backToInputBtn = document.getElementById('backToInputBtn');
        
        this.galleryContainer = document.getElementById('galleryContainer');
        this.clearGalleryBtn = document.getElementById('clearGalleryBtn');
        this.uploadImageBtn = document.getElementById('uploadImageBtn');
        
        // 图片编辑中心元素
        this.galleryUploadSection = document.getElementById('galleryUploadSection');
        this.galleryUploadArea = document.getElementById('galleryUploadArea');
        this.galleryImageUpload = document.getElementById('galleryImageUpload');
        this.imageWorkspace = document.getElementById('imageWorkspace');
        this.workspaceImage = document.getElementById('workspaceImage');
        this.workspaceCanvas = document.getElementById('workspaceCanvas');
        
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.togglePasswordBtn = document.getElementById('togglePasswordBtn');
        this.saveConfigBtn = document.getElementById('saveConfigBtn');
        this.testApiBtn = document.getElementById('testApiBtn');
        this.clearApiBtn = document.getElementById('clearApiBtn');
        this.apiStatus = document.getElementById('apiStatus');
        
        // 图片上传元素
        this.uploadArea = document.getElementById('uploadArea');
        this.imageUpload = document.getElementById('imageUpload');
        this.uploadedImagePreview = document.getElementById('uploadedImagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.addTextToUploadedBtn = document.getElementById('addTextToUploadedBtn');
        this.clearUploadBtn = document.getElementById('clearUploadBtn');
        this.uploadTextEditor = document.getElementById('uploadTextEditor');
        
        this.toastContainer = document.getElementById('toastContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    bindEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });
        
        this.parseBtn.addEventListener('click', () => this.parseJSON());
        this.clearBtn.addEventListener('click', () => this.clearInput());
        this.loadExampleBtn.addEventListener('click', () => this.loadExampleData());
        this.jsonInput.addEventListener('input', () => this.updateCharCount());
        
        this.backToInputBtn.addEventListener('click', () => this.navigateToPage('input'));
        this.clearGalleryBtn.addEventListener('click', () => this.clearGallery());
        this.uploadImageBtn.addEventListener('click', () => this.showUploadSection());
        
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        this.saveConfigBtn.addEventListener('click', () => this.saveApiConfig());
        this.testApiBtn.addEventListener('click', () => this.testApiConnection());
        this.clearApiBtn.addEventListener('click', () => this.clearApiConfig());
        
        // 图片上传事件
        this.bindUploadEvents();
    }

    navigateToPage(pageId) {
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });
        
        this.pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId + 'Page');
        });
        
        this.currentPage = pageId;
        
        if (pageId === 'settings') {
            this.loadApiConfig();
        } else if (pageId === 'gallery') {
            this.updateGallery();
        }
    }

    updateCharCount() {
        const count = this.jsonInput.value.length;
        this.charCount.textContent = count.toLocaleString();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 16px;">' + (type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️') + '</span><span>' + message + '</span></div>';
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    updateApiStatus() {
        const statusDot = this.apiStatusIndicator.querySelector('.status-dot');
        const statusText = this.apiStatusIndicator.querySelector('.status-text');
        
        if (this.apiKey) {
            statusDot.classList.add('connected');
            statusText.textContent = '已配置';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = '未配置';
        }
    }

    clearInput() {
        this.jsonInput.value = '';
        this.updateCharCount();
        this.showToast('输入已清空', 'success');
    }

    loadExampleData() {
        const exampleData = {
            "ok": true,
            "topic": "夜跑城市",
            "title": "城市夜跑的节奏",
            "body": "街灯下的步伐稳稳落地\\n微风里心跳与灯光齐闪\\n城市夜色，是跑者的舞台",
            "hashtags_line": "#夜跑 #城市夜跑 #跑步打卡 #健康生活",
            "poster_prompts": [
                {
                    "text": "夜跑者的坚持",
                    "prompt_en": "A determined runner jogging through the city at night, streetlights illuminating the path, urban skyline in the background, cinematic lighting, high quality, 4k",
                    "prompt_zh": "一位坚定的跑者在夜晚的城市中慢跑，街灯照亮道路，城市天际线作为背景，电影般的灯光，高质量，4k"
                }
            ]
        };

        this.jsonInput.value = JSON.stringify(exampleData, null, 2);
        this.updateCharCount();
        this.showToast('示例数据已加载', 'success');
    }

    async parseJSON() {
        const jsonText = this.jsonInput.value.trim();
        
        if (!jsonText) {
            this.showToast('请输入JSON数据', 'error');
            return;
        }

        try {
            const data = JSON.parse(jsonText);
            this.validateData(data);
            
            await this.displayResults(data);
            this.navigateToPage('results');
            this.showToast('解析成功！', 'success');
        } catch (error) {
            this.showToast('JSON解析错误: ' + error.message, 'error');
        }
    }

    validateData(data) {
        const requiredFields = ['topic', 'title', 'body', 'poster_prompts'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error('缺少必需字段: ' + field);
            }
        }

        if (!Array.isArray(data.poster_prompts)) {
            throw new Error('poster_prompts 必须是数组');
        }
    }

    async displayResults(data) {
        this.resultsContainer.innerHTML = '';
        
        // 基本信息卡片
        const basicInfoCard = document.createElement('div');
        basicInfoCard.className = 'content-card';
        basicInfoCard.innerHTML = '<h3>📌 基本信息</h3><div style="display: grid; gap: 1rem;"><div><label style="font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">话题：</label><div style="background: var(--primary-gradient); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 600;">' + data.topic + '</div></div><div><label style="font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">标题：</label><div style="font-size: 1.25rem; font-weight: 600; color: var(--text-primary); line-height: 1.4;">' + data.title + '</div></div></div>';
        this.resultsContainer.appendChild(basicInfoCard);
        
        // 正文内容卡片
        const contentCard = document.createElement('div');
        contentCard.className = 'content-card';
        contentCard.innerHTML = '<h3>📝 正文内容</h3><div style="background: rgba(248, 250, 252, 0.5); padding: 1.5rem; border-radius: var(--border-radius); line-height: 1.8; color: var(--text-secondary); font-size: 15px; white-space: pre-wrap; border-left: 4px solid #667eea;">' + data.body + '</div>';
        this.resultsContainer.appendChild(contentCard);
        
        // 话题标签卡片
        if (data.hashtags_line) {
            const hashtagsCard = document.createElement('div');
            hashtagsCard.className = 'content-card';
            const hashtags = data.hashtags_line.split(' ').filter(tag => tag.trim());
            
            hashtagsCard.innerHTML = '<h3>🏷️ 话题标签</h3><div style="display: flex; flex-wrap: wrap; gap: 8px;">' + hashtags.map(tag => '<span style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 6px 12px; border-radius: 15px; font-size: 13px; font-weight: 600;">' + tag + '</span>').join('') + '</div>';
            this.resultsContainer.appendChild(hashtagsCard);
        }
        
        // 海报提示词卡片
        if (data.poster_prompts && data.poster_prompts.length > 0) {
            const promptsCard = document.createElement('div');
            promptsCard.className = 'content-card';
            promptsCard.innerHTML = '<h3>🎨 海报提示词</h3>';
            
            data.poster_prompts.forEach((prompt, index) => {
                const promptDiv = this.createPromptItem(prompt, index);
                promptsCard.appendChild(promptDiv);
            });
            
            this.resultsContainer.appendChild(promptsCard);
        }
    }

    createPromptItem(prompt, index) {
        const promptDiv = document.createElement('div');
        promptDiv.style.cssText = `
            background: rgba(248, 250, 252, 0.5);
            border: 2px solid rgba(102, 126, 234, 0.1);
            border-radius: var(--border-radius-lg);
            padding: 1.5rem;
            margin-bottom: 1rem;
        `;
        
        // 创建标题
        const title = document.createElement('h4');
        title.style.cssText = 'margin-bottom: 1rem; color: var(--text-primary);';
        title.textContent = prompt.text;
        promptDiv.appendChild(title);
        
        // 创建中文提示词区域
        const zhSection = this.createPromptSection('🇨🇳 中文提示词：', prompt.prompt_zh || '暂无中文提示词', prompt.text, 'zh');
        promptDiv.appendChild(zhSection);
        
        // 创建英文提示词区域
        const enSection = this.createPromptSection('🇺🇸 英文提示词：', prompt.prompt_en, prompt.text, 'en');
        promptDiv.appendChild(enSection);
        
        // 创建图片结果区域
        const imageResult = document.createElement('div');
        imageResult.className = 'image-result';
        imageResult.style.cssText = 'margin-top: 1rem; display: none;';
        promptDiv.appendChild(imageResult);
        
        return promptDiv;
    }

    createPromptSection(label, promptText, title, type) {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 1rem;';
        
        // 标签
        const labelEl = document.createElement('label');
        labelEl.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem; display: block;';
        labelEl.textContent = label;
        section.appendChild(labelEl);
        
        // 文本域
        const textarea = document.createElement('textarea');
        textarea.readOnly = true;
        textarea.value = promptText;
        textarea.style.cssText = `
            width: 100%;
            min-height: 80px;
            padding: 1rem;
            border: 2px solid rgba(102, 126, 234, 0.2);
            border-radius: var(--border-radius);
            font-family: monospace;
            font-size: 13px;
            background: white;
            resize: vertical;
        `;
        section.appendChild(textarea);
        
        // 按钮区域
        const buttonDiv = document.createElement('div');
        buttonDiv.style.cssText = 'margin-top: 0.5rem;';
        
        // 复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 复制';
        copyBtn.style.cssText = `
            background: linear-gradient(135deg, #38b2ac 0%, #319795 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 8px;
        `;
        copyBtn.onclick = () => this.copyPromptText(promptText);
        buttonDiv.appendChild(copyBtn);
        
        // 生成图片按钮
        const generateBtn = document.createElement('button');
        generateBtn.textContent = '🎨 生成图片';
        generateBtn.style.cssText = `
            background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        `;
        generateBtn.onclick = () => {
            const imageResult = section.parentElement.querySelector('.image-result');
            this.generateImage(promptText, generateBtn, imageResult, title);
        };
        buttonDiv.appendChild(generateBtn);
        
        section.appendChild(buttonDiv);
        return section;
    }

    copyPromptText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('已复制到剪贴板', 'success');
        }).catch(() => {
            this.showToast('复制失败', 'error');
        });
    }

    // 优化提示词（基于ModelScope官方案例）
    optimizePrompt(originalPrompt) {
        if (!originalPrompt || typeof originalPrompt !== 'string') {
            return originalPrompt;
        }
        
        // 检测是否为中文提示词
        const isChinesePrimary = /[\u4e00-\u9fff]/.test(originalPrompt);
        
        // 定义魔法后缀
        const positiveMagic = {
            en: ", Ultra HD, 4K, cinematic composition, professional photography, high quality, detailed, masterpiece",
            zh: ", 超清，4K，电影级构图，专业摄影，高质量，精细，杰作"
        };
        
        // 如果提示词已经包含质量词汇，则不重复添加
        const qualityKeywords = [
            'ultra hd', '4k', 'cinematic', 'professional', 'high quality', 'detailed', 'masterpiece',
            '超清', '电影级', '专业', '高质量', '精细', '杰作'
        ];
        
        const hasQualityKeywords = qualityKeywords.some(keyword => 
            originalPrompt.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasQualityKeywords) {
            return originalPrompt;
        }
        
        // 添加相应的质量提升后缀
        const suffix = isChinesePrimary ? positiveMagic.zh : positiveMagic.en;
        return originalPrompt + suffix;
    }

    async generateImage(prompt, button, imageResultDiv, title) {
        if (!this.apiKey) {
            this.showToast('请先在设置页面配置API Key', 'error');
            this.navigateToPage('settings');
            return;
        }

        if (!prompt.trim()) {
            this.showToast('提示词不能为空', 'error');
            return;
        }

        const originalText = button.textContent;
        button.textContent = '⏳ 生成中...';
        button.disabled = true;

        try {
            // 根据官方案例优化提示词
            const optimizedPrompt = this.optimizePrompt(prompt);
            
            const response = await fetch('http://localhost:3001/api/image-synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    headers: { 'Authorization': 'Bearer ' + this.apiKey },
                    body: {
                        model: 'Qwen/Qwen-Image',
                        prompt: optimizedPrompt,
                        negative_prompt: " ",
                        size: '1080x1440',
                        num_inference_steps: 50,
                        true_cfg_scale: 4.0
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'HTTP ' + response.status);
            }

            const result = await response.json();
            
            if (result.task_id) {
                await this.pollTaskResult(result.task_id, imageResultDiv, title, prompt);
            } else if (result.output_images && result.output_images.length > 0) {
                this.displayGeneratedImage(result.output_images[0], imageResultDiv, title, prompt);
            } else {
                throw new Error('未收到有效的图片生成结果');
            }
        } catch (error) {
            this.showToast('图片生成失败: ' + error.message, 'error');
            this.showImageError(imageResultDiv, error.message);
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async pollTaskResult(taskId, imageResultDiv, title, prompt, maxAttempts = 30) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch('http://localhost:3001/api/tasks/' + taskId, {
                    headers: { 'Authorization': 'Bearer ' + this.apiKey }
                });

                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }

                const result = await response.json();
                
                if (result.task_status === 'SUCCEED') {
                    if (result.output_images && result.output_images.length > 0) {
                        this.displayGeneratedImage(result.output_images[0], imageResultDiv, title, prompt);
                        return;
                    }
                } else if (result.task_status === 'FAILED') {
                    throw new Error(result.message || '任务执行失败');
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw error;
                }
            }
        }
        
        throw new Error('生成超时，请稍后重试');
    }

    displayGeneratedImage(imageUrl, imageResultDiv, title, prompt) {
        const imageData = {
            id: Date.now(),
            url: imageUrl,
            title: title,
            prompt: prompt,
            timestamp: new Date().toISOString()
        };
        
        this.generatedImages.unshift(imageData);
        if (this.generatedImages.length > 50) {
            this.generatedImages = this.generatedImages.slice(0, 50);
        }
        localStorage.setItem('generated_images', JSON.stringify(this.generatedImages));
        
        // 创建图片展示区域
        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 1rem;
            padding: 1rem;
            background: rgba(248, 250, 252, 0.5);
            border-radius: var(--border-radius);
            border: 2px solid rgba(102, 126, 234, 0.1);
            align-items: start;
        `;
        
        imageContainer.innerHTML = `
            <div class="image-section" style="display: flex; flex-direction: column; align-items: center;">
                <img src="${imageUrl}" alt="Generated Image" style="width: 200px; height: 267px; object-fit: cover; border-radius: var(--border-radius); box-shadow: var(--shadow-lg); margin-bottom: 0.5rem;" />
                <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">
                    <button class="download-btn" style="background: var(--primary-gradient); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">📥</button>
                    <button class="copy-link-btn" style="background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">🔗</button>
                    <button class="add-text-btn" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">✏️</button>
                    <button class="edit-btn" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">🖼️</button>
                </div>
            </div>
            <div class="content-section" style="min-height: 267px; display: flex; flex-direction: column;">
                <h4 style="margin: 0 0 1rem 0; color: var(--text-primary);">🎨 ${title} - 生成结果</h4>
                <div class="text-editor" style="display: none; flex: 1;"></div>
                <div class="prompt-display" style="background: rgba(255, 255, 255, 0.8); padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea; margin-top: auto;">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 14px;">提示词:</h5>
                    <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; word-break: break-all;">${prompt}</p>
                </div>
            </div>
        `;
        
        // 绑定按钮事件
        const downloadBtn = imageContainer.querySelector('.download-btn');
        const copyLinkBtn = imageContainer.querySelector('.copy-link-btn');
        const addTextBtn = imageContainer.querySelector('.add-text-btn');
        const editBtn = imageContainer.querySelector('.edit-btn');
        
        downloadBtn.onclick = () => window.open(imageUrl, '_blank');
        copyLinkBtn.onclick = () => {
            navigator.clipboard.writeText(imageUrl);
            this.showToast('链接已复制', 'success');
        };
        addTextBtn.onclick = () => this.showTextEditor(imageUrl, imageContainer, title);
        editBtn.onclick = () => {
            this.navigateToPage('gallery');
            this.editImageFromGallery(imageUrl, title);
        };
        
        imageResultDiv.innerHTML = '';
        imageResultDiv.appendChild(imageContainer);
        imageResultDiv.style.display = 'block';
        
        this.updateGallery();
        this.showToast('图片生成成功！', 'success');
    }

    showImageError(imageResultDiv, message) {
        imageResultDiv.innerHTML = '<div style="text-align: center; padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.2); border-radius: var(--border-radius); color: #dc2626;"><p>❌ ' + message + '</p></div>';
        imageResultDiv.style.display = 'block';
    }

    // 显示文字编辑器
    showTextEditor(imageUrl, container, title) {
        const textEditor = container.querySelector('.text-editor');
        
        if (textEditor.style.display === 'none') {
            textEditor.innerHTML = `
                <div style="background: white; padding: 1.5rem; border-radius: var(--border-radius); border: 2px solid rgba(102, 126, 234, 0.2); margin-top: 1rem;">
                    <h5 style="margin-bottom: 1rem; color: var(--text-primary);">✏️ 图片文字编辑器</h5>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">文字内容:</label>
                            <textarea class="text-content" placeholder="输入要添加的文字..." style="width: 100%; height: 80px; padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">字体设置:</label>
                            <div style="display: grid; gap: 0.5rem;">
                                <select class="font-family" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); border-radius: 6px;">
                                    <option value="'Microsoft YaHei', 'PingFang SC', sans-serif">微软雅黑</option>
                                    <option value="'SimHei', 'Heiti SC', sans-serif">黑体</option>
                                    <option value="'SimSun', 'Songti SC', serif">宋体</option>
                                    <option value="'KaiTi', 'Kaiti SC', serif">楷体</option>
                                    <option value="'FangSong', 'STFangsong', serif">仿宋</option>
                                    <option value="'Arial Black', Arial, sans-serif">Arial Black</option>
                                    <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                    <option value="'Georgia', serif">Georgia</option>
                                    <option value="'Courier New', Courier, monospace">Courier New</option>
                                    <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                                    <option value="'Impact', sans-serif">Impact</option>
                                </select>
                                <input type="range" class="font-size" min="16" max="120" value="36" style="width: 100%;" />
                                <span class="font-size-display" style="text-align: center; font-size: 12px; color: var(--text-secondary);">字体大小: 36px</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">文字颜色:</label>
                            <input type="color" class="text-color" value="#ffffff" style="width: 100%; height: 40px; border: none; border-radius: 6px; cursor: pointer;" />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">描边颜色:</label>
                            <input type="color" class="stroke-color" value="#000000" style="width: 100%; height: 40px; border: none; border-radius: 6px; cursor: pointer;" />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">描边粗细:</label>
                            <input type="range" class="stroke-width" min="0" max="10" value="2" style="width: 100%;" />
                            <span class="stroke-width-display" style="text-align: center; font-size: 12px; color: var(--text-secondary); display: block;">描边: 2px</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">文字位置:</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                            <button class="position-btn" data-position="top-left" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↖ 左上</button>
                            <button class="position-btn" data-position="top-center" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↑ 上中</button>
                            <button class="position-btn" data-position="top-right" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↗ 右上</button>
                            <button class="position-btn" data-position="center-left" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">← 左中</button>
                            <button class="position-btn active" data-position="center" style="padding: 0.5rem; border: 2px solid #667eea; background: rgba(102, 126, 234, 0.1); border-radius: 6px; cursor: pointer;">● 居中</button>
                            <button class="position-btn" data-position="center-right" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">→ 右中</button>
                            <button class="position-btn" data-position="bottom-left" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↙ 左下</button>
                            <button class="position-btn" data-position="bottom-center" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↓ 下中</button>
                            <button class="position-btn" data-position="bottom-right" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↘ 右下</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="preview-text-btn" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">👁️ 预览效果</button>
                        <button class="compose-download-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">💾 合成下载</button>
                        <button class="hide-editor-btn" style="background: rgba(108, 117, 125, 0.8); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">✖️ 收起</button>
                    </div>
                    
                    <canvas class="preview-canvas" style="display: none; max-width: 100%; margin-top: 1rem; border: 2px solid rgba(102, 126, 234, 0.2); border-radius: 6px;"></canvas>
                </div>
            `;
            
            this.bindTextEditorEvents(textEditor, imageUrl, title);
            textEditor.style.display = 'block';
        } else {
            textEditor.style.display = 'none';
        }
    }

    // 绑定文字编辑器事件
    bindTextEditorEvents(textEditor, imageUrl, title) {
        const fontSizeSlider = textEditor.querySelector('.font-size');
        const fontSizeDisplay = textEditor.querySelector('.font-size-display');
        const strokeWidthSlider = textEditor.querySelector('.stroke-width');
        const strokeWidthDisplay = textEditor.querySelector('.stroke-width-display');
        const positionBtns = textEditor.querySelectorAll('.position-btn');
        const previewBtn = textEditor.querySelector('.preview-text-btn');
        const composeBtn = textEditor.querySelector('.compose-download-btn');
        const hideBtn = textEditor.querySelector('.hide-editor-btn');
        
        let selectedPosition = 'center';
        
        // 字体大小滑块
        fontSizeSlider.addEventListener('input', (e) => {
            fontSizeDisplay.textContent = `字体大小: ${e.target.value}px`;
        });
        
        // 描边粗细滑块
        strokeWidthSlider.addEventListener('input', (e) => {
            strokeWidthDisplay.textContent = `描边: ${e.target.value}px`;
        });
        
        // 位置按钮
        positionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                positionBtns.forEach(b => {
                    b.style.border = '2px solid rgba(102, 126, 234, 0.2)';
                    b.style.background = 'white';
                    b.classList.remove('active');
                });
                btn.style.border = '2px solid #667eea';
                btn.style.background = 'rgba(102, 126, 234, 0.1)';
                btn.classList.add('active');
                selectedPosition = btn.dataset.position;
            });
        });
        
        // 预览按钮
        previewBtn.addEventListener('click', () => {
            this.previewTextOnImage(textEditor, imageUrl);
        });
        
        // 合成下载按钮
        composeBtn.addEventListener('click', () => {
            this.composeAndDownloadImage(textEditor, imageUrl, title);
        });
        
        // 收起按钮
        hideBtn.addEventListener('click', () => {
            textEditor.style.display = 'none';
        });
    }

    // 预览文字效果
    async previewTextOnImage(textEditor, imageUrl) {
        const canvas = textEditor.querySelector('.preview-canvas');
        const ctx = canvas.getContext('2d');
        
        try {
            // 加载图片
            const img = await this.loadImage(imageUrl);
            
            // 设置canvas尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.style.display = 'block';
            
            // 绘制图片
            ctx.drawImage(img, 0, 0);
            
            // 获取文字参数
            const textContent = textEditor.querySelector('.text-content').value;
            const fontFamily = textEditor.querySelector('.font-family').value;
            const fontSize = parseInt(textEditor.querySelector('.font-size').value);
            const textColor = textEditor.querySelector('.text-color').value;
            const strokeColor = textEditor.querySelector('.stroke-color').value;
            const strokeWidth = parseInt(textEditor.querySelector('.stroke-width').value);
            const position = textEditor.querySelector('.position-btn.active').dataset.position;
            
            if (textContent.trim()) {
                this.drawTextOnCanvas(ctx, textContent, fontFamily, fontSize, textColor, strokeColor, strokeWidth, position, canvas.width, canvas.height);
            }
            
            this.showToast('预览已生成', 'success');
        } catch (error) {
            this.showToast('预览失败: ' + error.message, 'error');
        }
    }

    // 合成并下载图片
    async composeAndDownloadImage(textEditor, imageUrl, title) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        try {
            // 加载图片
            const img = await this.loadImage(imageUrl);
            
            // 设置canvas尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            ctx.drawImage(img, 0, 0);
            
            // 获取文字参数
            const textContent = textEditor.querySelector('.text-content').value;
            const fontFamily = textEditor.querySelector('.font-family').value;
            const fontSize = parseInt(textEditor.querySelector('.font-size').value);
            const textColor = textEditor.querySelector('.text-color').value;
            const strokeColor = textEditor.querySelector('.stroke-color').value;
            const strokeWidth = parseInt(textEditor.querySelector('.stroke-width').value);
            const position = textEditor.querySelector('.position-btn.active').dataset.position;
            
            if (textContent.trim()) {
                this.drawTextOnCanvas(ctx, textContent, fontFamily, fontSize, textColor, strokeColor, strokeWidth, position, canvas.width, canvas.height);
            }
            
            // 下载合成图片
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title}_with_text_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showToast('合成图片已下载', 'success');
            }, 'image/png');
            
        } catch (error) {
            this.showToast('合成失败: ' + error.message, 'error');
        }
    }

    // 加载图片（支持代理）
    loadImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('图片加载失败'));
            
            // 使用代理加载图片避免跨域问题
            if (imageUrl.startsWith('http') && !imageUrl.startsWith('http://localhost')) {
                img.src = `http://localhost:3001/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            } else {
                img.src = imageUrl;
            }
        });
    }

    // 在Canvas上绘制文字
    drawTextOnCanvas(ctx, text, fontFamily, fontSize, textColor, strokeColor, strokeWidth, position, canvasWidth, canvasHeight) {
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 处理多行文字
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        
        // 计算位置
        let x, y;
        switch (position) {
            case 'top-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                x = canvasWidth * 0.05;
                y = canvasHeight * 0.05;
                break;
            case 'top-center':
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                x = canvasWidth * 0.5;
                y = canvasHeight * 0.05;
                break;
            case 'top-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                x = canvasWidth * 0.95;
                y = canvasHeight * 0.05;
                break;
            case 'center-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                x = canvasWidth * 0.05;
                y = canvasHeight * 0.5 - totalHeight / 2;
                break;
            case 'center':
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                x = canvasWidth * 0.5;
                y = canvasHeight * 0.5 - totalHeight / 2;
                break;
            case 'center-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                x = canvasWidth * 0.95;
                y = canvasHeight * 0.5 - totalHeight / 2;
                break;
            case 'bottom-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                x = canvasWidth * 0.05;
                y = canvasHeight * 0.95 - totalHeight;
                break;
            case 'bottom-center':
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                x = canvasWidth * 0.5;
                y = canvasHeight * 0.95 - totalHeight;
                break;
            case 'bottom-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                x = canvasWidth * 0.95;
                y = canvasHeight * 0.95 - totalHeight;
                break;
        }
        
        // 绘制每一行文字
        lines.forEach((line, index) => {
            const lineY = y + index * lineHeight;
            
            // 绘制描边
            if (strokeWidth > 0) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
                ctx.strokeText(line, x, lineY);
            }
            
            // 绘制文字
            ctx.fillStyle = textColor;
            ctx.fillText(line, x, lineY);
        });
    }

    // 绑定图片上传事件
    bindUploadEvents() {
        if (!this.uploadArea || !this.imageUpload) return;
        
        // 点击上传区域
        this.uploadArea.addEventListener('click', () => {
            this.imageUpload.click();
        });
        
        // 文件选择
        this.imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });
        
        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    this.handleImageUpload(file);
                } else {
                    this.showToast('请上传图片文件', 'error');
                }
            }
        });
        
        // 按钮事件
        if (this.addTextToUploadedBtn) {
            this.addTextToUploadedBtn.addEventListener('click', () => {
                this.showUploadTextEditor();
            });
        }
        
        if (this.clearUploadBtn) {
            this.clearUploadBtn.addEventListener('click', () => {
                this.clearUploadedImage();
            });
        }
    }

    // 处理图片上传
    handleImageUpload(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showToast('请上传图片文件', 'error');
            return;
        }
        
        // 验证文件大小（限制为10MB）
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('图片文件过大，请选择小于10MB的图片', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImageUrl = e.target.result;
            this.displayUploadedImage(e.target.result);
            this.showToast('图片上传成功！', 'success');
        };
        
        reader.onerror = () => {
            this.showToast('图片读取失败', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // 显示上传的图片
    displayUploadedImage(imageUrl) {
        if (this.previewImage && this.uploadedImagePreview) {
            this.previewImage.src = imageUrl;
            this.uploadedImagePreview.style.display = 'block';
            this.uploadArea.style.display = 'none';
        }
    }

    // 清除上传的图片
    clearUploadedImage() {
        if (this.uploadedImagePreview && this.uploadArea && this.uploadTextEditor) {
            this.uploadedImagePreview.style.display = 'none';
            this.uploadArea.style.display = 'block';
            this.uploadTextEditor.style.display = 'none';
            this.imageUpload.value = '';
            this.uploadedImageUrl = null;
            this.showToast('图片已清除', 'success');
        }
    }

    // 显示上传图片的文字编辑器
    showUploadTextEditor() {
        if (!this.uploadedImageUrl) {
            this.showToast('请先上传图片', 'error');
            return;
        }
        
        if (this.uploadTextEditor.style.display === 'none') {
            this.uploadTextEditor.innerHTML = `
                <div style="background: white; padding: 1.5rem; border-radius: var(--border-radius); border: 2px solid rgba(102, 126, 234, 0.2); margin-top: 1rem;">
                    <h5 style="margin-bottom: 1rem; color: var(--text-primary);">✏️ 上传图片文字编辑器</h5>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">文字内容:</label>
                            <textarea class="text-content" placeholder="输入要添加的文字..." style="width: 100%; height: 80px; padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">字体设置:</label>
                            <div style="display: grid; gap: 0.5rem;">
                                <select class="font-family" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); border-radius: 6px;">
                                    <option value="'Microsoft YaHei', 'PingFang SC', sans-serif">微软雅黑</option>
                                    <option value="'SimHei', 'Heiti SC', sans-serif">黑体</option>
                                    <option value="'SimSun', 'Songti SC', serif">宋体</option>
                                    <option value="'KaiTi', 'Kaiti SC', serif">楷体</option>
                                    <option value="'FangSong', 'STFangsong', serif">仿宋</option>
                                    <option value="'Arial Black', Arial, sans-serif">Arial Black</option>
                                    <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                    <option value="'Georgia', serif">Georgia</option>
                                    <option value="'Courier New', Courier, monospace">Courier New</option>
                                    <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                                    <option value="'Impact', sans-serif">Impact</option>
                                </select>
                                <input type="range" class="font-size" min="16" max="120" value="36" style="width: 100%;" />
                                <span class="font-size-display" style="text-align: center; font-size: 12px; color: var(--text-secondary);">字体大小: 36px</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">文字颜色:</label>
                            <input type="color" class="text-color" value="#ffffff" style="width: 100%; height: 40px; border: none; border-radius: 6px; cursor: pointer;" />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">描边颜色:</label>
                            <input type="color" class="stroke-color" value="#000000" style="width: 100%; height: 40px; border: none; border-radius: 6px; cursor: pointer;" />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">描边粗细:</label>
                            <input type="range" class="stroke-width" min="0" max="10" value="2" style="width: 100%;" />
                            <span class="stroke-width-display" style="text-align: center; font-size: 12px; color: var(--text-secondary); display: block;">描边: 2px</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">文字位置:</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                            <button class="position-btn" data-position="top-left" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↖ 左上</button>
                            <button class="position-btn" data-position="top-center" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↑ 上中</button>
                            <button class="position-btn" data-position="top-right" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↗ 右上</button>
                            <button class="position-btn" data-position="center-left" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">← 左中</button>
                            <button class="position-btn active" data-position="center" style="padding: 0.5rem; border: 2px solid #667eea; background: rgba(102, 126, 234, 0.1); border-radius: 6px; cursor: pointer;">● 居中</button>
                            <button class="position-btn" data-position="center-right" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">→ 右中</button>
                            <button class="position-btn" data-position="bottom-left" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↙ 左下</button>
                            <button class="position-btn" data-position="bottom-center" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↓ 下中</button>
                            <button class="position-btn" data-position="bottom-right" style="padding: 0.5rem; border: 2px solid rgba(102, 126, 234, 0.2); background: white; border-radius: 6px; cursor: pointer;">↘ 右下</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="preview-text-btn" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">👁️ 预览效果</button>
                        <button class="compose-download-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">💾 合成下载</button>
                        <button class="hide-editor-btn" style="background: rgba(108, 117, 125, 0.8); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">✖️ 收起</button>
                    </div>
                    
                    <canvas class="preview-canvas" style="display: none; max-width: 100%; margin-top: 1rem; border: 2px solid rgba(102, 126, 234, 0.2); border-radius: 6px;"></canvas>
                </div>
            `;
            
            this.bindTextEditorEvents(this.uploadTextEditor, this.uploadedImageUrl, '上传图片');
            this.uploadTextEditor.style.display = 'block';
        } else {
            this.uploadTextEditor.style.display = 'none';
        }
    }

    // 显示上传区域
    showUploadSection() {
        if (this.galleryUploadSection.style.display === 'none') {
            this.galleryUploadSection.style.display = 'block';
            this.bindGalleryUploadEvents();
        } else {
            this.galleryUploadSection.style.display = 'none';
        }
    }

    // 绑定画廊上传事件
    bindGalleryUploadEvents() {
        if (!this.galleryUploadArea || !this.galleryImageUpload) return;
        
        // 点击上传
        this.galleryUploadArea.addEventListener('click', () => {
            this.galleryImageUpload.click();
        });
        
        // 文件选择
        this.galleryImageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadImageToWorkspace(file);
            }
        });
        
        // 拖拽上传
        this.galleryUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.galleryUploadArea.classList.add('dragover');
        });
        
        this.galleryUploadArea.addEventListener('dragleave', () => {
            this.galleryUploadArea.classList.remove('dragover');
        });
        
        this.galleryUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.galleryUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    this.loadImageToWorkspace(file);
                } else {
                    this.showToast('请上传图片文件', 'error');
                }
            }
        });
    }

    // 加载图片到工作区
    loadImageToWorkspace(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('请上传图片文件', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('图片文件过大，请选择小于10MB的图片', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageUrl = e.target.result;
            this.showImageWorkspace(e.target.result);
            this.galleryUploadSection.style.display = 'none';
            this.showToast('图片加载成功！', 'success');
        };
        
        reader.onerror = () => {
            this.showToast('图片读取失败', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // 显示图片工作区
    showImageWorkspace(imageUrl) {
        this.workspaceImage.src = imageUrl;
        this.imageWorkspace.style.display = 'grid';
        this.bindWorkspaceEvents();
    }

    // 绑定工作区事件
    bindWorkspaceEvents() {
        const textInput = document.querySelector('.text-input-compact');
        const fontSelect = document.querySelector('.font-select-compact');
        const sizeSlider = document.querySelector('.size-slider-compact');
        const sizeDisplay = document.querySelector('.size-display-compact');
        const colorInput = document.querySelector('.color-input-compact');
        const strokeColorInput = document.querySelector('.stroke-color-compact');
        const strokeWidthSlider = document.querySelector('.stroke-width-compact');
        const positionBtns = document.querySelectorAll('.pos-btn');
        const previewBtn = document.getElementById('previewTextCompact');
        const downloadBtn = document.getElementById('downloadImageCompact');
        const saveBtn = document.getElementById('saveToGalleryCompact');
        
        let selectedPosition = 'center';
        
        // 字体大小滑块
        if (sizeSlider && sizeDisplay) {
            sizeSlider.addEventListener('input', (e) => {
                sizeDisplay.textContent = e.target.value + 'px';
            });
        }
        
        // 位置按钮
        positionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                positionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedPosition = btn.dataset.pos;
            });
        });
        
        // 预览按钮
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewWorkspaceText();
            });
        }
        
        // 下载按钮
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadWorkspaceImage();
            });
        }
        
        // 保存按钮
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveWorkspaceToGallery();
            });
        }
    }

    // 预览工作区文字
    async previewWorkspaceText() {
        const textInput = document.querySelector('.text-input-compact');
        const fontSelect = document.querySelector('.font-select-compact');
        const sizeSlider = document.querySelector('.size-slider-compact');
        const colorInput = document.querySelector('.color-input-compact');
        const strokeColorInput = document.querySelector('.stroke-color-compact');
        const strokeWidthSlider = document.querySelector('.stroke-width-compact');
        const activePos = document.querySelector('.pos-btn.active');
        
        const text = textInput?.value || '';
        if (!text.trim()) {
            this.showToast('请输入文字内容', 'error');
            return;
        }
        
        try {
            const img = await this.loadImage(this.currentImageUrl);
            
            this.workspaceCanvas.width = img.width;
            this.workspaceCanvas.height = img.height;
            this.workspaceCanvas.style.display = 'block';
            this.workspaceImage.style.display = 'none';
            
            const ctx = this.workspaceCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const fontFamily = fontSelect?.value || "'Microsoft YaHei', sans-serif";
            const fontSize = parseInt(sizeSlider?.value || 40);
            const textColor = colorInput?.value || '#ffffff';
            const strokeColor = strokeColorInput?.value || '#000000';
            const strokeWidth = parseInt(strokeWidthSlider?.value || 2);
            const position = activePos?.dataset.pos || 'center';
            
            this.drawTextOnCanvas(ctx, text, fontFamily, fontSize, textColor, strokeColor, strokeWidth, position, this.workspaceCanvas.width, this.workspaceCanvas.height);
            
            this.showToast('预览已生成', 'success');
        } catch (error) {
            this.showToast('预览失败: ' + error.message, 'error');
        }
    }

    // 下载工作区图片
    async downloadWorkspaceImage() {
        if (this.workspaceCanvas.style.display === 'none') {
            await this.previewWorkspaceText();
        }
        
        if (this.workspaceCanvas.style.display !== 'none') {
            this.workspaceCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `edited_image_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showToast('图片已下载', 'success');
            }, 'image/png');
        }
    }

    // 保存工作区到画廊
    async saveWorkspaceToGallery() {
        if (this.workspaceCanvas.style.display === 'none') {
            await this.previewWorkspaceText();
        }
        
        if (this.workspaceCanvas.style.display !== 'none') {
            const textInput = document.querySelector('.text-input-compact');
            const imageData = {
                id: Date.now(),
                url: this.workspaceCanvas.toDataURL('image/png'),
                title: '编辑图片',
                prompt: textInput?.value || '自定义文字',
                timestamp: new Date().toISOString()
            };
            
            this.generatedImages.unshift(imageData);
            if (this.generatedImages.length > 50) {
                this.generatedImages = this.generatedImages.slice(0, 50);
            }
            localStorage.setItem('generated_images', JSON.stringify(this.generatedImages));
            
            this.updateGallery();
            this.showToast('已保存到画廊', 'success');
        }
    }

    updateGallery() {
        if (this.generatedImages.length === 0) {
            this.galleryContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: rgba(255, 255, 255, 0.8);"><div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🎨</div><h3>暂无图片</h3><p>上传图片或生成AI图片开始编辑吧！</p></div>';
            return;
        }

        this.galleryContainer.innerHTML = this.generatedImages.map(image => 
            '<div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: var(--border-radius-lg); padding: 1rem; box-shadow: var(--shadow-lg); border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;" onclick="xiaohongshuApp.editImageFromGallery(\'' + image.url + '\', \'' + image.title + '\')"><img src="' + image.url + '" alt="' + image.title + '" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: 1rem;" /><h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">' + image.title + '</h4><p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">' + image.prompt + '</p><div style="display: flex; gap: 8px; justify-content: space-between;" onclick="event.stopPropagation()"><button onclick="window.open(\'' + image.url + '\', \'_blank\')" style="flex: 1; background: var(--primary-gradient); color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">📥 下载</button><button onclick="removeFromGallery(' + image.id + ')" style="background: var(--danger-gradient); color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">🗑️</button></div><div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center;">' + new Date(image.timestamp).toLocaleString() + '</div></div>'
        ).join('');
    }

    // 从画廊编辑图片
    editImageFromGallery(imageUrl, title) {
        this.currentImageUrl = imageUrl;
        this.showImageWorkspace(imageUrl);
        this.showToast('点击图片进入编辑模式', 'info');
    }

    clearGallery() {
        if (confirm('确定要清空所有生成的图片吗？')) {
            this.generatedImages = [];
            localStorage.removeItem('generated_images');
            this.updateGallery();
            this.showToast('画廊已清空', 'success');
        }
    }

    loadApiConfig() {
        if (this.apiKey) {
            this.apiKeyInput.value = this.apiKey;
        }
    }

    togglePasswordVisibility() {
        const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
        this.apiKeyInput.type = type;
        this.togglePasswordBtn.innerHTML = type === 'password' ? '<span>��️</span>' : '<span>🙈</span>';
    }

    async saveApiConfig() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showToast('请输入API Key', 'error');
            return;
        }
        this.apiKey = apiKey;
        localStorage.setItem('modelscope_api_key', apiKey);
        this.updateApiStatus();
        this.showToast('API配置已保存', 'success');
    }

    async testApiConnection() {
        if (!this.apiKey) {
            this.showToast('请先保存API Key', 'error');
            return;
        }

        const originalText = this.testApiBtn.textContent;
        this.testApiBtn.textContent = '⏳ 测试中...';
        this.testApiBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3001/api/image-synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    headers: { 'Authorization': 'Bearer ' + this.apiKey },
                    body: {
                        model: 'Qwen/Qwen-Image',
                        prompt: 'test connection, Ultra HD, 4K, cinematic composition',
                        negative_prompt: " ",
                        size: '1080x1440',
                        num_inference_steps: 30,
                        true_cfg_scale: 4.0
                    }
                })
            });

            if (response.ok) {
                this.showApiStatus('✅ API连接成功！', 'success');
                this.showToast('API连接测试成功', 'success');
            } else {
                this.showApiStatus('❌ API连接失败', 'error');
                this.showToast('API连接测试失败', 'error');
            }
        } catch (error) {
            this.showApiStatus('❌ 连接失败，请检查代理服务器', 'error');
            this.showToast('请启动代理服务器', 'error');
        } finally {
            this.testApiBtn.textContent = originalText;
            this.testApiBtn.disabled = false;
        }
    }

    clearApiConfig() {
        if (confirm('确定要清除API配置吗？')) {
            this.apiKey = '';
            this.apiKeyInput.value = '';
            localStorage.removeItem('modelscope_api_key');
            this.updateApiStatus();
            this.apiStatus.style.display = 'none';
            this.showToast('API配置已清除', 'success');
        }
    }

    showApiStatus(message, type) {
        this.apiStatus.textContent = message;
        this.apiStatus.className = 'api-status ' + type;
        this.apiStatus.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                this.apiStatus.style.display = 'none';
            }, 5000);
        }
    }
}

// 全局函数（保留画廊删除功能）

window.removeFromGallery = function(imageId) {
    if (confirm('确定要删除这张图片吗？')) {
        xiaohongshuApp.generatedImages = xiaohongshuApp.generatedImages.filter(img => img.id !== imageId);
        localStorage.setItem('generated_images', JSON.stringify(xiaohongshuApp.generatedImages));
        xiaohongshuApp.updateGallery();
        xiaohongshuApp.showToast('图片已删除', 'success');
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.xiaohongshuApp = new XiaohongshuGenerator();
});
