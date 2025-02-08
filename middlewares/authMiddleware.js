const jwt = require("jsonwebtoken");
const db = require("../data/connectionDB");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("🔹 Token recibido en middleware:", token);

  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado - Token no encontrado" });
  }

  try {
    const decoded = jwt.verify(token, "clave_secreta_super_segura");
    console.log("✅ Token decodificado correctamente:", decoded);

    const connection = await db.connect();
    const [rows] = await connection.query(
      "SELECT token FROM tbusuario WHERE id_cedula = ?",
      [decoded.id]
    );
    const userToken = rows[0]?.token;
    
    console.log("🔹 Token en BD:", userToken);

    if (!userToken || userToken !== token) {
      return res.status(403).json({ message: "Sesión inválida o cerrada en otro dispositivo" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
