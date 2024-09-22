const express = require('express');
const router = express.Router();
const ProdazhiCont = require('../controllers/prodazhi.controller')

router.get('/api/prodazhi', ProdazhiCont.getProdazhi)
router.get('/api/getconts', ProdazhiCont.getConts)
router.post('/api/prodazhi', ProdazhiCont.postProdazh)
router.post('/api/editProdazhi', ProdazhiCont.editProdazhi)
router.post('/api/info', ProdazhiCont.getInfo)
router.post('/api/editinfo', ProdazhiCont.editInfo)

module.exports = router;