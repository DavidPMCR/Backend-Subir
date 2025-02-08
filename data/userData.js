const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Genera un identificador único
const db = require("./connectionDB");
const bcrypt = require("bcryptjs");

class UserData {
  // 📌 Obtener todos los usuarios
  static async getAllUsers() {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        "SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, rol FROM tbusuario WHERE estado = 1"
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Obtener empleados asociados a una empresa con rol dependiente
  static async getUsersByEmpresaAndRole(id_empresa) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT id_cedula, nombre, apellidos, correo, telefono, id_empresa, rol 
         FROM tbusuario 
         WHERE id_empresa = ? AND rol = ? AND estado = 1`,
        [id_empresa, "D"]
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al obtener los usuarios de la empresa:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Obtener un usuario por su cédula
  static async getUserByCedula(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        "SELECT id_cedula, nombre, apellidos, correo, telefono FROM tbusuario WHERE id_cedula = ? AND estado = 1",
        [cedula]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("❌ Error al obtener el usuario:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Crear un nuevo usuario con validación de máximo 3 usuarios por empresa
  static async createUser(data) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const { id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol } = data;

      const [rows] = await connection.query(
        `SELECT COUNT(*) AS totalUsuarios FROM tbusuario WHERE id_empresa = ? AND estado = 1`,
        [id_empresa]
      );

      if (rows[0].totalUsuarios >= 3) {
        throw new Error("❌ Máximo de usuarios creados para esta empresa.");
      }

      const contrasenaHashed = await bcrypt.hash(contrasena, 10);

      const [result] = await connection.query(
        `INSERT INTO tbusuario (id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasenaHashed, rol, 1]
      );

      return result.insertId;
    } catch (error) {
      console.error("❌ Error al crear el usuario:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Login de usuario
  static async login(cedula, contrasena) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query(
        `SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, telefono, correo, rol, estado, token, contrasena 
         FROM tbusuario WHERE id_cedula = ?`,
        [cedula]
      );

      const user = rows[0];

      if (!user) {
        return null;
      }

      if (user.token) {
        return { error: "Ya existe una sesión activa. Cierra sesión antes de iniciar nuevamente." };
      }

      const isMatch = await bcrypt.compare(String(contrasena), String(user.contrasena));
      if (!isMatch) {
        return null;
      }

      const token = jwt.sign({ id: user.id_cedula, sessionId: uuidv4() }, "clave_secreta_super_segura", {
        expiresIn: "1h",
      });

      await connection.query("UPDATE tbusuario SET token = ? WHERE id_cedula = ?", [token, cedula]);

      delete user.contrasena;
      return { user, token };
    } catch (error) {
      console.error("❌ Error en el login:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Verificar y eliminar token expirado
  static async verificarYEliminarTokenExpirado(cedula) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [rows] = await connection.query("SELECT token FROM tbusuario WHERE id_cedula = ?", [cedula]);

      if (rows.length === 0 || !rows[0].token) {
        return false;
      }

      try {
        jwt.verify(rows[0].token, "clave_secreta_super_segura");
        return false;
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          await connection.query("UPDATE tbusuario SET token = NULL WHERE id_cedula = ?", [cedula]);
          return true;
        }
      }
    } catch (error) {
      console.error("❌ Error al verificar/eliminar token:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
    return false;
  }

  // 📌 Cambiar contraseña
  static async changePassword(cedula, nuevaContrasena) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const contrasenaHashed = await bcrypt.hash(nuevaContrasena, 10);
      const [result] = await connection.query(
        "UPDATE tbusuario SET contrasena = ? WHERE id_cedula = ?",
        [contrasenaHashed, cedula]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("❌ Error al cambiar la contraseña:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // 📌 Método para eliminar el token de la base de datos
  static async removeToken(userId) {
    let connection;
    try {
      connection = await db.pool.getConnection();
      const [result] = await connection.query("UPDATE tbusuario SET token = NULL WHERE id_cedula = ?", [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("❌ Error al eliminar el token:", error.message);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = UserData;
