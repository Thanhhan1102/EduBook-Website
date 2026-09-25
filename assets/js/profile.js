const escapeProfile = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const orderStatus = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', ready: 'Sẵn sàng nhận', completed: 'Hoàn tất', cancelled: 'Đã hủy' };

async function renderAccount() {
  await window.eduAuth.ready;
  const session = window.eduAuth.getSession();
  if (!session) { window.location.replace('login.html'); return; }

  const isAdmin = ['admin', 'subadmin'].includes(session.role);
  document.querySelector('#profileInitials').textContent = isAdmin ? (session.role === 'admin' ? 'AD' : 'SA') : session.name.split(/\s+/).slice(-2).map((word) => word[0]).join('').toUpperCase();
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

  const history = document.querySelector('.profile-history');
  try {
    const orders = await window.eduBackend.getOrders();
    if (!orders.length) return;
    history.innerHTML = `<h2>${isAdmin ? 'Yêu cầu đặt sách gần đây' : 'Đơn học liệu của bạn'}</h2><div class="profile-order-list">${orders.slice(0, 10).map((order) => `
      <article class="profile-order"><div><strong>${new Date(order.created_at).toLocaleDateString('vi-VN')} · ${escapeProfile(orderStatus[order.status] || order.status)}</strong><small>${escapeProfile(order.pickup)}</small><p>${order.order_items.map((item) => `${escapeProfile(item.book_title)} (${item.mode === 'rent' ? 'thuê' : 'mua'} × ${item.quantity})`).join(' · ')}</p></div><strong>${new Intl.NumberFormat('vi-VN').format(order.total)}đ</strong></article>`).join('')}</div>`;
  } catch (error) {
    history.querySelector('.profile-empty').innerHTML = `<span>!</span><div><strong>Không tải được đơn học liệu</strong><p>${escapeProfile(error.message)}</p></div>`;
  }
}

renderAccount();
