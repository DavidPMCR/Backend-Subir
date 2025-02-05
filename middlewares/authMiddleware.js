const jwt = require("jsonwebtoken");
const db = require("../data/connectionDB");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acceso no autorizado" });
  }

  try {
    const decoded = jwt.verify(token, "clave_secreta_super_segura");

    const connection = await db.connect();
    const [rows] = await connection.query(
      "SELECT token FROM tbusuario WHERE id_cedula = ?",
      [decoded.id]
    );
    const userToken = rows[0]?.token;

    if (!userToken || userToken !== token) {
      return res.status(403).json({ message: "Sesión inválida o cerrada" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
