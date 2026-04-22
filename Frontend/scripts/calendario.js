const API_URL_TORNEOS = "http://localhost:3000/api/torneos";

let monthYear;
let calendarDays;
let modal;
let closeModal;
let eventTitle;
let eventInfo;

let currentDate;
let events = {};

// ================= INIT =================

export async function inicializarCalendario() {

  // DOM
  monthYear = document.getElementById("monthYear");
  calendarDays = document.getElementById("calendarDays");

  modal = document.getElementById("eventModal");
  closeModal = document.getElementById("closeModal");
  eventTitle = document.getElementById("eventTitle");
  eventInfo = document.getElementById("eventInfo");

  if (!monthYear || !calendarDays) {
    console.error("Calendario: elementos no encontrados");
    return;
  }

  currentDate = new Date();

  // 🔥 Traer torneos reales
  events = await obtenerEventosDesdeTorneos();

  // Botones
  document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  };

  document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  };

  closeModal.onclick = () => modal.classList.add("hidden");

  renderCalendar();
}

// ================= FETCH TORNEOS =================

async function obtenerEventosDesdeTorneos() {
  try {
    const res = await fetch(API_URL_TORNEOS);

    if (!res.ok) {
      throw new Error("Error al traer torneos");
    }

    const torneos = await res.json();

    const eventosMap = {};

    torneos.forEach(torneo => {
      const fecha = new Date(torneo.fecha);
      const year = fecha.getUTCFullYear();
      const month = fecha.getUTCMonth() + 1;
      const day = fecha.getUTCDate();

      const key = `${year}-${month}-${day}`;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);

      const esPasado = fecha < hoy;

      console.log("KEY GENERADA:", key, torneo.nombre);

      eventosMap[key] = {
        title: torneo.nombre,
        info: `Lugar: ${torneo.direccion || "A confirmar"}`,
        tipo: esPasado ? "pasado" : "proximo"
      };
    });
    
    console.log("TORNEOS:", torneos);

    return eventosMap;

  } catch (error) {
    console.error("Error calendario:", error);
    return {};
  }
}

// ================= RENDER =================

function renderCalendar() {
  calendarDays.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Espacios iniciales
  for (let i = 1; i < firstDay; i++) {
    calendarDays.innerHTML += `<div></div>`;
  }

  // Días
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;
    let eventHTML = "";

    if (events[dateKey]) {
      const tipo = events[dateKey].tipo;

      let clase = "event";
      if (tipo === "pasado") clase += " red";
      if (tipo === "proximo") clase += " green";

      eventHTML = `<div class="${clase}">${events[dateKey].title}</div>`;
    }
  console.log("Comparando:", dateKey, events[dateKey]);

    calendarDays.innerHTML += `
      <div class="day" data-date="${dateKey}">
        <div class="day-number">${day}</div>
        ${eventHTML}
      </div>
    `;
  }
  // 🔥 EVENT LISTENER (reemplaza onclick inline)
  document.querySelectorAll(".day").forEach(dayEl => {
    dayEl.addEventListener("click", () => {
      const dateKey = dayEl.dataset.date;
      openEvent(dateKey);
    });
  });
}

// ================= MODAL =================

function openEvent(dateKey) {
  if (!events[dateKey]) return;

  eventTitle.textContent = events[dateKey].title;
  eventInfo.textContent = events[dateKey].info;

  modal.classList.remove("hidden");
}