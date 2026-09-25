const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');
const authCallback = window.eduAuthCallback || {};

function setupConfirmationFlow() {
  const panel = document.createElement('section');
  panel.className = 'auth-confirmation';
  panel.setAttribute('role', 'status');
  panel.hidden = !authCallback.isEmailCallback;
  panel.innerHTML = `<strong id="confirmationTitle">Đang kiểm tra email...</strong>
    <p id="confirmationText">Vui lòng chờ trong giây lát.</p>
    <a id="confirmationContinue" class="button primary" href="catalog.html" hidden>Tiếp tục →</a>
    <form id="resendConfirmationForm" hidden>
      <label>Email đã đăng ký<input name="email" type="email" required autocomplete="email" placeholder="you@example.com" /></label>
      <button class="button secondary" type="submit">Gửi lại email xác nhận</button>
    </form>`;
  loginForm.insertAdjacentElement('beforebegin', panel);
  const title = panel.querySelector('#confirmationTitle');
  const description = panel.querySelector('#confirmationText');
  const resendForm = panel.querySelector('#resendConfirmationForm');
  const continueLink = panel.querySelector('#confirmationContinue');
  const savedEmail = sessionStorage.getItem('edubookPendingEmail');
  if (savedEmail) resendForm.elements.email.value = savedEmail;
  const resendToggle = document.createElement('button');
  resendToggle.type = 'button';
  resendToggle.className = 'text-button auth-resend-button';
  resendToggle.textContent = 'Chưa nhận được email xác nhận?';
  loginForm.insertAdjacentElement('afterend', resendToggle);
  resendToggle.addEventListener('click', () => {
    panel.hidden = false;
    title.textContent = 'Gửi lại email xác nhận';
    description.textContent = 'Nhập email đã đăng ký để nhận link mới.';
    continueLink.hidden = true;
    resendForm.hidden = false;
    resendForm.elements.email.focus();
  });

  resendForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = resendForm.querySelector('button');
    button.disabled = true;
    const result = await window.eduAuth.resendConfirmation(resendForm.elements.email.value);
    button.disabled = false;
    title.textContent = result.ok ? 'Đã gửi lại email' : 'Chưa gửi được email';
    description.textContent = result.ok
      ? 'Hãy mở link mới nhất trong hộp thư hoặc thư mục Spam.'
      : result.message;
    if (result.ok) resendForm.hidden = true;
  });

  if (authCallback.isEmailCallback) (async () => {
    const { errorCode, errorDescription } = authCallback;
    if (authCallback.error || errorCode) {
      window.history.replaceState(null, '', window.location.pathname);
      title.textContent = 'Xác nhận email chưa thành công';
      description.textContent = errorCode === 'otp_expired'
        ? 'Link xác nhận đã hết hạn hoặc không còn hợp lệ. Hãy thử đăng nhập nếu bạn đã xác nhận trước đó, hoặc gửi lại email và dùng link mới nhất.'
        : errorDescription || 'Không thể xác nhận email. Hãy gửi lại link và thử lần nữa.';
      resendForm.hidden = false;
      return;
    }
    await window.eduAuth.ready;
    window.history.replaceState(null, '', window.location.pathname);
    const session = window.eduAuth.getSession();
    if (!session) {
      title.textContent = 'Chưa xác minh được phiên đăng nhập';
      description.textContent = 'Nếu email đã được xác nhận, hãy đăng nhập bên dưới. Nếu chưa, bạn có thể gửi lại link.';
      resendForm.hidden = false;
      return;
    }
    sessionStorage.removeItem('edubookPendingEmail');
    title.textContent = 'Email đã được xác nhận';
    description.textContent = 'Tài khoản của bạn đã sẵn sàng.';
    continueLink.href = window.eduAuth.accountDestination(session);
    continueLink.hidden = false;
    loginForm.hidden = true;
    resendToggle.hidden = true;
  })();
}
setupConfirmationFlow();

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const submit = loginForm.querySelector('[type="submit"]');
  submit.disabled = true;
  const result = await window.eduAuth.signIn(formData.get('email'), formData.get('password'));
  submit.disabled = false;
  if (!result.ok) {
    loginMessage.textContent = result.message;
    loginMessage.hidden = false;
    return;
  }
  window.location.href = ['admin', 'subadmin'].includes(result.session.role) ? 'admin.html' : 'catalog.html';
});
