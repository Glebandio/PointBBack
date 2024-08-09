const express = require ('express');
const router = express.Router();
const ArchivController = require('../controllers/archiv.controller');


router.post('/api/archiv', ArchivController.addArchiv);
router.get('/api/archiv', ArchivController.allArchiv);
router.get('/api/archivmodal', ArchivController.listArchiv);
router.post('/api/archivmodal/return', ArchivController.returnContainer);
router.post('/api/editArchiv', ArchivController.editArchiv)


module.exports = router;