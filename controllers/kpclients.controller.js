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

exports.editKpClients = async (req, res) => {
    try {
      const { rowData } = req.body;
      const {
        id: rowNumber, // Extracting the id from rowData as rowNumber
        country, city, terminal, numcont, yom, tip, score
      } = rowData;
  
      const photo = rowData.photo ? JSON.stringify(rowData.photo) : '[]';
  
      console.log('Updating row:', rowNumber);
      console.log('With data:', rowData);
  
      const editKpClients = await db.query(
        `UPDATE kpclients 
         SET country = $1, city = $2, terminal = $3, numcont = $4, photo = $5, yom = $6, tip = $7, score = $8
         WHERE id = $9
         RETURNING *`,
        [country, city, terminal, numcont, photo, yom, tip, score, rowNumber]
      );
  
      if (editKpClients.rows.length === 0) {
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
        data: editKpClients.rows[0]
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
  