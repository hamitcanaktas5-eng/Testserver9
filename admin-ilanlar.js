(() => {
  // DB keys (site ile ortak okunacak)
  const ADS_KEY = "roxy_ads_db";
  const APIS_KEY = "roxy_apis_db";

  const $ = (id) => document.getElementById(id);

  const backBtn = $("backBtn");
  const countChip = $("countChip");
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const editList = $("editList");

  const formSms = $("formSms");
  const formSmm = $("formSmm");

  // SMS form elements
  const smsSegBtns = Array.from(formSms.querySelectorAll(".segBtn"));
  const smsPickWrap = $("smsPickWrap");
  const smsCreateWrap = $("smsCreateWrap");
  const smsApiPick = $("smsApiPick");
  const smsApiCreate = $("smsApiCreate");
  const smsTitle = $("smsTitle");
  const smsPrice = $("smsPrice");

  // SMM form elements
  const smmSegBtns = Array.from(formSmm.querySelectorAll(".segBtn"));
  const smmPickWrap = $("smmPickWrap");
  const smmCreateWrap = $("smmCreateWrap");
  const smmApiPick = $("smmApiPick");
  const smmApiCreate = $("smmApiCreate");
  const smmService = $("smmService");
  const smmBase1000 = $("smmBase1000");
  const smmMin = $("smmMin");
  const smmMax = $("smmMax");

  // Modal
  const modalBackdrop = $("modalBackdrop");
  const modalTitle = $("modalTitle");
  const modalSub = $("modalSub");
  const modalBody = $("modalBody");
  const modalClose = $("modalClose");
  const modalOk = $("modalOk");

  let activeTab = "sms"; // sms | smm
  let smsMode = "pick"; // pick | create
  let smmMode = "pick"; // pick | create

  // ------------------ storage ------------------
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const data = JSON.parse(raw);
      return data ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadAPIs() {
    const d = loadJSON(APIS_KEY, null);
    if (d && typeof d === "object") return d;
    // default APIs
    const defaults = {
      sms: ["WhatsApp", "Telegram"],
      smm: ["Instagram", "TikTok"]
    };
    saveJSON(APIS_KEY, defaults);
    return defaults;
  }

  function loadAds() {
    const arr = loadJSON(ADS_KEY, []);
    return Array.isArray(arr) ? arr : [];
  }

  function saveAds(arr) {
    saveJSON(ADS_KEY, arr);
  }

  // ------------------ modal ------------------
  function openModal({ title, sub, body }) {
    modalTitle.textContent = title || "Bilgi";
    modalSub.textContent = sub || "";
    modalBody.textContent = body || "";
    modalBackdrop.style.display = "flex";
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalBackdrop.style.display = "none";
    modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // ------------------ helpers ------------------
  function uid(prefix="id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function normalizeName(s) {
    return String(s || "").trim().replace(/\s+/g, " ");
  }

  function tl(n) {
    const v = Number(n);
    if (!Number.isFinite(v) || v < 0) return null;
    return Math.round(v);
  }

  function serviceLabel(key) {
    if (key === "followers") return "Takipçi";
    if (key === "likes") return "Beğeni";
    if (key === "views") return "İzlenme";
    return key;
  }

  // ------------------ UI sync ------------------
  function setTab(tab) {
    activeTab = tab;

    tabs.forEach(t => {
      const is = t.dataset.tab === tab;
      t.classList.toggle("active", is);
      t.setAttribute("aria-selected", is ? "true" : "false");
    });

    // show correct form
    formSms.hidden = tab !== "sms";
    formSmm.hidden = tab !== "smm";

    // refresh edit list
    renderEditList();
    refreshCounts();
  }

  function refreshCounts() {
    const ads = loadAds();
    const smsCount = ads.filter(a => a.kind === "sms").length;
    const smmCount = ads.filter(a => a.kind === "smm").length;

    $("pillSms").textContent = String(smsCount);
    $("pillSmm").textContent = String(smmCount);
    countChip.textContent = `${ads.length} İlan`;
  }

  function refreshApiSelects() {
    const apis = loadAPIs();

    // SMS apis
    smsApiPick.innerHTML = "";
    apis.sms.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      smsApiPick.appendChild(opt);
    });

    // SMM apis
    smmApiPick.innerHTML = "";
    apis.smm.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      smmApiPick.appendChild(opt);
    });
  }

  function setSmsMode(mode) {
    smsMode = mode;
    smsSegBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    smsPickWrap.hidden = mode !== "pick";
    smsCreateWrap.hidden = mode !== "create";
    if (mode === "create") smsApiCreate.focus();
  }

  function setSmmMode(mode) {
    smmMode = mode;
    smmSegBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    smmPickWrap.hidden = mode !== "pick";
    smmCreateWrap.hidden = mode !== "create";
    if (mode === "create") smmApiCreate.focus();
  }

  // ------------------ edit list ------------------
  function renderEditList() {
    const ads = loadAds().filter(a => a.kind === activeTab);
    editList.innerHTML = "";

    if (ads.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Bu kategoride ilan bulunmuyor.";
      editList.appendChild(empty);
      return;
    }

    // newest first
    ads.sort((a,b) => String(b.createdAt||"").localeCompare(String(a.createdAt||"")));

    ads.forEach(ad => {
      editList.appendChild(renderItem(ad));
    });
  }

  function renderItem(ad) {
    const item = document.createElement("div");
    item.className = "item";

    const top = document.createElement("div");
    top.className = "itemTop";

    const title = document.createElement("div");
    title.className = "itemTitle";
    title.textContent = `${ad.apiName} • ${ad.kind === "sms" ? "Sanal Numara" : "Sosyal Medya"}${ad.kind === "smm" ? " • " + serviceLabel(ad.service) : ""}`;

    const badge = document.createElement("span");
    badge.className = `badge ${ad.active ? "ok" : "bad"}`;
    badge.textContent = ad.active ? "Aktif" : "Pasif";

    top.appendChild(title);
    top.appendChild(badge);

    const grid = document.createElement("div");
    grid.className = "itemGrid";

    // Editable fields
    const f1 = document.createElement("div");
    f1.className = "field";
    const l1 = document.createElement("label");
    l1.className = "label";
    l1.textContent = "İlan Adı";
    const in1 = document.createElement("input");
    in1.className = "input";
    in1.type = "text";
    in1.maxLength = 80;
    in1.value = ad.title || "";
    f1.appendChild(l1);
    f1.appendChild(in1);

    grid.appendChild(f1);

    if (ad.kind === "sms") {
      const f2 = document.createElement("div");
      f2.className = "field";
      const l2 = document.createElement("label");
      l2.className = "label";
      l2.textContent = "Fiyat (₺)";
      const in2 = document.createElement("input");
      in2.className = "input";
      in2.type = "number";
      in2.min = "0";
      in2.step = "1";
      in2.value = String(ad.priceTL ?? "");
      f2.appendChild(l2);
      f2.appendChild(in2);
      grid.appendChild(f2);

      item.appendChild(top);
      item.appendChild(grid);

      const actions = document.createElement("div");
      actions.className = "itemActions";

      const toggle = document.createElement("button");
      toggle.className = "btn ghost small";
      toggle.type = "button";
      toggle.textContent = ad.active ? "Pasif Yap" : "Aktif Yap";
      toggle.addEventListener("click", () => {
        updateAd(ad.id, { active: !ad.active });
      });

      const save = document.createElement("button");
      save.className = "btn btnOk small";
      save.type = "button";
      save.textContent = "Kaydet";
      save.addEventListener("click", () => {
        const newTitle = normalizeName(in1.value);
        const newPrice = tl(in2.value);
        if (!newTitle) return openModal({ title:"Eksik Bilgi", sub:"İlan", body:"İlan adı boş olamaz." });
        if (newPrice === null) return openModal({ title:"Eksik Bilgi", sub:"Fiyat", body:"Geçerli bir fiyat girin." });
        updateAd(ad.id, { title: newTitle, priceTL: newPrice, updatedAt: nowISO() });
      });

      const del = document.createElement("button");
      del.className = "btn btnDanger small";
      del.type = "button";
      del.textContent = "Sil";
      del.addEventListener("click", () => {
        deleteAd(ad.id);
      });

      actions.appendChild(toggle);
      actions.appendChild(save);
      actions.appendChild(del);

      item.appendChild(actions);
      return item;
    }

    // smm fields
    const f2 = document.createElement("div");
    f2.className = "field";
    const l2 = document.createElement("label");
    l2.className = "label";
    l2.textContent = "1000 Adet Fiyatı (₺)";
    const in2 = document.createElement("input");
    in2.className = "input";
    in2.type = "number";
    in2.min = "0";
    in2.step = "1";
    in2.value = String(ad.base1000PriceTL ?? "");
    f2.appendChild(l2);
    f2.appendChild(in2);

    const f3 = document.createElement("div");
    f3.className = "field";
    const l3 = document.createElement("label");
    l3.className = "label";
    l3.textContent = "Minimum";
    const in3 = document.createElement("input");
    in3.className = "input";
    in3.type = "number";
    in3.min = "1";
    in3.step = "1";
    in3.value = String(ad.minQty ?? "");
    f3.appendChild(l3);
    f3.appendChild(in3);

    const f4 = document.createElement("div");
    f4.className = "field";
    const l4 = document.createElement("label");
    l4.className = "label";
    l4.textContent = "Maksimum";
    const in4 = document.createElement("input");
    in4.className = "input";
    in4.type = "number";
    in4.min = "1";
    in4.step = "1";
    in4.value = String(ad.maxQty ?? "");
    f4.appendChild(l4);
    f4.appendChild(in4);

    grid.appendChild(f2);
    grid.appendChild(f3);
    grid.appendChild(f4);

    item.appendChild(top);
    item.appendChild(grid);

    const actions = document.createElement("div");
    actions.className = "itemActions";

    const toggle = document.createElement("button");
    toggle.className = "btn ghost small";
    toggle.type = "button";
    toggle.textContent = ad.active ? "Pasif Yap" : "Aktif Yap";
    toggle.addEventListener("click", () => updateAd(ad.id, { active: !ad.active }));

    const save = document.createElement("button");
    save.className = "btn btnOk small";
    save.type = "button";
    save.textContent = "Kaydet";
    save.addEventListener("click", () => {
      const newTitle = normalizeName(in1.value);
      const base = tl(in2.value);
      const mn = parseInt(in3.value, 10);
      const mx = parseInt(in4.value, 10);

      if (!newTitle) return openModal({ title:"Eksik Bilgi", sub:"İlan", body:"İlan adı boş olamaz." });
      if (base === null) return openModal({ title:"Eksik Bilgi", sub:"Fiyat", body:"1000 adet fiyatı geçersiz." });
      if (!Number.isFinite(mn) || mn < 1) return openModal({ title:"Eksik Bilgi", sub:"Minimum", body:"Minimum miktar geçersiz." });
      if (!Number.isFinite(mx) || mx < mn) return openModal({ title:"Eksik Bilgi", sub:"Maksimum", body:"Maksimum, minimumdan küçük olamaz." });

      updateAd(ad.id, {
        title: newTitle,
        base1000PriceTL: base,
        minQty: mn,
        maxQty: mx,
        updatedAt: nowISO()
      });
    });

    const del = document.createElement("button");
    del.className = "btn btnDanger small";
    del.type = "button";
    del.textContent = "Sil";
    del.addEventListener("click", () => deleteAd(ad.id));

    actions.appendChild(toggle);
    actions.appendChild(save);
    actions.appendChild(del);

    item.appendChild(actions);
    return item;
  }

  function updateAd(id, patch) {
    const ads = loadAds();
    const idx = ads.findIndex(a => a.id === id);
    if (idx === -1) return;
    ads[idx] = { ...ads[idx], ...patch };
    saveAds(ads);
    renderEditList();
    refreshCounts();
  }

  function deleteAd(id) {
    const ads = loadAds().filter(a => a.id !== id);
    saveAds(ads);
    renderEditList();
    refreshCounts();
  }

  // ------------------ API create ------------------
  function ensureApi(kind, nameRaw) {
    const name = normalizeName(nameRaw);
    if (!name) return { ok:false, msg:"API adı boş olamaz." };

    const apis = loadAPIs();
    const list = apis[kind] || [];
    const exists = list.some(x => x.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"));
    if (!exists) {
      list.push(name);
      apis[kind] = list;
      saveJSON(APIS_KEY, apis);
    }
    refreshApiSelects();
    return { ok:true, name };
  }

  // ------------------ forms submit ------------------
  function getSmsApiName() {
    if (smsMode === "pick") return smsApiPick.value;
    const res = ensureApi("sms", smsApiCreate.value);
    if (!res.ok) { openModal({ title:"Eksik Bilgi", sub:"API", body:res.msg }); return null; }
    return res.name;
  }

  function getSmmApiName() {
    if (smmMode === "pick") return smmApiPick.value;
    const res = ensureApi("smm", smmApiCreate.value);
    if (!res.ok) { openModal({ title:"Eksik Bilgi", sub:"API", body:res.msg }); return null; }
    return res.name;
  }

  formSms.addEventListener("submit", (e) => {
    e.preventDefault();

    const apiName = getSmsApiName();
    if (!apiName) return;

    const title = normalizeName(smsTitle.value);
    const price = tl(smsPrice.value);

    if (!title) return openModal({ title:"Eksik Bilgi", sub:"İlan", body:"İlan adı boş olamaz." });
    if (price === null) return openModal({ title:"Eksik Bilgi", sub:"Fiyat", body:"Geçerli bir fiyat girin." });

    const ads = loadAds();
    ads.push({
      id: uid("sms"),
      kind: "sms",
      apiName,
      title,
      priceTL: price,
      active: true,
      createdAt: nowISO()
    });
    saveAds(ads);

    // reset
    smsTitle.value = "";
    smsPrice.value = "";
    smsApiCreate.value = "";
    setSmsMode("pick");

    renderEditList();
    refreshCounts();
    openModal({ title:"Başarılı", sub:"İlan", body:"Sanal numara ilanı kaydedildi." });
  });

  formSmm.addEventListener("submit", (e) => {
    e.preventDefault();

    const apiName = getSmmApiName();
    if (!apiName) return;

    const service = smmService.value;
    const base = tl(smmBase1000.value);
    const mn = parseInt(smmMin.value, 10);
    const mx = parseInt(smmMax.value, 10);

    // başlık otomatik: API + servis
    const title = normalizeName(`${apiName} ${serviceLabel(service)}`);

    if (base === null) return openModal({ title:"Eksik Bilgi", sub:"Fiyat", body:"1000 adet fiyatı geçersiz." });
    if (!Number.isFinite(mn) || mn < 1) return openModal({ title:"Eksik Bilgi", sub:"Minimum", body:"Minimum miktar geçersiz." });
    if (!Number.isFinite(mx) || mx < mn) return openModal({ title:"Eksik Bilgi", sub:"Maksimum", body:"Maksimum, minimumdan küçük olamaz." });

    const ads = loadAds();
    ads.push({
      id: uid("smm"),
      kind: "smm",
      apiName,
      service,                 // followers | likes | views
      title,
      base1000PriceTL: base,   // 1000 adet fiyatı
      minQty: mn,
      maxQty: mx,
      active: true,
      createdAt: nowISO()
    });
    saveAds(ads);

    // reset
    smmBase1000.value = "";
    smmMin.value = "";
    smmMax.value = "";
    smmApiCreate.value = "";
    setSmmMode("pick");

    renderEditList();
    refreshCounts();
    openModal({ title:"Başarılı", sub:"İlan", body:"Sosyal medya ilanı kaydedildi." });
  });

  // ------------------ events ------------------
  tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));

  smsSegBtns.forEach(b => b.addEventListener("click", () => setSmsMode(b.dataset.mode)));
  smmSegBtns.forEach(b => b.addEventListener("click", () => setSmmMode(b.dataset.mode)));

  backBtn.addEventListener("click", () => {
    window.location.href = "admin.html";
  });

  modalClose.addEventListener("click", closeModal);
  modalOk.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) closeModal(); });

  // ------------------ init ------------------
  refreshApiSelects();
  refreshCounts();
  setSmsMode("pick");
  setSmmMode("pick");
  setTab("sms");
})();