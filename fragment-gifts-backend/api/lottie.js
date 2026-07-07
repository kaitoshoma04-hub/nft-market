const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Настройки CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Обработка preflight запросов
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Получаем ID из URL: /api/lottie/artisan-bricks-1234
        const id = req.query.id || req.url.split('/').pop();
        
        if (!id) {
            return res.status(400).json({ 
                error: 'Missing Lottie ID',
                message: 'Please provide a Lottie ID' 
            });
        }

        console.log(`Fetching Lottie: ${id}`);
        
        // Запрос к Fragment
        const url = `https://nft.fragment.com/gift/${id}.lottie.json`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; FragmentGifts/1.0)'
            }
        });

        if (!response.ok) {
            console.error(`Fragment returned ${response.status} for ${id}`);
            return res.status(response.status).json({ 
                error: 'Failed to fetch from Fragment',
                status: response.status,
                id: id
            });
        }

        const data = await response.json();
        
        // Добавляем кеширование на 1 час
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Error in Lottie proxy:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
};
