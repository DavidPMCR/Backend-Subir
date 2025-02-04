const PatientData = require("../data/patientData");

class ControllerPatient {

  // Crear usuario
  async createUser(data) {
    try {
      const result = await PatientData.createUser(data); // Método estático
      return { success: true, id: result };
    } catch (error) {
      console.error("Error al crear paciente:", error.message);
      throw error;
    }
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const users = await PatientData.getAllUsers(); // Método estático, devuelve todos los usuarios (pacientes)
      return users;
    } catch (error) {
      console.error("Error al obtener pacientes:", error.message);
      throw error;
    }
  }

  // Obtener un usuario por cedula
  async getUserByCedula(cedula) {
    try {
      const user = await PatientData.getUserByCedula(cedula); // Método estático

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
  async deleteUserByCedula(cedula) {
    try {
      const result = await PatientData.deleteUser(cedula); // Método estático
      if (!result) {
        throw new Error(`No se encontró paciente con la cédula ${cedula}`);
      }
      return { success: true, message: "Usuario eliminado con éxito" };
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      throw error;
    }
  }

  // Actualizar usuario por cédula
  async updateUserByCedula(data) {
    try {
      const result = await PatientData.updateUser(data); // Método estático
      if (!result) {
        throw new Error(`No se encontró un usuario con la cédula ${data.id_cedula}`);
      }
      return { success: true, message: "Usuario actualizado con éxito" };
    } catch (error) {
      console.error("Error al actualizar usuario:", error.message);
      throw error;
    }
  }
}

module.exports = ControllerPatient;
