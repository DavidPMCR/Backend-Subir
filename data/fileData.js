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

        // 🔹 Asegurar que `id_registro` se incluya en la consulta
        const query = `
            SELECT 
                id_registro, 
                id_empresa, 
                id_cedula, 
                fecha, 
                detalle, 
                img1, 
                img2, 
                img3
            FROM tbregistros 
            WHERE id_cedula = ?`;

        const [results] = await connection.query(query, [id_cedula]);

        console.log("📌 Datos obtenidos de la BD:", results); // 🔍 Debugging

        return results.length > 0 ? results : [];
    } catch (error) {
        console.error("❌ Error al obtener archivos:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

  //eliminar archivo existente
  static async deleteFileById(id_registro) {
    let connection;
    try {
        connection = await db.pool.getConnection();

        // 🔹 Validar que `id_registro` sea un número válido
        if (!id_registro || typeof id_registro !== "number") {
            throw new Error("ID de registro inválido en la base de datos");
        }

        console.log(`🗑 Eliminando archivo con ID: ${id_registro}`); // 🔍 Debugging

        const query = `DELETE FROM tbregistros WHERE id_registro = ?`;
        const [result] = await connection.query(query, [id_registro]);

        console.log(`✅ Registros eliminados: ${result.affectedRows}`); // 🔍 Debugging

        return result.affectedRows > 0; // `true` si se eliminó, `false` si no se encontró
    } catch (error) {
        console.error("❌ Error al eliminar el archivo en la BD:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}




}

module.exports = FileData;
