const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Genera un identificador único
const db = require("./connectionDB");
const bcrypt = require('bcryptjs');

class UserData {
  // Obtener todos los usuarios
  static async getAllUsers() {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        "SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, rol FROM tbusuario WHERE estado = TRUE"
      );
      return rows;
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Obtener empleados asociados a una empresa y rol "dependiente"
  static async getUsersByEmpresaAndRole(id_empresa) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        `SELECT id_cedula, nombre, apellidos, correo, telefono, id_empresa, rol 
         FROM tbusuario 
         WHERE id_empresa = ? AND rol = ? AND estado = TRUE`, 
        [id_empresa, "D"]
      );
      return rows;
    } catch (error) {
      console.error("Error al obtener los usuarios de la empresa:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Obtener un usuario por su cédula
  static async getUserByCedula(cedula) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        "SELECT id_cedula, nombre, apellidos, correo, telefono FROM tbusuario WHERE id_cedula = ? AND estado = TRUE",
        [cedula]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error al obtener el usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Crear un nuevo usuario con validación de máximo 3 usuarios por empresa
  static async createUser(data) {
    const connection = await db.connect();
    try {
      const { id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol } = data;

      // Verificar cuántos usuarios existen en la empresa
      const [rows] = await connection.query(
        "SELECT COUNT(*) AS totalUsuarios FROM tbusuario WHERE id_empresa = ? AND estado = TRUE",
        [id_empresa]
      );

      const totalUsuarios = rows[0].totalusuarios;

      if (totalUsuarios >= 3) {
        throw new Error("Máximo de usuarios creados para esta empresa.");
      }

      // Cifrar la contraseña
      const contrasenaHashed = await bcrypt.hash(contrasena, 10);

      // Insertar el usuario en la base de datos
      const [result] = await connection.query(
        `INSERT INTO tbusuario (id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasenaHashed, rol, true]
      );

      return result.insertId;

    } catch (error) {
      console.error("Error al crear el usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Actualizar un usuario
  static async updateUser(data) {
    const connection = await db.connect();
    try {
      const { id_cedula, nombre, apellidos, correo, telefono, estado } = data;
      const estadoBooleano = estado == 1 ? true : false;

      const [result] = await connection.query(
        `UPDATE tbusuario
         SET nombre = ?, apellidos = ?, correo = ?, telefono = ?, estado = ?
         WHERE id_cedula = ?`,
        [nombre, apellidos, correo, telefono, estadoBooleano, id_cedula]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al actualizar el usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Eliminar un usuario
  static async deleteUser(cedula) {
    const connection = await db.connect();
    try {
      const [result] = await connection.query(
        "UPDATE tbusuario SET estado = FALSE WHERE id_cedula = ?",
        [cedula]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar el usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Login de usuario
  static async login(cedula, contrasena) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        "SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, telefono, correo, rol, estado, token, contrasena FROM tbusuario WHERE id_cedula = ?",
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

      const sessionId = uuidv4();

      const token = jwt.sign({ id: user.id_cedula, sessionId }, "clave_secreta_super_segura", { expiresIn: "30m" });

      await connection.query(
        "UPDATE tbusuario SET token = ? WHERE id_cedula = ?",
        [token, cedula]
      );

      delete user.contrasena;
      return { user, token };
    } catch (error) {
      console.error("Error en el login del usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Verificar y eliminar token expirado
  static async verificarYEliminarTokenExpirado(cedula) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        "SELECT token FROM tbusuario WHERE id_cedula = ?",
        [cedula]
      );

      if (rows.length === 0 || !rows[0].token) {
        return false;
      }

      const token = rows[0].token;

      try {
        jwt.verify(token, "clave_secreta_super_segura");
        return false;
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          await connection.query(
            "UPDATE tbusuario SET token = NULL WHERE id_cedula = ?",
            [cedula]
          );
          return true;
        }
      }
    } catch (error) {
      console.error("Error al verificar/eliminar token:", error.message);
    } finally {
      await db.disconnect();
    }
    return false;
  }

  // Método para eliminar el token de la base de datos
  static async removeToken(userId) {
    const connection = await db.connect();
    try {
      const [result] = await connection.query(
        "UPDATE tbusuario SET token = NULL WHERE id_cedula = ?",
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error al eliminar el token:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }
}

module.exports = UserData;
