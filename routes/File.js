const express = require('express');
const { upload } = require('../middleware/upload.js');
const { uploadFile, getUploadedDatabases, getFileById } = require('../controllers/File.js'); // Ajout de la fonction getFileById
const auth = require('../middleware/auth.js');

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadFile);
router.get('/databases', auth, getUploadedDatabases);
router.get('/file/:id', getFileById); // Ajout de la route pour récupérer le fichier par ID

module.exports = router;
