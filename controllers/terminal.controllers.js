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

exports.uploadTerminal = upload.fields([
    { name: 'photo', maxCount: 10 },
]);

exports.addTerminal = async (req, res) => {
    try {
        const { country, city, terminal, stock, adress, mail, phone, worktime, mechvid, prr20dc, prr40hc, storppr20, storprr40, accs } = req.body;
        const photos = req.files['photo'].map(file => file.filename);

        const addTerm = await db.query(
            `INSERT INTO terminal (country, city, terminal, stock, adress, mail, phone, worktime, mechvid, prr20dc, prr40hc, storppr20, storprr40, photo, accs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [country, city, terminal, stock, adress, mail, phone, worktime, mechvid, prr20dc, prr40hc, storppr20, storprr40, JSON.stringify(photos), accs]
        );

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Терминал добавлен успешно',
            data: addTerm.rows[0]
        });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: 'Произошла ошибка при добавлении терминала',
            error: error.message
        });
    }
};


exports.getTerminalsForZakup = async (req,res) =>{
    try {
        const query = `
            SELECT country, city, terminal, stock, prr20dc, prr40hc, storppr20, storprr40 
            FROM terminal 
        `;


        const { rows } = await db.query(query);

        res.status(200).json({
            statusCode: 200,
            status: true,
            data: rows
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

exports.getTerminals = async (req, res) => {
    try {
        const getTerms = await db.query('SELECT * FROM terminal');
        res.json(getTerms.rows);
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
  const filePath = path.join(__dirname, '..', 'uploads', 'images', filename); // Путь к папке с фотографиями

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
    const filePath = path.join(__dirname, '..', 'uploads', filename); // Путь к вашей папке с файлами
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', () => {
        res.status(404).end("File not found");
    });

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/octet-stream');

    fileStream.pipe(res);
};
