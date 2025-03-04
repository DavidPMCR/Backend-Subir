const ControllerDiary = require("../controllers/controllerDiary");
const validateBody = require("../middlewares/validateBody");

const diaryRouter = (app) => {
  let response = {
    data: "message",
    code: "code",
  };
  
// Obtener citas filtradas por empresa 
app.route("/diary/empresa/:idEmpresa").get(async (req, res) => {
  let response = { data: null, code: "" };
  try {
    const { idEmpresa } = req.params; // Obtiene el id de empresa de la URL
    const controller = new ControllerDiary();
    const diarys = await controller.getAllDiary(idEmpresa);

    if (diarys.length > 0) {
      response.data = diarys;
      response.code = "200";
    } else {
      response.data = "No hay citas para esta empresa";
      response.code = "404";
    }
  } catch (error) {
    response.data = error.message;
    response.code = "500";
  }
  res.send(response);
});


 //eliminar paciente por cedula
  app.route("/diary/:id_cita")
  .delete(async (req, res) => {
    try {
      const controller = new ControllerDiary();
      const {id_cita} = req.params;
      //console.log(" el numero de cita es:",id_cita);
      if(!id_cita){
          response.data = "El numero de cita es obligatoria";
          response.code = "400";
          return res.send(response);
      }

      const result = await controller.deleteDiaryByID_cita(id_cita);
      if (result.success) {
        response.data = result.message;
        response.code = "200";
      } else {
        response.data = "La cita No fue eliminado";
        response.code = "400";
      }
    } catch (error) {
      response.data = error.message;
      response.code = "500";
    }
    res.send(response);
  });

 //crear cita paciente
  app.route("/diary")
  .post(async (req, res) => {
    const response = {};
    try {
      const controller = new ControllerDiary();
      const result = await controller.createDiary(req.body);

      if (result.success) {
        response.data = "Cita creada correctamente";
        response.code = "200";
      } else {
        response.data = "La Cita No fue creado";
        response.code = "400";
      }
    } catch (error) {
      response.data = error.message;
      response.code = "500";
    }
    res.send(response);
  })


    // Obtener todas las citas
    .get(async (req, res) => {
      try {
        const controller = new ControllerDiary();
        const diarys = await controller.getAllDiary();
        response.data = diarys;
        response.code = "200";
      } catch (error) {
        response.data = error.message;
        response.code = "500";
      }
     
      res.send(response);
    })
    
    // Actualizar Cita
    .patch(async (req, res) => {
      try {
        const controller = new ControllerDiary();
        const result = await controller.updateDiaryByID_cita(req.body);
        if (result.success) {
          response.data = result.message;
          response.code = "200";
        } else {
          response.data = "Cita No fue actualizado";
          response.code = "400";
        }
      } catch (error) {
        response.data = error.message;
        response.code = "500";
      }
      res.send(response);
    });

};

module.exports = diaryRouter;
