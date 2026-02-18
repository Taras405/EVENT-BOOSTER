import createEventsMarkup from "../../template/events.hbs?raw";
import { getEventById, getEvents } from "../api/getEvents.js";

const refs = {
  list: document.querySelector("[data-events-list]"),
  pagination: document.querySelector("[data-pagination]"),
};

const state = {
  page: 1,
  size: 20,
  totalPages: 1,
};

const formatDate = value => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatDateTime = value => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("uk-UA", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getLargestImage = images => {
  if (!Array.isArray(images) || images.length === 0) {
    return "";
  }

  const sorted = [...images].sort((a, b) => {
    const aSize = (a.width || 0) * (a.height || 0);
    const bSize = (b.width || 0) * (b.height || 0);
    return bSize - aSize;
  });

  return sorted[0] && sorted[0].url ? sorted[0].url : "";
};

const getVenue = event => {
  if (!event || !event._embedded || !Array.isArray(event._embedded.venues)) {
    return null;
  }

  return event._embedded.venues[0] || null;
};

const getAttraction = event => {
  if (!event || !event._embedded || !Array.isArray(event._embedded.attractions)) {
    return null;
  }

  return event._embedded.attractions[0] || null;
};

const mapEventsForCards = events => {
  return events.map(event => {
    const venue = getVenue(event);

    return {
      id: event && event.id ? event.id : "",
      name: event && event.name ? event.name : "Untitled event",
      image: getLargestImage(event ? event.images : []),
      date: formatDate(event && event.dates && event.dates.start ? event.dates.start.dateTime || event.dates.start.localDate : ""),
      location: [
        venue && venue.city ? venue.city.name : "",
        venue && venue.country ? venue.country.name : "",
        venue ? venue.name : "",
      ]
        .filter(Boolean)
        .join(", "),
    };
  });
};

const mapEventForModal = event => {
  const venue = getVenue(event);
  const attraction = getAttraction(event);
  const prices = event && Array.isArray(event.priceRanges) ? event.priceRanges : [];

  return {
    id: event && event.id ? event.id : "",
    title: event && event.name ? event.name : "",
    image: getLargestImage(event ? event.images : []),
    dateTime: formatDateTime(event && event.dates && event.dates.start ? event.dates.start.dateTime : ""),
    venue: {
      city: venue && venue.city ? venue.city.name : "",
      country: venue && venue.country ? venue.country.name : "",
      place: venue ? venue.name : "",
    },
    performer: attraction && attraction.name ? attraction.name : "",
    standardPrice: prices[0]
      ? {
          min: prices[0].min,
          max: prices[0].max,
          currency: prices[0].currency,
          purchaseUrl: event && event.url ? event.url : "",
        }
      : null,
    vipPrice: prices[1]
      ? {
          min: prices[1].min,
          max: prices[1].max,
          currency: prices[1].currency,
          purchaseUrl: event && event.url ? event.url : "",
        }
      : null,
  };
};

const buildPages = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  if (start > 2) {
    pages.push("...");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < total - 1) {
    pages.push("...");
  }

  pages.push(total);
  return pages;
};

const renderPagination = () => {
  if (!refs.pagination) {
    return;
  }

  if (state.totalPages <= 1) {
    refs.pagination.innerHTML = "";
    return;
  }

  refs.pagination.innerHTML = buildPages(state.page, state.totalPages)
    .map(page => {
      if (page === "...") {
        return '<span class="pagination__dots">...</span>';
      }

      const active = page === state.page ? 'class="is-active" aria-current="page"' : "";
      return `<button type="button" data-page="${page}" ${active}>${page}</button>`;
    })
    .join("");
};

const renderCards = events => {
  if (!refs.list) {
    return;
  }

  if (!events || events.length === 0) {
    refs.list.innerHTML = "<p>No events found.</p>";
    return;
  }

  refs.list.innerHTML = createEventsMarkup(mapEventsForCards(events));
};

const loadAndRenderEvents = async () => {
  if (!refs.list) {
    return;
  }

  refs.list.innerHTML = "<p>Loading events...</p>";

  try {
    const data = await getEvents({ page: state.page, size: state.size });
    state.totalPages = data.pagination.totalPages;
    renderCards(data.events);
    renderPagination();
  } catch (error) {
    refs.list.innerHTML = `<p>${error.message}</p>`;
    if (refs.pagination) {
      refs.pagination.innerHTML = "";
    }
  }
};

const onPaginationClick = event => {
  const button = event.target.closest("[data-page]");
  if (!button) {
    return;
  }

  const nextPage = Number(button.dataset.page);
  if (!nextPage || nextPage === state.page) {
    return;
  }

  state.page = nextPage;
  loadAndRenderEvents();
};

const getModalDataByEventId = async eventId => {
  const event = await getEventById(eventId);
  return mapEventForModal(event);
};

const initEvents = () => {
  if (!refs.list) {
    return;
  }

  refs.pagination?.addEventListener("click", onPaginationClick);
  loadAndRenderEvents();
};

initEvents();

export { getModalDataByEventId, mapEventForModal };
