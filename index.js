(function () {
  const splash = document.getElementById("splash");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const closeMenu = document.getElementById("closeMenu");

  const SPLASH_KEY = "roxy_splash_seen_v4";

  function hideSplash() {
    if (!splash) return;
    splash.classList.add("fadeOut");
    setTimeout(() => splash.classList.add("hidden"), 460);
  }

  try {
    const seen = localStorage.getItem(SPLASH_KEY);
    if (seen) splash.classList.add("hidden");
    else {
      setTimeout(() => {
        localStorage.setItem(SPLASH_KEY, "1");
        hideSplash();
      }, 3000);
    }
  } catch {
    setTimeout(hideSplash, 3000);
  }

  function openMenu() {
    sidebar.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenuFn() {
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", openMenu);
  closeMenu?.addEventListener("click", closeMenuFn);
  backdrop?.addEventListener("click", closeMenuFn);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenuFn();
  });

  const page = document.documentElement.dataset.page || "home";
  document.querySelectorAll(".navItem").forEach((a) => {
    const p = a.getAttribute("data-page");
    if (p === page) a.classList.add("active");
    else a.classList.remove("active");
  });

  document.querySelectorAll(".serviceCard").forEach((c) => {
    c.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      c.style.background =
        `radial-gradient(260px 180px at ${x}% ${y}%, rgba(124,92,255,.16), transparent 60%),
         linear-gradient(135deg, rgba(13,21,48,.8), rgba(7,11,24,.65))`;
    });
    c.addEventListener("mouseleave", () => {
      c.style.background = "";
    });
  });
})();
import { db } from "./firebase-init.js";
import { collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

(async () => {
  try {
    // basit bağlantı testi: ads koleksiyonuna bakıyoruz (boş olabilir)
    const q = query(collection(db, "ads"), limit(1));
    const snap = await getDocs(q);
    console.log("[ROXY] Firebase OK. ads docs:", snap.size);
  } catch (err) {
    console.error("[ROXY] Firebase bağlantı hatası:", err);
    alert("Firebase bağlantı hatası var. Console'a bak.");
  }
})();