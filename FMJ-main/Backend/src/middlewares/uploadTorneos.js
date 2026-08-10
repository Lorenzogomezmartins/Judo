import multer from "multer";

const storage = multer.memoryStorage();

const uploadTorneos = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"), false);
    }
  },
});

export default uploadTorneos;