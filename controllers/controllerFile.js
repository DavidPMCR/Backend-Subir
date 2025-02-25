const FileData = require('../data/fileData');

class FileController {
  async uploadFile(req, res) {
    try {
      const { id_empresa, id_cedula, fecha, detalle } = req.body;
      const img1 = req.files.image1 ? req.files.image1[0].buffer : null;
      const img2 = req.files.image2 ? req.files.image2[0].buffer : null;
      const img3 = req.files.image3 ? req.files.image3[0].buffer : null;
      const pdf = req.files.pdf ? req.files.pdf[0].buffer : null;

      console.log('Data received:', { id_empresa, id_cedula, fecha, detalle, img1, img2, img3, pdf });

      const fileData = {
        id_empresa,
        id_cedula,
        fecha,
        img1,
        img2,
        img3,
        pdf,
        detalle
      };

      await FileData.saveFile(fileData);
      res.status(200).send('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error.message);
      res.status(500).send('Error uploading file');
    }
  }
//extraer archivos de un paciente por cedula 
async getFilesByCedula(req, res) {
  try {
      const { id_cedula } = req.params; // Obtener la cédula desde la URL
      const files = await FileData.getFilesByCedula(id_cedula); // Buscar archivos en la BD

      if (!files || files.length === 0) {
          return res.status(404).json({ message: 'No se encontraron archivos para este paciente' });
      }

      // Convertir imágenes y PDF a base64 y asegurarse de que cada registro sea único
      const response = files.map(file => ({
          id_registro: file.id_registro, // 🔹 Corrección aquí
          id_empresa: file.id_empresa,
          id_cedula: file.id_cedula,
          fecha: file.fecha,
          detalle: file.detalle,
          archivos: {
              img1: file.img1 ? `data:image/png;base64,${file.img1.toString('base64')}` : null,
              img2: file.img2 ? `data:image/png;base64,${file.img2.toString('base64')}` : null,
              img3: file.img3 ? `data:image/png;base64,${file.img3.toString('base64')}` : null,
              pdf: file.pdf ? `data:application/pdf;base64,${file.pdf.toString('base64')}` : null
          }
      }));

      res.json(response);
  } catch (error) {
      console.error('Error obteniendo archivos:', error.message);
      res.status(500).json({ message: 'Error al obtener los archivos' });
  }
}

// Eliminar archivo por ID
async deleteFile(req, res) {
  try {
      const { id_registro } = req.params;

      console.log(`🗑 Recibida solicitud DELETE para id_registro: ${id_registro}`); // 🔍 Debugging

      // 🔹 Convertir `id_registro` a número entero
      const registroId = parseInt(id_registro, 10);

      // 🔹 Validar que el `id_registro` es un número válido
      if (isNaN(registroId)) {
          console.error("❌ ID de registro inválido en el controlador:", id_registro);
          return res.status(400).json({ code: "400", message: "ID de registro inválido" });
      }

      // Llamar a la función que elimina el archivo
      const success = await FileData.deleteFileById(registroId);

      if (success) {
          console.log("✅ Archivo eliminado correctamente en la BD.");
          return res.status(200).json({ code: "200", message: "Archivo eliminado correctamente" });
      } else {
          console.error("❌ Archivo no encontrado en la BD.");
          return res.status(404).json({ code: "404", message: "Archivo no encontrado" });
      }
  } catch (error) {
      console.error("❌ Error en el controlador al eliminar el archivo:", error.message);
      res.status(500).json({ code: "500", message: "Error interno del servidor" });
  }
}



}

module.exports = new FileController();
