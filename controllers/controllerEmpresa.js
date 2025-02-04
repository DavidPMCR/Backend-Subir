const EmpresaData = require("../data/empresaData");

class ControllerEmpresa {

    // Crear empresa
    async insertEmpresa(data) {
        try {
            const result = await EmpresaData.createEmpresa(data);
            return { success: true, id: result };
        } catch (error) {
            console.error("Error al insertar empresa:", error.message);
            throw error;
        }
    }

    // Obtener todas las empresas
    async getAllEmpresas() {
        try {
            return await EmpresaData.getAllEmpresas();
        } catch (error) {
            console.error("Error al obtener empresas:", error.message);
            throw error;
        }
    }

    // Eliminar empresa por ID
    async deleteEmpresaById(id_empresa) {
        try {
            const result = await EmpresaData.deleteEmpresa(id_empresa);
            if (!result) {
                throw new Error(`No se encontró una empresa con el ID ${id_empresa}`);
            }
            return { success: true, message: "Empresa eliminada con éxito" };
        } catch (error) {
            console.error("Error al eliminar empresa:", error.message);
            throw error;
        }
    }

    // Actualizar empresa por ID
    async updateEmpresaById(id_empresa, data) {
        try {
            const result = await EmpresaData.updateEmpresa(id_empresa, data);
            if (!result) {
                throw new Error(`No se encontró una empresa con el ID ${id_empresa}`);
            }
            return { success: true, message: "Empresa actualizada con éxito" };
        } catch (error) {
            console.error("Error al actualizar empresa:", error.message);
            throw error;
        }
    }
}

module.exports = ControllerEmpresa;
