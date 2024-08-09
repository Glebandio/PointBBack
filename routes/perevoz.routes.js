const express = require ('express');
const router = express.Router();
const Perevoz = require('../controllers/perevoz.controller');

router.get('/api/perevoz', Perevoz.getPerevoz)
router.get('/api/getterm', Perevoz.getTerm)
router.get('/api/perevpodr', Perevoz.PerevPodr)
router.get('/api/perevozcont', Perevoz.PerevozCont)
router.post('/api/perevozadd', Perevoz.PerevozAdd)
router.get('/api/perevozendcont', Perevoz.getContsEnd)

module.exports = router;