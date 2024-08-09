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

exports.uploadZakup = upload.fields([
    { name: 'photo', maxCount: 10 },
    { name: 'gtd', maxCount: 1 }
]);

exports.addZakup = async (req, res) => {
    try {
        const {
            country, city, terminal, stock, numcont, tip, yom, sost, vidras, costzak, nds, podryad, dataprih,
            statusopl, termhran, rprcon, prr, izder, comm, maneger, sebes
        } = req.body;

        const photo = req.files['photo'] ? req.files['photo'].map(file => file.filename) : [];
        const gtd = req.files['gtd'] ? req.files['gtd'][0].filename : null;

        const addZakup = await db.query(
            `INSERT INTO zakup (country, city, terminal, stock, numcont, tip, photo, yom, sost, vidras, costzak, nds, gtd, podryad, dataprih, statusopl, termhran, rprcon, prr, izder, comm, maneger) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
             RETURNING *`,
            [country, city, terminal, stock, numcont, tip, JSON.stringify(photo), yom, sost, vidras, costzak, nds, gtd, podryad, dataprih, statusopl, termhran, rprcon, prr, izder, comm, maneger]
        );

        const addSvod = await db.query(
            'INSERT INTO svod (country, city, terminal, stock, numcont, photo, yom, tip, sost, sebes, podryad, dataprih, bron, bronprih, statusopl) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *',
            [country,city,terminal, stock, numcont, JSON.stringify(photo), yom, tip, sost, sebes, podryad, dataprih, null, null, statusopl]
        )

        const addKpClients = await db.query(
            'INSERT INTO kpclients (country, city, terminal, numcont, photo, yom, tip, score) values ($1,$2,$3,$4,$5,$6,$7,$8)',
            [country, city, terminal, numcont, JSON.stringify(photo), yom, tip, null]
        )

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Контейнер добавлен успешно',
            data: {zakup: addZakup.rows[0],
                   svod: addSvod.rows[0],
                   kpclients: addKpClients.rows[0]
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
};

exports.getZakups = async (req, res) => {
    try {
        const getZakups = await db.query('SELECT * FROM zakup');
        res.json(getZakups.rows);
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
