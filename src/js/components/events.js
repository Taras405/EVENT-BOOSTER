import createEventsMarkup from "../../template/events.hbs?raw";
import { getEvents } from "../api/getEvents.js";

const LOCATION_ICON_PATH = "/images/location.svg";

const refs = {
  container: document.querySelector(".gallery-container"),
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

const getVenueText = event => {
  if (!event || !event._embedded || !Array.isArray(event._embedded.venues)) {
    return "";
  }

  const venue = event._embedded.venues[0];
  const city = venue && venue.city ? venue.city.name : "";
  const country = venue && venue.country ? venue.country.name : "";

  return [city, country].filter(Boolean).join(", ");
};

const mapEventsForTemplate = events => {
  return events.map(event => {
    return {
      imageUrl: getLargestImage(event.images),
      artistName: event.name || "Untitled event",
      artistDate: formatDate(event.dates && event.dates.start ? event.dates.start.dateTime || event.dates.start.localDate : ""),
      artistPlace: getVenueText(event),
      locationIcon: LOCATION_ICON_PATH,
    };
  });
};

const renderEvents = events => {
  if (!refs.container) {
    return;
  }

  if (!events || events.length === 0) {
    refs.container.innerHTML = "<p>No events found.</p>";
    return;
  }

  refs.container.innerHTML = createEventsMarkup(mapEventsForTemplate(events));
};

const initEvents = async () => {
  if (!refs.container) {
    return;
  }

  refs.container.innerHTML = "<p>Loading events...</p>";

  try {
    const events = await getEvents({ page: 1, size: 20 });
    renderEvents(events);
  } catch (error) {
    refs.container.innerHTML = `<p>${error.message}</p>`;
  }
};

initEvents();

export { mapEventsForTemplate };
