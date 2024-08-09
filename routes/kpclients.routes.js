const express = require ('express');
const router = express.Router();
const kpc = require('../controllers/kpclients.controller')

router.get('/api/getkpc', kpc.getKpc)

module.exports = router;