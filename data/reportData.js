const db = require("./connectionDB");

class ReportData {
  static async reportMontoTotalMensual(anio, mes) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        `SELECT 
           e.nombre AS empresa, -- Nombre de la empresa
           IFNULL(SUM(c.monto_consulta), 0) AS total_monto_consulta, -- Suma de los montos de consulta
           COUNT(c.id_consulta) AS total_consultas -- Total de consultas realizadas en el mes
         FROM tbconsulta c
         INNER JOIN tbempresa e ON c.id_empresa = e.id_empresa
         WHERE c.estado = 0
           AND YEAR(c.fecha_consulta) = ?
           AND MONTH(c.fecha_consulta) = ?
         GROUP BY e.nombre`, // Agrupa por nombre de la empresa
        [anio, mes] // Parámetros dinámicos para el año y el mes
      );
      return rows; // Devuelve todas las filas (una por empresa)
    } catch (error) {
      console.error("Error al calcular el monto total mensual:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }
  
  //reporte de tipos de consultas realizadas y la suma en el monto de ellas

   // Obtener suma por mes de todas las consultas / dividido por tipos con una suma total
   static async reportMontoTotalAgrupado(anio, mes) {
    const connection = await db.connect();
    try {
      const [rows] = await connection.query(
        `SELECT 
           e.nombre AS empresa, -- Nombre de la empresa
           c.tipoconsulta,      -- Tipo de consulta
           COUNT(c.id_consulta) AS numero_consultas, -- Número de consultas por tipo
           IFNULL(SUM(c.monto_consulta), 0) AS monto_total_tipo_consulta, -- Suma por tipo de consulta
           (
             SELECT 
               COUNT(c2.id_consulta) -- Total de consultas del mes
             FROM tbconsulta c2
             WHERE c2.estado = 0
               AND YEAR(c2.fecha_consulta) = ?
               AND MONTH(c2.fecha_consulta) = ?
               AND c2.id_empresa = e.id_empresa
           ) AS total_consultas, -- Total de consultas en el mes para la empresa
           (
             SELECT 
               IFNULL(SUM(c2.monto_consulta), 0) -- Suma total del mes
             FROM tbconsulta c2
             WHERE c2.estado = 0
               AND YEAR(c2.fecha_consulta) = ?
               AND MONTH(c2.fecha_consulta) = ?
               AND c2.id_empresa = e.id_empresa
           ) AS monto_total_mensual -- Suma total mensual para esta empresa
         FROM tbconsulta c
         INNER JOIN tbempresa e ON c.id_empresa = e.id_empresa
         WHERE c.estado = 0
           AND YEAR(c.fecha_consulta) = ?
           AND MONTH(c.fecha_consulta) = ?
         GROUP BY e.nombre, c.tipoconsulta`, // Agrupamos por empresa y tipo de consulta
        [anio, mes, anio, mes, anio, mes] // Parámetros dinámicos
      );
      return rows; // Devuelve las filas agrupadas
    } catch (error) {
      console.error("Error al calcular el monto total agrupado:", error.message);
      throw error;
    } finally {
      await db.disconnect();
    }
  }

  //consultas 
  
  
  
  
}

module.exports = ReportData;
