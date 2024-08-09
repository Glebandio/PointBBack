const db = require('../db');

exports.getKpc = async (req,res) => {
    try {
        const getKpc = await db.query('SELECT * FROM kpclients')
        res.json(getKpc.rows)
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при получении данных',
            error: error.message
        });
    }
}