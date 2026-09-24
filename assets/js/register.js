const registerForm = document.querySelector('#registerForm');
const registerMessage = document.querySelector('#registerMessage');

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(registerForm));
  if (values.password !== values.confirmPassword) {
    registerMessage.textContent = 'Xác nhận mật khẩu chưa khớp.';
    registerMessage.hidden = false;
    return;
  }
  if (!/^[^@\s]+@iuh\.edu\.vn$/i.test(values.email.trim())) {
    registerMessage.textContent = 'Vui lòng dùng email IUH (@iuh.edu.vn).';
    registerMessage.hidden = false;
    return;
  }
  const submit = registerForm.querySelector('[type="submit"]');
  submit.disabled = true;
  const result = await window.eduAuth.register(values);
  submit.disabled = false;
  if (!result.ok) {
    registerMessage.textContent = result.message;
    registerMessage.hidden = false;
    return;
  }
  if (result.pendingEmail) {
    registerMessage.textContent = 'Tài khoản đã được tạo. Hãy mở email để xác nhận, sau đó đăng nhập.';
    registerMessage.hidden = false;
    registerMessage.classList.add('success');
    registerForm.reset();
    return;
  }
  window.location.href = 'catalog.html';
});
