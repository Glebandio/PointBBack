const db = require('../db');

exports.getProdazhi = async (req,res) => {
    try {
        
        const getProdazhi = await db.query(
            'SELECT id, klient, datas, status, stoimost, marzha, vid, nds, kolvo, city, manager FROM prodazhi'
        );

        res.json(getProdazhi.rows);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при добавлении подрядчика',
            error: error.message
        });
    }
};

exports.getConts = async (req,res) => {
    try {
        
        const getProdazhi = await db.query(
            'SELECT numcont, sebes, city FROM svod'
        );

        res.json(getProdazhi.rows);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при добавлении подрядчика',
            error: error.message
        });
    }
}

exports.postProdazh = async (req,res) => {
    try {
        const {
            klient, datas, status, marzha, stoimost, vid, nds, kolvo, city, manager, containers
        } = req.body;

        const addProdazhi = await db.query(
            `INSERT INTO prodazhi (klient, datas, status, stoimost, marzha, vid, nds, kolvo, city, manager, containers)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [klient, datas, status, marzha, stoimost, vid, nds, kolvo, city, manager, containers]
        );
        const containerData = await db.query('SELECT * FROM svod WHERE numcont = $1', [containers]);
        if (containerData.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                message: 'Контейнер не найден'
            });
        }

        const container = containerData.rows[0];

        const addToArchiv = await db.query(
            'INSERT INTO archiv (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, statusopl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
            [
                container.country, container.city, container.terminal, container.stock, container.numcont, 
                container.photo, container.yom, container.tip, container.sost, container.sebes, 
                container.podryad, container.dataprih, container.bron, container.statusopl
            ]
        );

        await db.query('DELETE FROM svod WHERE numcont = $1', [containers]);

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер добавлен успешно',
            data: {zakup: addProdazhi.rows[0],
                   svod: addToArchiv.rows[0],
                   kpclients: addToArchiv.rows[0]
                }
        });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при добавлении контейнера',
            error: error.message
        });
    }
}