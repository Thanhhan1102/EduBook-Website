(() => {
  const sessionKey = 'iuh-edubook-session';
  const usersKey = 'iuh-edubook-users';
  const demoAccounts = {
    'user@iuh.edu.vn': { password: '123456', role: 'user', name: 'Nguyễn Lan Anh', subtitle: 'K18 · CNTT', studentId: '21123451', faculty: 'Công nghệ thông tin', phone: '0901 234 567', birthday: '15/08/2003', address: 'Gò Vấp, TP. Hồ Chí Minh' },
    'admin@iuh.edu.vn': { password: 'admin123', role: 'admin', name: 'Quản trị EduBook', subtitle: 'Thư viện IUH', staffId: 'IUH-ADMIN-01', faculty: 'Thư viện IUH', phone: '(028) 38940 390', birthday: '—', address: '12 Nguyễn Văn Bảo, Gò Vấp' }
  };

  const getRegisteredUsers = () => {
    try { return JSON.parse(localStorage.getItem(usersKey)) || {}; } catch { return {}; }
  };
  const getAccounts = () => ({ ...demoAccounts, ...getRegisteredUsers() });

  const getSession = () => {
    try { return JSON.parse(localStorage.getItem(sessionKey)); } catch { return null; }
  };
  const signIn = (email, password) => {
    const account = getAccounts()[email.trim().toLowerCase()];
    if (!account || account.password !== password) return { ok: false, message: 'Email hoặc mật khẩu chưa đúng.' };
    const session = { email: email.trim().toLowerCase(), ...account };
    delete session.password;
    localStorage.setItem(sessionKey, JSON.stringify(session));
    return { ok: true, session };
  };
  const register = ({ name, email, password, studentId, faculty }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (getAccounts()[normalizedEmail]) return { ok: false, message: 'Email này đã được sử dụng.' };
    const users = getRegisteredUsers();
    users[normalizedEmail] = { password, role: 'user', name: name.trim(), subtitle: `${studentId.trim()} · ${faculty}`, studentId: studentId.trim(), faculty, phone: 'Chưa cập nhật', birthday: 'Chưa cập nhật', address: 'Chưa cập nhật' };
    localStorage.setItem(usersKey, JSON.stringify(users));
    return signIn(normalizedEmail, password);
  };
  const signOut = () => localStorage.removeItem(sessionKey);
  const accountDestination = (session) => session?.role === 'admin' ? 'admin.html' : session ? 'catalog.html' : 'login.html';

  const renderProfile = () => {
    const session = getSession();
    document.querySelectorAll('.profile').forEach((profile) => {
      const name = session?.name || 'Đăng nhập';
      const subtitle = session?.subtitle || 'Tài khoản IUH';
      const initials = session?.role === 'admin' ? 'AD' : session ? 'LA' : '↗';
      profile.setAttribute('aria-label', session ? `Mở tài khoản ${name}` : 'Đăng nhập EduBook');
      profile.setAttribute('aria-expanded', 'false');
      profile.innerHTML = `<span class="avatar">${initials}</span><span class="profile-copy"><strong>${name}</strong><small>${subtitle}</small></span>`;
      if (!session) {
        profile.addEventListener('click', () => { window.location.href = 'login.html'; });
        return;
      }

      const menu = document.createElement('div');
      menu.className = 'account-menu';
      menu.hidden = true;
      menu.innerHTML = `<a href="profile.html"><span>◉</span><span><strong>Hồ sơ cá nhân</strong><small>${session.email}</small></span></a><button type="button" data-account-logout><span>↪</span><span>Đăng xuất</span></button>`;
      profile.insertAdjacentElement('afterend', menu);

      const closeMenu = () => {
        profile.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        window.setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 180);
      };
      const openMenu = () => {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        profile.setAttribute('aria-expanded', 'true');
      };
      profile.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.contains('is-open') ? closeMenu() : openMenu();
      });
      menu.addEventListener('click', (event) => {
        const logout = event.target.closest('[data-account-logout]');
        if (!logout) return;
        signOut();
        window.location.href = 'login.html';
      });
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav-actions')) closeMenu();
      });
    });
  };

  const requireAdmin = () => {
    const session = getSession();
    if (session?.role === 'admin') return session;
    window.location.replace('login.html?next=admin');
    return null;
  };

  window.eduAuth = { getSession, signIn, signOut, register, requireAdmin, accountDestination };
  document.addEventListener('DOMContentLoaded', renderProfile);
})();
