const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const API_KEY = "BIqpeJSCCVibv6jIhfaVoFVpuL0cSADG";

const request = async (path, params = {}) => {
  const query = new URLSearchParams({ apikey: API_KEY });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const url = `${BASE_URL}${path}?${query.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

const toTmDateTime = (d) => d.toISOString().split(".")[0] + "Z";

const addYearsUTC = (date, years) => {
  const d = new Date(date);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
};

const getEvents = async ({
  page = 1,
  size = 20,
  keyword = "",
  countryCode,
  monthsAhead,
  daysAhead,
} = {}) => {
  const now = new Date();

  let end = addYearsUTC(now, 1);
  if (Number.isFinite(Number(monthsAhead))) {
    end = new Date(now);
    end.setUTCMonth(end.getUTCMonth() + Number(monthsAhead));
  }
  if (Number.isFinite(Number(daysAhead))) {
    end = new Date(now.getTime() + Number(daysAhead) * 24 * 60 * 60 * 1000);
  }

  const safeSize = Math.min(200, Math.max(1, Number(size) || 20));

  const params = {
    page: Math.max(0, Number(page) - 1),
    size: safeSize,
    sort: "date,desc",
    startDateTime: toTmDateTime(now),
    endDateTime: toTmDateTime(end),
  };

  if (countryCode?.trim())
    params.countryCode = countryCode.trim().toUpperCase();
  if (keyword?.trim()) params.keyword = keyword.trim();

  try {
    const data = await request("/events", params);

    return {
      events: data?._embedded?.events || [],
      totalPages: data?.page?.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { events: [], totalPages: 1 };
  }
};

const getAllEvents = async ({
  keyword = "",
  countryCode,
  monthsAhead,
  daysAhead,
  maxPages = 10,
} = {}) => {
  const now = new Date();

  let end = addYearsUTC(now, 1);
  if (Number.isFinite(Number(monthsAhead))) {
    end = new Date(now);
    end.setUTCMonth(end.getUTCMonth() + Number(monthsAhead));
  }
  if (Number.isFinite(Number(daysAhead))) {
    end = new Date(now.getTime() + Number(daysAhead) * 24 * 60 * 60 * 1000);
  }

  const allEvents = [];
  let currentPage = 0;
  let totalPages = 1;

  try {
    while (currentPage < totalPages && currentPage < maxPages) {
      const params = {
        page: currentPage,
        size: 200,
        sort: "date,desc",
        startDateTime: toTmDateTime(now),
        endDateTime: toTmDateTime(end),
      };

      if (countryCode?.trim())
        params.countryCode = countryCode.trim().toUpperCase();
      if (keyword?.trim()) params.keyword = keyword.trim();

      const data = await request("/events", params);

      if (!data) break;

      const events = data?._embedded?.events || [];

      if (events.length === 0) break;

      allEvents.push(...events);

      totalPages = data?.page?.totalPages || 1;
      currentPage++;
    }

    return allEvents;
  } catch (error) {
    console.error("Error fetching all events:", error);
    return allEvents;
  }
};

const getEventById = async (id) => {
  if (!id) {
    throw new Error("Event id is required");
  }

  try {
    return await request(`/events/${id}`);
  } catch (error) {
    console.error("Error getting event:", error);
    throw error;
  }
};

export { getEvents, getAllEvents, getEventById };
