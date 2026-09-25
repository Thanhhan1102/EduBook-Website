const adminState = { books: [], accounts: [], page: 1, pageSize: 20, role: null };
const adminList = document.querySelector('#adminBookList');
const adminCount = document.querySelector('#bookCount');
const adminForm = document.querySelector('#bookForm');
const adminMessage = document.querySelector('#adminMessage');
const orderList = document.querySelector('#adminOrderList');
const orderCount = document.querySelector('#adminOrderCount');
const money = (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const conditionText = (book) => ({ new: 'Mới 100%', over80: 'Độ mới trên 80%', over60: 'Độ mới trên 60%' }[book.condition] || 'Mới 100%');
const availabilityText = (book) => ({ buy: 'Chỉ bán', rent: 'Chỉ thuê', both: 'Bán và thuê' }[book.availability] || 'Bán và thuê');
const statusText = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', ready: 'Sẵn sàng nhận', completed: 'Hoàn tất', cancelled: 'Đã hủy' };

function showAdminMessage(message, isError = false) {
  const notice = document.querySelector('#adminNotice');
  notice.textContent = message;
  notice.hidden = false;
  notice.classList.toggle('is-error', isError);
  adminMessage.textContent = message;
  adminMessage.hidden = false;
  adminMessage.classList.toggle('success', !isError);
}

function selectTab(name) {
  if (adminState.role !== 'admin' && name === 'subadmins') return;
  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    const selected = button.dataset.adminTab === name;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('[data-admin-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.adminPanel !== name;
  });
  history.replaceState(null, '', `#${name}`);
}

function drawBooks() {
  const query = document.querySelector('#bookSearch').value.trim().toLocaleLowerCase('vi');
  const filtered = adminState.books.filter((book) =>
    [book.title, book.code, book.faculty, book.author].some((value) => String(value || '').toLocaleLowerCase('vi').includes(query))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / adminState.pageSize));
  adminState.page = Math.min(adminState.page, pages);
  const start = (adminState.page - 1) * adminState.pageSize;
  const visible = filtered.slice(start, start + adminState.pageSize);
  adminCount.textContent = `${filtered.length} / ${adminState.books.length} giáo trình đang hiển thị`;
  document.querySelector('#statBooks').textContent = adminState.books.length;
  adminList.innerHTML = visible.length ? visible.map((book) => `<article class="admin-book"><img src="${escapeHtml(book.image)}" alt="" /><div><span>${escapeHtml(book.faculty)} · ${escapeHtml(book.code)}</span><h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(book.author)}</p><strong>${money(book.price)} · thuê ${money(book.rent)}/kỳ</strong><small class="admin-book-meta">${conditionText(book)} · Tồn kho: ${book.stock} cuốn · ${availabilityText(book)}</small></div><button class="delete-book" type="button" data-delete-book="${escapeHtml(book.id)}" aria-label="Gỡ ${escapeHtml(book.title)}">Gỡ</button></article>`).join('') : '<p class="admin-empty">Không tìm thấy giáo trình.</p>';
  document.querySelector('#bookPageInfo').textContent = filtered.length ? `Trang ${adminState.page}/${pages} · Sách ${start + 1}–${start + visible.length} trong ${filtered.length}` : '0 giáo trình';
  document.querySelector('#bookPrev').disabled = adminState.page === 1;
  document.querySelector('#bookNext').disabled = adminState.page >= pages;
}

async function renderAdminBooks() {
  try {
    adminState.books = await window.eduBackend.getBooks();
    drawBooks();
  } catch (error) { showAdminMessage(error.message, true); }
}

