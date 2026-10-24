(() => {
  const controls = document.querySelector(".works-filters");
  const results = document.querySelector("#works-results");
  const count = document.querySelector(".works-result-count");
  const empty = document.querySelector(".works-empty");

  if (!controls || !results || !count || !empty) {
    return;
  }

  const buttons = Array.from(controls.querySelectorAll("[data-work-filter]"));
  const cards = Array.from(results.querySelectorAll("[data-work-categories]"));

  const applyFilter = (category) => {
    let visible = 0;
    cards.forEach((card) => {
      const categories = card.dataset.workCategories.split(/\s+/);
      const matches = category === "all" || categories.includes(category);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.workFilter === category));
    });
    count.textContent = category === "all" ? `${visible}作品` : `${visible} / ${cards.length}作品`;
    empty.hidden = visible !== 0;
  };

  controls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-work-filter]");
    if (button && controls.contains(button)) {
      applyFilter(button.dataset.workFilter);
    }
  });

  applyFilter("all");
  controls.hidden = false;
})();
