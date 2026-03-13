import Handlebars from "handlebars";
import modalTemplateSource from "../../template/modal.hbs?raw";
import { getEventById } from "../api/getEvents.js";

const eventsContainer = document.querySelector(".events");
let backdrop;
let modalContent;

eventsContainer.addEventListener("click", async (event) => {
  const card = event.target.closest(".events__item");
  if (!card) return;

  const eventId = card.dataset.eventId;
  
  if (!backdrop) createModal();

  openModal();
  await loadModalContent(eventId);
});

document.addEventListener("click", (event) => {
  if (
    backdrop &&
    (event.target.classList.contains("event-modal__close") ||
     event.target === backdrop)
  ) {
    closeModal();
  }
});

function createModal() {
  backdrop = document.createElement("div");
  backdrop.classList.add("modal-overlay", "modal-hidden");

  modalContent = document.createElement("div");
  modalContent.id = "modal-content";

  backdrop.appendChild(modalContent);
  document.body.appendChild(backdrop);
}

function openModal() {
  backdrop.classList.remove("modal-hidden");
  backdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  backdrop.classList.add("modal-hidden");
  backdrop.style.display = "none";
  document.body.style.overflow = "auto";
}

async function loadModalContent(eventId) {
  const eventData = await getEventById(eventId);

  const modalData = {
    name: eventData.name,

    info: eventData.info || "No information",

    url: eventData.images?.find(img => img.ratio === "4_3")?.url 
         || eventData.images?.[0]?.url,

    date: `${eventData.dates?.start?.localDate || ""} ${eventData.dates?.start?.localTime || ""}`,

    place: eventData._embedded?.venues?.[0]
      ? `${eventData._embedded.venues[0].name}, ${eventData._embedded.venues[0].city?.name || ""}`
      : "Location not available",

    prices: eventData.priceRanges
      ? eventData.priceRanges.map(p => ({
          type: p.type,
          min: p.min,
          max: p.max,
          currency: p.currency
        }))
      : ["Price not available"]
  };

  const template = Handlebars.compile(modalTemplateSource);
  modalContent.innerHTML = template(modalData);
}
