import Handlebars from "handlebars";
import eventsTemplateSource from "../../template/events.hbs?raw";
import { getEventsForCards } from "../api/getEvents.js";

const createEventsMarkup = Handlebars.compile(eventsTemplateSource);

const refs = {
  container:
    document.querySelector(".gallery-list") ||
    document.querySelector(".gallery-container"),
  paginationContainer: document.querySelector(".pagination") || null,
};

let currentPage = 1;
let totalPages = 1;
let currentParams = { keyword: "", countryCode: "US" };

const renderCards = (cards) => {
  if (!refs.container) {
    console.error("Gallery container not found");
    return;
  }

  if (!cards || cards.length === 0) {
    refs.container.innerHTML = "<p class='no-events'>No events found.</p>";
    return;
  }

  try {
    refs.container.innerHTML = createEventsMarkup(cards);
  } catch (error) {
    console.error("Error rendering template:", error);
    refs.container.innerHTML = `<p class='error'>Error rendering events</p>`;
  }
};

const renderPagination = () => {
  if (!refs.paginationContainer || totalPages <= 1) {
    return;
  }

  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  let html = "";


  if (currentPage > 1) {
    html += `<button class="pagination-btn" data-page="${currentPage - 1}">← Попередня</button>`;
  }


  if (startPage > 1) {
    html += `<button class="pagination-btn" data-page="1">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-dots">...</span>`;
    }
  }


  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button 
        class="pagination-btn ${i === currentPage ? "active" : ""}" 
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }


  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="pagination-dots">...</span>`;
    }
    html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
  }


  if (currentPage < totalPages) {
    html += `<button class="pagination-btn" data-page="${currentPage + 1}">Наступна →</button>`;
  }

  refs.paginationContainer.innerHTML = html;
  attachPaginationListeners();
};

const attachPaginationListeners = () => {
  const buttons = refs.paginationContainer?.querySelectorAll(".pagination-btn");

  if (!buttons) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = parseInt(e.target.dataset.page);
      if (page && page !== currentPage) {
        currentPage = page;
        loadEvents(currentParams);
      }
    });
  });
};

const loadEvents = async (params = {}) => {
  if (!refs.container) {
    console.error("Gallery container not found");
    return;
  }

  refs.container.innerHTML = "<p class='loading'>Завантаження подій...</p>";

  try {
    currentParams = { ...currentParams, ...params };

    const result = await getEventsForCards({
      page: currentPage,
      size: 20,
      ...currentParams,
    });

    const { cards, totalPages: newTotalPages } = result;
    totalPages = newTotalPages;

    renderCards(cards);

    if (!refs.paginationContainer) {
      const paginationDiv = document.createElement("div");
      paginationDiv.className = "pagination";
      refs.container.parentNode.appendChild(paginationDiv);
      refs.paginationContainer = paginationDiv;
    }

    renderPagination();
  } catch (error) {
    console.error("Error loading events:", error);
    refs.container.innerHTML = `<p class='error'>Помилка: ${error.message}</p>`;
  }
};

const loadEventsByCountry = (countryCode) => {
  currentPage = 1;
  loadEvents({ countryCode });
};

const loadEventsByKeyword = (keyword) => {
  currentPage = 1;
  loadEvents({ keyword });
};

loadEvents();

export { loadEvents, loadEventsByCountry, loadEventsByKeyword };
