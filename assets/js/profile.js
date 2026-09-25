const escapeProfile = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const profileHistory = document.querySelector('.profile-history');
const profileHoldNotice = document.createElement('div');
profileHoldNotice.className = 'hold-notice profile-hold-notice';
profileHoldNotice.setAttribute('role', 'status');
profileHoldNotice.hidden = true;
profileHistory.insertAdjacentElement('beforebegin', profileHoldNotice);
let profileOrders = [];
let profileIsAdmin = false;

function updateProfileHoldNotice() {
  const summary = window.eduOrderHolds.notice(profileOrders, profileIsAdmin ? 'admin' : 'student');
  profileHoldNotice.hidden = !summary.text;
  if (profileHoldNotice.textContent !== summary.text) profileHoldNotice.textContent = summary.text;
  profileHoldNotice.classList.toggle('is-urgent', summary.urgent);
}

async function renderProfileOrders() {
  try {
    profileOrders = await window.eduBackend.getOrders();
    if (!profileOrders.length) {
      profileHistory.innerHTML = '<h2>Hoạt động gần đây</h2><div class="profile-empty"><span>▣</span><div><strong>Chưa có đơn học liệu</strong><p>Giáo trình bạn mua hoặc thuê sẽ xuất hiện ở đây.</p></div><a class="button primary" href="catalog.html">Khám phá giáo trình →</a></div>';
    } else {
      profileHistory.innerHTML = `<h2>${profileIsAdmin ? 'Yêu cầu đặt sách' : 'Đơn học liệu của bạn'}</h2><div class="profile-order-list">${profileOrders.map((order) => `
        <article class="profile-order" data-order-hold="${escapeProfile(order.id)}"><div><strong>${new Date(order.created_at).toLocaleDateString('vi-VN')} · <span data-hold-status>${escapeProfile(window.eduOrderHolds.statusLabel(order))}</span></strong><small>${escapeProfile(order.pickup)}</small>${window.eduOrderHolds.countdownHtml(order)}<p>${order.order_items.map((item) => `${escapeProfile(item.book_title)} (${item.mode === 'rent' ? 'thuê' : 'mua'} × ${item.quantity})`).join(' · ')}</p></div><strong>${new Intl.NumberFormat('vi-VN').format(order.total)}đ</strong></article>`).join('')}</div>`;
    }
    window.eduOrderHolds.updateCountdowns(profileHistory);
    updateProfileHoldNotice();
  } catch (error) {
    profileHistory.innerHTML = `<h2>Hoạt động gần đây</h2><div class="profile-empty"><span>!</span><div><strong>Không tải được đơn học liệu</strong><p>${escapeProfile(error.message)}</p></div></div>`;
  }
}

async function renderAccount() {
  await window.eduAuth.ready;
  const session = window.eduAuth.getSession();
  if (!session) { window.location.replace('login.html'); return; }

  profileIsAdmin = ['admin', 'subadmin'].includes(session.role);
  document.querySelector('#profileInitials').textContent = profileIsAdmin ? (session.role === 'admin' ? 'AD' : 'SA') : session.name.split(/\s+/).slice(-2).map((word) => word[0]).join('').toUpperCase();
  document.querySelector('#profileName').textContent = session.name;
  document.querySelector('#profileSubtitle').textContent = session.subtitle;
  document.querySelector('#profileEmail').textContent = session.email;
  document.querySelector('#profileRole').textContent = session.role === 'admin' ? 'Admin chính EduBook' : session.role === 'subadmin' ? 'SubAdmin EduBook' : 'Sinh viên IUH';
  document.querySelector('#profileRoleDetail').textContent = session.role === 'admin' ? 'Admin chính' : session.role === 'subadmin' ? 'SubAdmin' : 'Sinh viên';
  document.querySelector('#profileId').textContent = session.studentId || 'Chưa cập nhật';
  document.querySelector('#profileFaculty').textContent = session.faculty || 'Chưa cập nhật';
  document.querySelector('#profilePhone').textContent = session.phone || 'Chưa cập nhật';
  document.querySelector('#profileBirthday').textContent = session.birthday || 'Chưa cập nhật';
  document.querySelector('#profileAddress').textContent = session.address || 'Chưa cập nhật';

  await renderProfileOrders();
  window.setInterval(() => {
    window.eduOrderHolds.updateCountdowns(profileHistory);
    updateProfileHoldNotice();
  }, 1000);
  window.setInterval(() => { if (!document.hidden) renderProfileOrders(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderProfileOrders(); });
}

renderAccount();
