const db = require("./connectionDB"); // Asegúrate de que la ruta sea correcta

class FileData {
  // 📌 Guardar archivo en la base de datos
  static async saveFile(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const { id_empresa, id_cedula, fecha, img1, img2, img3, pdf, detalle } = data;

      const query = `
        INSERT INTO tbregistros (id_empresa, id_cedula, fecha, img1, img2, img3, pdf, detalle)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [id_empresa, id_cedula, fecha, img1, img2, img3, pdf, detalle];

      await connection.query(query, values);
      return { success: true, message: "Archivo guardado correctamente" };
    } catch (error) {
      console.error("❌ Error al guardar archivo:", error.message);
      throw error;
    } finally {
      if (connection) connection.release(); // 🔄 Liberar conexión en lugar de cerrarla
    }
  }

  // 📌 Obtener archivos por cédula
  static async getFilesByCedula(id_cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const query = `SELECT * FROM tbregistros WHERE id_cedula = ?`;
      const [results] = await connection.query(query, [id_cedula]);

      return results.length > 0 ? results : []; // Si no hay archivos, retorna un array vacío
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error.message);
      throw error;
    } finally {
      if (connection) connection.release(); // 🔄 Liberar conexión en lugar de cerrarla
    }
  }
  //eliminar archivo existente
  static async deleteFileById(id_registro) {
    let connection;
    try {
        connection = await db.pool.getConnection();

        console.log(`🗑 Eliminando archivo con ID: ${id_registro}`); // 🔍 Debugging

        // 🔹 Verificar si el registro existe antes de eliminar
        const [exists] = await connection.query(`SELECT id_registro FROM tbregistros WHERE id_registro = ?`, [id_registro]);

        if (exists.length === 0) {
            console.error("❌ Archivo no encontrado en la BD.");
            return false; // Si no existe, devolvemos `false`
        }

        // 🔹 Ejecutar la eliminación
        const query = `DELETE FROM tbregistros WHERE id_registro = ?`;
        const [result] = await connection.query(query, [id_registro]);

        console.log("📌 Resultado de la eliminación:", result); // 🔍 Debugging
        return result.affectedRows > 0; // Devuelve `true` si se eliminó, `false` si no
    } catch (error) {
        console.error("❌ Error al eliminar el archivo en la BD:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}




}

module.exports = FileData;
