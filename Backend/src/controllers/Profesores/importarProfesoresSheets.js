import Profesor from "../../models/profesor.js";

import {
  obtenerFilasProfesores,
  descargarArchivoDrive,
  extraerDriveId,
} from "../../config/google.js";

import {
  subirBufferACloudinary,
  subirCvACloudinary,
} from "../../config/cloudinary.js";

function normalizarTexto(valor = "") {
  return String(valor).trim();
}

function convertirCapacitaciones(valor = "") {
  if (!valor.trim()) return [];

  return valor
    .split(/\n|;/)
    .map((curso) => curso.trim())
    .filter(Boolean)
   .map((curso) => ({
  titulo: curso,
  club: "Sin especificar",
  descripcion: "",
}));
}

export async function importarProfesoresDesdeSheets(req, res) {
  try {
    const filas = await obtenerFilasProfesores();

    if (!filas.length) {
      return res.status(400).json({
        mensaje: "La planilla está vacía",
      });
    }

    const encabezados = filas[0].map((e) =>
      normalizarTexto(e).toLowerCase()
    );
    

    const indice = (nombre) =>
      encabezados.findIndex(
        (e) => e === nombre.toLowerCase()
      );

    const nombreIndex = indice("nombre");
    const apellidoIndex = indice("apellido");
    const clubIndex = indice("club");
    const cursosIndex = indice("cursos/capacitaciones");
    const fotoIndex = indice("foto del rostro");
    const cvIndex = indice("curriculum");

    let creados = 0;
    let actualizados = 0;
    let errores = [];

    for (let i = 1; i < filas.length; i++) {
      try {
        const fila = filas[i];
        

        const nombre = normalizarTexto(fila[nombreIndex]);
        const apellido = normalizarTexto(fila[apellidoIndex]);
        const club = normalizarTexto(fila[clubIndex]);
        const cursos = normalizarTexto(fila[cursosIndex]);

        if (!nombre || !apellido) continue;

        let profesor = await Profesor.findOne({
          nombre,
          apellido,
        });

        let foto = profesor?.foto || "";
        let cv = profesor?.cv || null;

        // FOTO
        const fotoUrl = normalizarTexto(fila[fotoIndex]);
        const fotoDriveId = extraerDriveId(fotoUrl);

        if (fotoDriveId) {
          const imagenBuffer =
            await descargarArchivoDrive(fotoDriveId);

          const resultadoFoto =
            await subirBufferACloudinary(
              imagenBuffer,
              `profesor_${nombre}_${apellido}`
            );

          foto = resultadoFoto.secure_url;
        }

        // CV
        const cvUrl = normalizarTexto(fila[cvIndex]);
        const cvDriveId = extraerDriveId(cvUrl);

        if (cvDriveId) {
          const cvBuffer =
            await descargarArchivoDrive(cvDriveId);

          const resultadoCv =
            await subirCvACloudinary(
              cvBuffer,
              `cv_${nombre}_${apellido}.pdf`
            );

          cv = resultadoCv.secure_url;
        }

        const datos = {
          nombre,
          apellido,
          club,
          foto,
          cv,
          capacitaciones:
            convertirCapacitaciones(cursos),
        };

        if (profesor) {
          await Profesor.findByIdAndUpdate(
            profesor._id,
            datos,
            {
              new: true,
              runValidators: true,
            }
          );

          actualizados++;
        } else {
          await Profesor.create(datos);
          creados++;
        }
      } catch (error) {
        errores.push({
          fila: i + 1,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      mensaje: "Importación de profesores finalizada",
      creados,
      actualizados,
      errores,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error importando profesores",
      error: error.message,
    });
  }
}