const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Genera un identificador único
const db = require("./connectionDB");
const bcrypt = require("bcrypt");

class UserData {
  // Obtener todos los usuarios
  static async getAllUsers() {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query("SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, rol FROM tbusuario  WHERE estado = 1");
      return rows;
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }
//obtener empleados asociados una empresa y rol dependiente
  static async getUsersByEmpresaAndRole(id_empresa) {
    const connection = await db.connect();
    try {
        const [rows] = await connection.query(
            `SELECT id_cedula, nombre, apellidos, correo, telefono, id_empresa, rol 
             FROM tbusuario 
             WHERE id_empresa = ? AND rol = ? AND estado = 1`, // Solo usuarios activos
            [id_empresa, "D"]
        );
        return rows; // Devuelve el listado de usuarios con rol "D" en la empresa
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
        "SELECT  id_cedula, nombre, apellidos, correo, telefono FROM tbusuario WHERE id_cedula = ? AND estado = 1",
        [cedula]
      );
      return rows[0] || null; // Devuelve el usuario o null si no existe
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

      //  Verificar cuántos usuarios existen en la empresa
      const [rows] = await connection.query(
          `SELECT COUNT(*) AS totalUsuarios FROM tbusuario WHERE id_empresa = ? AND estado = 1`,
          [id_empresa]
      );

      const totalUsuarios = rows[0].totalUsuarios;

      //  Si ya hay 3 usuarios en la empresa, no permitir más
      if (totalUsuarios >= 3) {
          throw new Error("Máximo de usuarios creados para esta empresa.");
      }

      //  Cifrar la contraseña antes de guardarla
      const contrasenaHashed = await bcrypt.hash(contrasena, 10);

      //  Insertar el nuevo usuario en la base de datos
      const [result] = await connection.query(
          `INSERT INTO tbusuario (id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol, estado)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              id_cedula,
              tipo_cedula,
              id_empresa,
              nombre,
              apellidos,
              correo,
              telefono,
              contrasenaHashed,
              rol,
              1, // Estado activo
          ]
      );

      return result.insertId; //  Devuelve el ID del nuevo usuario

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
      const {id_cedula, nombre, apellidos, correo, telefono, estado } =
        data;
      const [result] = await connection.query(
        `UPDATE tbusuario
                 SET  nombre = ?, apellidos = ?, correo = ?, telefono = ?, estado = ?
                 WHERE id_cedula = ?`,
        [ nombre, apellidos, correo, telefono,  estado, id_cedula]
      );
      return result.affectedRows > 0; // Devuelve true si se actualizó correctamente
    } catch (error) {
      console.error("Error al actualizar el usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Eliminar un usuario por admin APP
  static async deleteUserByADM(cedula) {
    const connection = await db.connect();
    try {
        console.log("Intentando eliminar usuario con cédula:", cedula);
        
        const [result] = await connection.query(
            `DELETE FROM tbusuario WHERE id_cedula = ? AND rol = ?`,
            [cedula, "D"]
        );

        if (result.affectedRows > 0) {
            console.log(`Usuario ${cedula} eliminado correctamente`);
            return true;
        } else {
            console.error(`No se encontró un usuario dependiente con cédula ${cedula}`);
            return false;
        }
    } catch (error) {
        console.error("Error al eliminar el usuario:", error.message);
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
        //`DELETE FROM tbusuario WHERE id_cedula = ?`,
        `UPDATE tbusuario SET estado = ? WHERE id_cedula = ?`,
        [0, cedula]
      );
      return result.affectedRows > 0; // Devuelve true si se eliminó correctamente
    } catch (error) {
      console.error("Error al eliminar el usuario:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  // Login de usuario
  static async login(cedula, contrasena) {
    console.log("Cédula ingresada:", cedula);

    const connection = await db.connect();
    try {
        // Consultar todos los datos del usuario excepto la contraseña
        const [rows] = await connection.query(
            `SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, telefono, 
                    correo, rol, estado, token, contrasena 
             FROM tbusuario WHERE id_cedula = ?`,
            [cedula]
        );

        const user = rows[0];

        if (!user) {
            console.error("Usuario no encontrado con ID:", cedula);
            return null;
        }

        // Verificar si ya tiene una sesión activa
        if (user.token) {
            console.error("Intento de login en otro dispositivo. Usuario ya tiene una sesión activa.");
            return { error: "Ya existe una sesión activa. Cierra sesión antes de iniciar nuevamente." };
        }

        // Verificar contraseña con bcrypt
        const isMatch = await bcrypt.compare(String(contrasena), String(user.contrasena));

        if (!isMatch) {
            console.error("Contraseña incorrecta para el usuario:", cedula);
            return null;
        }

        // Generar un identificador único para la sesión
        const sessionId = uuidv4();

        // Generar token JWT con tiempo de expiración de 1 hora
        const token = jwt.sign(
            { id: user.id_cedula, sessionId },
            "clave_secreta_super_segura",
            { expiresIn: "30m" }
        );

        // Guardar el token en la base de datos
        await connection.query(
            "UPDATE tbusuario SET token = ? WHERE id_cedula = ?",
            [token, cedula]
        );
        

        // Eliminar la contraseña antes de devolver el usuario
        delete user.contrasena;

        return { user, token };
    } catch (error) {
        console.error("Error en el login del usuario:", error.message);
        throw error;
    } finally {
        await db.disconnect();
    }
}

//  Verificar y eliminar token expirado
static async verificarYEliminarTokenExpirado(cedula) {
  const connection = await db.connect();
  try {
      //  Obtener el token almacenado en la base de datos
      const [rows] = await connection.query(
          "SELECT token FROM tbusuario WHERE id_cedula = ?",
          [cedula]
      );

      if (rows.length === 0 || !rows[0].token) {
          return false; // No hay token para este usuario
      }

      const token = rows[0].token;

      try {
          //  Intentar verificar el token
          jwt.verify(token, "clave_secreta_super_segura");
          return false; // Token aún válido
      } catch (error) {
          if (error.name === "TokenExpiredError") {
              console.log(`Token expirado para el usuario ${cedula}, eliminando...`);
              await connection.query(
                  "UPDATE tbusuario SET token = NULL WHERE id_cedula = ?",
                  [cedula]
              );
              return true; // Token eliminado
          }
      }
  } catch (error) {
      console.error("Error al verificar/eliminar token:", error.message);
  } finally {
      await db.disconnect();
  }
  return false;
}

  

  // Cambiar contraseña
  static async changePassword(cedula, nuevaContrasena) {
    const connection = await db.connect();
    try {
        // Cifrar la nueva contraseña
        const contrasenaHashed = await bcrypt.hash(nuevaContrasena, 10);

        const [result] = await connection.query(
            `UPDATE tbusuario SET contrasena = ? WHERE id_cedula = ?`,
            [contrasenaHashed, cedula]
        );
        return result.affectedRows > 0; // Devuelve true si se actualizó correctamente
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error.message);
        throw error;
    } finally {
        await db.disconnect();
    }
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
