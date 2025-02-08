const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("./connectionDB");
const bcrypt = require("bcryptjs");

class UserData {
    // Obtener todos los usuarios
    static async getAllUsers() {
        try {
            return await db.query(
                "SELECT id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, rol FROM tbusuario WHERE estado = 1"
            );
        } catch (error) {
            console.error("Error al obtener usuarios:", error.message);
            throw error;
        }
    }

    // Obtener empleados asociados a una empresa y con rol "D"
    static async getUsersByEmpresaAndRole(id_empresa) {
        try {
            return await db.query(
                `SELECT id_cedula, nombre, apellidos, correo, telefono, id_empresa, rol 
                 FROM tbusuario 
                 WHERE id_empresa = ? AND rol = ? AND estado = 1`,
                [id_empresa, "D"]
            );
        } catch (error) {
            console.error("Error al obtener los usuarios de la empresa:", error.message);
            throw error;
        }
    }

    // Obtener un usuario por su cédula
    static async getUserByCedula(cedula) {
        try {
            const rows = await db.query(
                "SELECT id_cedula, nombre, apellidos, correo, telefono FROM tbusuario WHERE id_cedula = ? AND estado = 1",
                [cedula]
            );
            return rows[0] || null;
        } catch (error) {
            console.error("Error al obtener el usuario:", error.message);
            throw error;
        }
    }

    // Crear un nuevo usuario con validación de máximo 3 usuarios por empresa
    static async createUser(data) {
        try {
            const { id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol } = data;

            // Verificar cuántos usuarios existen en la empresa
            const [totalUsuarios] = await db.query(
                "SELECT COUNT(*) AS totalUsuarios FROM tbusuario WHERE id_empresa = ? AND estado = 1",
                [id_empresa]
            );

            if (totalUsuarios.totalUsuarios >= 3) {
                throw new Error("Máximo de usuarios creados para esta empresa.");
            }

            // Cifrar la contraseña antes de guardarla
            const contrasenaHashed = await bcrypt.hash(contrasena, 10);

            // Insertar el nuevo usuario en la base de datos
            const result = await db.query(
                `INSERT INTO tbusuario (id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasena, rol, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_cedula, tipo_cedula, id_empresa, nombre, apellidos, correo, telefono, contrasenaHashed, rol, 1]
            );

            return result.insertId;
        } catch (error) {
            console.error("Error al crear el usuario:", error.message);
            throw error;
        }
    }

    // Actualizar un usuario
    static async updateUser(data) {
        try {
            const { id_cedula, nombre, apellidos, correo, telefono, estado } = data;
            const result = await db.query(
                `UPDATE tbusuario
                 SET nombre = ?, apellidos = ?, correo = ?, telefono = ?, estado = ?
                 WHERE id_cedula = ?`,
                [nombre, apellidos, correo, telefono, estado, id_cedula]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error al actualizar el usuario:", error.message);
            throw error;
        }
    }

    // Eliminar un usuario
    static async deleteUser(cedula) {
        try {
            const result = await db.query(
                "UPDATE tbusuario SET estado = ? WHERE id_cedula = ?",
                [0, cedula]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error al eliminar el usuario:", error.message);
            throw error;
        }
    }

    // Login de usuario
    static async login(cedula, contrasena) {
        try {
            const rows = await db.query(
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
                return { error: "Ya existe una sesión activa. Cierra sesión antes de iniciar nuevamente." };
            }

            // Verificar contraseña con bcrypt
            const isMatch = await bcrypt.compare(String(contrasena), String(user.contrasena));

            if (!isMatch) {
                console.error("Contraseña incorrecta para el usuario:", cedula);
                return null;
            }

            // Generar token JWT
            const token = jwt.sign({ id: user.id_cedula }, "clave_secreta_super_segura", { expiresIn: "30m" });

            // Guardar el token en la base de datos
            await db.query("UPDATE tbusuario SET token = ? WHERE id_cedula = ?", [token, cedula]);

            delete user.contrasena;
            return { user, token };
        } catch (error) {
            console.error("Error en el login del usuario:", error.message);
            throw error;
        }
    }

    // Cambiar contraseña
    static async changePassword(cedula, nuevaContrasena) {
        try {
            const contrasenaHashed = await bcrypt.hash(nuevaContrasena, 10);
            const result = await db.query(
                "UPDATE tbusuario SET contrasena = ? WHERE id_cedula = ?",
                [contrasenaHashed, cedula]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error al cambiar la contraseña:", error.message);
            throw error;
        }
    }

    // Eliminar token de sesión
    static async removeToken(userId) {
        try {
            const result = await db.query("UPDATE tbusuario SET token = NULL WHERE id_cedula = ?", [userId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error al eliminar el token:", error.message);
            throw error;
        }
    }
}

module.exports = UserData;
