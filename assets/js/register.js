const registerForm = document.querySelector('#registerForm');
const registerMessage = document.querySelector('#registerMessage');
const resendButton = document.createElement('button');
resendButton.type = 'button';
resendButton.className = 'text-button auth-resend-button';
resendButton.textContent = 'Gửi lại email xác nhận';
resendButton.hidden = true;
registerMessage?.insertAdjacentElement('afterend', resendButton);
let pendingEmail = '';

resendButton.addEventListener('click', async () => {
  if (!pendingEmail) return;
  resendButton.disabled = true;
  const result = await window.eduAuth.resendConfirmation(pendingEmail);
  resendButton.disabled = false;
  registerMessage.classList.toggle('success', result.ok);
  registerMessage.textContent = result.ok
    ? 'Đã gửi lại email xác nhận. Hãy mở link mới nhất và kiểm tra cả thư mục Spam.'
    : result.message;
  registerMessage.hidden = false;
});

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(registerForm));
  if (values.password !== values.confirmPassword) {
    registerMessage.classList.remove('success');
    registerMessage.textContent = 'Xác nhận mật khẩu chưa khớp.';
    registerMessage.hidden = false;
    return;
  }
  const submit = registerForm.querySelector('[type="submit"]');
  submit.disabled = true;
  const result = await window.eduAuth.register(values);
  submit.disabled = false;
  if (!result.ok) {
    registerMessage.classList.remove('success');
    registerMessage.textContent = result.message;
    registerMessage.hidden = false;
    return;
  }
  if (result.pendingEmail) {
    pendingEmail = values.email.trim().toLowerCase();
    sessionStorage.setItem('edubookPendingEmail', pendingEmail);
    registerMessage.textContent = 'Đã gửi email xác nhận. Hãy mở link mới nhất; nếu link hết hạn, dùng nút gửi lại bên dưới.';
    registerMessage.hidden = false;
    registerMessage.classList.add('success');
    resendButton.hidden = false;
    registerForm.reset();
    registerForm.elements.email.value = pendingEmail;
    return;
  }
  window.location.href = 'catalog.html';
});
