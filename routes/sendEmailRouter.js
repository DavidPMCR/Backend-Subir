const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Cargar variables de entorno

const router = express.Router(); // Usar un router en vez de `app`

// Configurar Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, // Carga desde .env
    pass: process.env.EMAIL_PASS, // Carga desde .env
  },
});

router.post('/sendEmail/cita', async (req, res) => {
  const { email, reason } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmación de cita',
    text: `Motivo: ${reason}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error en Nodemailer:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});
//solicitud de recuperacion de contraseña
router.post('/sendEmail/resetPassword', async (req, res) => {
  const { email, reason } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Solicitud, cambio contraseña',
    text: `Motivo: ${reason}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error en Nodemailer:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});


//solicitud de crean de usuario
router.post('/sendEmail/createUser', async (req, res) => {
  const { email, reason } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Solicitud, Crear Usuario APP',
    text: `Motivo: ${reason}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error en Nodemailer:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

//solicitud de soporte
//solicitud de crean de usuario
router.post('/sendEmail/support', async (req, res) => {
  const { email, reason } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Solicitud, Solicitud de soporte APP',
    text: `Motivo: ${reason}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente.' });
  } catch (error) {
    console.error('Error en Nodemailer:', error);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});

module.exports = (app) => {
  app.use(router);
};
