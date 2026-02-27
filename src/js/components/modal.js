import Handlebars from "handlebars";
import modalTemplateSource from "../../template/modal.hbs?raw";
import { getEventById } from "../api/getEvents.js";

document.addEventListener('click', e => {

  const item = e.target.closest('.events__item');
  if (!item) return;

  const backdrop = document.createElement('div');
  backdrop.style.position = 'fixed';
  backdrop.style.inset = '0';
  backdrop.style.background = 'rgba(0,0,0,0.7)';
  backdrop.style.display = 'flex';
  backdrop.style.justifyContent = 'center';
  backdrop.style.alignItems = 'center';
  backdrop.style.zIndex = '1000';

  const modal = document.createElement('div');
  modal.style.background = '#fff';
  modal.style.padding = '40px';
  modal.style.borderRadius = '20px';
  modal.innerText = 'Modal works';

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.remove();
  });

});