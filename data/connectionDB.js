/*const mysql = require('mysql2/promise'); // Importa la versión con promesas

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
module.exports = new ConnectionDB();*/

//postgrest

const { Pool } = require('pg'); // Importa el cliente de PostgreSQL

class ConnectionDB {
    constructor() {
        this.config = {
            user: "maph_user",
            password: "af43UWHuYfKzlBoxQoyHdlacVdkIoWK4",
            host: "dpg-cuh9sgi3esus73fmhc10-a.ohio-postgres.render.com",
            database: "maph",
            port: 5432,
            ssl: {
                rejectUnauthorized: false // Necesario para conexiones a Render
            }
        };

        this.pool = new Pool(this.config); // Crear un pool de conexiones
    }

    async connect() {
        try {
            this.client = await this.pool.connect();
            console.log("✅ Conexión exitosa a la base de datos PostgreSQL");
            return this.client;
        } catch (error) {
            console.error(`❌ Error de conexión: ${error.message}`);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                this.client.release(); // Devuelve la conexión al pool
                console.log("🔌 Conexión liberada con éxito");
            } else {
                console.warn("⚠️ No hay conexión activa para cerrar.");
            }
        } catch (error) {
            console.error(`❌ Error al cerrar la conexión: ${error.message}`);
        }
    }
}

// Exportamos una instancia única de la clase ConnectionDB
module.exports = new ConnectionDB();

