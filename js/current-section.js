(() => {
  const navLinks = Array.from(document.querySelectorAll(".l-header-link"));
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const header = document.querySelector(".l-header");

  const setCurrent = (id) => {
    navLinks.forEach((link) => {
      if (id && link.getAttribute("href") === `#${id}`) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateCurrent = () => {
    const marker = (header ? header.offsetHeight : 0) + 16;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let currentId = "";

    if (atBottom && sections.length > 0) {
      currentId = sections[sections.length - 1].id;
    } else {
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) {
          currentId = section.id;
        }
      });
    }

    setCurrent(currentId);
  };

  let ticking = false;

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updateCurrent();
      ticking = false;
    });
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  document.addEventListener("scroll", requestUpdate, { passive: true, capture: true });
  window.addEventListener("resize", updateCurrent);

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }

    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    window.setTimeout(() => {
      target.focus({ preventScroll: true });
    }, 0);
  });

  updateCurrent();
})();
