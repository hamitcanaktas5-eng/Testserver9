(function () {
  const RULES = {
    instagram: {
      followers: { per1000: 100, min: 200, max: 75000 },
      likes:     { per1000: 100, min: 200, max: 100000 },
      views:     { maintenance: true }
    },
    tiktok: {
      followers: { per1000: 150, min: 200, max: 50000 },
      likes:     { per1000: 80,  min: 400, max: 100000 },
      views:     { maintenance: true }
    }
  };

  const $ = (id) => document.getElementById(id);

  const menuBtn = $("menuBtn");
  const sidebar = $("sidebar");
  const closeMenu = $("closeMenu");
  const menuBackdrop = $("menuBackdrop");

  const apiBtn = $("apiBtn");
  const apiMenu = $("apiMenu");
  const apiText = $("apiText");
  const apiValue = $("apiValue");

  const serviceBtn = $("serviceBtn");
  const serviceMenu = $("serviceMenu");
  const serviceText = $("serviceText");
  const serviceValue = $("serviceValue");
  const serviceHint = $("serviceHint");

  const amount = $("amount");
  const limitHint = $("limitHint");
  const limitWarn = $("limitWarn");

  const price = $("price");
  const buyBtn = $("buyBtn");
  const form = $("smmForm");

  const modalBackdrop = $("modalBackdrop");

  const maintModal = $("maintModal");
  const closeMaint = $("closeMaint");
  const okMaint = $("okMaint");

  const payModal = $("payModal");
  const closePay = $("closePay");
  const okPay = $("okPay");

  const withinHoursEl = $("withinHours");
  const nowLine = $("nowLine");

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
    const payOpen = payModal && !payModal.hidden;
    const maintOpen = maintModal && !maintModal.hidden;
    const menuOpen = sidebar && sidebar.classList.contains("open");
    if (!payOpen && !maintOpen && !menuOpen) document.body.style.overflow = "";
  }

  function openDrop(menuEl, btnEl) {
    if (!menuEl) return;
    menuEl.hidden = false;
    menuEl.style.display = "block";
    btnEl?.setAttribute("aria-expanded", "true");
  }
  function closeDrop(menuEl, btnEl) {
    if (!menuEl) return;
    menuEl.hidden = true;
    menuEl.style.display = "none";
    btnEl?.setAttribute("aria-expanded", "false");
  }

  // initial close
  function forceClosed() {
    hardHide(payModal);
    hardHide(maintModal);
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

    closeDrop(apiMenu, apiBtn);
    closeDrop(serviceMenu, serviceBtn);

    document.body.style.overflow = "";
  }
  forceClosed();
  window.addEventListener("load", forceClosed);

  // nav active
  const page = document.documentElement.dataset.page || "home";
  document.querySelectorAll(".navItem").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-page") === page);
  });

  // sidebar
  function openSidebar() {
    closePayModal();
    closeMaintModal();
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

  // state helpers
  function disableServiceSelect() {
    if (!serviceBtn) return;
    serviceBtn.disabled = true;
    serviceBtn.classList.add("isDisabled");
    serviceHint && (serviceHint.textContent = "Platform seçilince açılır.");
  }
  function enableServiceSelect() {
    if (!serviceBtn) return;
    serviceBtn.disabled = false;
    serviceBtn.classList.remove("isDisabled");
    serviceHint && (serviceHint.textContent = "Servis seç.");
  }

  function resetServiceAndAmount() {
    serviceValue.value = "";
    serviceText.textContent = "";
    serviceText.classList.add("isEmpty");

    amount.value = "";
    amount.disabled = true;
    amount.placeholder = "Miktar gir";
    amount.removeAttribute("min");
    amount.removeAttribute("max");

    price.value = "";
    buyBtn.disabled = true;

    limitHint.textContent = "Sınırlar servis seçince görünür.";
    hardHide(limitWarn);
  }

  disableServiceSelect();
  resetServiceAndAmount();

  // API select
  apiBtn?.addEventListener("click", () => {
    if (!apiMenu) return;
    apiMenu.hidden ? openDrop(apiMenu, apiBtn) : closeDrop(apiMenu, apiBtn);
  });

  apiMenu?.addEventListener("click", (e) => {
    const opt = e.target.closest(".opt");
    if (!opt) return;

    apiValue.value = opt.dataset.value;
    apiText.textContent = opt.textContent.trim();
    apiText.classList.remove("isEmpty");

    closeDrop(apiMenu, apiBtn);
    enableServiceSelect();
    resetServiceAndAmount();
  });

  // service select
  serviceBtn?.addEventListener("click", () => {
    if (!serviceMenu || serviceBtn.disabled) return;
    serviceMenu.hidden ? openDrop(serviceMenu, serviceBtn) : closeDrop(serviceMenu, serviceBtn);
  });

  function openMaintModal() {
    closeDrop(serviceMenu, serviceBtn);
    hardShow(modalBackdrop, "block");
    hardShow(maintModal, "grid");
    lockScroll();
  }
  function closeMaintModal() {
    hardHide(maintModal);
    if (!(payModal && !payModal.hidden)) hardHide(modalBackdrop);
    unlockScrollIfFree();
  }
  closeMaint?.addEventListener("click", closeMaintModal);
  okMaint?.addEventListener("click", closeMaintModal);

  function setWarn(msg) {
    if (!limitWarn) return;
    limitWarn.textContent = msg;
    limitWarn.hidden = false;
    limitWarn.style.display = "block";
  }
  function clearWarn() {
    if (!limitWarn) return;
    hardHide(limitWarn);
    limitWarn.textContent = "";
  }

  function getRule() {
    const api = apiValue.value;
    const svc = serviceValue.value;
    if (!api || !svc) return null;
    return RULES[api]?.[svc] || null;
  }

  function calcPrice(per1000, qty) {
    return (qty / 1000) * per1000;
  }

  function validateAndPrice() {
    const rule = getRule();
    if (!rule || rule.maintenance) {
      price.value = "";
      buyBtn.disabled = true;
      clearWarn();
      return;
    }

    const raw = String(amount.value || "").trim();
    if (!raw) {
      price.value = "";
      buyBtn.disabled = true;
      clearWarn();
      return;
    }

    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty <= 0) {
      price.value = "";
      buyBtn.disabled = true;
      setWarn("Lütfen geçerli bir miktar gir.");
      return;
    }

    if (qty < rule.min) {
      price.value = "";
      buyBtn.disabled = true;
      setWarn(`Minimum ${rule.min} adet girmen gerekiyor.`);
      return;
    }

    if (qty > rule.max) {
      price.value = "";
      buyBtn.disabled = true;
      setWarn(`Maksimum ${rule.max} adeti geçemezsin.`);
      return;
    }

    // valid
    clearWarn();
    const total = calcPrice(rule.per1000, qty);
    price.value = `${Math.round(total)}₺`;
    buyBtn.disabled = false;
  }

  serviceMenu?.addEventListener("click", (e) => {
    const opt = e.target.closest(".opt");
    if (!opt) return;

    const api = apiValue.value;
    if (!api) {
      closeDrop(serviceMenu, serviceBtn);
      return;
    }

    const svc = opt.dataset.value;
    if (svc === "views") {
      openMaintModal();
      return;
    }

    const rule = RULES[api]?.[svc];
    if (!rule || rule.maintenance) {
      openMaintModal();
      return;
    }

    serviceValue.value = svc;
    serviceText.textContent = opt.textContent.trim();
    serviceText.classList.remove("isEmpty");
    closeDrop(serviceMenu, serviceBtn);

    // enable amount but DO NOT autofill
    amount.disabled = false;
    amount.min = String(rule.min);
    amount.max = String(rule.max);
    amount.placeholder = `Min ${rule.min} • Max ${rule.max}`;

    limitHint.textContent = `Minimum ${rule.min} • Maksimum ${rule.max}`;
    price.value = "";
    buyBtn.disabled = true;
    clearWarn();
  });

  amount?.addEventListener("input", validateAndPrice);
  amount?.addEventListener("change", validateAndPrice);

  // payment modal time
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

  function openPayModal() {
    closeSidebar();
    closeMaintModal();

    const now = getIstanbulNow();
    const within = isWithinHours(now);

    withinHoursEl.hidden = !within;
    withinHoursEl.style.display = within ? "block" : "none";
    nowLine.textContent = formatNow(now);

    hardShow(modalBackdrop, "block");
    hardShow(payModal, "grid");
    lockScroll();
  }
  function closePayModal() {
    hardHide(payModal);
    if (!(maintModal && !maintModal.hidden)) hardHide(modalBackdrop);
    unlockScrollIfFree();
  }

  closePay?.addEventListener("click", closePayModal);
  okPay?.addEventListener("click", closePayModal);
  modalBackdrop?.addEventListener("click", () => {
    if (payModal && !payModal.hidden) closePayModal();
    if (maintModal && !maintModal.hidden) closeMaintModal();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    validateAndPrice();
    if (buyBtn.disabled) return;
    openPayModal();
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (payModal && !payModal.hidden) closePayModal();
    else if (maintModal && !maintModal.hidden) closeMaintModal();
    else if (sidebar && sidebar.classList.contains("open")) closeSidebar();
    else if (serviceMenu && !serviceMenu.hidden) closeDrop(serviceMenu, serviceBtn);
    else if (apiMenu && !apiMenu.hidden) closeDrop(apiMenu, apiBtn);
  });

  // click outside dropdown close
  document.addEventListener("click", (e) => {
    const apiWrap = apiBtn?.closest(".selectWrap");
    const svcWrap = serviceBtn?.closest(".selectWrap");
    if (apiWrap && !apiWrap.contains(e.target)) closeDrop(apiMenu, apiBtn);
    if (svcWrap && !svcWrap.contains(e.target)) closeDrop(serviceMenu, serviceBtn);
  });
})();