import Galeria from "../../models/galeria.js";

const darLikeGaleria = async (req, res) => {
  try {
    const foto = await Galeria.findById(req.params.id);

    if (!foto || !foto.activo) {
      return res.status(404).json({
        mensaje: "Foto no encontrada",
      });
    }

    const ipUsuario =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    const yaDioLike = foto.likes.includes(ipUsuario);

    if (yaDioLike) {
      foto.likes = foto.likes.filter((ip) => ip !== ipUsuario);
    } else {
      foto.likes.push(ipUsuario);
    }

    await foto.save();

    res.json({
      mensaje: yaDioLike ? "Like eliminado" : "Like agregado",
      likes: foto.likes.length,
      dioLike: !yaDioLike,
      foto,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al dar like",
      error: error.message,
    });
  }
};

export default darLikeGaleria;