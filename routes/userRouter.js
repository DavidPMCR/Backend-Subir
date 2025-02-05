const ControllerUser = require("../controllers/controllerUser");
const validateBody = require("../middlewares/validateBody");
const authMiddleware = require("../middlewares/authMiddleware");


const userRouter = (app) => {
  let response = {
    data: "message",
    code: "code",
  };
  
//obtener usuario por cedula/ ruta api
app.route("/auth/login").post(async (req, res) => {
  let response = { data: null, code: null };
  try {
      const { id_cedula, contrasena } = req.body;

      if (!id_cedula || !contrasena) {
          response.data = "Cédula y contraseña son requeridas";
          response.code = "400";
          return res.status(400).send(response);
      }

      const controller = new ControllerUser();
      const result = await controller.auth(id_cedula, contrasena);

      if (result.error) {
          response.data = result.error;
          response.code = "403"; // 403 Forbidden
          return res.status(403).send(response);
      }

      if (!result) {
          response.data = "Credenciales incorrectas";
          response.code = "401";
          return res.status(401).send(response);
      }

      response.data = {
          message: "Login exitoso",
          user: result.user,
          token: result.token, // Enviar token al frontend
      };
      response.code = "200";
      return res.status(200).send(response);
  } catch (error) {
      console.error("Error en /auth/login:", error.stack);
      response.data = error.message;
      response.code = "500";
      return res.status(500).send(response);
  }
});



//  RUTA PARA CERRAR SESIÓN Y ELIMINAR TOKEN
app.route("/auth/logout").post(authMiddleware, async (req, res) => {
  try {
    const controller = new ControllerUser();
    const result = await controller.logout(req.user.id); // Se pasa el ID del usuario autenticado

    if (result.success) {
      return res.status(200).json({ message: "Sesión cerrada correctamente" });
    } else {
      return res.status(400).json({ message: "No se pudo cerrar sesión" });
    }
  } catch (error) {
    console.error("Error en /auth/logout:", error.stack);
    return res.status(500).json({ message: "Error cerrando sesión", error: error.message });
  }
})

//  RUTA PARA ELIMINACIÓN LÓGICA (MARCAR USUARIO COMO INACTIVO)
app.route("/user/delete/:cedula").delete(async (req, res) => {
  try {
    const controller = new ControllerUser();
    const { cedula } = req.params;

    if (!cedula) {
      return res.status(400).json({ message: "La cédula es obligatoria" });
    }

    const result = await controller.deleteUserByCedula(cedula);
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(400).json({ message: "El usuario no fue eliminado" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error en la eliminación", error: error.message });
  }
});

//  RUTA PARA ELIMINACIÓN DEFINITIVA (BORRAR USUARIO DE LA BASE DE DATOS)
app.route("/user/delete/adm/:cedula").delete(async (req, res) => {
  try {
    const controller = new ControllerUser();
    const { cedula } = req.params;

    if (!cedula) {
      return res.status(400).json({ message: "La cédula es obligatoria" });
    }

    const result = await controller.deleteUserByADM(cedula); // Llamando a la función de eliminación definitiva
    if (result) {
      return res.status(200).json({ message: "Usuario eliminado permanentemente" });
    } else {
      return res.status(400).json({ message: "No se pudo eliminar el usuario" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
  }
});


  app.route("/user")
    // Crear usuario
    .post(async (req, res) => {
      try {
        const controller = new ControllerUser();

        const result = await controller.insertUser(req.body);

        if (result.success) {
          response.data = "El Usuario fue creado correctamente";
          response.code = "200";
        } else {
          response.data = "El Usuario No fue creado";
          response.code = "400";
        }
      } catch (error) {
        response.data = error.message;
        response.code = "500";
      }
      res.send(response);
    })

    // Obtener todos los usuarios
    .get(async (req, res) => {
      try {
        const controller = new ControllerUser();
        const users = await controller.getAllUsers();
        response.data = users;
        response.code = "200";
      } catch (error) {
        response.data = error.message;
        response.code = "500";
      }
      res.send(response);
    })
    
    // Actualizar usuario por cédula
.patch(async (req, res) => {
  // Inicializa el objeto response
  const response = {
    data: null,
    code: null,
  };

  try {
    // Instancia el controlador y llama al método para actualizar el usuario
    const controller = new ControllerUser();
    const result = await controller.updateUserByCedula(req.body);
    
    // Verifica el resultado del controlador
    if (result.success) {
      response.data = result.message || "Usuario actualizado correctamente";
      response.code = "200";
    } else {
      response.data = "El Usuario no fue actualizado";
      response.code = "400";
    }
  } catch (error) {
    // Captura errores y devuelve una respuesta adecuada
    response.data = error.message || "Error interno del servidor";
    response.code = "500";
  }

  // Envía la respuesta al cliente
  res.status(response.code).json(response);
});


//  RUTA PARA OBTENER USUARIOS POR EMPRESA CON ROL "D"
app.route("/user/dependientes/:id_empresa").get(async (req, res) => {
  try {
      const { id_empresa } = req.params;

      if (!id_empresa) {
          return res.status(400).json({ message: "El ID de la empresa es obligatorio." });
      }

      const controller = new ControllerUser();
      const users = await controller.getUsersByEmpresa(id_empresa);

      return res.status(200).json({ success: true, data: users });
  } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
  }
});


};

module.exports = userRouter;
