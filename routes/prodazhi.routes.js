const express = require('express');
const router = express.Router();
const ProdazhiCont = require('../controllers/prodazhi.controller')

router.get('/api/prodazhi', ProdazhiCont.getProdazhi)
router.get('/api/getconts', ProdazhiCont.getConts)
router.post('/api/prodazhi', ProdazhiCont.postProdazh)

module.exports = router;