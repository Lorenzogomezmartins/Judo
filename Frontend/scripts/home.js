const API_TORNEOS = "/api/torneos";

export async function inicializarHome() {
  await cargarProximaActividad();
}

async function cargarProximaActividad() {
  const container = document.getElementById("homeProximaActividad");

  if (!container) {
    console.error("No existe #homeProximaActividad");
    return;
  }

  container.innerHTML = `
    <div class="home-proxima-loading">
      Cargando próxima actividad...
    </div>
  `;

  try {
    const response = await fetch(API_TORNEOS);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const actividades = await response.json();

    console.log("Actividades recibidas:", actividades);

    if (!Array.isArray(actividades)) {
      throw new Error("La API no devolvió un array");
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximasActividades = actividades
      .filter((actividad) => {
        if (!actividad.fecha) return false;

        const fechaActividad = new Date(actividad.fecha);

        if (isNaN(fechaActividad.getTime())) return false;

        fechaActividad.setHours(0, 0, 0, 0);

        return fechaActividad >= hoy;
      })
      .sort((a, b) => {
        return new Date(a.fecha) - new Date(b.fecha);
      });

    if (proximasActividades.length === 0) {
      container.innerHTML = `
        <div class="home-proxima-vacia">
          <i class="bi bi-calendar-x"></i>

          <div>
            <strong>No hay próximas actividades</strong>

            <p>
              Consultá el calendario para ver nuevas actividades cuando estén disponibles.
            </p>
          </div>
        </div>
      `;

      return;
    }

    const actividad = proximasActividades[0];

    const fecha = new Date(actividad.fecha);

    const dia = fecha.getUTCDate();

    const mes = fecha
      .toLocaleString("es-AR", {
        month: "long",
        timeZone: "UTC",
      })
      .toUpperCase();

    const anio = fecha.getUTCFullYear();

    const tipo = obtenerTipoActividad(actividad.tipo);

    const ubicacion =
      actividad.direccion ||
      "Ubicación a confirmar";

    container.innerHTML = `
      <div class="home-proxima-fecha">

        <span class="home-proxima-dia">
          ${dia}
        </span>

        <span class="home-proxima-mes">
          ${mes}
        </span>

        <span class="home-proxima-anio">
          ${anio}
        </span>

      </div>

      <div class="home-proxima-contenido">

        <span class="home-proxima-tipo">
          ${tipo}
        </span>

        <h4>
          ${actividad.nombre || "Actividad sin nombre"}
        </h4>

        <div class="home-proxima-info">

          <span>
            <i class="bi bi-calendar-event"></i>
            ${formatearFechaCompleta(fecha)}
          </span>

          <span>
            <i class="bi bi-geo-alt"></i>
            ${ubicacion}
          </span>

        </div>

        <a
          href="#/calendario"
          class="home-proxima-link"
        >
          Ver en calendario
          <i class="bi bi-arrow-right"></i>
        </a>

      </div>
    `;
  } catch (error) {
    console.error("Error cargando próxima actividad:", error);

    container.innerHTML = `
      <div class="home-proxima-vacia">
        <i class="bi bi-exclamation-circle"></i>

        <div>
          <strong>No se pudo cargar la próxima actividad</strong>

          <p>
            Intentá nuevamente más tarde.
          </p>
        </div>
      </div>
    `;
  }
}

function obtenerTipoActividad(tipo) {
  const tipos = {
    curso: "Curso",
    capacitacion: "Capacitación",
    evento: "Evento",
    torneo: "Torneo",
  };

  return tipos[tipo] || "Actividad";
}

function formatearFechaCompleta(fecha) {
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}