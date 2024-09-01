const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Ces ID et secrets doivent provenir du fichier .env.
const CLIENT_ID = '1070820564642-oig2tobgkkbofp218jrtoeqjs8rt5mn8.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04rH91d9WKQB1CgYIARAAGAQSNwF-L9Ir6U7CSCV4CGO3wgyVMfkFdEXfGzbV9g6xVe6hZjK-w67GAUwby2SD-VDPNpzE43jpr-I';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(name, email, activationCode, password) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'houssemzorgui10@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });


    const mailTemplate = `



    
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activation du compte</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1, h2, p {
      margin: 0 0 20px;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Activation du compte</h1>
    <h2>Bonjour ${name}</h2>
    <p>Veuillez confirmer votre email en cliquant sur le lien suivant :</p>
    <a href="http://localhost:58016/">Cliquez ici</a>
    <ul>
      <li><strong>Votre nom d'utilisateur :</strong> ${name}</li>
      <li><strong>Votre mot de passe :</strong> ${password}</li>
      <li><strong>Votre Activation Code :</strong> ${activationCode}</li>
    </ul>
  </div>
</body>
</html>



`;

    const mailOptions = {
      from: 'ChatDb <Houssemzorgui10@gmail.com>',
      to: 'houssem.zorgui@esprit.tn',
      subject: 'Hello from ChatDb',
      text: `Hello ${name}, please confirm your email by clicking the following link: http://localhost:56736/`,
      html:mailTemplate,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

module.exports = { sendMail };
