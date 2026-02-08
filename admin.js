(() => {
  const $ = (id) => document.getElementById(id);

  const btnReviews = $("btnReviews");
  const btnAds = $("btnAds");
  const logoutBtn = $("logoutBtn");

  const backdrop = $("modalBackdrop");
  const closeBtn = $("modalClose");
  const okBtn = $("modalOk");
  const titleEl = $("modalTitle");
  const subEl = $("modalSub");
  const bodyEl = $("modalBody");

  function openModal({ title, sub, body }) {
    titleEl.textContent = title || "Bilgi";
    subEl.textContent = sub || "";
    bodyEl.textContent = body || "";

    backdrop.style.display = "flex";
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    backdrop.style.display = "none";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  async function safeNavigate(url) {
    // Dosya var mı kontrol: varsa git, yoksa 404 yerine modal
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (r.ok) {
        window.location.href = url;
        return;
      }
    } catch (_) {}

    openModal({
      title: "Sayfa Bulunamadı",
      sub: "Dosya yolu kontrolü",
      body: "Bu menüye ait sayfa bulunamadı. Dosya adını ve konumunu kontrol edin."
    });
  }

  btnReviews.addEventListener("click", () => {
    safeNavigate("admin-degerlendirmeler.html");
  });

  btnAds.addEventListener("click", () => {
    safeNavigate("admin-ilanlar.html");
  });

  logoutBtn.addEventListener("click", () => {
    // Burayı sonra giriş sistemine bağlayınca gerçek çıkış yapacağız.
    window.location.href = "admin-giris.html";
  });

  closeBtn.addEventListener("click", closeModal);
  okBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
})();