async function renderAdminOrders() {
  try {
    const orders = await window.eduBackend.getOrders();
    orderCount.textContent = `${orders.length} yêu cầu đặt sách`;
    document.querySelector('#statOrders').textContent = orders.length;
    orderList.innerHTML = orders.length ? orders.map((order) => `
      <article class="admin-order">
        <div><strong>${escapeHtml(order.contact_name)}</strong><small>${escapeHtml(order.student_id)} · ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}</small><small>${new Date(order.created_at).toLocaleString('vi-VN')} · ${escapeHtml(order.pickup)}</small></div>
        <ul>${order.order_items.map((item) => `<li>${escapeHtml(item.book_title)} · ${item.mode === 'rent' ? 'Thuê' : 'Mua'} × ${item.quantity}</li>`).join('')}</ul>
        <div class="admin-order-actions"><strong>${money(order.total)} · cọc ${money(order.deposit)}</strong><select data-order-status="${escapeHtml(order.id)}" aria-label="Trạng thái đơn của ${escapeHtml(order.contact_name)}" ${['completed', 'cancelled'].includes(order.status) ? 'disabled' : ''}>${Object.entries(statusText).map(([value, label]) => `<option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
      </article>`).join('') : '<p class="admin-empty">Chưa có yêu cầu đặt sách.</p>';
  } catch (error) { showAdminMessage(error.message, true); }
}

function personCard(person, action) {
  const secondary = [person.email, person.student_id, person.faculty].filter(Boolean).map(escapeHtml).join(' · ');
  const state = person.active ? '<span class="admin-state is-active">Đang hoạt động</span>' : '<span class="admin-state">Đã khóa</span>';
  return `<article class="admin-person"><div><strong>${escapeHtml(person.full_name)}</strong><small>${secondary}</small><small>Đăng ký ${new Date(person.created_at).toLocaleDateString('vi-VN')} · ${escapeHtml(person.phone || 'Chưa có SĐT')}</small></div><div class="admin-person-actions">${state}${action}</div></article>`;
}

function drawAccounts() {
  const students = adminState.accounts.filter((account) => account.role === 'student');
  const subadmins = adminState.accounts.filter((account) => account.role === 'subadmin');
  document.querySelector('#statStudents').textContent = students.length;
  document.querySelector('#statSubadmins').textContent = subadmins.length;
  document.querySelector('#studentCount').textContent = `${students.length} tài khoản sinh viên`;
  const query = document.querySelector('#studentSearch').value.trim().toLocaleLowerCase('vi');
  const visible = students.filter((person) => [person.full_name, person.email, person.student_id, person.faculty].some((field) => String(field || '').toLocaleLowerCase('vi').includes(query)));
  document.querySelector('#studentList').innerHTML = visible.length ? visible.map((person) => personCard(person, `<button type="button" data-toggle-student="${escapeHtml(person.id)}" data-active="${!person.active}" class="${person.active ? 'admin-danger' : 'admin-safe'}">${person.active ? 'Khóa tài khoản' : 'Mở khóa'}</button>`)).join('') : '<p class="admin-empty">Không tìm thấy sinh viên.</p>';
  document.querySelector('#subadminList').innerHTML = subadmins.length ? subadmins.map((person) => personCard(person, `<button type="button" class="admin-danger" data-revoke-subadmin="${escapeHtml(person.id)}">Thu hồi quyền</button>`)).join('') : '<p class="admin-empty">Chưa có SubAdmin.</p>';
}

async function renderAccounts() {
  try {
    adminState.accounts = await window.eduBackend.getAdminAccounts();
    drawAccounts();
  } catch (error) {
    showAdminMessage(`Không tải được tài khoản. Hãy chạy migration dashboard trong Supabase: ${error.message}`, true);
    document.querySelector('#studentList').textContent = 'Chưa tải được tài khoản.';
    document.querySelector('#subadminList').textContent = 'Chưa tải được tài khoản.';
  }
}

adminForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = new FormData(adminForm);
  const price = Number(values.get('price'));
  const book = {
    id: `book-${Date.now()}`,
    title: values.get('title').trim(), code: values.get('code').trim().toUpperCase(),
    faculty: values.get('faculty'), author: values.get('author').trim(),
    condition: values.get('condition'), availability: values.get('availability'),
    price, oldPrice: Math.round(price * 1.8), rent: Number(values.get('rent')),
    stock: Number(values.get('stock')),
    image: values.get('image').trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    description: values.get('description').trim() || 'Giáo trình được cập nhật bởi EduBook.'
  };
  const submit = adminForm.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    await window.eduBackend.saveBook(book);
    adminForm.reset();
    await renderAdminBooks();
    showAdminMessage(`Đã thêm “${book.title}” vào catalog.`);
  } catch (error) { showAdminMessage(error.message, true); }
  finally { submit.disabled = false; }
});

adminList?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-book]');
  if (!button) return;
  button.disabled = true;
  try {
    await window.eduBackend.archiveBook(button.dataset.deleteBook);
    await renderAdminBooks();
    showAdminMessage('Đã gỡ giáo trình khỏi catalog.');
  } catch (error) { button.disabled = false; showAdminMessage(error.message, true); }
});

document.querySelector('#restoreBooks')?.addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const inserted = await window.eduBackend.addMissingSeeds(window.eduBookStore.seedBooks);
    await renderAdminBooks();
    showAdminMessage(`Đã bổ sung ${inserted.length} sách mẫu còn thiếu.`);
  } catch (error) { showAdminMessage(error.message, true); }
  finally { button.disabled = false; }
});

orderList?.addEventListener('change', async (event) => {
  const select = event.target.closest('[data-order-status]');
  if (!select) return;
  select.disabled = true;
  try {
    await window.eduBackend.setOrderStatus(select.dataset.orderStatus, select.value);
    await renderAdminOrders();
    showAdminMessage('Đã cập nhật trạng thái yêu cầu.');
  } catch (error) { showAdminMessage(error.message, true); await renderAdminOrders(); }
  finally { select.disabled = false; }
});

document.querySelector('#studentList')?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-toggle-student]');
  if (!button) return;
  button.disabled = true;
  try {
    await window.eduBackend.setStudentActive(button.dataset.toggleStudent, button.dataset.active === 'true');
    await renderAccounts();
    showAdminMessage('Đã cập nhật trạng thái tài khoản sinh viên.');
  } catch (error) { button.disabled = false; showAdminMessage(error.message, true); }
});

document.querySelector('#promoteForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#promoteEmail').value.trim().toLowerCase();
  const person = adminState.accounts.find((account) => account.email?.toLowerCase() === email && account.role === 'student');
  if (!person) { showAdminMessage('Không tìm thấy tài khoản sinh viên đã đăng ký với email này.', true); return; }
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  try {
    await window.eduBackend.setSubadminRole(person.id, 'subadmin');
    event.currentTarget.reset();
    await renderAccounts();
    showAdminMessage('Đã cấp quyền SubAdmin. Tài khoản sẽ dùng trang đăng nhập chung.');
  } catch (error) { showAdminMessage(error.message, true); }
  finally { button.disabled = false; }
});

document.querySelector('#subadminList')?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-revoke-subadmin]');
  if (!button) return;
  button.disabled = true;
  try {
    await window.eduBackend.setSubadminRole(button.dataset.revokeSubadmin, 'student');
    await renderAccounts();
    showAdminMessage('Đã thu hồi quyền SubAdmin.');
  } catch (error) { button.disabled = false; showAdminMessage(error.message, true); }
});

document.querySelector('#bookSearch')?.addEventListener('input', () => { adminState.page = 1; drawBooks(); });
document.querySelector('#studentSearch')?.addEventListener('input', drawAccounts);
document.querySelectorAll('[data-page-size]').forEach((button) => button.addEventListener('click', () => {
  adminState.pageSize = Number(button.dataset.pageSize);
  adminState.page = 1;
  document.querySelectorAll('[data-page-size]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  drawBooks();
}));
document.querySelector('#bookPrev')?.addEventListener('click', () => { adminState.page--; drawBooks(); });
document.querySelector('#bookNext')?.addEventListener('click', () => { adminState.page++; drawBooks(); });
document.querySelectorAll('[data-admin-tab]').forEach((button) => button.addEventListener('click', () => selectTab(button.dataset.adminTab)));
document.querySelector('#logoutButton')?.addEventListener('click', async () => {
  await window.eduAuth.signOut();
  window.location.href = 'login.html';
});

window.eduAuth.requireAdmin().then((session) => {
  if (!session) return;
  adminState.role = session.role;
  document.querySelector('#adminName').textContent = session.name;
  document.querySelector('#adminRole').textContent = session.role === 'admin' ? 'Admin chính' : 'SubAdmin';
  document.querySelectorAll('[data-root-only]').forEach((item) => { item.hidden = session.role !== 'admin'; });
  const initialTab = ['books', 'orders', 'students', 'subadmins'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'books';
  selectTab(initialTab);
  renderAdminBooks();
  renderAdminOrders();
  renderAccounts();
});
