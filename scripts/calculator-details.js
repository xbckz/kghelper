(function () {
  function closeOpenDetails() {
    document.querySelectorAll('.best-plan-detail:not([hidden])').forEach(detail => {
      detail.hidden = true;
      detail.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('.best-plan-card[aria-expanded="true"]').forEach(card => {
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-pressed', 'false');
    });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('.best-plan-card, .best-plan-detail')) return;
    closeOpenDetails();
  });
})();
