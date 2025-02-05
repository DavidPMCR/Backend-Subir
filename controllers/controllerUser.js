const UserData = require("../data/userData");

class ControllerUser {
  
  // **Autenticación de usuario**
  async auth(cedula, contrasena) {
    try {
        // Verificar y eliminar token expirado antes de intentar login
        await UserData.verificarYEliminarTokenExpirado(cedula);

        const user = await UserData.login(cedula, contrasena); 

        if (!user) {
            throw new Error("Credenciales incorrectas");
        }
        return user;
    } catch (error) {
        console.error("Error en la autenticación:", error.message);
        throw error;
    }
  }

  // **Cerrar sesión y eliminar token**
  async logout(userId) {
    try {
      const result = await UserData.removeToken(userId);
      if (!result) {
        throw new Error("Error al eliminar el token de la base de datos");
      }
      return { success: true };
    } catch (error) {
      console.error("Error en logout:", error.message);
      throw error;
    }
  }

  // **Cambiar contraseña**
  async changeUserPassword(cedula, nuevaContrasena) {
    try {
        const result = await UserData.changePassword(cedula, nuevaContrasena);
        if (!result) {
          throw new Error(`No se encontró un usuario con la cédula ${cedula}`);
        }
        return { success: true, message: "Contraseña cambiada con éxito" };
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error.message);
        throw error;
    }
  }

  // **Crear usuario**
  async insertUser(data) {
    try {
        if (!data.id_cedula || data.id_cedula.trim() === "") {
            throw new Error("La cédula es obligatoria.");
        }
        if (!data.contrasena || data.contrasena.trim() === "") {
            throw new Error("La contraseña es obligatoria.");
        }

        const result = await UserData.createUser(data);

        return { success: true, id: result };
    } catch (error) {
        console.error("Error al insertar usuario:", error.message);
        throw new Error(error.message);
    }
  }

  // **Obtener todos los usuarios**
  async getAllUsers() {
    try {
      return await UserData.getAllUsers();
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
      throw error;
    }
  }

  // **Obtener usuarios por empresa con rol dependiente**
  async getUsersByEmpresa(id_empresa) {
    try {
        const users = await UserData.getUsersByEmpresaAndRole(id_empresa);
        if (users.length === 0) {
            throw new Error("No se encontraron dependientes para esta empresa.");
        }
        return users;
    } catch (error) {
        console.error("Error en ControllerUser - getUsersByEmpresa:", error.message);
        throw error;
    }
  }

  // **Obtener un usuario por cédula**
  async getUserByCedula(cedula) {
    try {
      const user = await UserData.getUserByCedula(cedula);

      if (!user) {
        throw new Error(`No se encontró un usuario con la cédula ${cedula}`);
      }
    
      return user;
    } catch (error) {
      console.error("Error al obtener usuario:", error.message);
      throw error;
    }
  }

  // **Eliminar usuario por administrador (permanente)**
  async deleteUserByADM(cedula) {
    try {
      const result = await UserData.deleteUserByADM(cedula);
      if (!result) {
        throw new Error(`No se encontró un usuario con la cédula ${cedula}`);
      }
      return { success: true, message: "Usuario eliminado con éxito" };
    } catch (error) {
      console.error("Error al eliminar usuario", error.message);
      throw error;
    }
  }

  // **Eliminar usuario (lógico, desactivación)**
  async deleteUserByCedula(cedula) {
    try {
      const result = await UserData.deleteUser(cedula);
      if (!result) {
        throw new Error(`No se encontró un usuario con la cédula ${cedula}`);
      }
      return { success: true, message: "Usuario eliminado con éxito" };
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      throw error;
    }
  }

  // **Actualizar usuario por cédula**
  async updateUserByCedula(data) {
    console.log('Datos enviados al servidor:', data);
    try {
      const result = await UserData.updateUser(data);
      
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

module.exports = ControllerUser;
