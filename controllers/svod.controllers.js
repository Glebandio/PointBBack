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

exports.uploadSvod = upload.fields([
    { name: 'photo', maxCount: 10 },
]);

exports.addSvod = async (req, res) => {
    try {
        const {
            country, city, terminal, stock, numcont, yom, tip, sost, sebes, podryad, dataprih,
            bron, bronprih, stat
        } = req.body;

        const photo = req.files['photo'] ? req.files['photo'].map(file => file.filename) : [];

        const addSvod = await db.query(
            `INSERT INTO svod (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, stat) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
             RETURNING *`,
            [country, city, terminal, stock, numcont, JSON.stringify(photo), yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, stat]
        );

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер добавлен успешно',
            data: addSvod.rows[0]
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
};

exports.getSvod = async (req, res) => {
    try {
        const getSvod = await db.query('SELECT * FROM svod');
        res.json(getSvod.rows);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при получении данных',
            error: error.message
        });
    }
};

exports.downloadDocumentPhoto = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'images', filename);
    console.log(`Trying to access file: ${filePath}`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            return res.status(404).end("File not found");
        }

        res.sendFile(filePath);
    });
};

exports.downloadDocument = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', () => {
        res.status(404).end("File not found");
    });

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/octet-stream');

    fileStream.pipe(res);
};

exports.editSvod = async (req, res) => {
    try {
      const { rowData } = req.body;
      const {
        id: rowNumber, // Extracting the id from rowData as rowNumber
        country, city, terminal, stock, numcont, yom, tip, sost, sebes, podryad, dataprih,
        bron, bronprih, statusopl // Adjust the column names if necessary
      } = rowData;
  
      const photo = rowData.photo ? JSON.stringify(rowData.photo) : '[]';
  
      console.log('Updating row:', rowNumber);
      console.log('With data:', rowData);
  
      const editSvod = await db.query(
        `UPDATE svod 
         SET country = $1, city = $2, terminal = $3, stock = $4, numcont = $5, photo = $6, yom = $7, tip = $8, sost = $9, sebes = $10, podryad = $11, dataprih = $12, bron = $13, bronprih = $14, statusopl = $15 
         WHERE id = $16 
         RETURNING *`,
        [country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl, rowNumber]
      );
  
      if (editSvod.rows.length === 0) {
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
        data: editSvod.rows[0]
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
  