(() => {
  // Admin tarafı veri anahtarı
  const DB_KEY = "roxy_reviews_db";

  const $ = (id) => document.getElementById(id);

  const backBtn = $("backBtn");
  const listArea = $("listArea");
  const countChip = $("countChip");

  const pillApproved = $("pillApproved");
  const pillPending = $("pillPending");
  const pillRejected = $("pillRejected");
  const pillUnreplied = $("pillUnreplied");

  const tabs = Array.from(document.querySelectorAll(".tab"));

  // Reply modal
  const replyBackdrop = $("replyBackdrop");
  const replyClose = $("replyClose");
  const replyCancel = $("replyCancel");
  const replySend = $("replySend");
  const replyText = $("replyText");
  const replySub = $("replySub");
  const replyQuote = $("replyQuote");

  // Info modal
  const infoBackdrop = $("infoBackdrop");
  const infoTitle = $("infoTitle");
  const infoSub = $("infoSub");
  const infoBody = $("infoBody");
  const infoClose = $("infoClose");
  const infoOk = $("infoOk");

  let activeTab = "approved";
  let replyTargetId = null;

  // ---- Storage helpers (ileride backend ile değiştirilebilir) ----
  function loadDB() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
  function saveDB(list) {
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  }

  // Bu fonksiyonlar “backend hook” gibi düşün:
  // İstersen ileride burada Firebase/REST çağrısı yaparsın.
  function dbGetAll() {
    return loadDB();
  }
  function dbUpdateOne(id, patch) {
    const db = loadDB();
    const idx = db.findIndex(r => r.id === id);
    if (idx === -1) return false;
    db[idx] = { ...db[idx], ...patch };
    saveDB(db);
    return true;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  }

  // HAMİTCAN A. format
  function maskName(fullName) {
    const s = String(fullName || "").trim();
    if (!s) return "MÜŞTERİ";
    const parts = s.split(/\s+/).filter(Boolean);
    const first = parts[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1] : "";
    const firstUp = first.toLocaleUpperCase("tr-TR");
    const lastInit = last ? (last[0].toLocaleUpperCase("tr-TR") + ".") : "";
    return lastInit ? `${firstUp} ${lastInit}` : firstUp;
  }

  function statusLabel(r) {
    if (r.status === "pending") return { text: "Onay Bekliyor", cls: "warn" };
    if (r.status === "rejected") return { text: "Reddedildi", cls: "bad" };
    // approved:
    if (r.replyText && String(r.replyText).trim()) return { text: "Yanıtlandı", cls: "ok" };
    return { text: "Onaylandı", cls: "ok" };
  }

  function countPills(db) {
    const approved = db.filter(r => r.status === "approved").length;
    const pending = db.filter(r => r.status === "pending").length;
    const rejected = db.filter(r => r.status === "rejected").length;
    const unreplied = db.filter(r => r.status === "approved" && !(r.replyText && String(r.replyText).trim())).length;

    pillApproved.textContent = String(approved);
    pillPending.textContent = String(pending);
    pillRejected.textContent = String(rejected);
    pillUnreplied.textContent = String(unreplied);
    countChip.textContent = `${db.length} Kayıt`;
  }

  function setActiveTab(tab) {
    activeTab = tab;
    tabs.forEach(t => {
      const is = t.dataset.tab === tab;
      t.classList.toggle("active", is);
      t.setAttribute("aria-selected", is ? "true" : "false");
    });
    render();
  }

  function makeEmpty(msg) {
    const div = document.createElement("div");
    div.className = "empty";
    div.textContent = msg;
    return div;
  }

  function render() {
    const db = dbGetAll();
    countPills(db);
    listArea.innerHTML = "";

    let list = [];
    if (activeTab === "approved") {
      list = db.filter(r => r.status === "approved");
    } else if (activeTab === "pending") {
      list = db.filter(r => r.status === "pending");
    } else if (activeTab === "rejected") {
      list = db.filter(r => r.status === "rejected");
    } else if (activeTab === "unreplied") {
      list = db.filter(r => r.status === "approved" && !(r.replyText && String(r.replyText).trim()));
    }

    // newest first
    list.sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    if (list.length === 0) {
      if (activeTab === "approved") listArea.appendChild(makeEmpty("Onaylanmış yorum bulunmuyor."));
      if (activeTab === "pending") listArea.appendChild(makeEmpty("Onay bekleyen yorum bulunmuyor."));
      if (activeTab === "rejected") listArea.appendChild(makeEmpty("Reddedilmiş yorum bulunmuyor."));
      if (activeTab === "unreplied") listArea.appendChild(makeEmpty("Yanıtlanmamış yorum bulunmuyor."));
      return;
    }

    list.forEach(r => listArea.appendChild(renderItem(r)));
  }

  function renderItem(r) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "itemTop";

    const person = document.createElement("div");
    person.className = "person";

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const meta = document.createElement("div");
    meta.className = "pmeta";

    const name = document.createElement("div");
    name.className = "pname";
    name.textContent = maskName(r.name);

    const mail = document.createElement("div");
    mail.className = "pmail";
    // Admin panelinde mail görünür
    mail.textContent = r.email ? r.email : "";

    meta.appendChild(name);
    meta.appendChild(mail);

    person.appendChild(avatar);
    person.appendChild(meta);

    const st = statusLabel(r);
    const badge = document.createElement("span");
    badge.className = `badge ${st.cls}`;
    badge.textContent = st.text;

    top.appendChild(person);
    top.appendChild(badge);

    const comment = document.createElement("div");
    comment.className = "comment";
    comment.textContent = r.comment || "";

    item.appendChild(top);
    item.appendChild(comment);

    if (r.replyText && String(r.replyText).trim()) {
      const reply = document.createElement("div");
      reply.className = "replyBox";
      const when = r.replyAt ? ` • ${formatDate(r.replyAt)}` : "";
      reply.innerHTML = `<strong>ROXY STORE yanıtı</strong>${when}<br>${escapeHtml(r.replyText)}`;
      item.appendChild(reply);
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    if (r.status === "pending") {
      const approve = document.createElement("button");
      approve.className = "btn btnOk small";
      approve.type = "button";
      approve.textContent = "Onayla";
      approve.addEventListener("click", () => approveReview(r.id));

      const reject = document.createElement("button");
      reject.className = "btn btnDanger small";
      reject.type = "button";
      reject.textContent = "Reddet";
      reject.addEventListener("click", () => rejectReview(r.id));

      actions.appendChild(approve);
      actions.appendChild(reject);
    }

    if (r.status === "approved" && !(r.replyText && String(r.replyText).trim())) {
      const replyBtn = document.createElement("button");
      replyBtn.className = "btn primary small";
      replyBtn.type = "button";
      replyBtn.textContent = "Yanıtla";
      replyBtn.addEventListener("click", () => openReplyModal(r));
      actions.appendChild(replyBtn);
    }

    if (actions.children.length) item.appendChild(actions);

    const metaRow = document.createElement("div");
    metaRow.className = "pmail";
    metaRow.style.marginTop = "10px";
    metaRow.textContent = r.createdAt ? `Gönderim: ${formatDate(r.createdAt)}` : "";
    item.appendChild(metaRow);

    return item;
  }

  function approveReview(id) {
    const ok = dbUpdateOne(id, {
      status: "approved",
      approvedAt: nowISO()
    });
    if (!ok) return;
    render();
  }

  function rejectReview(id) {
    const ok = dbUpdateOne(id, {
      status: "rejected",
      rejectedAt: nowISO()
    });
    if (!ok) return;
    render();
  }

  function openInfo({ title, sub, body }) {
    infoTitle.textContent = title || "Bilgi";
    infoSub.textContent = sub || "";
    infoBody.textContent = body || "";
    infoBackdrop.style.display = "flex";
    infoBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeInfo() {
    infoBackdrop.style.display = "none";
    infoBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openReplyModal(review) {
    replyTargetId = review.id;
    replySub.textContent = `${maskName(review.name)} • ${review.createdAt ? formatDate(review.createdAt) : ""}`;
    replyQuote.textContent = review.comment || "";
    replyText.value = "";
    replyBackdrop.style.display = "flex";
    replyBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => replyText.focus(), 50);
  }

  function closeReplyModal() {
    replyBackdrop.style.display = "none";
    replyBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    replyTargetId = null;
  }

  function sendReply() {
    const text = (replyText.value || "").trim();
    if (!text) {
      openInfo({ title: "Eksik Bilgi", sub: "Yanıt", body: "Yanıt boş olamaz." });
      return;
    }

    const ok = dbUpdateOne(replyTargetId, {
      replyText: text,
      replyBy: "ROXY STORE",
      replyAt: nowISO(),
      status: "approved",
      approvedAt: nowISO()
    });

    if (!ok) {
      closeReplyModal();
      return;
    }

    closeReplyModal();
    setActiveTab("approved");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // Events
  tabs.forEach(t => t.addEventListener("click", () => setActiveTab(t.dataset.tab)));

  backBtn.addEventListener("click", () => {
    window.location.href = "admin.html";
  });

  replyClose.addEventListener("click", closeReplyModal);
  replyCancel.addEventListener("click", closeReplyModal);
  replyBackdrop.addEventListener("click", (e) => { if (e.target === replyBackdrop) closeReplyModal(); });
  replySend.addEventListener("click", sendReply);

  infoClose.addEventListener("click", closeInfo);
  infoOk.addEventListener("click", closeInfo);
  infoBackdrop.addEventListener("click", (e) => { if (e.target === infoBackdrop) closeInfo(); });

  // Init
  countPills(dbGetAll());
  setActiveTab("approved");
})();