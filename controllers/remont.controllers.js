const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir = './uploads/';

        if (file.mimetype.startsWith('image')) {
            uploadDir += 'images/';
        } else if (file.mimetype === 'application/pdf') {
            uploadDir += 'pdf/';
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.mimetype === 'application/msword') {
            uploadDir += 'doc/';
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.mimetype === 'application/vnd.ms-excel') {
            uploadDir += 'excel/';
        } else {
            uploadDir += 'documents/';
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const multerFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg|pdf|doc|docx|xls|xlsx)$/)) {
        return cb(new Error('Please upload an image or document'));
    }
    cb(null, true);
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadRemont = upload.fields([
    { name: 'repphoto', maxCount: 10 },
]);

exports.addRemont = async (req,res) => {
    try {
        const {
            okazrem
        } = req.body

        const photo = req.files['photo'] ? req.files['photo'].map(file => file.filename) : [];

        const addRemont = await db.query(
            '',
            []
        )
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

exports.naRemont = async (req,res) => {
    try {
        const { numcont } = req.body;
        const containerData = await db.query('SELECT * FROM svod WHERE numcont = $1', [numcont]);
        if (containerData.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                message: 'Контейнер не найден'
            });
        }

        const container = containerData.rows[0];

        const addToSvod = await db.query(
            'INSERT INTO svodremont (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
            [
                container.country, container.city, container.terminal, container.stock, container.numcont, 
                container.photo, container.yom, container.tip, container.sost, container.sebes, 
                container.podryad, container.dataprih, null, null, container.statusopl
            ]
        );

        const addToRemont = await db.query(
            'INSERT INTO remont (numcont,city,terminal,tip,photo,sost,okazrem,repphoto) values ($1,$2,$3,$4,$5,$6,$7,$8)',
            [container.numcont, container.city, container.terminal, container.tip,container.photo, container.sost, null, null]
        )

        await db.query('DELETE FROM svod WHERE numcont = $1', [numcont]);

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер отправлен на ремонт',
            data: addToSvod.rows[0]
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

exports.listRemont = async (req,res) => {
    try {
        const listRemont = await db.query (
            'SELECT numcont FROM svod'
        )

        res.json(listRemont.rows)
        
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }

}

exports.fromRemont = async (req,res) => {
    try {
        const listRemont = await db.query (
            'SELECT numcont FROM svodremont'
        )

        res.json(listRemont.rows)
        
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }

}

exports.update = async (req, res) => {
    const { numcont, okazrem } = req.body;
    const repphoto = req.files['repphoto'] ? req.files['repphoto'].map(file => file.filename) : [];

    console.log('Received update request:', { numcont, okazrem, repphoto });

    try {
        // Check if the container exists in svodremont
        const containerData = await db.query('SELECT * FROM svodremont WHERE numcont = $1', [numcont]);
        if (containerData.rows.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                message: 'Контейнер не найден в svodremont'
            });
        }

        const container = containerData.rows[0];

        await db.query(
            'INSERT INTO svod (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
            [
                container.country, container.city, container.terminal, container.stock, container.numcont, 
                JSON.stringify(repphoto), container.yom, container.tip, container.sost, container.sebes, 
                container.podryad, container.dataprih, container.bron, container.bronprih, container.statusopl
            ]
        );

        await db.query('UPDATE kpclients SET photo = $1 WHERE numcont = $2', [JSON.stringify(repphoto), numcont])

        await db.query(
            'UPDATE remont SET okazrem = $1, repphoto = $2 WHERE numcont = $3',
            [okazrem, JSON.stringify(repphoto), numcont]
        );

        await db.query('DELETE FROM svodremont WHERE numcont = $1', [numcont]);

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер успешно обновлен и перенесен обратно в svod'
        });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при обновлении данных',
            error: error.message
        });
    }
}



exports.remont = async (req,res) => {
    try {
        const Remont = await db.query (
            'SELECT * FROM remont'
        )

        res.json(Remont.rows)
        
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }

}


exports.editRemont = async (req, res) => {
    try {
      const { rowData } = req.body;
      const {
        id: rowNumber, // Extracting the id from rowData as rowNumber
        country, city, terminal, stock, adress, mail, phone, worktime, mechvid, prr20dc, prr40hc,
        storppr20, storprr40, accs // Adjust the column names if necessary
      } = rowData;
  
      const photo = rowData.photo ? JSON.stringify(rowData.photo) : '[]';
  
      console.log('Updating row:', rowNumber);
      console.log('With data:', rowData);
  
      const editRemont = await db.query(
        `UPDATE terminal 
         SET country = $1, city = $2, terminal = $3, stock = $4, adress = $5, mail = $6, phone = $7, worktime = $8, mechvid = $9, prr20dc = $10, prr40hc = $11, storppr20 = $12, storprr40 = $13, photo = $14, accs = $15 
         WHERE id = $16 
         RETURNING *`,
        [country, city, terminal, stock, adress, mail, phone, worktime, mechvid, prr20dc, prr40hc,
            storppr20, storprr40, photo, accs, rowNumber]
      );
  
      if (editRemont.rows.length === 0) {
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
        data: editRemont.rows[0]
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
  