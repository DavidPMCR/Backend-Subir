const ConsultationData = require("../data/consultationData");

class ControllerConsultation {
  // Crear consulta
  async createConsultation(data) {
    try {
      const result = await ConsultationData.createConsultation(data);
      return { success: true, id: result };
    } catch (error) {
      console.error("Error al crear consulta:", error.message);
      throw error;
    }
  }

  // Obtener todas las consultas
  async getAllConsultation(idEmpresa) {
    try {
      const consultation = await ConsultationData.getAllConsultation(idEmpresa);
      return consultation;
    } catch (error) {
      console.error("Error al obtener consultas:", error.message);
      throw error;
    }
  }

  // Obtener citas por cédula
  async getConsultationByCedula(cedula) {
    try {
      const user = await ConsultationData.getConsultationByCedula(cedula);

      if (!user) {
        throw new Error(`No se encontraron citas con la cédula ${cedula}`);
      }
    
      return user;
    } catch (error) {
      console.error("Error al obtener citas de este usuario:", error.message);
      throw error;
    }
  }

  // Eliminar consulta por id_consulta
  async deleteConsultation(id_consulta) {
    try {
      const result = await ConsultationData.deleteConsultation(id_consulta);
      if (!result) {
        throw new Error(`No se encontró consulta con la id: ${id_consulta}`);
      }
      return { success: true, message: "Consulta eliminada con éxito" };
    } catch (error) {
      console.error("Error al eliminar consulta:", error.message);
      throw error;
    }
  }

  // Actualizar consulta (formateando fecha antes de enviar)
  async updateConsultation(data) {
    try {
      // 👉 Formatear la fecha aquí
      if (data.fecha_consulta) {
        data.fecha_consulta = data.fecha_consulta.split('T')[0]; // De '2025-04-25T00:00:00.000Z' a '2025-04-25'
      }

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
