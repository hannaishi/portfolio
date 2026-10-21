const header = document.querySelector(".l-header");
const toggle = document.querySelector(".l-header-menu");
const nav = document.querySelector("#header-nav");

if (header && toggle && nav) {
  const desktopQuery = window.matchMedia("(min-width: 768px)");
  const links = Array.from(nav.querySelectorAll("a"));

  const syncInert = () => {
    const collapsed = !desktopQuery.matches && !header.classList.contains("is-open");
    nav.toggleAttribute("inert", collapsed);
  };

  const setOpen = (open, restoreFocus) => {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    document.body.classList.toggle("is-menu-open", open && !desktopQuery.matches);
    syncInert();

    if (open && links[0]) {
      links[0].focus();
    } else if (!open && restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    const nextOpen = !header.classList.contains("is-open");
    setOpen(nextOpen, !nextOpen);
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || desktopQuery.matches) {
      return;
    }
    setOpen(false, false);
  });

  document.addEventListener("keydown", (event) => {
    if (!header.classList.contains("is-open") || desktopQuery.matches) {
      return;
    }

    if (event.key === "Escape") {
      setOpen(false, true);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = [toggle, ...links];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const onDesktopChange = () => {
    if (desktopQuery.matches && header.classList.contains("is-open")) {
      setOpen(false, false);
    }
    syncInert();
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", onDesktopChange);
  }

  syncInert();
}
