const db = require("./connectionDB");


class MedicalHistoryData {
    


  
  // Obtener antecedente de paciente por su cédula
  static async getMHByCedula(cedula) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        "SELECT  id_cedula, id_empresa, app, apf, aqx, tx,observaciones FROM tbantecedentes WHERE id_cedula = ? ",
        [cedula]
      );
      return rows[0] || null; // Devuelve el usuario o null si no existe
    } catch (error) {
      console.error("Error al obtener el paciente:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

 // Crear un nuevo antecedente
static async createMH(data) {
  const connection = await db.connect();
  try {
    const {
      id_cedula,
      id_empresa,
      app,
      apf,
      aqx,
      tx,
      observaciones,
    } = data;

    // Verificar si ya existe un registro para la cédula
    const [existingRecord] = await connection.query(
      `SELECT COUNT(*) AS count FROM tbantecedentes WHERE id_cedula = ?`,
      [id_cedula]
    );

    // Si ya existe, devolver un mensaje de error
    if (existingRecord[0].count > 0) {
      throw new Error("Paciente ya posee un historial médico registrado.");
    }

    // Insertar el nuevo registro si no existe
    const [result] = await connection.query(
      `INSERT INTO tbantecedentes (id_cedula, id_empresa, app, apf, aqx, tx, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_cedula, id_empresa, app, apf, aqx, tx, observaciones]
    );

    return result.insertId; // Devuelve el ID del nuevo registro
  } catch (error) {
    console.error("Error al crear antecedente:", error.message);
    throw error; // Lanzar el error para que pueda manejarse externamente
  } finally {
    await db.disconnect();
  }
}


  // Actualizar antecedente
  static async updateMH(data) {
    const connection = await db.connect();
    try {
      const {
        id_cedula,
        id_empresa,
        app,
        apf,
        aqx,
        tx,
        observaciones
      } = data;
  
      const [result] = await connection.query(
        `UPDATE tbantecedentes
         SET app = ?, apf = ?, aqx = ?, tx = ?, observaciones = ?
         WHERE id_cedula = ?`,
        [app, apf, aqx, tx, observaciones, id_cedula, id_empresa] // Ajustar el orden
      );
  
      return result.affectedRows > 0; // Devuelve true si se actualizó correctamente
    } catch (error) {
      console.error("Error al actualizar el antecedente:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Eliminar antecedente
  static async deleteMH(cedula) {
    const connection = await db.connect();
    try {
      const [result] = await connection.query(

        `DELETE FROM tbantecedentes  WHERE id_cedula = ?`,
        [cedula]
      );
      return result.affectedRows > 0; // Devuelve true si se eliminó correctamente
    } catch (error) {
      console.error("Error al eliminar el antecedente:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  

}

module.exports = MedicalHistoryData;
