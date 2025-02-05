const express = require("express");
const ControllerUser = require("../controllers/controllerUser");
const validateBody = require("../middlewares/validateBody");
const authMiddleware = require("../middlewares/authMiddleware");

const userRouter = (app) => {
  let response = {
    data: "message",
    code: "code",
  };

  // **Login de usuario**
  app.route("/auth/login").post(async (req, res) => {
    let response = { data: null, code: null };
    try {
      const { id_cedula, contrasena } = req.body;

      if (!id_cedula || !contrasena) {
        return res.status(400).json({ success: false, message: "Cédula y contraseña son requeridas" });
      }

      const controller = new ControllerUser();
      const result = await controller.auth(id_cedula, contrasena);

      if (result.error) {
        return res.status(403).json({ success: false, message: result.error });
      }

      return res.status(200).json({ success: true, message: "Login exitoso", user: result.user, token: result.token });
    } catch (error) {
      console.error("Error en /auth/login:", error.stack);
      return res.status(500).json({ success: false, message: "Error interno", error: error.message });
    }
  });

  // **Logout de usuario**
  app.route("/auth/logout").post(authMiddleware, async (req, res) => {
    try {
      const controller = new ControllerUser();
      const result = await controller.logout(req.user.id);

      if (result) {
        return res.status(200).json({ success: true, message: "Sesión cerrada correctamente" });
      } else {
        return res.status(400).json({ success: false, message: "No se pudo cerrar sesión" });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error cerrando sesión", error: error.message });
    }
  });

  // **Eliminar usuario (Lógico)**
  app.route("/user/delete/:cedula").delete(async (req, res) => {
    try {
      const controller = new ControllerUser();
      const { cedula } = req.params;

      if (!cedula) {
        return res.status(400).json({ success: false, message: "La cédula es obligatoria" });
      }

      const result = await controller.deleteUserByCedula(cedula);
      return res.status(200).json({ success: true, message: "Usuario marcado como inactivo" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error en la eliminación", error: error.message });
    }
  });

  // **Eliminar usuario (Definitivo)**
  app.route("/user/delete/adm/:cedula").delete(async (req, res) => {
    try {
      const controller = new ControllerUser();
      const { cedula } = req.params;

      if (!cedula) {
        return res.status(400).json({ success: false, message: "La cédula es obligatoria" });
      }

      const result = await controller.deleteUserByADM(cedula);
      return res.status(200).json({ success: true, message: "Usuario eliminado permanentemente" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error al eliminar usuario", error: error.message });
    }
  });

  // **CRUD de usuarios**
  app.route("/user")
    // Crear usuario
    .post(async (req, res) => {
      try {
        const controller = new ControllerUser();
        const result = await controller.insertUser(req.body);

        if (result.success) {
          return res.status(200).json({ success: true, message: "Usuario creado correctamente" });
        } else {
          return res.status(400).json({ success: false, message: "No se pudo crear el usuario" });
        }
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error en la creación", error: error.message });
      }
    })

    // Obtener todos los usuarios
    .get(async (req, res) => {
      try {
        const controller = new ControllerUser();
        const users = await controller.getAllUsers();

        return res.status(200).json({ success: true, data: users });
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error al obtener usuarios", error: error.message });
      }
    })

    // Actualizar usuario por cédula
    .patch(async (req, res) => {
      try {
        const controller = new ControllerUser();
        const result = await controller.updateUserByCedula(req.body);

        if (result.success) {
          return res.status(200).json({ success: true, message: "Usuario actualizado correctamente" });
        } else {
          return res.status(400).json({ success: false, message: "El usuario no fue actualizado" });
        }
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error en la actualización", error: error.message });
      }
    });

  // **Obtener usuarios por empresa con rol "D"**
  app.route("/user/dependientes/:id_empresa").get(async (req, res) => {
    try {
      const { id_empresa } = req.params;

      if (!id_empresa) {
        return res.status(400).json({ success: false, message: "El ID de la empresa es obligatorio." });
      }

      const controller = new ControllerUser();
      const users = await controller.getUsersByEmpresa(id_empresa);

      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error al obtener usuarios", error: error.message });
    }
  });
};

module.exports = userRouter;
