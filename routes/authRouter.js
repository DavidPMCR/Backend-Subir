const ControllerUser = require("../controllers/controllerUser");

const authRouter = (app) => {
  let response = {
    data: "message",
    code: "code",
  };

  app.route("/auth/login").post(async (req, res) => {
      try {

        const { id_cedula, contrasena } = req.body;

        if (!id_cedula || !contrasena) {
          response.data = "Correo y cédula son requeridos";
          response.code = "400";
          return res.send(response);
        }

        const controller = new ControllerUser();
        const user = await controller.auth(id_cedula, contrasena);

        if (user) {
          response.data = {
            message: "Login exitoso",
            user,
          };
          response.code = "200";
        } else {
          response.data = "Credenciales incorrectas";
          response.code = "401";
        }
      } catch (error) {
        response.data = error.message;
        response.code = "500";
      }
      res.send(response);
    });

  app.route("/auth/change-password").patch(async (req, res) => {

    const { id_cedula, contrasena } = req.body;
    let response = { data: "message", code: "code" };

    try {
      const controller = new ControllerUser();
      const result = await controller.changeUserPassword(id_cedula, contrasena);
      response.data = result.message;
      response.code = "200";
    } catch (error) {
      response.data = error.message;
      response.code = "500";
    }
    res.send(response);
  });
};

module.exports = authRouter;
