const express = require('express');
const router = express.Router();
const svodController = require('../controllers/svod.controllers');

router.post('/api/svod', svodController.uploadSvod, svodController.addSvod);

router.get('/api/svod', svodController.getSvod);

router.get('/api/download/:filename', svodController.downloadDocument);

router.post('/api/editSvod', svodController.editSvod)

module.exports = router;
