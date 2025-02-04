const db = require("./connectionDB");


class DiaryData {
    
  // Obtener todas las citas
  static async getAllDiary() {
    const connection = await db.connect();
   
      try {
        const [rows] = await connection.query(
          `SELECT 
               tbcita.id_cita as numero_cita,
              tbcita.id_cedula_usuario,
              tbusuario.nombre AS nombre_usuario,
              tbcita.id_cedula_paciente,
              tbpaciente.nombre AS nombre_paciente,
              tbcita.fecha,
              tbcita.hora_inicio,
              tbcita.hora_final
          FROM 
              tbcita
          INNER JOIN 
              tbusuario ON tbcita.id_cedula_usuario = tbusuario.id_cedula
          INNER JOIN 
              tbpaciente ON tbcita.id_cedula_paciente = tbpaciente.id_cedula`
      );
      return rows;
    } catch (error) {
      console.error("Error al obtener citas:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  
  // Obtener una cita por cedula de paciente para verificar
  static async getDiaryByCedula(cedula) {
    const connection = await db.connect();
    try {
        const [rows] = await connection.query(
            `SELECT 
                tbcita.id_cita as numero_cita,
                tbcita.id_cedula_usuario,
                tbusuario.nombre AS encargado,
                tbcita.id_cedula_paciente,
                tbpaciente.nombre AS paciente,
                tbcita.fecha,
                tbcita.hora_inicio,
                tbcita.hora_final
            FROM 
                tbcita
            INNER JOIN 
                tbusuario ON tbcita.id_cedula_usuario = tbusuario.id_cedula
            INNER JOIN 
                tbpaciente ON tbcita.id_cedula_paciente = tbpaciente.id_cedula
            WHERE 
                tbcita.id_cedula_paciente = ?`,
            [cedula]
        );
        return rows[0] || null; // Devuelve el registro o null si no existe
    } catch (error) {
        console.error("Error al obtener cita de dicho paciente:", error.message);
        throw error;
    } finally {
        await db.disconnect();
    }
}


  // Crear un nueva cita
  static async createDiary(data) {
    const connection = await db.connect();
    try {

      const {
        id_empresa,
        id_cedula_usuario,
        id_cedula_paciente,
        fecha,
        hora_inicio,
        hora_final
      } = data;

      const [result] = await connection.query(
        `INSERT INTO tbcita (id_empresa, id_cedula_usuario,id_cedula_paciente, fecha, hora_inicio,hora_final)
                 VALUES ( ?, ?, ?, ?, ?, ?)`,
        [
        id_empresa,
        id_cedula_usuario,
        id_cedula_paciente,
        fecha,
        hora_inicio,
        hora_final
        ]
      );
      return result.insertId; // Devuelve el ID del nuevo
    } catch (error) {
      console.error("Error al crear la cita:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Actualizar un usuario
  static async updateDiary(data) {
    const connection = await db.connect();
    try {
      const {
        id_cita,
        id_cedula_usuario,
        fecha,
        hora_inicio,
        hora_final
      } = data;
  
      // Validación de datos requeridos
      if (!id_cita || !id_cedula_usuario || !fecha || !hora_inicio || !hora_final) {
        throw new Error("Faltan datos obligatorios para actualizar la cita");
      }
  
      const [result] = await connection.query(
        `UPDATE tbcita
         SET  id_cedula_usuario = ?, fecha = ?, hora_inicio = ?, hora_final = ?
         WHERE  id_cita =?`,
        [ 
          id_cedula_usuario,
          fecha,
          hora_inicio,
          hora_final,
          id_cita,
        ]
      );
  
      return result.affectedRows > 0; // Devuelve true si se actualizó correctamente
    } catch (error) {
      console.error("Error al actualizar la cita:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Eliminar una cita
  static async deleteDiary(id_cita) {
    const connection = await db.connect();
    try {
      const [result] = await connection.query(
        `DELETE FROM tbcita WHERE id_cita = ?`,
        [id_cita] // Pasa el valor correcto como parámetro
      );
  
      return result.affectedRows > 0; // Devuelve true si se eliminó correctamente
    } catch (error) {
      console.error("Error al eliminar la cita:", error.message);
      throw error;
    } finally {
      await db.disconnect(); // Cierra la conexión adecuadamente
    }
  }
  


}

module.exports = DiaryData;