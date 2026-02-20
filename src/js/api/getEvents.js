const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const API_KEY = "BIqpeJSCCVibv6jIhfaVoFVpuL0cSADG";

const createQuery = params => {
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
  const response = await fetch(`${BASE_URL}${path}?${createQuery(params)}`);

  if (!response.ok) {
    throw new Error(`Ticketmaster API error: ${response.status}`);
  }

  return response.json();
};

const getEvents = async ({ page = 1, size = 20, keyword = "", countryCode = "" } = {}) => {
  const payload = await request("/events", {
    page: Math.max(0, Number(page) - 1),
    size,
    keyword,
    countryCode,
    sort: "date,asc",
  });

  return payload._embedded && Array.isArray(payload._embedded.events)
    ? payload._embedded.events
    : [];
};

const getEventById = id => request(`/events/${id}`);

export { getEvents, getEventById };
