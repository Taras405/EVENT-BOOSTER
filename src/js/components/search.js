import { countries } from "./country.js";
import { loadEventsByCountry, loadEventsByKeyword } from "./events.js";
const refs = {
  countrySelect: document.querySelector("#country-select"),
  searchInput: document.querySelector("#search-input"),
};

function populateCountrySelect() {
  if (!refs.countrySelect) return;

  countries.forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    refs.countrySelect.appendChild(opt);
  });
}

function initFilters() {
  if (refs.countrySelect) {
    refs.countrySelect.addEventListener("change", (e) => {
      const code = e.target.value;
      if (code) {
        loadEventsByCountry(code);
      } else {
        loadEventsByCountry("");
      }
    });
  }

  if (refs.searchInput) {
    let debounce;
    refs.searchInput.addEventListener("input", (e) => {
      clearTimeout(debounce);
      const text = e.target.value.trim();
      debounce = setTimeout(() => {
        loadEventsByKeyword(text);
      }, 300);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateCountrySelect();
  initFilters();
});