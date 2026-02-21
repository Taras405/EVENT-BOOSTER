import { getEventModalData } from "../api/getEvents.js";

const getModalData = async (eventId) => {
  try {
    const modalData = await getEventModalData(eventId);
    return modalData;
  } catch (error) {
    console.error(error.message);
  }
};

export { getModalData };
