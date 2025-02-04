const mysql = require('mysql2/promise'); // Importa la versión con promesas

class ConnectionDB {
    constructor() {
        this.config = {
            user: "root",
            password: "",
            host: "localhost",
            database: "maph",
        };
        this.client = null; // Aquí almacenamos la conexión activa
    }

    async connect() {
        try {
            // Establece la conexión a la base de datos
            this.client = await mysql.createConnection(this.config);
            console.log("Conexión exitosa a la base de datos");
            return this.client; // Devuelve la conexión activa
        } catch (error) {
            console.error(`Error de conexión: ${error.message}`);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.end(); // Cierra la conexión
                console.log("Conexión cerrada con éxito");
            } else {
                console.warn("No hay conexión activa para cerrar.");
            }
        } catch (error) {
            console.error(`Error al cerrar la conexión: ${error.message}`);
        }
    }
}

// Exportamos una instancia única de la clase ConnectionDB
module.exports = new ConnectionDB();
