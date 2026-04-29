const API_TORNEOS = "/api/torneos";

let monthYear;
let calendarDays;
let modal;
let closeModal;

let eventTitle;
let eventFecha;
let eventDireccion;
let eventCategorias;
let eventImage;

let currentDate;
let events = {};

// ================= INIT =================

export async function inicializarCalendario() {
  monthYear = document.getElementById("monthYear");
  calendarDays = document.getElementById("calendarDays");

  modal = document.getElementById("eventModal");
  closeModal = document.getElementById("closeModal");

  eventTitle = document.getElementById("eventTitle");
  eventFecha = document.getElementById("eventFecha");
  eventDireccion = document.getElementById("eventDireccion");
  eventCategorias = document.getElementById("eventCategorias");
  eventImage = document.getElementById("eventImage");

  if (!monthYear || !calendarDays || !modal) {
    console.error("Calendario: elementos no encontrados");
    return;
  }

  currentDate = new Date();

  events = await obtenerEventosDesdeTorneos();

  document.getElementById("prevMonth")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("nextMonth")?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  closeModal?.addEventListener("click", cerrarModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  renderCalendar();
}

// ================= FETCH TORNEOS =================

async function obtenerEventosDesdeTorneos() {
  try {
    const response = await fetch(API_URL_TORNEOS);

    if (!response.ok) {
      throw new Error("Error al obtener torneos");
    }

    const torneos = await response.json();

    const eventosMap = {};

    torneos.forEach((torneo) => {
      const fecha = new Date(torneo.fecha);

      const year = fecha.getUTCFullYear();
      const month = fecha.getUTCMonth() + 1;
      const day = fecha.getUTCDate();

      const key = `${year}-${month}-${day}`;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaEvento = new Date(
        fecha.getUTCFullYear(),
        fecha.getUTCMonth(),
        fecha.getUTCDate()
      );

      fechaEvento.setHours(0, 0, 0, 0);

      const esPasado = fechaEvento < hoy;

      if (!eventosMap[key]) {
        eventosMap[key] = [];
      }

      eventosMap[key].push({
        ...torneo,
        tipo: esPasado ? "pasado" : "proximo",
      });
    });

    return eventosMap;

  } catch (error) {
    console.error("Error calendario:", error);
    return {};
  }
}

// ================= RENDER CALENDARIO =================

function renderCalendar() {
  calendarDays.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i < firstDay; i++) {
    calendarDays.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;

    let eventHTML = "";

    if (events[dateKey]) {
      eventHTML = events[dateKey]
        .map((torneo, index) => {
          let clase = "event";

          if (torneo.tipo === "pasado") clase += " red";
          if (torneo.tipo === "proximo") clase += " green";

          return `
            <div
              class="${clase}"
              data-date="${dateKey}"
              data-index="${index}"
            >
              ${torneo.nombre}
            </div>
          `;
        })
        .join("");
    }

    calendarDays.innerHTML += `
      <div class="day">
        <div class="day-number">${day}</div>
        ${eventHTML}
      </div>
    `;
  }

  document.querySelectorAll(".event").forEach((eventEl) => {
    eventEl.addEventListener("click", (e) => {
      e.stopPropagation();

      const dateKey = eventEl.dataset.date;
      const index = Number(eventEl.dataset.index);

      abrirModal(dateKey, index);
    });
  });
}

// ================= MODAL =================

function abrirModal(dateKey, index = 0) {
  if (!events[dateKey] || !events[dateKey][index]) {
    return;
  }

  const torneo = events[dateKey][index];

  eventTitle.textContent = torneo.nombre || "Torneo";

  eventFecha.textContent = torneo.fecha
    ? new Date(torneo.fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

  eventDireccion.textContent = torneo.direccion || "A confirmar";

  eventCategorias.textContent =
    Array.isArray(torneo.categorias) && torneo.categorias.length
      ? torneo.categorias.join(", ")
      : "No informadas";

  if (Array.isArray(torneo.fotos) && torneo.fotos.length > 0) {
    eventImage.src = torneo.fotos[0];
    eventImage.style.display = "block";
  } else {
    eventImage.src = "";
    eventImage.style.display = "none";
  }

  modal.classList.remove("hidden");
}

function cerrarModal() {
  modal.classList.add("hidden");
}