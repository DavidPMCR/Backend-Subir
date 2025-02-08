const db = require("./connectionDB");

class ReportData {
  // 📌 Obtener el monto total de consultas por mes
  static async reportMontoTotalMensual(anio, mes) {
    let connection;
    try {
      connection = await db.pool.getConnection(); // Obtener una conexión del pool
      const [rows] = await connection.query(
        `SELECT 
           e.nombre AS empresa,
           IFNULL(SUM(c.monto_consulta), 0) AS total_monto_consulta,
           COUNT(c.id_consulta) AS total_consultas
         FROM tbconsulta c
         INNER JOIN tbempresa e ON c.id_empresa = e.id_empresa
         WHERE c.estado = 0
           AND YEAR(c.fecha_consulta) = ?
           AND MONTH(c.fecha_consulta) = ?
         GROUP BY e.nombre`,
        [anio, mes]
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al calcular el monto total mensual:", error.message);
      throw error;
    } finally {
      if (connection) connection.release(); // Liberar conexión al pool
    }
  }
  
  // 📌 Obtener el reporte agrupado por tipo de consulta
  static async reportMontoTotalAgrupado(anio, mes) {
    let connection;
    try {
      connection = await db.pool.getConnection(); // Obtener una conexión del pool
      const [rows] = await connection.query(
        `SELECT 
           e.nombre AS empresa,
           c.tipoconsulta,
           COUNT(c.id_consulta) AS numero_consultas,
           IFNULL(SUM(c.monto_consulta), 0) AS monto_total_tipo_consulta,
           (
             SELECT COUNT(c2.id_consulta) 
             FROM tbconsulta c2
             WHERE c2.estado = 0
               AND YEAR(c2.fecha_consulta) = ?
               AND MONTH(c2.fecha_consulta) = ?
               AND c2.id_empresa = e.id_empresa
           ) AS total_consultas,
           (
             SELECT IFNULL(SUM(c2.monto_consulta), 0)
             FROM tbconsulta c2
             WHERE c2.estado = 0
               AND YEAR(c2.fecha_consulta) = ?
               AND MONTH(c2.fecha_consulta) = ?
               AND c2.id_empresa = e.id_empresa
           ) AS monto_total_mensual
         FROM tbconsulta c
         INNER JOIN tbempresa e ON c.id_empresa = e.id_empresa
         WHERE c.estado = 0
           AND YEAR(c.fecha_consulta) = ?
           AND MONTH(c.fecha_consulta) = ?
         GROUP BY e.nombre, c.tipoconsulta`,
        [anio, mes, anio, mes, anio, mes]
      );
      return rows;
    } catch (error) {
      console.error("❌ Error al calcular el monto total agrupado:", error.message);
      throw error;
    } finally {
      if (connection) connection.release(); // Liberar conexión al pool
    }
  }
}

module.exports = ReportData;
