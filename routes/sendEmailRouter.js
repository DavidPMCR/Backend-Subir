const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// Configurar Nodemailer con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Carga desde .env
        pass: process.env.EMAIL_PASS, // Carga desde .env
    },
});

/**
 * 📌 Función genérica para enviar correos
 * @param {string} email - Correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} reason - Cuerpo del correo
 */
const sendEmail = async (email, subject, reason) => {
    if (!email || !reason) {
        throw new Error("Email y motivo son requeridos.");
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: `Motivo: ${reason}`,
    };

    return transporter.sendMail(mailOptions);
};

// 📌 Ruta para confirmar cita
router.post('/sendEmail/cita', async (req, res) => {
    try {
        const { email, reason } = req.body;
        await sendEmail(email, 'Confirmación de cita', reason);
        res.status(200).json({ message: 'Correo de confirmación de cita enviado correctamente.' });
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 📌 Ruta para recuperación de contraseña
router.post('/sendEmail/resetPassword', async (req, res) => {
    try {
        const { email, reason } = req.body;
        await sendEmail(email, 'Solicitud de cambio de contraseña', reason);
        res.status(200).json({ message: 'Correo de recuperación de contraseña enviado correctamente.' });
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 📌 Ruta para solicitud de creación de usuario
router.post('/sendEmail/createUser', async (req, res) => {
    try {
        const { email, reason } = req.body;
        await sendEmail(email, 'Solicitud de creación de usuario en la APP', reason);
        res.status(200).json({ message: 'Correo de solicitud de usuario enviado correctamente.' });
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 📌 Ruta para solicitud de soporte
router.post('/sendEmail/support', async (req, res) => {
    try {
        const { email, reason } = req.body;
        await sendEmail(email, 'Solicitud de soporte técnico en la APP', reason);
        res.status(200).json({ message: 'Correo de solicitud de soporte enviado correctamente.' });
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Exportar el router correctamente
module.exports = router;
