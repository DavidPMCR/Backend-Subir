const db = require("./connectionDB");

class PatientData {
  // 📌 Obtener todos los pacientes activos
  static async getAllUsers() {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, conocido_como, correo, telefono, telefono_emergencia, residencia, observaciones
         FROM tbpaciente 
         WHERE estado = 1`
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener pacientes:", error.message);
      throw error;
    } finally {
      if (connection) connection.release(); // Liberar la conexión
    }
  }

  // 📌 Obtener un paciente por cédula
  static async getUserByCedula(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, conocido_como, telefono, telefono_emergencia, correo, residencia, observaciones
         FROM tbpaciente 
         WHERE id_cedula = ? AND estado = 1`,
        [cedula]
      );
      return rows[0] || null; // Devuelve el paciente o null si no existe
    } catch (error) {
      console.error("❌ Error al obtener el paciente:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Crear un nuevo paciente
  static async createUser(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const {
        id_cedula,
        tipo_cedula,
        id_empresa,
        nombre,
        apellidos,
        conocido_como,
        telefono,
        telefono_emergencia,
        correo,
        residencia,
        observaciones
      } = data;

      const [result] = await connection.query(
        `INSERT INTO tbpaciente 
         (id_cedula, tipo_cedula, id_empresa, nombre, apellidos, conocido_como, telefono, telefono_emergencia, correo, residencia, observaciones, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_cedula,
          tipo_cedula,
          id_empresa,
          nombre,
          apellidos,
          conocido_como,
          telefono,
          telefono_emergencia,
          correo,
          residencia,
          observaciones,
          1, // Estado activo
        ]
      );
      return result.insertId; // Devuelve el ID del nuevo paciente
    } catch (error) {
      console.error("❌ Error al crear el paciente:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Actualizar un paciente
  static async updateUser(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const {
        id_cedula,
        tipo_cedula,
        nombre,
        apellidos,
        conocido_como,
        telefono,
        telefono_emergencia,
        correo,
        residencia,
        observaciones
      } = data;

      // Validación de datos requeridos
      if (!id_cedula || !tipo_cedula || !nombre || !apellidos) {
        throw new Error("⚠️ Faltan datos obligatorios para actualizar el paciente.");
      }

      const [result] = await connection.query(
        `UPDATE tbpaciente
         SET tipo_cedula = ?, nombre = ?, apellidos = ?, conocido_como = ?, telefono = ?, telefono_emergencia = ?, correo = ?, residencia = ?, observaciones = ?
         WHERE id_cedula = ?`,
        [
          tipo_cedula,
          nombre,
          apellidos,
          conocido_como,
          telefono,
          telefono_emergencia,
          correo,
          residencia,
          observaciones,
          id_cedula
        ]
      );

      return result.affectedRows > 0; // Devuelve `true` si se actualizó correctamente
    } catch (error) {
      console.error("❌ Error al actualizar el paciente:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Eliminar un paciente (desactivar en vez de borrar)
  static async deleteUser(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [result] = await connection.query(
        `UPDATE tbpaciente SET estado = ? WHERE id_cedula = ?`,
        [0, cedula] // 0 indica que el paciente está inactivo
      );
      return result.affectedRows > 0; // Devuelve `true` si se eliminó correctamente
    } catch (error) {
      console.error("❌ Error al eliminar el paciente:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = PatientData;
