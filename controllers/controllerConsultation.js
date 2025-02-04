const ConsultationData = require("../data/consultationData");

class ControllerConsultation {

  // Crear consluta
  async createConsultation(data) {
    try {
      const result = await ConsultationData.createConsultation(data); // Método estático
      return { success: true, id: result };
    } catch (error) {
      console.error("Error al crear consulta:", error.message);
      throw error;
    }
  }

  // Obtener todas las consultas
  async getAllConsultation() {
    try {
      const consultation = await ConsultationData.getAllConsultation(); // Método estático, devuelve todos los usuarios (pacientes)
      return consultation;
    } catch (error) {
      console.error("Error al obtener pacientes:", error.message);
      throw error;
    }
  }

  // Obtener citas por cedula
  async getConsultationByCedula(cedula) {
    try {
      const user = await ConsultationData.getConsultationByCedula(cedula); // Método estático

      if (!user) {
        throw new Error(`No se encontrócitas con la cédula ${cedula}`);
      }
    
      return user;
    } catch (error) {
      console.error("Error al obtener citas de este usuari0:", error.message);
      throw error;
    }
  }

  // Eliminar usuario por cédula
  async deleteConsultation(id_consulta) {
    try {
      const result = await ConsultationData.deleteConsultation(id_consulta); // Método estático
      if (!result) {
        throw new Error(`No se encontró consulta con la id: ${id_consulta}`);
      }
      return { success: true, message: "Consulta eliminada con éxito" };
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      throw error;
    }
  }

  // Actualizar consulta
  async updateConsultation(data) {
    try {
      const result = await ConsultationData.updateConsultation(data);
      if (!result) {
        throw new Error(`No se encontró consulta con los datos proporcionados`);
      }
      return { success: true, message: "Consulta actualizada con éxito" };
    } catch (error) {
      console.error("Error al actualizar consulta:", error.message);
      throw error;
    }
  }
}  

module.exports = ControllerConsultation;
