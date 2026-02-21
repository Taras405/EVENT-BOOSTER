const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const API_KEY = "BIqpeJSCCVibv6jIhfaVoFVpuL0cSADG";

const createQuery = (params) => {
  const query = new URLSearchParams({ apikey: API_KEY });

  Object.entries(params).forEach(([key, value]) => {
    if (!value && value !== 0) return;
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

const getEventDate = (event) => {
  if (event?.dates?.start?.dateTime) {
    return event.dates.start.dateTime;
  }

  if (event?.dates?.start?.localDate) {
    return `${event.dates.start.localDate}T00:00:00`;
  }

  return "";
};

const formatDate = (dateString) => {
  if (!dateString) return "No date";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "No date";

    return new Intl.DateTimeFormat("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return "No date";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "No date";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "No date";

    return new Intl.DateTimeFormat("uk-UA", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "No date";
  }
};

const getBestCardImage = (images) => {
  if (!Array.isArray(images)) return "";

  const portrait = images.filter((img) => img.ratio === "3_4");

  if (portrait.length > 0) {
    return portrait[0].url;
  }

  return images[0]?.url || "";
};

const getVenue = (event) => {
  return event?._embedded?.venues?.[0] || null;
};

const getAttraction = (event) => {
  return event?._embedded?.attractions?.[0] || null;
};

const getPrices = (event) => {
  return Array.isArray(event?.priceRanges) ? event.priceRanges : [];
};

const getEvents = async ({
  page = 1,
  size = 20,
  keyword = "",
  countryCode = "UA",
} = {}) => {
  const requestParams = {
    page: Math.max(0, Number(page) - 1),
    size,
    sort: "date,asc",
  };

  if (countryCode?.trim()) {
    requestParams.countryCode = countryCode;
  }

  if (keyword?.trim()) {
    requestParams.keyword = keyword;
  }

  try {
    const payload = await request("/events", requestParams);
    const events = payload?._embedded?.events || [];

    return {
      events,
      totalEvents: payload?.page?.totalElements || 0,
      totalPages: payload?.page?.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { events: [], totalEvents: 0, totalPages: 1 };
  }
};

const getEventById = async (id) => {
  if (!id) {
    throw new Error("Event id is required");
  }

  return request(`/events/${id}`);
};

const mapEventToCardData = (event) => {
  const venue = getVenue(event);
  const dateTime = getEventDate(event);
  const imageUrl = getBestCardImage(event?.images || []);

  return {
    id: event?.id || "",
    imageUrl:
      imageUrl || "https://via.placeholder.com/180x227?text=No+Image",
    artistName: event?.name || "Untitled event",
    artistDate: formatDate(dateTime),
    artistPlace: venue
      ? `${venue?.city?.name || ""}, ${venue?.country?.name || ""}`
      : "Venue TBD",
    locationIcon: "/images/location.svg",
  };
};

const mapEventToModalData = (event) => {
  const venue = getVenue(event);
  const attraction = getAttraction(event);
  const prices = getPrices(event);
  const dateTime = getEventDate(event);

  return {
    id: event?.id || "",
    title: event?.name || "",
    image: getBestCardImage(event?.images || []),
    dateTime: formatDateTime(dateTime),
    url: event?.url || "",
    venue: {
      city: venue?.city?.name || "",
      country: venue?.country?.name || "",
      place: venue?.name || "",
      address: venue?.address?.line1 || "",
    },
    performer: attraction?.name || "",
    standardPrice: prices[0]
      ? {
          min: prices[0].min,
          max: prices[0].max,
          currency: prices[0].currency,
        }
      : null,
    vipPrice: prices[1]
      ? {
          min: prices[1].min,
          max: prices[1].max,
          currency: prices[1].currency,
        }
      : null,
  };
};

const getEventsForCards = async (params = {}) => {
  const { events, totalPages } = await getEvents(params);

  return {
    cards: events.map(mapEventToCardData),
    totalPages,
    currentPage: params.page || 1,
  };
};

const getEventModalData = async (eventId) => {
  try {
    const event = await getEventById(eventId);
    return mapEventToModalData(event);
  } catch (error) {
    console.error("Error getting modal data:", error);
    return null;
  }
};

export {
  getEventsForCards,
  getEventModalData,
  getEvents,
  getEventById,
};