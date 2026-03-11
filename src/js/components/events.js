import Handlebars from "handlebars";
import eventsTemplateSource from "../../template/events.hbs?raw";
import { getEvents, getAllEvents } from "../api/getEvents.js";
// import { openModal } from "./modal.js";

Handlebars.registerHelper("formatDate", (dateString) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) return "No date";
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
});

const createEventsMarkup = Handlebars.compile(eventsTemplateSource);

const refs = {
  container: document.querySelector(".events__list") || null,
  paginationContainer:
    document.querySelector(".pagination") ||
    document.querySelector("#pagination") ||
    null,
};

let currentPage = 1;
let currentParams = { keyword: "" }; 

let totalFilteredEvents = 0;
let allFilteredEvents = [];

const isDefaultPlaceholder = (url) => {
  if (!url) return true;
  const defaultPatterns = [
    "TABLET_LANDSCAPE",
    "TABLET_PORTRAIT",
    "MOBILE_SQUARE",
    "WEB_LANDSCAPE",
    "EVENT_DETAIL",
  ];
  return defaultPatterns.some((pattern) => url.includes(pattern));
};

const filterEventsWithImages = (events) => {
  return events.filter((event) => {
    const hasImages = event.images && event.images.length > 0;
    const firstImageUrl = event.images?.[0]?.url;
    const isDefault = isDefaultPlaceholder(firstImageUrl);

    let validUrl = firstImageUrl && !isDefault ? firstImageUrl : null;

    if (!validUrl && event._embedded?.attractions?.[0]?.images?.[0]?.url) {
      validUrl = event._embedded.attractions[0].images[0].url;
    }

    return !!validUrl;
  });
};

const renderCards = (events) => {
  if (!refs.container) {
    console.error("Gallery container not found");
    return;
  }

  const filteredEvents = filterEventsWithImages(events);

  if (!filteredEvents || filteredEvents.length === 0) {
    refs.container.innerHTML = "<p class='no-events'>No events found.</p>";
    return;
  }

  allFilteredEvents = filteredEvents;
  totalFilteredEvents = filteredEvents.length;

  const eventsPerPage = 20;
  const startIdx = (currentPage - 1) * eventsPerPage;
  const endIdx = startIdx + eventsPerPage;
  const pageEvents = filteredEvents.slice(startIdx, endIdx);

  try {
    refs.container.innerHTML = createEventsMarkup(pageEvents);
    attachCardListeners();
  } catch (error) {
    console.error("Error rendering template:", error);
    refs.container.innerHTML = `<p class='error'>Error rendering events</p>`;
  }
};

const attachCardListeners = () => {
  const cards = refs.container?.querySelectorAll(
    ".gallery-item, .events__item, .card, .event-card, [data-event-id]",
  );

  if (!cards || cards.length === 0) return;

  cards.forEach((card) => {
    const eventId = card.dataset.eventId || card.getAttribute("data-event-id");

    card.addEventListener("click", () => {
      if (eventId && typeof openModal === "function") openModal(eventId);
    });

    card.addEventListener("keydown", (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        eventId &&
        typeof openModal === "function"
      )
        openModal(eventId);
    });
  });
};

const renderPagination = () => {
  if (!refs.paginationContainer) {
    return;
  }

  const realTotalPages = Math.ceil(totalFilteredEvents / 20);

  if (realTotalPages <= 1) {
    refs.paginationContainer.innerHTML = "";
    return;
  }

  const maxPagesTotal = Math.min(realTotalPages, 50);
  const maxPagesToShow = 7;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(maxPagesTotal, startPage + maxPagesToShow - 1);

  let html = "";

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

  if (endPage < maxPagesTotal) {
    if (endPage < maxPagesTotal - 1) {
      html += `<span class="pagination-dots">...</span>`;
    }
    html += `<button class="pagination-btn" data-page="${maxPagesTotal}">${maxPagesTotal}</button>`;
  }

  refs.paginationContainer.innerHTML = html;
  attachPaginationListeners();
};

const attachPaginationListeners = () => {
  const buttons = refs.paginationContainer?.querySelectorAll(
    "[data-page], .pagination-btn, button",
  );

  if (!buttons) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = parseInt(
        e.target.dataset.page || btn.getAttribute("data-page"),
      );
      if (page && page !== currentPage) {
        currentPage = page;

        if (allFilteredEvents.length > 0) {
          showFilteredEventsPage();
          renderPagination();
        } else {
          loadEvents(currentParams);
        }
      }
    });
  });
};

const showFilteredEventsPage = () => {
  if (!refs.container || allFilteredEvents.length === 0) return;

  const eventsPerPage = 20;
  const startIdx = (currentPage - 1) * eventsPerPage;
  const endIdx = startIdx + eventsPerPage;
  const pageEvents = allFilteredEvents.slice(startIdx, endIdx);

  try {
    refs.container.innerHTML = createEventsMarkup(pageEvents);
    attachCardListeners();
  } catch (error) {
    console.error("Error rendering template:", error);
    refs.container.innerHTML = `<p class='error'>Error rendering events</p>`;
  }
};

const loadEvents = async (params = {}) => {
  if (!refs.container) {
    console.error("Gallery container not found");
    return;
  }

  refs.container.innerHTML = "<p class='loading'>Loading events...</p>";

  try {
    currentParams = { ...currentParams, ...params };
    currentPage = 1;

    const firstPageResult = await getEvents({
      page: 1,
      size: 200,
      ...currentParams,
    });

    renderCards(firstPageResult.events);

    if (!refs.paginationContainer) {
      const paginationDiv = document.createElement("div");
      paginationDiv.className = "pagination";
      refs.container.parentNode.appendChild(paginationDiv);
      refs.paginationContainer = paginationDiv;
    }

    renderPagination();

    if (firstPageResult.totalPages > 1) {
      getAllEvents({
        ...currentParams,
        maxPages: 6,
      })
        .then((allEvents) => {
          allFilteredEvents = filterEventsWithImages(allEvents);
          totalFilteredEvents = allFilteredEvents.length;

          renderPagination();
        })
        .catch((err) => {
          console.error("Background loading error:", err);
        });
    }
  } catch (error) {
    console.error("Error loading events:", error);
    refs.container.innerHTML = `<p class='error'>Error: ${error.message}</p>`;
  }
};

const loadEventsByCountry = (countryCode) => {
  currentPage = 1;

  if (countryCode) {
    loadEvents({ countryCode });
  } else {
    currentParams.countryCode = undefined;
    loadEvents();
  }
};

const loadEventsByKeyword = (keyword) => {
  currentPage = 1;
  loadEvents({ keyword });
};


loadEvents();

export {
  loadEvents,
  loadEventsByCountry,
  loadEventsByKeyword,
};
