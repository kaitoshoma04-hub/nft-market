// api/lottie.js
module.exports = async (req, res) => {
    // 🔥 Настройка CORS - разрешаем все запросы
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Обработка preflight (OPTIONS) запросов
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Получаем ID из разных частей запроса
        let id = req.query.id;
        if (!id) {
            // Если ID в пути: /api/lottie/artisan-bricks-1234
            const pathParts = req.url.split('/');
            id = pathParts[pathParts.length - 1];
            // Удаляем параметры запроса если есть
            if (id.includes('?')) {
                id = id.split('?')[0];
            }
        }

        if (!id) {
            return res.status(400).json({ 
                error: 'Missing Lottie ID',
                message: 'Please provide a Lottie ID'
            });
        }

        console.log(`📥 Fetching Lottie: ${id}`);

        // Запрос к Fragment
        const url = `https://nft.fragment.com/gift/${id}.lottie.json`;
        
        // Используем fetch с правильными заголовками
        const fetch = require('node-fetch');
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; FragmentGifts/1.0)',
                'Origin': 'https://nft.fragment.com',
                'Referer': 'https://nft.fragment.com/'
            }
        });

        if (!response.ok) {
            console.error(`❌ Fragment returned ${response.status} for ${id}`);
            return res.status(response.status).json({ 
                error: 'Failed to fetch from Fragment',
                status: response.status,
                id: id
            });
        }

        const data = await response.json();
        
        // Кешируем на 1 час
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).json(data);
        
    } catch (error) {
        console.error('❌ Error in Lottie proxy:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
