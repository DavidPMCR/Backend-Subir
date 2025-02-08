const mysql = require("mysql2/promise");

class ConnectionDB {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || "junction.proxy.rlwy.net",
            port: process.env.DB_PORT || 29441,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "ZNlcpmqhXSpyFtMzTGqEhhClUNzbVJjR",
            database: process.env.DB_DATABASE || "maph",
            waitForConnections: true,
            connectionLimit: 10,  // Número máximo de conexiones activas
            queueLimit: 0
        };

        this.pool = mysql.createPool(this.config);
    }

    // Método para hacer consultas sin abrir múltiples conexiones
    async query(sql, params) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(sql, params);
            return rows;
        } catch (error) {
            console.error("❌ Error en la consulta:", error.message);
            throw error;
        } finally {
            connection.release(); // ¡IMPORTANTE! Liberar la conexión
        }
    }
}

// Exportamos una instancia única de la clase ConnectionDB
module.exports = new ConnectionDB();
