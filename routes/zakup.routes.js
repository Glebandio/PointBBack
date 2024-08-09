const express = require('express');
const router = express.Router();
const zakupController = require('../controllers/zakup.controllers');

router.post('/api/zakup', zakupController.uploadZakup, zakupController.addZakup);
router.get('/api/zakup', zakupController.getZakups);
router.get('/uploads/images/:filename', zakupController.downloadDocumentPhoto);
router.post('/api/editZakup', zakupController.editZakup)

module.exports = router;