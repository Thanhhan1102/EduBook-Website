(() => {
  let currentSession = null;

  const fromProfile = (user, profile) => ({
    id: user.id,
    email: user.email,
    role: profile.role,
    name: profile.full_name,
    subtitle: profile.role === 'admin' ? 'Admin chính' : profile.role === 'subadmin' ? 'SubAdmin EduBook' : profile.student_id,
    studentId: profile.student_id,
    faculty: profile.faculty,
    phone: profile.phone || '',
    birthday: profile.birthday || '',
    address: profile.address || '',
    active: profile.active !== false
  });

  const loadSession = async (user) => {
    if (!user) { currentSession = null; return null; }
    const db = await window.eduBackend.requireClient();
    if (!user.email_confirmed_at) {
      await db.auth.signOut();
      currentSession = null;
      throw new Error('Email chưa được xác nhận. Hãy mở link trong email hoặc gửi lại email xác nhận.');
    }
    const { data: profile, error } = await db.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    currentSession = fromProfile(user, profile);
    if (!currentSession.active) {
      await db.auth.signOut();
      currentSession = null;
      throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ admin EduBook.');
    }
    return currentSession;
  };

  const ready = (async () => {
    try {
      const db = await window.eduBackend.requireClient();
      const { data, error } = await db.auth.getUser();
      if (error) throw error;
      await loadSession(data.user);
    } catch {
      currentSession = null;
    }
    return currentSession;
  })();

  const signIn = async (email, password) => {
    try {
      const db = await window.eduBackend.requireClient();
      const { data, error } = await db.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      return { ok: true, session: await loadSession(data.user) };
    } catch (error) {
      const unconfirmed = error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message || '');
      return { ok: false, message: unconfirmed
        ? 'Email chưa được xác nhận. Hãy mở link trong email hoặc dùng “Chưa nhận được email xác nhận?” bên dưới.'
        : error.message || 'Không thể đăng nhập. Vui lòng thử lại.' };
    }
  };

  const register = async ({ name, email, password, studentId, faculty }) => {
    try {
      const db = await window.eduBackend.requireClient();
      const { data, error } = await db.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: {
          emailRedirectTo: window.eduBackend.authRedirectUrl || `${window.location.origin}/login.html`,
          data: { full_name: name.trim(), student_id: studentId.trim(), faculty }
        }
      });
      if (error) throw error;
      if (!data.session || !data.user?.email_confirmed_at) {
        if (data.session) await db.auth.signOut();
        return { ok: true, pendingEmail: true };
      }
      return { ok: true, session: await loadSession(data.user) };
    } catch (error) {
      return { ok: false, message: error.message || 'Không thể tạo tài khoản. Vui lòng thử lại.' };
    }
  };

  const resendConfirmation = async (email) => {
    try {
      const db = await window.eduBackend.requireClient();
      const { error } = await db.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: window.eduBackend.authRedirectUrl || `${window.location.origin}/login.html` }
      });
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || 'Không thể gửi lại email xác nhận.' };
    }
  };

  const signOut = async () => {
    try {
      const db = await window.eduBackend.requireClient();
      await db.auth.signOut();
    } finally {
      currentSession = null;
    }
  };
  const getSession = () => currentSession;
  const accountDestination = (session) => ['admin', 'subadmin'].includes(session?.role) ? 'admin.html' : session ? 'catalog.html' : 'login.html';
  const requireAdmin = async () => {
    await ready;
    if (['admin', 'subadmin'].includes(currentSession?.role)) return currentSession;
    window.location.replace('login.html?next=admin');
    return null;
  };

  const renderProfile = async () => {
    await ready;
    document.querySelectorAll('.profile').forEach((profile) => {
      const session = getSession();
      const name = session?.name || 'Đăng nhập';
      const subtitle = session?.subtitle || 'Tài khoản EduBook';
      const initials = ['admin', 'subadmin'].includes(session?.role) ? (session.role === 'admin' ? 'AD' : 'SA') : session?.name
        ? session.name.split(/\s+/).slice(-2).map((word) => word[0]).join('').toUpperCase()
        : '↗';
      profile.setAttribute('aria-label', session ? `Mở tài khoản ${name}` : 'Đăng nhập EduBook');
      profile.setAttribute('aria-expanded', 'false');
      profile.innerHTML = '<span class="avatar"></span><span class="profile-copy"><strong></strong><small></small></span>';
      profile.querySelector('.avatar').textContent = initials;
      profile.querySelector('strong').textContent = name;
      profile.querySelector('small').textContent = subtitle;
      if (!session) {
        profile.addEventListener('click', () => { window.location.href = 'login.html'; });
        return;
      }

      const menu = document.createElement('div');
      menu.className = 'account-menu';
      menu.hidden = true;
      menu.innerHTML = '<a href="profile.html"><span>◉</span><span><strong>Hồ sơ cá nhân</strong><small></small></span></a><button type="button" data-account-logout><span>↪</span><span>Đăng xuất</span></button>';
      menu.querySelector('small').textContent = session.email;
      profile.insertAdjacentElement('afterend', menu);

      const closeMenu = () => {
        profile.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        window.setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 180);
      };
      profile.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = !menu.classList.contains('is-open');
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.toggle('is-open', open));
        profile.setAttribute('aria-expanded', String(open));
        if (!open) closeMenu();
      });
      menu.addEventListener('click', async (event) => {
        if (!event.target.closest('[data-account-logout]')) return;
        await signOut();
        window.location.href = 'login.html';
      });
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav-actions')) closeMenu();
      });
    });
  };

  window.eduAuth = { ready, getSession, signIn, signOut, register, resendConfirmation, requireAdmin, accountDestination };
  document.addEventListener('DOMContentLoaded', renderProfile);
})();
