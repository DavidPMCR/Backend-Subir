require("dotenv").config(); // Cargar variables de entorno
const express = require("express");
const cors = require("cors");
const db = require("./data/connectionDB");

const PORT = process.env.PORT || 10000;
const app = express();

// Configurar CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware global para manejar JSON
app.use(express.json());

// Política de seguridad (CSP)
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'");
    next();
});

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("¡Hola, mundo desde Node.js!");
});

// Prueba de conexión a la base de datos
app.get("/test-db", async (req, res) => {
    try {
        const connection = await db.connect();
        const result = await connection.query("SELECT NOW() as currentTime");
        await db.disconnect(connection);
        res.json({ success: true, message: "Conexión exitosa a la base de datos", data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al conectar a la base de datos", error: error.message });
    }
});

// Definir rutas
const userRouter = require("./routes/userRouter");
app.use("/user", userRouter);

const empresaRouter = require("./routes/empresaRouter");
app.use("/empresa", empresaRouter);

const authRouter = require("./routes/authRouter");
app.use("/auth", authRouter);

const patientRouter = require("./routes/patientRouter");
app.use("/paciente", patientRouter);

const diaryRouter = require("./routes/diaryRouter");
app.use("/diario", diaryRouter);

const consultationRouter = require("./routes/consultationRouter");
app.use("/consulta", consultationRouter);

const mhRouter = require("./routes/medicalHistoryRouter");
app.use("/historial", mhRouter);

const fileRouter = require("./routes/fileRouter");
app.use("/archivo", fileRouter);

const reportRouter = require("./routes/reportRouter");
app.use("/reporte", reportRouter);

const sendEmail = require("./routes/sendEmailRouter");
app.use("/email", sendEmail);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
