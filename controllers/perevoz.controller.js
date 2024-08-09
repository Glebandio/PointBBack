const db = require('../db');

exports.getPerevoz = async (req,res) =>{
    try {
        const getPerevoz = await db.query(
            'SELECT id, podryad, date, kolvo, cityA, terminalA, stockA, cityB, terminalB, stockB, price, statusopl, manager FROM perevoz'
        )
        res.json(getPerevoz.rows)
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


exports.getTerm = async (req,res) =>{
    try {
        const getTerm = await db.query(
            'SELECT city, terminal, stock FROM terminal'
        )
        res.json(getTerm.rows)
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

exports.PerevPodr = async (req,res) => {
    try {
        const PerevPodr = await db.query(
            'SELECT namecontr FROM podryad'
        )
        res.json(PerevPodr.rows)
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

exports.PerevozCont = async (req,res) => {
    try {
        const PerevozCont = await db.query(
            'SELECT numcont FROM svod'
        )
        res.json(PerevozCont.rows)
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

exports.PerevozAdd = async (req, res) => {
    try {
        
        const { podryad, date, kolvo, citya, terminala, stocka, cityb, terminalb, stockb, count, price, statusopl, manager, stavkasnp, kolvodays, numcont, tip } = req.body;

const totalPrice = count + price; // Используем другое имя переменной

const PerevozAdd = await db.query(
    `INSERT INTO perevoz (podryad, date, kolvo, citya, terminala, stocka, cityb, terminalb, stockb, price, statusopl, manager, stavkasnp, kolvodays, numcont, tip)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
        podryad,
        date,
        kolvo,
        citya,
        terminala,
        stocka,
        cityb,
        terminalb,
        stockb,
        totalPrice,
        statusopl,
        manager,
        stavkasnp,
        kolvodays,
        numcont,
        tip
    ]
);

          

        const containerData = await db.query('SELECT * FROM svod WHERE numcont = $1', [numcont]);
        if (containerData.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                message: 'Контейнер не найден'
            });
        }
        const container = containerData.rows[0];

        const addToArchiv = await db.query(
            'INSERT INTO svodperevoz (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
            [
                container.country, container.city, container.terminal, container.stock, container.numcont, 
                container.photo, container.yom, container.tip, container.sost, container.sebes, 
                container.podryad, container.dataprih, container.bron, null, container.statusopl
            ]
        );

        await db.query('DELETE FROM svod WHERE numcont = $1', [numcont]);

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер добавлен успешно',
            data: {zakup: PerevozAdd.rows[0],
                   svod: containerData.rows[0],
                   kpclients: addToArchiv.rows[0]
                }
        });

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

exports.getContsEnd = async (req,res) => {
    try {
        const PerevozCont = await db.query(
            'SELECT numcont FROM perevoz'
        )
        res.json(PerevozCont.rows)
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

exports.editPerevoz = async (req, res) => {
    try {
      const { rowData } = req.body;
      const {
        id: rowNumber, 
        podryad, date, kolvo, citya, terminala, stocka, cityb, terminalb, stockb, price, statusopl, manager, stavkasnp, kolvodays, numcont, tip
      } = rowData;
  
    //   const photo = rowData.photo ? JSON.stringify(rowData.photo) : '[]';
  
      console.log('Updating row:', rowNumber);
      console.log('With data:', rowData);
  
      const editPerevoz = await db.query(
        `UPDATE perevoz 
         SET podryad = $1, date = $2, kolvo = $3, citya = $4, terminala = $5, stocka = $6, cityb = $7, terminalb = $8, stockb = $9, price = $10, statusopl = $11, manager = $12, stavkasnp = $13, kolvodays = $14, numcont = $15, tip = $16
         WHERE id = $17 
         RETURNING *`,
        [podryad, date, kolvo, citya, terminala, stocka, cityb, terminalb, stockb, price, statusopl, manager, stavkasnp, kolvodays, numcont, tip, rowNumber]
      );
  
      if (editPerevoz.rows.length === 0) {
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
        data: editPerevoz.rows[0]
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
  