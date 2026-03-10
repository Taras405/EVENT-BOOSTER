// Scroll-triggered animations for event cards
export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, index * 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const observeCards = () => {
    const cards = document.querySelectorAll('.events__item');
    cards.forEach(card => {
  
      card.classList.remove('animate-in');
      observer.observe(card);
    });
  };

  observeCards();

  const eventsContainer = document.querySelector('.events__list');
  if (eventsContainer) {
    const mutationObserver = new MutationObserver(() => {
      setTimeout(observeCards, 100);
    });

    mutationObserver.observe(eventsContainer, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener('resize', () => {
    setTimeout(observeCards, 100);
  });
};

document.addEventListener('DOMContentLoaded', initScrollAnimations);


window.addEventListener('load', () => {
  setTimeout(initScrollAnimations, 100);
});
