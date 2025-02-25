const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/controllerFile');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fileRouter = (app) => {
  app.post('/api/files/upload', upload.fields([
    { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  ]), (req, res) => fileController.uploadFile(req, res));

//obtener archivos por cedula del paciente
  app.get('/api/files/patient/:id_cedula', (req, res) => fileController.getFilesByCedula(req, res));

   // Eliminar un archivo de un paciente por `id_registro`
   app.delete('/api/files/:id_registro', (req, res) => fileController.deleteFile(req, res));

};
  




module.exports = fileRouter;
