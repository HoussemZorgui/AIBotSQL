const File = require('../models/File.js');
const fs = require('fs');
const path = require('path');

// Import the upload middleware and its destinationDir
const { upload, destinationDir } = require('../middleware/upload.js');

const uploadFile = async (req, res) => {
  try {
    console.log('Starting file upload...');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, mimetype, path: filePath } = req.file; // Rename 'path' to 'filePath' to avoid conflict

    const newFilePath = path.join(destinationDir, originalname); // New file path

    // Check if the file already exists
    if (fs.existsSync(newFilePath)) {
      fs.unlinkSync(filePath);
      console.log('File with the same name already exists');
      return res.status(400).json({ message: 'File with the same name already exists' });
    }

    // Move the uploaded file to the new file path
    fs.renameSync(filePath, newFilePath);

    const newFile = new File({
      filename: originalname,
      contentType: mimetype,
      data: newFilePath,
      uploadedBy: req.user 
    });

    await newFile.save();

    console.log('File uploaded successfully');

    res.status(201).json({ 
      message: 'File uploaded successfully',
      filename: originalname,
      contentType: mimetype,
      createdAt: newFile.createdAt,
      uploadedBy: newFile.uploadedBy.name
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUploadedDatabases = async (req, res) => {
  try {
    console.log('Fetching uploaded databases...');
    const userId = req.user._id;
    console.log('User ID:', userId);
    // Fetch databases uploaded by the authenticated user
    const uploadedDatabases = await File.find({ uploadedBy: userId }).populate('uploadedBy', 'name');
    
    console.log('Uploaded databases fetched:', uploadedDatabases);
    
    res.status(200).json(uploadedDatabases);
  } catch (error) {
    console.error('Error fetching uploaded databases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFileById = async (req, res) => {
  try {
    const fileId = req.params.id; // Récupérer l'ID du fichier depuis les paramètres de la requête

    // Rechercher le fichier dans la base de données par son ID
    const file = await File.findById(fileId);

    if (!file) {
      console.log('File not found');
      return res.status(404).json({ error: 'File not found' });
    }

    // Construire le chemin complet du fichier dans le dossier "assets"
    const filePath = path.join(__dirname, '../assets', file.filename);

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      console.log('File not found in assets folder');
      return res.status(404).json({ error: 'File not found in assets folder' });
    }

    // Si le fichier existe, renvoyer son chemin
    console.log('File path:', filePath);
    res.status(200).json({ filePath });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { uploadFile, getUploadedDatabases, getFileById };
