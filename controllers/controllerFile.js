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

//eliminar archivo
async deleteFile(id_registro) {
  try {
      // 🔹 Asegurar que `id_registro` sea un número válido
      if (!id_registro || typeof id_registro !== "number") {
          console.error("ID de registro inválido en el controlador:", id_registro);
          return { code: "400", message: "ID de registro inválido" };
      }

      const success = await FileData.deleteFileById(id_registro);
      if (success) {
          return { code: "200", message: "Archivo eliminado correctamente" };
      } else {
          return { code: "404", message: "Archivo no encontrado" };
      }
  } catch (error) {
      console.error("❌ Error en el controlador al eliminar el archivo:", error.message);
      return { code: "500", message: "Error interno del servidor" };
  }
}


}

module.exports = new FileController();
