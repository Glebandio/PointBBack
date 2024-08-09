const express = require('express');
const router = express.Router();
const terminalController = require('../controllers/terminal.controllers');

router.post('/api/terminal', terminalController.uploadTerminal, terminalController.addTerminal);
router.get('/api/terminals', terminalController.getTerminals);
router.get('/api/terminalsforzakup', terminalController.getTerminalsForZakup)
router.get('/uploads/images/:filename', terminalController.downloadDocumentPhoto);
router.post('/api/editTerminal', terminalController.editTerminal)

module.exports = router;
