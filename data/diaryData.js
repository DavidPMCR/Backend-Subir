const db = require("./connectionDB");

class DiaryData {
    
  // 📌 Obtener todas las citas
  static async getAllDiary() {
    let connection;
    try {
      connection = await db.pool.getConnection(); // 🟢 Obtener conexión del pool
      const [rows] = await connection.query(
        `SELECT 
             tbcita.id_cita AS numero_cita,
             tbcita.id_cedula_usuario,
             tbusuario.nombre AS nombre_usuario,
             tbcita.id_cedula_paciente,
             tbpaciente.nombre AS nombre_paciente,
             tbcita.fecha,
             tbcita.hora_inicio,
             tbcita.hora_final
         FROM tbcita
         INNER JOIN tbusuario ON tbcita.id_cedula_usuario = tbusuario.id_cedula
         INNER JOIN tbpaciente ON tbcita.id_cedula_paciente = tbpaciente.id_cedula`
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener citas:", error.message);
      throw error;
    } finally {
      if (connection) connection.release(); // 🔄 Liberar conexión en lugar de cerrarla
    }
  }

  // 📌 Obtener una cita por cédula de paciente
  static async getDiaryByCedula(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT 
            tbcita.id_cita AS numero_cita,
            tbcita.id_cedula_usuario,
            tbusuario.nombre AS encargado,
            tbcita.id_cedula_paciente,
            tbpaciente.nombre AS paciente,
            tbcita.fecha,
            tbcita.hora_inicio,
            tbcita.hora_final
         FROM tbcita
         INNER JOIN tbusuario ON tbcita.id_cedula_usuario = tbusuario.id_cedula
         INNER JOIN tbpaciente ON tbcita.id_cedula_paciente = tbpaciente.id_cedula
         WHERE tbcita.id_cedula_paciente = ?`,
        [cedula]
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener cita del paciente:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Crear una nueva cita
  static async createDiary(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const { id_empresa, id_cedula_usuario, id_cedula_paciente, fecha, hora_inicio, hora_final } = data;
      const [result] = await connection.query(
        `INSERT INTO tbcita (id_empresa, id_cedula_usuario, id_cedula_paciente, fecha, hora_inicio, hora_final)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_empresa, id_cedula_usuario, id_cedula_paciente, fecha, hora_inicio, hora_final]
      );
      return { success: true, insertId: result.insertId, message: "Cita creada correctamente" };
    } catch (error) {
      console.error("❌ Error al crear la cita:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Actualizar una cita
  static async updateDiary(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const { id_cita, id_cedula_usuario, fecha, hora_inicio, hora_final } = data;

      if (!id_cita || !id_cedula_usuario || !fecha || !hora_inicio || !hora_final) {
        throw new Error("❌ Faltan datos obligatorios para actualizar la cita");
      }

      const [result] = await connection.query(
        `UPDATE tbcita
         SET id_cedula_usuario = ?, fecha = ?, hora_inicio = ?, hora_final = ?
         WHERE id_cita = ?`,
        [id_cedula_usuario, fecha, hora_inicio, hora_final, id_cita]
      );

      return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? "Cita actualizada correctamente" : "No se encontró la cita" };
    } catch (error) {
      console.error("❌ Error al actualizar la cita:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Eliminar una cita
  static async deleteDiary(id_cita) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [result] = await connection.query(
        `DELETE FROM tbcita WHERE id_cita = ?`,
        [id_cita]
      );

      return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? "Cita eliminada correctamente" : "No se encontró la cita" };
    } catch (error) {
      console.error("❌ Error al eliminar la cita:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = DiaryData;
