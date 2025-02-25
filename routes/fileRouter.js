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
  app.delete('/api/files/:id_registro', async (req, res) => {
    try {
      const { id_registro } = req.params;

      // Validar que `id_registro` sea un número válido
      if (!id_registro || isNaN(id_registro)) {
        return res.status(400).send({ code: "400", message: "ID de registro inválido" });
      }

      await fileController.deleteFile(req, res);
    } catch (error) {
      console.error("❌ Error al eliminar el archivo:", error.message);
      res.status(500).send({ code: "500", message: "Error interno del servidor" });
    }
  });


};
  




module.exports = fileRouter;
