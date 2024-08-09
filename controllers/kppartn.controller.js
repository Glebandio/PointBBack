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

exports.upload = upload;

exports.uploadKppart = async (req, res) => {
    try {
        const folder = req.body.folder;
        const file = req.file;

        if (!folder || !file) {
            return res.status(400).json({ message: 'Folder and file are required' });
        }

        const addDoc = await db.query(
            'INSERT INTO kppart (folder, doc) VALUES ($1, $2) RETURNING *',
            [folder, file.path]
        );

        res.json(addDoc.rows[0]);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }
};

exports.getFolder = async (req, res) => {
    try {
        const getFolder = await db.query(
            'SELECT folder FROM folders'
        );
        res.json(getFolder.rows);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }
};

exports.getDoc = async (req, res) => {
    try {
        const { folder } = req.query;
        const getdoc = await db.query(
            'SELECT doc FROM kppart WHERE folder = $1',
            [folder]
        );

        res.json(getdoc.rows);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }
};

exports.postfolder = async (req, res) => {
    try {
        const { folder } = req.body;
        const addfolder = await db.query(
            'INSERT INTO folders (folder) VALUES ($1) RETURNING *',
            [folder]
        );
        res.json(addfolder.rows[0]);
    } catch (error) {
        console.error('Error inserting folder:', error);
        res.status(500).json({
            statusCode: 500,
            status: false,
            message: '',
            error: error.message
        });
    }
};
