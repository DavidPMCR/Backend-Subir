const ControllerEmpresa = require("../controllers/controllerEmpresa");

const empresaRouter = (app) => {
    let response = {
        data: "message",
        code: "code",
    };

    app.route("/empresa")
        // Crear empresa
        .post(async (req, res) => {
            try {
                const controller = new ControllerEmpresa();
                const result = await controller.insertEmpresa(req.body);
                if (result.success) {
                    response.data = "La empresa fue creada correctamente";
                    response.code = "200";
                } else {
                    response.data = "La empresa no fue creada";
                    response.code = "400";
                }
            } catch (error) {
                response.data = error.message;
                response.code = "500";
            }
            res.send(response);
        })

        // Obtener todas las empresas
        .get(async (req, res) => {
            try {
                const controller = new ControllerEmpresa();
                const empresas = await controller.getAllEmpresas();
                response.data = empresas;
                response.code = "200";
            } catch (error) {
                response.data = error.message;
                response.code = "500";
            }
            res.send(response);
        })

        // Eliminar empresa por ID
        .delete(async (req, res) => {
            try {
                const controller = new ControllerEmpresa();
                const result = await controller.deleteEmpresaById(req.body.id_empresa);
                if (result.success) {
                    response.data = result.message;
                    response.code = "200";
                } else {
                    response.data = "La empresa no fue eliminada";
                    response.code = "400";
                }
            } catch (error) {
                response.data = error.message;
                response.code = "500";
            }
            res.send(response);
        })

        // Actualizar empresa por ID
        .patch(async (req, res) => {
            try {
                const controller = new ControllerEmpresa();
                const result = await controller.updateEmpresaById(req.body.id_empresa, req.body);
                if (result.success) {
                    response.data = result.message;
                    response.code = "200";
                } else {
                    response.data = "La empresa no fue actualizada";
                    response.code = "400";
                }
            } catch (error) {
                response.data = error.message;
                response.code = "500";
            }
            res.send(response);
        });
};

module.exports = empresaRouter;
