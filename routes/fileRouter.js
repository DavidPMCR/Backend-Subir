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

  app.get('/api/files/patient/:id_cedula', (req, res) => fileController.getFilesByCedula(req, res));
};
  




module.exports = fileRouter;
