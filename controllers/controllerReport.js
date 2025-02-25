const ReportData = require("../data/reportData");

class ControllerReport {
  // Obtener suma por mes de todas las consultas
  
  async reportMontoTotalMensual(anio, mes, idEmpresa) {
    try {
      const result = await ReportData.reportMontoTotalMensual(anio, mes, idEmpresa);
      return result;
    } catch (error) {
      console.error("Error al generar el reporte:", error.message);
      throw error;
    }
  }
  

       // Obtener suma por mes de todas las consultas / dividido por tipos con una suma total
       async reportMontoTotalAgrupado(anio, mes, idEmpresa) {
        try {
          const result = await ReportData.reportMontoTotalAgrupado(anio, mes, idEmpresa);
          return result;
        } catch (error) {
          console.error("Error al generar el reporte agrupado:", error.message);
          throw error;
        }
      }
      



  }

  

module.exports = ControllerReport;
