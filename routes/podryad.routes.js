const express = require('express');
const router = express.Router();
const podryadController = require('../controllers/podryad.controllers');
const upload = podryadController.upload.array('soprdocs', 10);

router.post('/api/Podryad', upload, podryadController.addPodryad);
router.get('/api/Podryad', podryadController.getPodryad);
router.get('/api/download/:filename', podryadController.downloadDocument);
router.get('/api/forzakup', podryadController.getForZakup )

module.exports = router;
