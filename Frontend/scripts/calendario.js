const API_TORNEOS = "/api/torneos";

let currentDate = new Date();
let eventos = {};

export async function inicializarCalendario() {
  await obtenerEventosDesdeTorneos();

  renderCalendar();

  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  prevBtn?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  inicializarModal();
}

/* =========================
   OBTENER TORNEOS
========================= */

async function obtenerEventosDesdeTorneos() {
  try {
    const response = await fetch(API_TORNEOS);

    if (!response.ok) {
      throw new Error("Error al obtener torneos");
    }

    const torneos = await response.json();

    eventos = {};

    torneos.forEach((torneo) => {
      if (!torneo.fecha) return;

      const fecha = new Date(torneo.fecha);

      const key = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;

      if (!eventos[key]) {
        eventos[key] = [];
      }

      eventos[key].push(torneo);
    });

  } catch (error) {
    console.error("Error cargando torneos:", error);
  }
}

/* =========================
   RENDER CALENDARIO
========================= */

function renderCalendar() {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");

  if (!monthYear || !calendarDays) return;

  calendarDays.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("es-ES", {
    month: "long",
  });

  monthYear.textContent = `${monthName} ${year}`;

  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay();

  startDay = startDay === 0 ? 6 : startDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    calendarDays.innerHTML += `<div class="empty-day"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${month}-${day}`;

    const eventosDia = eventos[key] || [];

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");

    dayDiv.innerHTML = `
      <span class="day-number">${day}</span>
    `;

    eventosDia.forEach((torneo, index) => {
      const fechaEvento = new Date(torneo.fecha);
      const hoy = new Date();

      hoy.setHours(0, 0, 0, 0);
      fechaEvento.setHours(0, 0, 0, 0);

      const esPasado = fechaEvento < hoy;

      const eventoDiv = document.createElement("div");

      eventoDiv.classList.add(
        "calendar-event",
        esPasado ? "past-event" : "future-event"
      );

      eventoDiv.textContent = torneo.nombre;

      eventoDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModal(torneo);
      });

      dayDiv.appendChild(eventoDiv);
    });

    calendarDays.appendChild(dayDiv);
  }
}

/* =========================
   MODAL
========================= */

function inicializarModal() {
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("eventModal");

  closeBtn?.addEventListener("click", cerrarModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });
}

function abrirModal(torneo) {
  const modal = document.getElementById("eventModal");

  const title = document.getElementById("eventTitle");
  const fecha = document.getElementById("eventFecha");
  const direccion = document.getElementById("eventDireccion");
  const categorias = document.getElementById("eventCategorias");
  const image = document.getElementById("eventImage");

  if (!modal) return;

  title.textContent = torneo.nombre || "Torneo";

  fecha.textContent = torneo.fecha
    ? new Date(torneo.fecha).toLocaleDateString("es-AR")
    : "-";

  direccion.textContent = torneo.direccion || "-";

  categorias.textContent = Array.isArray(torneo.categorias)
    ? torneo.categorias.join(", ")
    : torneo.categorias || "-";

  const foto =
    Array.isArray(torneo.fotos) && torneo.fotos.length > 0
      ? torneo.fotos[0]
      : "";

  if (foto) {
    image.src = foto;
    image.style.display = "block";
  } else {
    image.style.display = "none";
  }

  modal.classList.remove("hidden");
}

function cerrarModal() {
  const modal = document.getElementById("eventModal");

  modal?.classList.add("hidden");
}