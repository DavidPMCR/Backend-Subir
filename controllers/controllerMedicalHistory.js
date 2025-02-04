const MedicalHistoryData = require("../data/medicalHistoryData");


class ControllerMedicalHistory {

  // Crear historial medico
  async createMH(data) {
    try {
      const result = await MedicalHistoryData.createMH(data); // Método estático
      return { success: true, id: result };
    } catch (error) {
      console.error("Error al crear el historial Medico:", error.message);
      throw error;
    }
  }

  
  // Obtener un historial por cedula
  async getMHByCedula(cedula) {
    try {
      const user = await MedicalHistoryData.getMHByCedula(cedula); // Método estático

      if (!user) {
        throw new Error(`No se encontró paciente con la cédula ${cedula}`);
      }
    
      return user;
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      throw error;
    }
  }

  // Eliminar usuario por cédula
  async deleteMH(cedula) {
    try {
      const result = await MedicalHistoryData.deleteMH(cedula); // Método estático
      if (!result) {
        throw new Error(`No se encontró paciente con la cédula ${cedula}`);
      }
      return { success: true, message: "Historial medico eliminado con éxito" };
    } catch (error) {
      console.error("Error al eliminar historial medico:", error.message);
      throw error;
    }
  }

  // Actualizar historia por cédula
  async updateMH(data) {
    try {
      const result = await MedicalHistoryData.updateMH(data); // Método estático
      if (!result) {
        throw new Error(`No se encontró un usuario con la cédula ${data.id_cedula}`);
      }
      return { success: true, message: "Historial actualizado con éxito" };
    } catch (error) {
      console.error("Error al actualizar el historial:", error.message);
      throw error;
    }
  }
}

module.exports = ControllerMedicalHistory;
