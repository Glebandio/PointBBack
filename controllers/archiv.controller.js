const db = require('../db');


exports.addArchiv = async (req,res) => {
    try {
        const {
            country,
            city,
            terminal,
            stock,
            numcont,
            photo,
            yom,
            tip,
            sost,
            sebes,
            podryad,
            dataprih,
            bron,
            statusopl
        } = req.body
        const addArchiv = await db.query(
            'INSERT INTO archiv (country, city, terminal,stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, statusopl) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
            [country,city,terminal,stock,numcont,photo,yom,tip,sost,sebes,podryad,dataprih,bron,statusopl]
        )
        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Подрядчик добавлен успешно',
            data: addArchiv.rows[0]
        });
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

exports.allArchiv = async (req,res) => {
    try {
        const allArchiv = await db.query (
            'SELECT * FROM archiv'
        )

        res.json(allArchiv.rows)
        
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

exports.listArchiv = async (req,res) => {
    try {
        const listArchiv = await db.query (
            'SELECT numcont FROM archiv'
        )

        res.json(listArchiv.rows)
        
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

exports.returnContainer = async (req, res) => {
    try {
        const { numcont } = req.body;
        const containerData = await db.query('SELECT * FROM archiv WHERE numcont = $1', [numcont]);
        if (containerData.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                message: 'Контейнер не найден'
            });
        }

        const container = containerData.rows[0];

        const addToSvod = await db.query(
            'INSERT INTO svod (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
            [
                container.country, container.city, container.terminal, container.stock, container.numcont, 
                container.photo, container.yom, container.tip, container.sost, container.sebes, 
                container.podryad, container.dataprih, container.bron, null, container.statusopl
            ]
        );

        await db.query('DELETE FROM archiv WHERE numcont = $1', [numcont]);


        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер успешно возвращен',
            data: addToSvod.rows[0]
        });
    } catch (error) {
        console.error('Error returning container:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при возвращении контейнера',
            error: error.message
        });
    }
}


exports.editArchiv = async (req, res) => {
    try {
      const { rowData } = req.body;
      const {
        id: rowNumber, // Extracting the id from rowData as rowNumber
        country, city, terminal, stock, numcont, yom, tip, sost, sebes, podryad, dataprih,
        bron, statusopl // Adjust the column names if necessary
      } = rowData;
  
      const photo = rowData.photo ? JSON.stringify(rowData.photo) : '[]';
  
      console.log('Updating row:', rowNumber);
      console.log('With data:', rowData);
  
      const editArchiv = await db.query(
        `UPDATE archiv 
         SET country = $1, city = $2, terminal = $3, stock = $4, numcont = $5, photo = $6, yom = $7, tip = $8, sost = $9, sebes = $10, podryad = $11, dataprih = $12, bron = $13 , statusopl = $14
         WHERE id = $15 
         RETURNING *`,
        [country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, statusopl, rowNumber]
      );
  
      if (editArchiv.rows.length === 0) {
        return res.status(404).json({
          statusCode: 404,
          status: false,
          message: 'Контейнер не найден',
        });
      }
  
      res.status(200).json({
        statusCode: 200,
        status: true,
        message: 'Контейнер обновлен успешно',
        data: editArchiv.rows[0]
      });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({
        statusCode: 500,
        status: false,
        message: 'Произошла ошибка при обновлении контейнера',
        error: error.message
      });
    }
  };
  