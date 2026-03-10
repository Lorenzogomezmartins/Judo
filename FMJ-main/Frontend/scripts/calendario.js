let monthYear;
let calendarDays;
let modal;
let closeModal;
let eventTitle;
let eventInfo;

let currentDate;
let events;

function inicializarCalendario() {

  // Referencias al DOM (AHORA sí existen)
  monthYear = document.getElementById("monthYear");
  calendarDays = document.getElementById("calendarDays");

  modal = document.getElementById("eventModal");
  closeModal = document.getElementById("closeModal");
  eventTitle = document.getElementById("eventTitle");
  eventInfo = document.getElementById("eventInfo");

  // Seguridad
  if (!monthYear || !calendarDays) {
    console.error("Calendario: elementos no encontrados");
    return;
  }

  currentDate = new Date();

  /* EVENTOS DE EJEMPLO */
  events = {
    "2026-1-15": {
      title: "Torneo Metropolitano",
      info: "Lugar: Buenos Aires | Horario: 10:00"
    },
    "2026-1-22": {
      title: "Examen de Cinturones",
      info: "Club Central | 18:00"
    }
  };

  // Botones
  document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(monthYear, calendarDays, currentDate, events, eventTitle, eventInfo, modal);
  };

  document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(monthYear, calendarDays, currentDate, events, eventTitle, eventInfo, modal);
  };

  closeModal.onclick = () => modal.classList.add("hidden");

  renderCalendar(monthYear, calendarDays, currentDate, events, eventTitle, eventInfo, modal);
}

function renderCalendar(monthYear, calendarDays, currentDate, events, eventTitle, eventInfo, modal) {
  calendarDays.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent =
    currentDate.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric"
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
      eventHTML = `<div class="event">${events[dateKey].title}</div>`;
    }

    calendarDays.innerHTML += `
      <div class="day" onclick="openEvent('${dateKey}')">
        <div class="day-number">${day}</div>
        ${eventHTML}
      </div>
    `;
  }
}

function openEvent(dateKey) {
  if (!events[dateKey]) return;

  eventTitle.textContent = events[dateKey].title;
  eventInfo.textContent = events[dateKey].info;
  modal.classList.remove("hidden");
}
