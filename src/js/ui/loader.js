export function hideLoader() {
  const loader = document.getElementById("app-loader");
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add("hidden");
  }, 800); // small delay for smooth UX
}

console.log("Loader module loaded");