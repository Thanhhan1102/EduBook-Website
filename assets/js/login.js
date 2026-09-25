const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');

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
