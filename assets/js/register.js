const registerForm = document.querySelector('#registerForm');
const registerMessage = document.querySelector('#registerMessage');

registerForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(registerForm));
  if (values.password !== values.confirmPassword) {
    registerMessage.textContent = 'Xác nhận mật khẩu chưa khớp.';
    registerMessage.hidden = false;
    return;
  }
  const result = window.eduAuth.register(values);
  if (!result.ok) {
    registerMessage.textContent = result.message;
    registerMessage.hidden = false;
    return;
  }
  window.location.href = 'catalog.html';
});
