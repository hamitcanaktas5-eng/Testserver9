(function () {
  const PRICES = {
    wa_global: 200,
    wa_tr: 460,
    tg_global: 200,
    tg_tr: 460,
  };

  // Elements
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const closeMenu = document.getElementById("closeMenu");
  const menuBackdrop = document.getElementById("menuBackdrop");

  const modal = document.getElementById("modal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const closeModal = document.getElementById("closeModal");
  const okModal = document.getElementById("okModal");

  const serviceBtn = document.getElementById("serviceBtn");
  const serviceMenu = document.getElementById("serviceMenu");
  const serviceText = document.getElementById("serviceText");
  const serviceValue = document.getElementById("serviceValue");
  const priceInput = document.getElementById("price");
  const buyBtn = document.getElementById("buyBtn");
  const form = document.getElementById("smsForm");

  const withinHoursEl = document.getElementById("withinHours");
  const nowLine = document.getElementById("nowLine");

  // Hard show/hide (hidden + display)
  function hardHide(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
    el.style.display = "none";
  }
  function hardShow(el, display) {
    if (!el) return;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
    el.style.display = display;
  }

  function lockScroll() { document.body.style.overflow = "hidden"; }
  function unlockScrollIfFree() {
    const modalOpen = modal && !modal.hidden;
    const menuOpen = sidebar?.classList.contains("open");
    if (!modalOpen && !menuOpen) document.body.style.overflow = "";
  }

  // Force closed on start + after load (some envs need this)
  function forceClosed() {
    hardHide(modal);
    hardHide(modalBackdrop);

    if (sidebar) {
      sidebar.classList.remove("open");
      sidebar.setAttribute("aria-hidden", "true");
    }
    if (menuBackdrop) {
      menuBackdrop.hidden = true;
      menuBackdrop.style.display = "none";
    }
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  forceClosed();
  window.addEventListener("load", forceClosed);

  // Active nav highlight
  const page = document.documentElement.dataset.page || "home";
  document.querySelectorAll(".navItem").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-page") === page);
  });

  // Sidebar open/close
  function openSidebar() {
    closeModalFn(); // modal varsa kapat
    if (!sidebar) return;

    sidebar.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    if (menuBackdrop) {
      menuBackdrop.hidden = false;
      menuBackdrop.style.display = "block";
    }
    menuBtn?.setAttribute("aria-expanded", "true");
    lockScroll();
  }

  function closeSidebar() {
    if (!sidebar) return;

    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    if (menuBackdrop) {
      menuBackdrop.hidden = true;
      menuBackdrop.style.display = "none";
    }
    menuBtn?.setAttribute("aria-expanded", "false");
    unlockScrollIfFree();
  }

  menuBtn?.addEventListener("click", openSidebar);
  closeMenu?.addEventListener("click", closeSidebar);
  menuBackdrop?.addEventListener("click", closeSidebar);

  // Select open/close
  function openSelect() {
    if (!serviceMenu) return;
    serviceMenu.hidden = false;
    serviceMenu.style.display = "block";
    serviceBtn?.setAttribute("aria-expanded", "true");
  }
  function closeSelect() {
    if (!serviceMenu) return;
    serviceMenu.hidden = true;
    serviceMenu.style.display = "none";
    serviceBtn?.setAttribute("aria-expanded", "false");
  }
  closeSelect();

  serviceBtn?.addEventListener("click", () => {
    if (!serviceMenu) return;
    if (serviceMenu.hidden) openSelect();
    else closeSelect();
  });

  document.addEventListener("click", (e) => {
    const wrap = serviceBtn?.closest(".selectWrap");
    if (!wrap) return;
    if (!wrap.contains(e.target)) closeSelect();
  });

  serviceMenu?.addEventListener("click", (e) => {
    const opt = e.target.closest(".opt");
    if (!opt) return;

    const value = opt.dataset.value;
    const label = opt.textContent.trim();

    serviceValue.value = value;
    serviceText.textContent = label;
    serviceText.classList.remove("isEmpty");

    const price = PRICES[value];
    if (typeof price === "number") {
      priceInput.value = `${price}₺`;
      buyBtn.disabled = false;
    } else {
      priceInput.value = "";
      buyBtn.disabled = true;
    }

    closeSelect();
  });

  // Istanbul time and working hours
  function getIstanbulNow() {
    const parts = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());

    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return {
      y: Number(map.year),
      m: Number(map.month),
      d: Number(map.day),
      hh: Number(map.hour),
      mm: Number(map.minute),
      weekday: map.weekday
    };
  }

  function isWithinHours(now) {
    const isWeekend = (now.weekday === "Cmt" || now.weekday === "Paz");
    if (isWeekend) return true;
    const mins = now.hh * 60 + now.mm;
    return mins >= 17 * 60 && mins <= 23 * 60 + 59;
  }

  function formatNow(now) {
    const pad = (n) => String(n).padStart(2, "0");
    return `Şu an: ${pad(now.d)}.${pad(now.m)}.${now.y} • ${pad(now.hh)}:${pad(now.mm)} (TR)`;
  }

  // Modal open/close
  function openModal() {
    closeSidebar(); // menü açıksa kapat

    const now = getIstanbulNow();
    const within = isWithinHours(now);

    withinHoursEl.hidden = !within;
    withinHoursEl.style.display = within ? "block" : "none";
    nowLine.textContent = formatNow(now);

    hardShow(modalBackdrop, "block");
    hardShow(modal, "grid");
    lockScroll();
  }

  function closeModalFn() {
    hardHide(modal);
    hardHide(modalBackdrop);
    unlockScrollIfFree();
  }

  closeModal?.addEventListener("click", closeModalFn);
  okModal?.addEventListener("click", closeModalFn);
  modalBackdrop?.addEventListener("click", closeModalFn);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!serviceValue.value) return;
    openModal();
  });

  // ESC priority
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (modal && !modal.hidden) closeModalFn();
    else if (sidebar?.classList.contains("open")) closeSidebar();
    else if (serviceMenu && !serviceMenu.hidden) closeSelect();
  });
})();