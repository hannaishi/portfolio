(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const status = form.querySelector(".contact-form-message");
  const note = form.querySelector(".contact-form-note");
  const button = form.querySelector('button[type="submit"]');
  const inputs = [form.elements.name, form.elements.email, form.elements.subject, form.elements.message];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const preparing = "現在、送信機能は準備中です。お問い合わせはまだ送信されていません。";
  const failure = "送信できませんでした。お時間をおいて、もう一度お試しください。";
  let busy = false;
  let token = null;

  const setStatus = (text, type = "") => {
    status.textContent = text;
    status.classList.toggle("contact-form-message--success", type === "success");
    status.classList.toggle("contact-form-message--error", type === "error");
  };

  const messageFor = (input) => {
    const value = input.value.trim();
    if (input.name === "name" && value === "") return "お名前を入力してください。";
    if (input.name === "email" && value === "") return "メールアドレスを入力してください。";
    if (input.name === "message" && value === "") return "お問い合わせ内容を入力してください。";
    if (input.maxLength > 0 && input.value.length > input.maxLength) return `${input.maxLength}文字以内で入力してください。`;
    if (input.name === "email" && (!emailPattern.test(value) || /[\r\n\x00]/.test(input.value))) return "正しいメールアドレスを入力してください。";
    return "";
  };

  const setError = (input, message) => {
    const field = input.closest(".contact-form-field");
    const error = field.querySelector(".contact-form-error");
    field.classList.toggle("is-error", Boolean(message));
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    error.textContent = message;
    error.hidden = !message;
  };

  const request = async (options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, {
        ...options,
        credentials: "same-origin",
        cache: "no-store",
        redirect: "error",
        headers: { Accept: "application/json", ...options.headers },
        signal: controller.signal,
      });
      // Static hosts may serve the PHP source or an HTML 404. Neither is success.
      if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("Unavailable");
      return { response, data: await response.json() };
    } finally {
      clearTimeout(timeout);
    }
  };

  const loadSettings = async () => {
    if (location.hostname === "github.io" || location.hostname.endsWith(".github.io")) {
      note.textContent = "GitHub Pagesではお問い合わせを送信できません。送信機能は準備中です。";
      return false;
    }
    try {
      const { response, data } = await request();
      if (!response.ok || data.ok !== true || data.enabled !== true || typeof data.token !== "string") return false;
      token = data.token;
      note.textContent = "必要事項をご入力のうえ、送信ボタンを押してください。";
      return true;
    } catch {
      return false;
    }
  };
  const settings = loadSettings();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    let firstInvalid = null;
    inputs.forEach((input) => {
      const message = messageFor(input);
      setError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      setStatus("");
      firstInvalid.focus();
      return;
    }

    busy = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    setStatus("送信の準備を確認しています。");
    try {
      if (!(await settings) || (!token && !(await loadSettings()))) {
        setStatus(preparing);
        return;
      }
      const values = Object.fromEntries(inputs.map((input) => [input.name, input.value]));
      const payload = { ...values, token, website: form.elements.website.value };
      setStatus("送信中です。そのままお待ちください。");
      const { response, data } = await request({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok && data.ok === true && data.code === "sent") {
        token = null;
        // Preserve any edits made while the request was in flight.
        if (inputs.every((input) => input.value === values[input.name])) form.reset();
        setStatus("お問い合わせを送信しました。お問い合わせいただき、ありがとうございます。", "success");
      } else if (data.enabled === false) {
        note.textContent = "送信機能は準備中です。お問い合わせはまだ送信されていません。";
        setStatus(preparing);
      } else {
        if (data.code === "csrf") token = null;
        if (data.code === "validation" && data.errors && typeof data.errors === "object") {
          inputs.forEach((input) => {
            // Server messages are fixed validation text, inserted as text only.
            if (typeof data.errors[input.name] === "string") {
              setError(input, data.errors[input.name]);
              if (!firstInvalid) firstInvalid = input;
            }
          });
          firstInvalid?.focus();
        }
        setStatus(failure, "error");
      }
    } catch {
      setStatus(failure, "error");
    } finally {
      busy = false;
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (!inputs.includes(input) || input.getAttribute("aria-invalid") !== "true") return;
    setError(input, messageFor(input));
  });
})();
