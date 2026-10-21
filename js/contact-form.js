(() => {
  const form = document.querySelector(".contact-form");
  if (!form) {
    return;
  }

  const status = form.querySelector(".contact-form-message");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const messageFor = (input) => {
    const value = input.value.trim();

    if (input.name === "name" && value === "") {
      return "お名前を入力してください。";
    }

    if (input.name === "email" && value === "") {
      return "メールアドレスを入力してください。";
    }

    if (input.name === "email" && !emailPattern.test(value)) {
      return "正しいメールアドレスを入力してください。";
    }

    if (input.name === "message" && value === "") {
      return "お問い合わせ内容を入力してください。";
    }

    return "";
  };

  const setError = (input, message) => {
    const field = input.closest(".contact-form-field");
    const error = field.querySelector(".contact-form-error");

    if (message) {
      field.classList.add("is-error");
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
      error.hidden = false;
      return;
    }

    field.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    error.hidden = true;
  };

  const checkedInputs = () => [form.elements.name, form.elements.email, form.elements.message];

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstInvalid = null;

    checkedInputs().forEach((input) => {
      const message = messageFor(input);
      setError(input, message);
      if (message && !firstInvalid) {
        firstInvalid = input;
      }
    });

    if (firstInvalid) {
      status.textContent = "";
      firstInvalid.focus();
      return;
    }

    // 入力は有効。送信処理は未実装。PHP接続時にこの案内を成功・失敗表示へ置き換える。
    status.textContent = "現在、送信機能は準備中です。お問い合わせはまだ送信されていません。";
  });

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) && !(input instanceof HTMLTextAreaElement)) {
      return;
    }

    if (input.getAttribute("aria-invalid") !== "true") {
      return;
    }

    setError(input, messageFor(input));
  });
})();
