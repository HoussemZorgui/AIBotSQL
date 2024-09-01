const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the destination directory outside the middleware function
const destinationDir = path.join(process.cwd(), 'assets');

// Ensure the destination directory exists
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true }); // Create the directory recursively
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationDir); // Use the predefined destination directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const newFileName = uniqueSuffix + fileExtension;
    cb(null, newFileName); // Add a unique filename
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      'xls', 'xlsx', 'mdb', 'sqlite', 'sql', 'json', 'csv',
      'dump', 'mongodb', 'json-db', 'xml-db'
    ];

    // Extract the file extension
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    console.log('Destination Directory:', destinationDir);//to check from the saved destination
    // Check if the file extension is in the allowed list
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true); // Allow the file
    } else {
      cb(new Error('Only database files are allowed'), false); 
    }
  }
});

module.exports = { upload, destinationDir };