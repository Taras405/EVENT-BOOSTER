export function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.remove('loader--hidden');
    document.body.style.overflow = 'hidden';
  }
}

export function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('loader--hidden');
    document.body.style.overflow = '';
  }
}

export function initLoader() {
  const existing = document.getElementById('loader');
  if (existing) return;

  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.innerHTML = `
    <div class="loader__backdrop"></div>
    <div class="loader__content">
      <div class="loader__logo">
        <span class="loader__logo-e">E</span><span class="loader__logo-v">V</span><span class="loader__logo-e2">E</span><span class="loader__logo-n">N</span><span class="loader__logo-t">T</span>
        <br>
        <span class="loader__logo-b">B</span><span class="loader__logo-star">⊕</span><span class="loader__logo-s">S</span><span class="loader__logo-t2">T</span><span class="loader__logo-e3">E</span><span class="loader__logo-r">R</span>
      </div>
      <div class="loader__bar-wrapper">
        <div class="loader__bar">
          <div class="loader__bar-fill"></div>
        </div>
        <p class="loader__text">Finding best events<span class="loader__dots"><span>.</span><span>.</span><span>.</span></span></p>
      </div>
      <div class="loader__pulses">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  `;

  document.body.prepend(loader);
}