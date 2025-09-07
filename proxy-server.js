const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static('.'));

// 代理API请求到ModelScope
app.post('/api/image-synthesis', async (req, res) => {
    try {
        const { headers, body } = req.body;
        
        const response = await fetch('https://api-inference.modelscope.cn/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': headers.Authorization,
                'Content-Type': 'application/json',
                'X-ModelScope-Async-Mode': 'true'
            },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        
        if (!response.ok) {
            console.error('API Error:', response.status, text);
            try {
                const errorData = JSON.parse(text);
                return res.status(response.status).json(errorData);
            } catch (e) {
                return res.status(response.status).json({ error: text });
            }
        }
        
        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (e) {
            console.error('JSON Parse Error:', text);
            res.status(500).json({ error: 'Invalid JSON response from ModelScope API' });
        }
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 代理任务查询请求
app.get('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const authHeader = req.headers.authorization;
        
        const response = await fetch(`https://api-inference.modelscope.cn/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': authHeader,
                'X-ModelScope-Task-Type': 'image_generation'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Task query error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 图片代理端点，解决Canvas跨域问题
app.get('/api/proxy-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Missing image URL' });
        }

        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }

        // 设置CORS头和内容类型
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': response.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600'
        });

        // 将图片数据流式传输到客户端
        response.body.pipe(res);
    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 代理服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 静态文件服务: http://localhost:${PORT}/index.html`);
});
