const ControllerMedicalHistory = require("../controllers/controllerMedicalHistory");
const validateBody = require("../middlewares/validateBody");

const patientRouter = (app) => {
  let response = {
    data: "message",
    code: "code",
  };
  
  //obtener historial m paciente por cedula/ ruta api
  app.route("/mh/:cedula")
  .get(async (req, res) => {
    try {
      const { cedula } = req.params; // Obtiene la cédula de la URL
      const controller = new ControllerMedicalHistory();
      const user = await controller.getMHByCedula(cedula);

      if (user) {
        response.data = user;
        response.code = "200";
      } else {
        response.data = "historial no encontrado";
        response.code = "404";
      }
    } catch (error) {
      response.data = error.message;
      response.code = "500";
    }
    res.send(response);
  })

 //eliminar paciente por cedula
  app.route("/mh/:cedula")

  .delete(async (req, res) => {
    try {
      const controller = new ControllerMedicalHistory();
      const { cedula } = req.params;

      if(!cedula){
          response.data = "La cédula es obligatoria";
          response.code = "400";
          return res.send(response);
      }

      const result = await controller.deleteMH(cedula);
      if (result.success) {
        response.data = result.message;
        response.code = "200";
      } else {
        response.data = "El historial medico del paciente No fue eliminado";
        response.code = "400";
      }
    } catch (error) {
      response.data = error.message;
      response.code = "500";
    }
    res.send(response);
  });

 // Crear los historiales médicos de los pacientes
app.route("/mh")
.post(async (req, res) => {
  const response = {};
  try {
    const controller = new ControllerMedicalHistory();
    const result = await controller.createMH(req.body);

    if (result.success) {
      response.data = "El Historial Médico fue creado correctamente";
      response.code = "200";
    } else {
      response.data = "El Historial Médico no fue creado";
      response.code = "400";
    }
  } catch (error) {
    if (error.message === "Paciente ya posee un historial médico registrado.") {
      response.data = error.message;
      response.code = "400"; // Código 400 para errores del cliente
    } else {
      response.data = "Error interno del servidor.";
      response.code = "500"; // Código 500 para errores del servidor
    }
  }
  res.status(parseInt(response.code, 10)).send(response);
})

    
    // Actualizar historial medico del paciente
    .patch(async (req, res) => {
      try {
        const controller = new ControllerMedicalHistory();
        const result = await controller.updateMH(req.body);
        if (result.success) {
          response.data = result.message;
          response.code = "200";
        } else {
          response.data = "El historial medico No fue actualizado";
          response.code = "400";
        }
      } catch (error) {
        response.data = error.message;
        response.code = "500";
      }
      res.send(response);
    });

};

module.exports = patientRouter;
