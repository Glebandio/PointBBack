const express = require('express');
const router = express.Router();
const remontController = require('../controllers/remont.controllers');

router.post('/api/sremont', remontController.uploadRemont, remontController.addRemont);
router.post('/api/naremont', remontController.naRemont)
router.get('/api/naremont', remontController.listRemont)
router.get('/api/remont', remontController.remont)
router.get('/api/sremont', remontController.fromRemont)
router.post('/api/fromremont',remontController.uploadRemont, remontController.update);


module.exports = router;
