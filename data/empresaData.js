const db = require("./connectionDB");

class EmpresaData {
    // Obtener todas las empresas
    async getAllEmpresas() {
        const connection = await db.connect();
        try {
            const [rows] = await connection.query('SELECT * FROM empresa');
            return rows;
        } catch (error) {
            console.error("Error al obtener empresas:", error.message);
            throw error;
        } finally {
            await db.disconnect();
        }
    }

    // Crear una nueva empresa
    async createEmpresa(data) {
        const connection = await db.connect();
        try {
            const { cedula, tipo_cedula, nombre, correo, telefono, estado } = data;
            const [result] = await connection.query(
                `INSERT INTO empresa (cedula, tipo_cedula, nombre, correo, telefono, estado)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [cedula, tipo_cedula, nombre, correo, telefono, estado]
            );
            return result.insertId; // Devuelve el ID de la nueva empresa
        } catch (error) {
            console.error("Error al crear empresa:", error.message);
            throw error;
        } finally {
            await db.disconnect();
        }
    }

    // Actualizar una empresa por ID
    async updateEmpresa(id_empresa, data) {
        const connection = await db.connect();
        try {
            const { cedula, tipo_cedula, nombre, correo, telefono, estado } = data;
            const [result] = await connection.query(
                `UPDATE empresa
                 SET cedula = ?, tipo_cedula = ?, nombre = ?, correo = ?, telefono = ?, estado = ?
                 WHERE id_empresa = ?`,
                [cedula, tipo_cedula, nombre, correo, telefono, estado, id_empresa]
            );
            return result.affectedRows > 0; // Devuelve true si se actualizó correctamente
        } catch (error) {
            console.error("Error al actualizar empresa:", error.message);
            throw error;
        } finally {
            await db.disconnect();
        }
    }

    // Eliminar una empresa por ID
    async deleteEmpresa(id_empresa) {
        const connection = await db.connect();
        try {
            const [result] = await connection.query(
                `DELETE FROM empresa WHERE id_empresa = ?`,
                [id_empresa]
            );
            return result.affectedRows > 0; // Devuelve true si se eliminó correctamente
        } catch (error) {
            console.error("Error al eliminar empresa:", error.message);
            throw error;
        } finally {
            await db.disconnect();
        }
    }
}

module.exports = EmpresaData;
