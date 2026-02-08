(function () {
  const STORAGE_KEY = "roxy_reviews_v1";
  const DEMO_EMAIL = "hamitcanaktas5@gmail.com";

  const STATUS = {
    pending:  { label: "Onay bekliyor", cls: "pending" },
    approved: { label: "Onaylandı", cls: "approved" },
    replied:  { label: "Yanıtlandı", cls: "replied" },
    rejected: { label: "Reddedildi", cls: "rejected" }
  };

  const $ = (id) => document.getElementById(id);

  // Sidebar
  const menuBtn = $("menuBtn");
  const sidebar = $("sidebar");
  const closeMenu = $("closeMenu");
  const menuBackdrop = $("menuBackdrop");

  // Backdrop
  const modalBackdrop = $("modalBackdrop");

  // Main
  const latestList = $("latestList");
  const viewAllBtn = $("viewAllBtn");

  // Overlays
  const allOverlay = $("allOverlay");
  const closeAll = $("closeAll");
  const allList = $("allList");

  const lookupOverlay = $("lookupOverlay");
  const openLookup = $("openLookup");
  const closeLookup = $("closeLookup");
  const lookupForm = $("lookupForm");
  const lookupEmail = $("lookupEmail");
  const lookupResult = $("lookupResult");
  const lookupList = $("lookupList");
  const clearLookup = $("clearLookup");

  // Form
  const reviewForm = $("reviewForm");
  const fullName = $("fullName");
  const email = $("email");
  const comment = $("comment");

  // Info Modal
  const okModal = $("okModal");
  const okText = $("okText");
  const closeOk = $("closeOk");
  const okBtn = $("okBtn");

  // ---------------- helpers ----------------
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
    const menuOpen = sidebar && sidebar.classList.contains("open");
    const modalOpen =
      (okModal && !okModal.hidden) ||
      (allOverlay && !allOverlay.hidden) ||
      (lookupOverlay && !lookupOverlay.hidden);

    if (!menuOpen && !modalOpen) document.body.style.overflow = "";
  }

  function normalizeEmail(v) {
    return String(v || "").trim().toLowerCase();
  }

  function escapeHTML(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(d);
  }

  function genId() {
    return (crypto?.randomUUID?.() || ("id_" + Math.random().toString(16).slice(2)));
  }

  // FULL NAME -> "HAMİTCAN A." (and if multiple last names: "HAMİTCAN C. A.")
  function toDisplayNameTR(name) {
    const cleaned = String(name || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!cleaned) return "MÜŞTERİ";

    const parts = cleaned.split(" ");
    // Uppercase in Turkish correctly
    const upperParts = parts.map(p => p.toLocaleUpperCase("tr-TR"));

    if (upperParts.length === 1) {
      // Single name, no surname
      return `${upperParts[0]}`;
    }

    const first = upperParts[0];
    const rest = upperParts.slice(1);

    // Each surname part -> first letter + "."
    const maskedSurnames = rest.map(s => `${s[0]}.`);

    return `${first} ${maskedSurnames.join(" ")}`.trim();
  }

  // ---------------- storage (READY TO SWAP WITH API) ----------------
  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveReviews(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // ---------------- seed (only DEMO_EMAIL, 4 statuses) ----------------
  function ensureSeed() {
    const list = loadReviews();
    const already = list.some(r => r && r.__seed && normalizeEmail(r.email) === normalizeEmail(DEMO_EMAIL));
    if (already) return;

    const demoFullName = "Hamitcan Aktaş";
    const demoDisplay = toDisplayNameTR(demoFullName); // HAMİTCAN A.

    const seed = [
      {
        id: genId(),
        __seed: true,
        createdAt: "2026-02-01T16:10:00.000Z",
        fullName: demoFullName,
        displayName: demoDisplay,
        email: DEMO_EMAIL,
        comment: "Sipariş verdim. Şimdilik beklemedeyim, dönüş bekliyorum.",
        status: "pending",
        reply: ""
      },
      {
        id: genId(),
        __seed: true,
        createdAt: "2026-02-02T19:25:00.000Z",
        fullName: demoFullName,
        displayName: demoDisplay,
        email: DEMO_EMAIL,
        comment: "İşlem hızlıydı. Fiyatlar da net, memnun kaldım.",
        status: "approved",
        reply: ""
      },
      {
        id: genId(),
        __seed: true,
        createdAt: "2026-02-04T21:05:00.000Z",
        fullName: demoFullName,
        displayName: demoDisplay,
        email: DEMO_EMAIL,
        comment: "Destekle konuşunca sorun çözüldü. Teşekkürler.",
        status: "replied",
        reply: "Geri bildiriminiz için teşekkürler. Yardımcı olmaktan memnuniyet duyarız."
      },
      {
        id: genId(),
        __seed: true,
        createdAt: "2026-02-05T13:40:00.000Z",
        fullName: demoFullName,
        displayName: demoDisplay,
        email: DEMO_EMAIL,
        comment: "Bu yorum politika dışı içerik olduğu için reddedildi (demo).",
        status: "rejected",
        reply: ""
      }
    ];

    saveReviews([...seed, ...list]);
  }

  // ---------------- rendering ----------------
  function statusBadge(statusKey) {
    const s = STATUS[statusKey] || STATUS.pending;
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  }

  function renderCard(r, showStatus) {
    const date = formatDate(r.createdAt);
    const initials = "A";

    const replyBlock = (r.status === "replied" && r.reply)
      ? `
        <div class="replyBox">
          <div class="replyHead">
            <div class="replyTitle">ROXY STORE Yanıtı</div>
            <div class="badge replied">Yanıtlandı</div>
          </div>
          <div class="replyText">${escapeHTML(r.reply)}</div>
        </div>
      `
      : "";

    const rightBadge = showStatus ? statusBadge(r.status) : "";

    return `
      <div class="reviewCard">
        <div class="reviewTop">
          <div class="author">
            <div class="avatar">${initials}</div>
            <div class="aText">
              <div class="aName">${escapeHTML(r.displayName || "MÜŞTERİ")}</div>
              <div class="aDate">${date}</div>
            </div>
          </div>
          ${rightBadge}
        </div>
        <div class="reviewText">${escapeHTML(r.comment)}</div>
        ${replyBlock}
      </div>
    `;
  }

  function getPublished(list) {
    return list
      .filter(r => r.status === "approved" || r.status === "replied")
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function renderLatest() {
    const list = loadReviews();
    const published = getPublished(list).slice(0, 4);
    if (!published.length) {
      latestList.innerHTML = `<div class="hint">Henüz yayınlanmış yorum yok.</div>`;
      return;
    }
    latestList.innerHTML = published.map(r => renderCard(r, false)).join("");
  }

  function renderAllOverlay() {
    const list = loadReviews();
    const published = getPublished(list);
    allList.innerHTML = published.length
      ? published.map(r => renderCard(r, false)).join("")
      : `<div class="hint">Henüz yayınlanmış yorum yok.</div>`;
  }

  function renderLookup(emailAddr) {
    const list = loadReviews();
    const q = normalizeEmail(emailAddr);

    const mine = list
      .filter(r => normalizeEmail(r.email) === q)
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    hardShow(lookupResult, "block");

    if (!mine.length) {
      lookupList.innerHTML = `<div class="hint">Bu e-posta ile kayıtlı yorum bulunamadı.</div>`;
      return;
    }

    lookupList.innerHTML = mine.map(r => renderCard(r, true)).join("");
  }

  // ---------------- UI open/close ----------------
  function openSidebar() {
    sidebar?.classList.add("open");
    sidebar?.setAttribute("aria-hidden", "false");
    if (menuBackdrop) {
      menuBackdrop.hidden = false;
      menuBackdrop.style.display = "block";
    }
    menuBtn?.setAttribute("aria-expanded", "true");
    lockScroll();
  }
  function closeSidebar() {
    sidebar?.classList.remove("open");
    sidebar?.setAttribute("aria-hidden", "true");
    if (menuBackdrop) {
      menuBackdrop.hidden = true;
      menuBackdrop.style.display = "none";
    }
    menuBtn?.setAttribute("aria-expanded", "false");
    unlockScrollIfFree();
  }

  function openAll() {
    closeSidebar();
    hardShow(modalBackdrop, "block");
    hardShow(allOverlay, "grid");
    renderAllOverlay();
    lockScroll();
  }
  function closeAllOverlay() {
    hardHide(allOverlay);
    if (!(lookupOverlay && !lookupOverlay.hidden) && !(okModal && !okModal.hidden)) hardHide(modalBackdrop);
    unlockScrollIfFree();
  }

  function openLookupOverlay() {
    closeSidebar();
    hardShow(modalBackdrop, "block");
    hardShow(lookupOverlay, "grid");
    lockScroll();
  }
  function closeLookupOverlay() {
    hardHide(lookupOverlay);
    if (!(allOverlay && !allOverlay.hidden) && !(okModal && !okModal.hidden)) hardHide(modalBackdrop);
    unlockScrollIfFree();
  }

  function openOk(message) {
    okText.textContent = message;
    hardShow(modalBackdrop, "block");
    hardShow(okModal, "grid");
    lockScroll();
  }
  function closeOkModal() {
    hardHide(okModal);
    if (!(allOverlay && !allOverlay.hidden) && !(lookupOverlay && !lookupOverlay.hidden)) hardHide(modalBackdrop);
    unlockScrollIfFree();
  }

  // ---------------- init ----------------
  ensureSeed();
  renderLatest();

  const page = document.documentElement.dataset.page || "home";
  document.querySelectorAll(".navItem").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-page") === page);
  });

  // ---------------- events ----------------
  menuBtn?.addEventListener("click", openSidebar);
  closeMenu?.addEventListener("click", closeSidebar);
  menuBackdrop?.addEventListener("click", closeSidebar);

  viewAllBtn?.addEventListener("click", openAll);
  closeAll?.addEventListener("click", closeAllOverlay);

  openLookup?.addEventListener("click", openLookupOverlay);
  closeLookup?.addEventListener("click", closeLookupOverlay);

  lookupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = lookupEmail.value.trim();
    if (!v) return;
    renderLookup(v);
  });

  clearLookup?.addEventListener("click", () => {
    lookupEmail.value = "";
    hardHide(lookupResult);
    lookupList.innerHTML = "";
  });

  reviewForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = fullName.value.trim();
    const mail = email.value.trim();
    const text = comment.value.trim();
    if (!name || !mail || !text) return;

    const list = loadReviews();

    list.unshift({
      id: genId(),
      createdAt: new Date().toISOString(),
      fullName: name,
      displayName: toDisplayNameTR(name), // ✅ HERE
      email: mail,
      comment: text,
      status: "pending",
      reply: ""
    });

    saveReviews(list);

    reviewForm.reset();
    renderLatest();

    openOk("Yorumunuz alındı. Durum: Onay bekliyor.");
  });

  closeOk?.addEventListener("click", closeOkModal);
  okBtn?.addEventListener("click", closeOkModal);

  modalBackdrop?.addEventListener("click", () => {
    if (okModal && !okModal.hidden) closeOkModal();
    else if (lookupOverlay && !lookupOverlay.hidden) closeLookupOverlay();
    else if (allOverlay && !allOverlay.hidden) closeAllOverlay();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (okModal && !okModal.hidden) closeOkModal();
    else if (lookupOverlay && !lookupOverlay.hidden) closeLookupOverlay();
    else if (allOverlay && !allOverlay.hidden) closeAllOverlay();
    else if (sidebar?.classList.contains("open")) closeSidebar();
  });
})();