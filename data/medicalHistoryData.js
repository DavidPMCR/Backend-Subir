const db = require("./connectionDB");

class MedicalHistoryData {
  // 📌 Obtener historial médico por cédula
  static async getMHByCedula(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT id_cedula, id_empresa, app, apf, aqx, tx, observaciones 
         FROM tbantecedentes 
         WHERE id_cedula = ?`,
        [cedula]
      );
      return rows[0] || null; // Devuelve el historial o null si no existe
    } catch (error) {
      console.error("❌ Error al obtener el historial médico:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Crear un nuevo historial médico
  static async createMH(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const { id_cedula, id_empresa, app, apf, aqx, tx, observaciones } = data;

      // Verificar si ya existe un registro para la cédula
      const [existingRecord] = await connection.query(
        `SELECT COUNT(*) AS count FROM tbantecedentes WHERE id_cedula = ?`,
        [id_cedula]
      );

      if (existingRecord[0].count > 0) {
        throw new Error("⚠️ Paciente ya posee un historial médico registrado.");
      }

      // Insertar el nuevo registro si no existe
      const [result] = await connection.query(
        `INSERT INTO tbantecedentes (id_cedula, id_empresa, app, apf, aqx, tx, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_cedula, id_empresa, app, apf, aqx, tx, observaciones]
      );

      return result.insertId; // Devuelve el ID del nuevo registro
    } catch (error) {
      console.error("❌ Error al crear el historial médico:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Actualizar historial médico
  static async updateMH(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const { id_cedula, app, apf, aqx, tx, observaciones } = data;

      const [result] = await connection.query(
        `UPDATE tbantecedentes
         SET app = ?, apf = ?, aqx = ?, tx = ?, observaciones = ?
         WHERE id_cedula = ?`,
        [app, apf, aqx, tx, observaciones, id_cedula]
      );

      return result.affectedRows > 0; // Devuelve true si se actualizó correctamente
    } catch (error) {
      console.error("❌ Error al actualizar el historial médico:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Eliminar historial médico
  static async deleteMH(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [result] = await connection.query(
        `DELETE FROM tbantecedentes WHERE id_cedula = ?`,
        [cedula]
      );
      return result.affectedRows > 0; // Devuelve true si se eliminó correctamente
    } catch (error) {
      console.error("❌ Error al eliminar el historial médico:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = MedicalHistoryData;
