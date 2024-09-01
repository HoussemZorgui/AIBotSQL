const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

// Variable pour stocker le processus Python en cours d'exécution
let pythonProcess;

// Route POST pour exécuter le script Python avec l'ID du fichier comme argument
router.post("/execute-python-script/:fileId", (req, res) => {
    const fileId = req.params.fileId;
    const command = `python chatwithdata.py ${fileId}`;

    // S'il y a déjà un processus en cours d'exécution, le tuer
    if (pythonProcess) {
        pythonProcess.kill();
    }

    // Exécuter le script Python
    pythonProcess = spawn('python', ['chatwithdata.py', fileId]);

    // Gérer les événements de sortie du processus Python
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Le processus Python s'est terminé avec le code ${code}`);
    });

    // Renvoyer une réponse immédiate à Postman
    res.status(200).json({ message: 'Le script Python est en cours d\'exécution' });
});

module.exports = router;
