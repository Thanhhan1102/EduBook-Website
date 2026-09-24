const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const result = window.eduAuth.signIn(formData.get('email'), formData.get('password'));
  if (!result.ok) {
    loginMessage.textContent = result.message;
    loginMessage.hidden = false;
    return;
  }
  const next = new URLSearchParams(window.location.search).get('next');
  window.location.href = next === 'admin' || result.session.role === 'admin' ? 'admin.html' : 'catalog.html';
});

document.querySelectorAll('[data-demo-account]').forEach((button) => {
  button.addEventListener('click', () => {
    const [email, password] = button.dataset.demoAccount.split('|');
    loginForm.elements.email.value = email;
    loginForm.elements.password.value = password;
    loginMessage.hidden = true;
  });
});
