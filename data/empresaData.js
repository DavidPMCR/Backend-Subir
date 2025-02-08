const db = require("./connectionDB");

class EmpresaData {
    // 📌 Obtener todas las empresas
    static async getAllEmpresas() {
        let connection;
        try {
            connection = await db.pool.getConnection(); // 🟢 Obtener conexión del pool
            const [rows] = await connection.query('SELECT * FROM empresa');
            return rows;
        } catch (error) {
            console.error("❌ Error al obtener empresas:", error.message);
            throw error;
        } finally {
            if (connection) connection.release(); // 🔄 Liberar conexión en lugar de cerrarla
        }
    }

    // 📌 Crear una nueva empresa
    static async createEmpresa(data) {
        let connection;
        try {
            connection = await db.pool.getConnection();
            const { cedula, tipo_cedula, nombre, correo, telefono, estado } = data;
            const [result] = await connection.query(
                `INSERT INTO empresa (cedula, tipo_cedula, nombre, correo, telefono, estado)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [cedula, tipo_cedula, nombre, correo, telefono, estado]
            );
            return { success: true, insertId: result.insertId, message: "Empresa creada correctamente" };
        } catch (error) {
            console.error("❌ Error al crear empresa:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    // 📌 Actualizar una empresa por ID
    static async updateEmpresa(id_empresa, data) {
        let connection;
        try {
            connection = await db.pool.getConnection();
            const { cedula, tipo_cedula, nombre, correo, telefono, estado } = data;
            const [result] = await connection.query(
                `UPDATE empresa
                 SET cedula = ?, tipo_cedula = ?, nombre = ?, correo = ?, telefono = ?, estado = ?
                 WHERE id_empresa = ?`,
                [cedula, tipo_cedula, nombre, correo, telefono, estado, id_empresa]
            );
            return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? "Empresa actualizada correctamente" : "No se encontró la empresa" };
        } catch (error) {
            console.error("❌ Error al actualizar empresa:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    // 📌 Eliminar una empresa por ID
    static async deleteEmpresa(id_empresa) {
        let connection;
        try {
            connection = await db.pool.getConnection();
            const [result] = await connection.query(
                `DELETE FROM empresa WHERE id_empresa = ?`,
                [id_empresa]
            );
            return { success: result.affectedRows > 0, message: result.affectedRows > 0 ? "Empresa eliminada correctamente" : "No se encontró la empresa" };
        } catch (error) {
            console.error("❌ Error al eliminar empresa:", error.message);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = EmpresaData;
