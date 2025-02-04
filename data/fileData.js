const connectionDB = require('./connectionDB'); // Asegúrate de que la ruta sea correcta

class FileData {
  static async saveFile(data) {
    const client = await connectionDB.connect(); // Conecta a la base de datos
    try {
      const { id_empresa, id_cedula, fecha, img1, img2, img3, pdf, detalle } = data;

      const query = `
        INSERT INTO tbregistros (id_empresa, id_cedula, fecha, img1, img2, img3, pdf, detalle)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [id_empresa, id_cedula, fecha, img1, img2, img3, pdf, detalle];

      await client.query(query, values);
    } catch (error) {
      console.error('Error saving file:', error.message);
      throw error;
    } finally {
      await connectionDB.disconnect(); // Cierra la conexión
    }
  }
//extraer archivos de un paciente por cedula
static async getFilesByCedula(id_cedula) {
  const client = await connectionDB.connect(); // Conectar a la base de datos
  try {
      const query = `SELECT * FROM tbregistros WHERE id_cedula = ?`; // Buscar por cédula
      const [results] = await client.query(query, [id_cedula]);

      if (results.length === 0) {
          return []; // Devuelve un array vacío si no hay registros
      }

      return results; // Devuelve todos los registros encontrados
  } catch (error) {
      console.error('Error obteniendo archivos:', error.message);
      throw error;
  } finally {
      await connectionDB.disconnect(); // Cerrar la conexión
  }
}




}

module.exports = FileData;
