const ControllerReport = require("../controllers/controllerReport");

const reportRouter = (app) => {
    // Variable de respuesta inicial
    let response = {
        data: null,
        code: null,
    };

// Obtener reporte de suma total consultas por mes y año
app.route("/report/:anio/:mes").get(async (req, res) => {
    const { anio, mes } = req.params;
  
    // Validación de los parámetros
    if (isNaN(anio) || isNaN(mes) || mes < 1 || mes > 12) {
      res.status(400).send({ data: "Año o mes inválido", code: "400" });
      return;
    }
  
    try {
      // Arreglo con los nombres de los meses
      const nombresMeses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
      ];
  
      const controller = new ControllerReport();
      const resultado = await controller.reportMontoTotalMensual(anio, mes);
  
      // Si no se encuentra la empresa, devolver un mensaje de error
      if (!resultado || resultado.length === 0) {
        res.status(404).send({ data: "No se encontraron datos para este mes y año", code: "404" });
        return;
      }
  
      // Preparar respuesta ajustada
      const respuesta = resultado.map(({ nombre, total_monto_consulta, total_consultas }) => ({
        empresa: nombre,
        anio,
        mes: nombresMeses[mes - 1], // Nombre del mes correspondiente
        total_consultas: total_consultas, // Número total de consultas realizadas
        total_mensual: total_monto_consulta,
      }));
  
      res.status(200).send({
        data: respuesta,
        code: "200",
      });
    } catch (error) {
      console.error("Error al generar el reporte:", error.message);
      res.status(500).send({
        data: "Error interno del servidor",
        code: "500",
      });
    }
  });
  


    //reporte por tipo de consulta mensual + monto total generado entre los tipos
    app.route("/report/agrupado/:anio/:mes").get(async (req, res) => {
        const { anio, mes } = req.params;
      
        // Validación de los parámetros
        if (isNaN(anio) || isNaN(mes) || mes < 1 || mes > 12) {
          res.status(400).send({ data: null, code: "400", message: "Año o mes inválido" });
          return;
        }
      
        try {
          const controller = new ControllerReport();
          const resultado = await controller.reportMontoTotalAgrupado(anio, mes);
      
          // Si no hay resultados, devolver un mensaje de error
          if (!resultado || resultado.length === 0) {
            res.status(404).send({ data: null, code: "404", message: "No se encontraron datos para este mes y año" });
            return;
          }
      
          // Arreglo con los nombres de los meses
          const nombresMeses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
          ];
          const nombreMes = nombresMeses[mes - 1]; // Obtener el nombre del mes correspondiente
      
          // Extraemos el nombre de la empresa y los totales
          const nombreEmpresa = resultado[0]?.empresa; // Nombre de la empresa
          const montoTotalMensual = resultado[0]?.monto_total_mensual; // Total mensual
          const totalConsultas = resultado[0]?.total_consultas; // Total de consultas
      
          // Construimos los detalles excluyendo datos redundantes
          const detalles = resultado.map(({ empresa, monto_total_mensual, total_consultas, ...resto }) => ({
            ...resto, // Incluye los demás campos
          }));
      
          // Estructura de la respuesta
          res.status(200).send({
            data: {
              empresa: nombreEmpresa, // Mostramos el nombre de la empresa una sola vez
              anio, // Incluimos el año
              mes: nombreMes, // Incluimos el nombre del mes
              detalles, // Lista de detalles agrupados por tipo de consulta
              total_consultas: totalConsultas, // Total de consultas
              monto_total_mensual: montoTotalMensual, // Total mensual
            },
            code: "200",
            message: "Reporte generado con éxito",
          });
        } catch (error) {
          console.error("Error al generar el reporte agrupado:", error.message);
          res.status(500).send({
            data: null,
            code: "500",
            message: "Error interno del servidor",
          });
        }
      });
      
      








};

module.exports = reportRouter;
