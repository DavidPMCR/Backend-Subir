const ReportData = require("../data/reportData");

class ControllerReport {
  // Obtener suma por mes de todas las consultas
  
    async reportMontoTotalMensual(anio, mes) {
      try {
        const result = await ReportData.reportMontoTotalMensual(anio, mes);
        console.log("Reporte mensual por empresa:", result);
        return result;
      } catch (error) {
        console.error("Error al generar el reporte:", error.message);
        throw error;
      }
    }

       // Obtener suma por mes de todas las consultas / dividido por tipos con una suma total
    async reportMontoTotalAgrupado(anio, mes) {
      try {
        const result = await ReportData.reportMontoTotalAgrupado(anio, mes);
        return result; // Devuelve el resultado de la capa de datos
      } catch (error) {
        console.error("Error al generar el reporte agrupado:", error.message);
        throw error; // Lanza el error para que sea manejado en la capa superior
      }
    }



  }

  

module.exports = ControllerReport;
