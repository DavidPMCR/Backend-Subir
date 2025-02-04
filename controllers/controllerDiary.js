const DiaryData = require("../data/diaryData");

class ControllerDiary {

  // Crear o agendar cita
  async createDiary(data) {
    try {
      const result = await DiaryData.createDiary(data); // Método estático
      return { success: true, id: result };
    } catch (error) {
      console.error("Error al crear paciente:", error.message);
      throw error;
    }
  }

  // Obtener todas las citas
  async getAllDiary() {
    try {
      const diarys = await DiaryData.getAllDiary(); // Método estático, devuelve todas citas 
      return diarys;
    } catch (error) {
      console.error("Error al obtener citas:", error.message);
      throw error;
    }
  }

  // Obtener una cita
  async getDiaryByCedula(cedula) {
    try {
      const user = await DiaryData.getDiaryByCedula(cedula); // Método estático

      if (!user) {
        throw new Error(`No se encontró cita programada para el paciente con la cédula ${cedula}`);
      }
    
      return user;
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      throw error;
    }
  }

  // Eliminar usuario por cédula
  async deleteDiaryByID_cita(id_cita) {
    try {
      const result = await DiaryData.deleteDiary(id_cita); // Método estático
      if (!result) {
        throw new Error(`No se encontró cita  ${id_cita}`);
      }
      return { success: true, message: "Cita elimanda con éxito" };
    } catch (error) {
      console.error("Error al eliminar cita:", error.message);
      throw error;
    }
  }

  // Actualizar cita por id_cita
  async updateDiaryByID_cita(data) {
    try {
      const result = await DiaryData.updateDiary(data); // Método estático
      if (!result) {
        throw new Error(`No se encontró un usuario con la cédula ${data.id_cedula}`);
      }
      return { success: true, message: "Cita actualizada con éxito" };
    } catch (error) {
      console.error("Error al actualizar cita:", error.message);
      throw error;
    }
  }
}

module.exports = ControllerDiary;
