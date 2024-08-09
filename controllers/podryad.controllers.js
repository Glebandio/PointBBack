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

exports.upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.addPodryad = async (req, res) => {
    try {
        const { namecontr, inn } = req.body;
        const files = req.files.map(file => file.filename);

        const addPodr = await db.query(
            `INSERT INTO podryad (namecontr, inn, soprdocs) VALUES ($1, $2, $3) RETURNING *`,
            [namecontr, inn, files]
        );

        res.status(200).json({
            statusCode: 200,
            status: true,
            message: 'Подрядчик добавлен успешно',
            data: addPodr.rows[0]
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
};

exports.getForZakup = async(req,res) => {
    try {
        const getPodr = await db.query('SELECT namecontr FROM podryad');
        res.json(getPodr.rows);
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

exports.getPodryad = async (req, res) => {
    try {
        const getPodr = await db.query('SELECT * FROM podryad');
        res.json(getPodr.rows);
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

exports.downloadDocument = (req, res) => {
    const filename = req.params.filename;
    let filePath = path.join(__dirname, '..', 'uploads');

    if (filename.match(/\.(png|jpg|jpeg)$/)) {
        filePath = path.join(filePath, 'images', filename);
    } else if (filename.match(/\.pdf$/)) {
        filePath = path.join(filePath, 'pdf', filename);
    } else if (filename.match(/\.(doc|docx)$/)) {
        filePath = path.join(filePath, 'doc', filename);
    } else if (filename.match(/\.(xls|xlsx)$/)) {
        filePath = path.join(filePath, 'excel', filename);
    } else {
        filePath = path.join(filePath, 'documents', filename);
    }

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (error) => {
        console.error('FileStream error:', error);
        res.status(404).end("File not found");
    });

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/octet-stream');

    fileStream.pipe(res);
};
