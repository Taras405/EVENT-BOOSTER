  window.addEventListener("load", () => {
    const loader = document.getElementById("app-loader");

    setTimeout(() => {
      loader.classList.add("hidden");
    }, 1500);
  });