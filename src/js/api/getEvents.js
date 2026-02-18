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

const getEvents = async () => {
  const res = await fetch(`${BASE_URL}/events?apikey=${API_KEY}`);
  return res.json();
};

export { getEvents };
