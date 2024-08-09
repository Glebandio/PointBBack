const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ParserContr = require('../controllers/parser.controller');

// Настройка хранения загруженных файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/api/parserZakup', upload.single('file'), ParserContr.parseAndSave);

module.exports = router;
