const mysql = require("mysql2/promise"); // Importamos la librería para MySQL con promesas

class ConnectionDB {
    constructor() {
        this.config = {
         
                host: "junction.proxy.rlwy.net",
                port: 29441,
                user: "root",
                password: "ZNlcpmqhXSpyFtMzTGqEhhClUNzbVJjR",
                database: "maph",  // Cambia "railway" por "maph"
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            };
            
        

        this.pool = mysql.createPool(this.config); // Creamos un pool de conexiones
    }

    // Método para obtener una conexión
    async connect() {
        try {
            const connection = await this.pool.getConnection();
            console.log("✅ Conexión exitosa a la base de datos MySQL en Railway");
            return connection;
        } catch (error) {
            console.error("❌ Error de conexión a la base de datos:", error.message);
            throw error;
        }
    }

    // Método para liberar la conexión
    async disconnect(connection) {
        try {
            if (connection) {
                await connection.release();
                console.log("🔌 Conexión liberada correctamente");
            }
        } catch (error) {
            console.error("❌ Error al liberar la conexión:", error.message);
        }
    }
}

// Exportamos una instancia única de la clase ConnectionDB
module.exports = new ConnectionDB();
