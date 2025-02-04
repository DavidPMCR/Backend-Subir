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
  
      if (userToken !== token) {
        return res.status(403).json({ message: "Sesión inválida o cerrada" });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
  };
  


function validateBody(req, res, next) {
    const contentType = req.headers["content-type"];
    console.log(`[${req.method}] Content-Type: ${contentType}`);
    console.log("Request Body:", req.body);

    if (contentType && contentType.includes("multipart/form-data")) {
        return next();
    }

    if (["POST", "PATCH", "PUT"].includes(req.method)) {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "El cuerpo de la solicitud no puede estar vacío.",
            });
        }
    }

    next();
}

module.exports = validateBody;

