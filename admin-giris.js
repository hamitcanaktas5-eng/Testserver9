(() => {
  const $ = (id) => document.getElementById(id);

  // Şimdilik geçici doğrulama (backend gelince burası gerçek olacak)
  const AUTH = {
    username: "admin",
    password: "admin",
    otp: "222222"
  };

  const chipState = $("chipState");
  const dot1 = $("dot1");
  const dot2 = $("dot2");

  const screenLogin = $("screenLogin");
  const screenOtp = $("screenOtp");

  const loginForm = $("loginForm");
  const loginUser = $("loginUser");
  const loginPass = $("loginPass");
  const loginAlert = $("loginAlert");

  const otpForm = $("otpForm");
  const otpInputs = Array.from(document.querySelectorAll(".otpBox"));
  const otpAlert = $("otpAlert");
  const otpOk = $("otpOk");
  const backBtn = $("backBtn");
  const clearBtn = $("clearBtn");

  const show = (el) => el.hidden = false;
  const hide = (el) => el.hidden = true;

  function setStep(step){
    dot1.classList.toggle("active", step === 1);
    dot2.classList.toggle("active", step === 2);
    chipState.textContent = step === 1 ? "Güvenli Giriş" : "Doğrulama";
  }

  function goLogin(){
    setStep(1);
    show(screenLogin); hide(screenOtp);
    hide(loginAlert); hide(otpAlert); hide(otpOk);
    otpInputs.forEach(i => i.value = "");
  }

  function goOtp(){
    setStep(2);
    hide(screenLogin); show(screenOtp);
    hide(loginAlert); hide(otpAlert); hide(otpOk);
    otpInputs.forEach(i => i.value = "");
    otpInputs[0]?.focus();
  }

  function showAlert(el, msg){
    el.textContent = msg;
    el.hidden = false;
  }

  function otpValue(){
    return otpInputs.map(i => i.value).join("");
  }

  // OTP behavior
  otpInputs.forEach((inp, idx) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/\D/g, "").slice(0,1);
      if (inp.value && otpInputs[idx+1]) otpInputs[idx+1].focus();
    });

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !inp.value && otpInputs[idx-1]) otpInputs[idx-1].focus();
      if (e.key === "Enter") otpForm.requestSubmit();
      if (e.key === "ArrowLeft" && otpInputs[idx-1]) otpInputs[idx-1].focus();
      if (e.key === "ArrowRight" && otpInputs[idx+1]) otpInputs[idx+1].focus();
    });

    inp.addEventListener("paste", (e) => {
      e.preventDefault();
      const t = (e.clipboardData?.getData("text") || "").replace(/\D/g,"").slice(0,6);
      if (!t) return;
      for (let i=0;i<6;i++) otpInputs[i].value = t[i] || "";
      otpInputs[Math.min(t.length,6)-1]?.focus();
    });
  });

  // Login submit
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hide(loginAlert);

    const u = loginUser.value.trim();
    const p = loginPass.value;

    if (u !== AUTH.username || p !== AUTH.password) {
      showAlert(loginAlert, "Hatalı kullanıcı adı veya şifre.");
      return;
    }

    // Burada gerçek sürümde: backend'e login isteği atılır ve mail OTP tetiklenir.
    goOtp();
  });

  // OTP submit
  otpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hide(otpAlert); hide(otpOk);

    const code = otpValue();
    if (code.length !== 6) {
      showAlert(otpAlert, "Lütfen 6 haneli kodu girin.");
      return;
    }

    if (code !== AUTH.otp) {
      showAlert(otpAlert, "Kod hatalı.");
      return;
    }

    show(otpOk);

    // Gerçek sürümde burada: session açılır + admin.html'e yönlendirme yapılır.
    // sessionStorage.setItem("roxy_admin_ok","1");
    // window.location.replace("admin.html");

    setTimeout(() => {
      goLogin();
    }, 900);
  });

  backBtn.addEventListener("click", goLogin);

  clearBtn.addEventListener("click", () => {
    hide(otpAlert); hide(otpOk);
    otpInputs.forEach(i => i.value = "");
    otpInputs[0]?.focus();
  });

  goLogin();
})();