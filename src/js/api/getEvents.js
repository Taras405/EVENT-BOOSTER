const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const API_KEY = "BIqpeJSCCVibv6jIhfaVoFVpuL0cSADG";

// приклад запиту
// https://app.ticketmaster.com/discovery/v2/events?apikey=BIqpeJSCCVibv6jIhfaVoFVpuL0cSADG

// /events – пошук та отримання подій
// /events/{id} – деталі конкретної події
// /events/{id}/images – зображення події
// /attractions – артисти/атракції
// /venues – місця проведення
// /suggest – автопідказки для пошуку
// /classifications – жанри, сегменти, типи


const buildQuery = params => {
  const query = new URLSearchParams({ apikey: API_KEY });

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  return query.toString();
};

const request = async (path, params = {}) => {
  const response = await fetch(`${BASE_URL}${path}?${buildQuery(params)}`);

  if (!response.ok) {
    throw new Error(`Ticketmaster API error: ${response.status}`);
  }

  return response.json();
};

const getEvents = async ({ page = 1, size = 20, keyword = "", countryCode = "", city = "" } = {}) => {
  const payload = await request("/events", {
    page: Math.max(0, Number(page) - 1),
    size,
    keyword,
    countryCode,
    city,
    sort: "date,asc",
  });

  const events = payload?._embedded?.events ?? [];
  const pageInfo = payload?.page ?? {};

  return {
    events,
    pagination: {
      currentPage: (pageInfo.number ?? 0) + 1,
      totalPages: pageInfo.totalPages ?? 1,
      totalElements: pageInfo.totalElements ?? events.length,
      size: pageInfo.size ?? size,
    },
  };
};

const getEventById = id => {
  if (!id) {
    throw new Error("Event id is required");
  }

  return request(`/events/${id}`);
};

export { getEvents, getEventById };
