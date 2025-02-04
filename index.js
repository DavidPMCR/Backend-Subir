require('dotenv').config(); // Mueve esto a la primera línea
const express = require('express');
const validateBody = require("./middlewares/validateBody");
const cors = require('cors');



const PORT = 3001;

// Crear una sola instancia de express
const app = express();

// Habilita CORS globalmente para todas las rutas
app.use(cors());

// Middleware global para manejar JSON y validar el cuerpo de las solicitudes
app.use(express.json());
//app.use(validateBody); // Asegúrate de que este middleware sea necesario

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola, mundo desde Node.js!');
});

// Definir rutas
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

const sendEmail = require('./routes/sendEmailRouter');
sendEmail(app);
console.log('Email:', process.env.EMAIL_USER);
console.log('Password:', process.env.EMAIL_PASS);

// Iniciar el servidor
app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
  });