const ControllerConsultation = require("../controllers/controllerConsultation");
const validateBody = require("../middlewares/validateBody");

const consultationRouter = (app) => {
  let response = {
    data: "message",
    code: "code",
  };
  
 // 🔎 Obtener consultas por cédula
 app.route("/consultation/:cedula").get(async (req, res) => {
  try {
    const { cedula } = req.params;
    const controller = new ControllerConsultation();
    const user = await controller.getConsultationByCedula(cedula);

    if (user && user.length > 0) {
      const orderedData = user.map((consulta) => {
        const {
          id_consulta,
          nombre_paciente,
          apellido_paciente,
          fecha_consulta,
          ...resto
        } = consulta;

        return {
          id_consulta,
          nombre_paciente,
          apellido_paciente,
          fecha_consulta:
            fecha_consulta instanceof Date
              ? fecha_consulta.toISOString().split("T")[0]
              : fecha_consulta.split("T")[0],
          ...resto,
        };
      });

      res.status(200).send({
        data: orderedData,
        code: "200",
      });
    } else {
      res.status(404).send({
        data: "Consulta usuario no encontrada",
        code: "404",
      });
    }
  } catch (error) {
    res.status(500).send({
      data: error.message,
      code: "500",
    });
  }
});

// 🗑️ Eliminar (lógicamente) consulta por id_consulta (cambia estado a 0)
app.route("/consultation/:id_consulta").patch(async (req, res) => {
  try {
    const controller = new ControllerConsultation();
    const { id_consulta } = req.params;

    if (!id_consulta) {
      response.data = "Identificador necesario";
      response.code = "400";
      return res.send(response);
    }

    const result = await controller.deleteConsultation(id_consulta);
    if (result.success) {
      response.data = result.message;
      response.code = "200";
    } else {
      response.data = "Consulta No fue eliminada";
      response.code = "400";
    }
  } catch (error) {
    response.data = error.message;
    response.code = "500";
  }
  res.send(response);
});

// ➕ Crear consulta
app.route("/consultation").post(async (req, res) => {
  const response = {};
  try {
    const controller = new ControllerConsultation();
    const result = await controller.createConsultation(req.body);

    if (result.success) {
      response.data = "La consulta fue creada correctamente";
      response.code = "200";
    } else {
      response.data = "La consulta No fue creada";
      response.code = "400";
    }
  } catch (error) {
    response.data = error.message;
    response.code = "500";
  }
  res.send(response);
});

// 🟢 Obtener todas las consultas por empresa
app.route("/consultation/empresa/:idEmpresa").get(async (req, res) => {
  let response = { data: null, code: "" };
  try {
    const { idEmpresa } = req.params;
    const controller = new ControllerConsultation();
    const consultation = await controller.getAllConsultation(idEmpresa);

    if (consultation.length > 0) {
      response.data = consultation;
      response.code = "200";
    } else {
      response.data = "No hay consultas para esta empresa";
      response.code = "404";
    }
  } catch (error) {
    response.data = error.message;
    response.code = "500";
  }
  res.send(response);
});

// ✏️ Actualizar consulta (Correctamente separado)
app.route("/consultation").patch(async (req, res) => {
  try {
    const controller = new ControllerConsultation();
    const result = await controller.updateConsultation(req.body);
    if (result.success) {
      response.data = result.message;
      response.code = "200";
    } else {
      response.data = "Consulta No fue actualizada";
      response.code = "400";
    }
  } catch (error) {
    response.data = error.message;
    response.code = "500";
  }
  res.send(response);
});

};

module.exports = consultationRouter;
