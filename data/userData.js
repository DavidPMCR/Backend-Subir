const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("./connectionDB");
const bcrypt = require('bcryptjs');

class UserData {

  // **Obtener todos los usuarios**
  static async getAllUsers() {
    try {
      const result = await db.pool.query(
        `SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, rol 
         FROM tbusuario  
         WHERE estado = TRUE`
      );
      return result.rows;
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      throw error;
    }
  }

  // **Obtener empleados por empresa con rol "D" (Dependiente)**
  static async getUsersByEmpresaAndRole(id_empresa) {
    try {
      const result = await db.pool.query(
        `SELECT id_cedula, nombre, apellidos, correo, telefono, id_empresa, rol 
         FROM tbusuario 
         WHERE id_empresa = $1 AND rol = $2 AND estado = TRUE`,
        [id_empresa, "D"]
      );
      return result.rows;
    } catch (error) {
      console.error("Error al obtener usuarios de la empresa:", error.message);
      throw error;
    }
  }

  // **Obtener un usuario por cédula**
  static async getUserByCedula(cedula) {
    try {
      const result = await db.pool.query(
        `SELECT id_cedula, nombre, apellidos, correo, telefono 
         FROM tbusuario 
         WHERE id_cedula = $1 AND estado = TRUE`,
        [cedula]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error al obtener el usuario:", error.message);
      throw error;
    }
  }

  // **Crear un usuario con límite de 3 por empresa**
  static async createUser(data) {
    try {
      const {
        id_cedula,
        tipo_cedula,
        id_empresa,
        nombre,
        apellidos,
        correo,
        telefono,
        contrasena,
        rol
      } = data;

      // **Verificar cuántos usuarios existen en la empresa**
      const countResult = await db.pool.query(
        `SELECT COUNT(*) AS totalUsuarios FROM tbusuario WHERE id_empresa = $1 AND estado = TRUE`,
        [id_empresa]
      );
      const totalUsuarios = parseInt(countResult.rows[0].totalusuarios);

      if (totalUsuarios >= 3) {
        throw new Error("Máximo de usuarios creados para esta empresa.");
      }

      // **Cifrar la contraseña antes de guardarla**
      const contrasenaHashed = await bcrypt.hash(contrasena, 10);

      // **Insertar usuario**
      const result = await db.pool.query(
        `INSERT INTO tbusuario (id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE) RETURNING id_cedula`,
        [
          id_cedula,
          tipo_cedula,
          id_empresa,
          nombre,
          apellidos,
          correo,
          telefono,
          contrasenaHashed,
          rol
        ]
      );

      return result.rows[0].id_cedula;

    } catch (error) {
      console.error("Error al crear usuario:", error.message);
      throw error;
    }
  }

  // **Actualizar usuario**
  static async updateUser(data) {
    try {
      const { id_cedula, nombre, apellidos, correo, telefono, estado } = data;

      const result = await db.pool.query(
        `UPDATE tbusuario
         SET nombre = $1, apellidos = $2, correo = $3, telefono = $4, estado = $5
         WHERE id_cedula = $6`,
        [nombre, apellidos, correo, telefono, estado, id_cedula]
      );

      return result.rowCount > 0;

    } catch (error) {
      console.error("Error al actualizar usuario:", error.message);
      throw error;
    }
  }

  // **Eliminar usuario (Permanente)**
  static async deleteUserByADM(cedula) {
    try {
      const result = await db.pool.query(
        `DELETE FROM tbusuario WHERE id_cedula = $1 AND rol = $2`,
        [cedula, "D"]
      );

      return result.rowCount > 0;

    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      throw error;
    }
  }

  // **Eliminar usuario (Lógica: Desactivación)**
  static async deleteUser(cedula) {
    try {
      const result = await db.pool.query(
        `UPDATE tbusuario SET estado = FALSE WHERE id_cedula = $1`,
        [cedula]
      );

      return result.rowCount > 0;

    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      throw error;
    }
  }

  // **Login de usuario**
  static async login(cedula, contrasena) {
    try {
      const result = await db.pool.query(
        `SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, telefono, 
                correo, rol, estado, token, contrasena 
         FROM tbusuario WHERE id_cedula = $1`,
        [cedula]
      );

      const user = result.rows[0];

      if (!user) {
        return null;
      }

      if (user.token) {
        return { error: "Ya existe una sesión activa. Cierra sesión antes de iniciar nuevamente." };
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena);

      if (!isMatch) {
        return null;
      }

      const sessionId = uuidv4();
      const token = jwt.sign({ id: user.id_cedula, sessionId }, "clave_secreta_super_segura", { expiresIn: "30m" });

      await db.pool.query(
        "UPDATE tbusuario SET token = $1 WHERE id_cedula = $2",
        [token, cedula]
      );

      delete user.contrasena;
      return { user, token };

    } catch (error) {
      console.error("Error en login:", error.message);
      throw error;
    }
  }

  // **Verificar y eliminar token expirado**
  static async verificarYEliminarTokenExpirado(cedula) {
    try {
      const result = await db.pool.query(
        "SELECT token FROM tbusuario WHERE id_cedula = $1",
        [cedula]
      );

      if (result.rowCount === 0 || !result.rows[0].token) {
        return false;
      }

      const token = result.rows[0].token;

      try {
        jwt.verify(token, "clave_secreta_super_segura");
        return false;
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          await db.pool.query(
            "UPDATE tbusuario SET token = NULL WHERE id_cedula = $1",
            [cedula]
          );
          return true;
        }
      }
    } catch (error) {
      console.error("Error al verificar/eliminar token:", error.message);
      throw error;
    }
    return false;
  }

  // **Cambiar contraseña**
  static async changePassword(cedula, nuevaContrasena) {
    try {
      const contrasenaHashed = await bcrypt.hash(nuevaContrasena, 10);

      const result = await db.pool.query(
        `UPDATE tbusuario SET contrasena = $1 WHERE id_cedula = $2`,
        [contrasenaHashed, cedula]
      );

      return result.rowCount > 0;

    } catch (error) {
      console.error("Error al cambiar contraseña:", error.message);
      throw error;
    }
  }

  // **Eliminar el token de la base de datos**
  static async removeToken(userId) {
    try {
      const result = await db.pool.query(
        "UPDATE tbusuario SET token = NULL WHERE id_cedula = $1",
        [userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error al eliminar token:", error.message);
      throw error;
    }
  }
}

module.exports = UserData;
