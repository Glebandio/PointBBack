const express = require('express');
const path = require('path');
const router = express.Router();
const KPpartn = require('../controllers/kppartn.controller');

router.post('/api/postfolder', KPpartn.postfolder);
router.get('/api/getfolder', KPpartn.getFolder);
router.get('/api/getdoc', KPpartn.getDoc);
router.post('/api/upload', KPpartn.upload.single('file'), KPpartn.uploadKppart);

// Route for serving files and forcing download
router.get('/uploads/:type/:file', (req, res) => {
    const { type, file } = req.params;
    const decodedFile = decodeURIComponent(file); // Decode URL encoded filenames
    const filePath = path.join(__dirname, '../uploads', type, decodedFile);

    res.download(filePath, decodedFile, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('File not found or unable to download');
        }
    });
});

module.exports = router;
