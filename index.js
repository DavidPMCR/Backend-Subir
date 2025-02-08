require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require(__dirname + '/data/connectionDB');
 // Importar conexión a la BD

const PORT = process.env.PORT || 8080;
const app = express();

// Habilitar CORS globalmente
app.use(cors({
    origin: "*", // O usa el dominio exacto del frontend
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization"
}));

// Middleware global para manejar JSON
app.use(express.json());

// Función Keep-Alive para evitar que Railway cierre MySQL por inactividad
const keepAliveMySQL = () => {
    setInterval(async () => {
        try {
            await db.query("SELECT 1"); // Consulta simple para mantener conexión
            console.log("🔄 Keep-alive: Conexión MySQL activa.");
        } catch (error) {
            console.error("⚠️ Error en Keep-alive MySQL:", error.message);
        }
    }, 600000); // 10 minutos (600,000ms)
};

// Definir rutas
const registerRoutes = () => {
    const userRouter = require('./routes/userRouter');
    userRouter(app);

    const empresaRouter = require("./routes/empresaRouter");
    empresaRouter(app);

    const authRouter = require("./routes/authRouter");
    authRouter(app);

    const patientRouter = require('./routes/patientRouter');
    patientRouter(app);

    const diaryRouter = require('./routes/diaryRouter');
    diaryRouter(app);

    const consultationRouter = require('./routes/consultationRouter');
    consultationRouter(app);

    const mhRouter = require('./routes/medicalHistoryRouter');
    mhRouter(app);

    const fileRouter = require('./routes/fileRouter');
    fileRouter(app);

    const reportRouter = require('./routes/reportRouter');
    reportRouter(app);

    const sendEmailRouter = require('./routes/sendEmailRouter');
    app.use(sendEmailRouter);
};

// Verificar variables de entorno importantes
console.log('📧 Email:', process.env.EMAIL_USER || 'No configurado');
console.log('🔑 Password:', process.env.EMAIL_PASS ? '****' : 'No definida');

// Iniciar el servidor y configurar eventos de cierre
const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
        keepAliveMySQL(); // Iniciar Keep-Alive para MySQL
    });

    // Manejo de señales para Railway (evita que cierre abruptamente)
    process.on("SIGTERM", async () => {
        console.log("🚨 Servidor recibiendo SIGTERM, cerrando conexiones...");
        await shutdownServer(server);
    });

    process.on("SIGINT", async () => {
        console.log("🛑 Servidor detenido manualmente (Ctrl + C)");
        await shutdownServer(server);
    });
};

// Función para cerrar el servidor correctamente
const shutdownServer = async (server) => {
    try {
        console.log("⏳ Cerrando servidor...");
        server.close(() => {
            console.log("🔌 Servidor cerrado correctamente.");
            process.exit(0);
        });
    } catch (error) {
        console.error("⚠️ Error cerrando el servidor:", error.message);
        process.exit(1);
    }
};

// Registrar rutas y arrancar el servidor
registerRoutes();
startServer();
