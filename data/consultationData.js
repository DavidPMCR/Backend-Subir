const db = require("./connectionDB");

class ConsultationData {
    
  static async getAllConsultation(idEmpresa) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT id_consulta, id_cedula, id_empresa, tipoconsulta, valoracion, presion_arterial, frecuencia_cardiaca, saturacion_oxigeno, glicemia, frecuencia_respiratoria, plan_tratamiento, fecha_consulta, monto_consulta, estado 
         FROM tbconsulta 
         WHERE estado = 1 AND id_empresa = ?`, // 🔎 Filtramos por empresa
        [idEmpresa]
      );
      return rows;
    } catch (error) {
      console.error(" Error al obtener las consultas:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
  
  
  // 📌 Obtener consultas por cédula de paciente
  static async getConsultationByCedula(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT 
           c.id_consulta, 
           c.id_cedula, 
           c.id_empresa, 
           c.tipoconsulta, 
           c.valoracion, 
           c.presion_arterial, 
           c.frecuencia_cardiaca, 
           c.saturacion_oxigeno, 
           c.glicemia, 
           c.frecuencia_respiratoria, 
           c.plan_tratamiento, 
           c.fecha_consulta, 
           c.monto_consulta,
           p.nombre AS nombre_paciente,
           p.apellidos AS apellido_paciente
         FROM tbconsulta c
         INNER JOIN tbpaciente p ON c.id_cedula = p.id_cedula
         WHERE c.id_cedula = ?`,
        [cedula]
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener consulta:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Crear una nueva consulta
  static async createConsultation(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const {
        id_cedula,
        id_empresa,
        tipoconsulta,
        valoracion,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion_oxigeno,
        glicemia,
        frecuencia_respiratoria,
        plan_tratamiento,
        fecha_consulta,
        monto_consulta,
      } = data;

      const [result] = await connection.query(
        `INSERT INTO tbconsulta(id_cedula, id_empresa, tipoconsulta, valoracion, presion_arterial, frecuencia_cardiaca, saturacion_oxigeno, glicemia, frecuencia_respiratoria, plan_tratamiento, fecha_consulta, monto_consulta, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_cedula,
          id_empresa,
          tipoconsulta,
          valoracion,
          presion_arterial,
          frecuencia_cardiaca,
          saturacion_oxigeno,
          glicemia,
          frecuencia_respiratoria,
          plan_tratamiento,
          fecha_consulta,
          monto_consulta,
          1,
        ]
      );
      return { success: true, insertId: result.insertId, message: "Consulta creada correctamente" };
    } catch (error) {
      console.error("❌ Error al crear la consulta:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Actualizar consulta
  static async updateConsultation(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const {
        id_consulta,
        id_cedula,
        tipoconsulta,
        valoracion,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion_oxigeno,
        glicemia,
        frecuencia_respiratoria,
        plan_tratamiento,
        fecha_consulta,
        monto_consulta,
      } = data;
  
      const [result] = await connection.query(
        `UPDATE tbconsulta
         SET tipoconsulta = ?, valoracion = ?, presion_arterial = ?, frecuencia_cardiaca = ?, saturacion_oxigeno = ?, glicemia = ?, frecuencia_respiratoria = ?, plan_tratamiento = ?, fecha_consulta = ?, monto_consulta = ?
         WHERE id_cedula = ? AND id_consulta = ?`,
        [
          tipoconsulta,
          valoracion,
          presion_arterial,
          frecuencia_cardiaca,
          saturacion_oxigeno,
          glicemia,
          frecuencia_respiratoria,
          plan_tratamiento,
          fecha_consulta,
          monto_consulta,
          id_cedula,
          id_consulta,
        ]
      );
  
      return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? "Consulta actualizada correctamente" : "No se encontró la consulta" };
    } catch (error) {
      console.error("❌ Error al actualizar la consulta:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
  
  // 📌 Eliminar consulta (cambio de estado a 0)
  static async deleteConsultation(id_consulta) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [result] = await connection.query(
        `UPDATE tbconsulta SET estado = ? WHERE id_consulta = ?`,
        [0, id_consulta]
      );
      return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? "Consulta eliminada correctamente" : "No se encontró la consulta" };
    } catch (error) {
      console.error("❌ Error al eliminar consulta:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = ConsultationData;
