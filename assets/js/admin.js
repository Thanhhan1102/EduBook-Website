const adminState = { books: [], accounts: [], orders: [], page: 1, pageSize: 20, role: null };
const adminList = document.querySelector('#adminBookList');
const adminCount = document.querySelector('#bookCount');
const adminForm = document.querySelector('#bookForm');
const adminMessage = document.querySelector('#adminMessage');
const coverInput = adminForm?.elements.coverFile;
const coverPreview = document.querySelector('#adminCoverPreview');
const editDialog = document.querySelector('#editBookDialog');
const editForm = document.querySelector('#editBookForm');
const editPreview = document.querySelector('#editBookPreview');
const editMessage = document.querySelector('#editBookMessage');
const orderList = document.querySelector('#adminOrderList');
const orderCount = document.querySelector('#adminOrderCount');
let coverPreviewUrl = '';
let editPreviewUrl = '';
let editingBookId = '';
const money = (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const conditionText = (book) => ({ new: 'Mới 100%', over80: 'Độ mới trên 80%', over60: 'Độ mới trên 60%' }[book.condition] || 'Mới 100%');
const availabilityText = (book) => ({ buy: 'Chỉ bán', rent: 'Chỉ thuê', both: 'Bán và thuê' }[book.availability] || 'Bán và thuê');
const bookPriceText = (book) => book.availability === 'buy' ? money(book.price) : book.availability === 'rent' ? `thuê ${money(book.rent)}/kỳ` : `${money(book.price)} · thuê ${money(book.rent)}/kỳ`;
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
  adminList.innerHTML = visible.length ? visible.map((book) => `<article class="admin-book"><img src="${escapeHtml(book.image)}" alt="" /><div><span>${escapeHtml(book.faculty)} · ${escapeHtml(book.code)}</span><h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(book.author)}</p><strong>${bookPriceText(book)}</strong><small class="admin-book-meta">${conditionText(book)} · Tồn kho: ${book.stock} cuốn · ${availabilityText(book)}</small></div><div class="admin-book-actions"><button class="edit-book" type="button" data-edit-book="${escapeHtml(book.id)}" aria-label="Chỉnh sửa ${escapeHtml(book.title)}">Chỉnh sửa</button><button class="delete-book" type="button" data-delete-book="${escapeHtml(book.id)}" aria-label="Gỡ ${escapeHtml(book.title)}">Gỡ</button></div></article>`).join('') : '<p class="admin-empty">Không tìm thấy giáo trình.</p>';
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

function updateAdminOrderNotice() {
  const summary = window.eduOrderHolds.notice(adminState.orders, 'admin');
  const notice = document.querySelector('#adminOrderNotice');
  notice.hidden = !summary.text;
  if (notice.textContent !== summary.text) notice.textContent = summary.text;
  notice.classList.toggle('is-urgent', summary.urgent);
  const count = document.querySelector('#adminUrgentCount');
  const attentionCount = summary.urgentCount + summary.expiredCount;
  count.hidden = attentionCount === 0;
  count.textContent = attentionCount;
}

function drawAdminOrders() {
  const orders = adminState.orders;
  orderCount.textContent = `${orders.length} yêu cầu đặt sách`;
  document.querySelector('#statOrders').textContent = orders.length;
  orderList.innerHTML = orders.length ? orders.map((order) => {
    const hold = window.eduOrderHolds;
    const ended = ['completed', 'cancelled'].includes(order.status) || (hold.isActive(order) && hold.remainingMs(order) === 0);
    return `<article class="admin-order" data-order-hold="${escapeHtml(order.id)}">
      <div><strong>${escapeHtml(order.contact_name)}</strong><small>${escapeHtml(order.student_id)} · ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}</small><small>${new Date(order.created_at).toLocaleString('vi-VN')} · ${escapeHtml(order.pickup)}</small><span class="hold-status" data-hold-status>${escapeHtml(hold.statusLabel(order))}</span>${hold.countdownHtml(order)}</div>
      <ul>${order.order_items.map((item) => `<li>${escapeHtml(item.book_title)} · ${item.mode === 'rent' ? 'Thuê' : 'Mua'} × ${item.quantity}</li>`).join('')}</ul>
      <div class="admin-order-actions"><strong>${money(order.total)} · cọc ${order.deposit ? money(order.deposit) : 'Miễn phí'}</strong><select data-order-status="${escapeHtml(order.id)}" aria-label="Trạng thái đơn của ${escapeHtml(order.contact_name)}" ${ended ? 'disabled' : ''}>${Object.entries(statusText).map(([value, label]) => `<option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
    </article>`;
  }).join('') : '<p class="admin-empty">Chưa có yêu cầu đặt sách.</p>';
  window.eduOrderHolds.updateCountdowns(orderList);
  updateAdminOrderNotice();
}

async function renderAdminOrders() {
  try {
    adminState.orders = await window.eduBackend.getOrders();
    drawAdminOrders();
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

function syncPriceFields() {
  const availability = adminForm.elements.availability.value;
  const priceRow = document.querySelector('#adminPriceRow');
  const showBuy = ['buy', 'both'].includes(availability);
  const showRent = ['rent', 'both'].includes(availability);
  priceRow.hidden = !showBuy && !showRent;
  priceRow.classList.toggle('is-single', showBuy !== showRent);
  for (const [mode, show] of [['buy', showBuy], ['rent', showRent]]) {
    const label = priceRow.querySelector(`[data-price-field="${mode}"]`);
    const input = label.querySelector('input');
    label.hidden = !show;
    input.disabled = !show;
    input.required = show;
  }
  syncConditionOptions(adminForm);
}

function syncConditionOptions(form) {
  const availability = form.elements.availability.value;
  const condition = form.elements.condition;
  const rental = availability === 'rent' || availability === 'both';
  condition.disabled = !availability;
  for (const option of condition.options) {
    if (option.value !== 'new' && option.value !== 'over60') continue;
    option.hidden = rental;
    option.disabled = rental;
  }
  if (!availability || (rental && condition.value !== 'over80')) {
    const changed = Boolean(condition.value);
    condition.value = '';
    return changed;
  }
  return false;
}

adminForm?.elements.availability.addEventListener('change', syncPriceFields);
if (adminForm) syncPriceFields();

function syncEditPriceFields() {
  const availability = editForm.elements.availability.value;
  for (const [mode, visible] of [['buy', availability !== 'rent'], ['rent', availability !== 'buy']]) {
    const label = editForm.querySelector(`[data-edit-price="${mode}"]`);
    label.hidden = !visible;
    label.querySelector('input').disabled = !visible;
    label.querySelector('input').required = visible;
  }
  editForm.querySelector('[data-edit-old-price]').hidden = availability === 'rent';
  if (syncConditionOptions(editForm)) {
    editMessage.textContent = 'Sách cho thuê chỉ dùng độ mới trên 80%. Hãy chọn lại độ mới hoặc chuyển sang Chỉ bán.';
    editMessage.hidden = false;
  }
}

function setEditPreview(source) {
  if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
  editPreviewUrl = source instanceof File ? URL.createObjectURL(source) : '';
  editPreview.src = editPreviewUrl || source || '';
}

function openBookEditor(book) {
  editingBookId = book.id;
  editForm.reset();
  editMessage.hidden = true;
  editForm.elements.faculty.innerHTML = adminForm.elements.faculty.innerHTML;
  for (const [field, value] of Object.entries({
    title: book.title, code: book.code, faculty: book.faculty, author: book.author,
    availability: book.availability, condition: book.condition,
    price: book.price, rent: book.rent, oldPrice: book.oldPrice,
    stock: book.stock, image: book.image, description: book.description
  })) editForm.elements[field].value = value ?? '';
  if (!editForm.elements.faculty.value) {
    editForm.elements.faculty.add(new Option(book.faculty, book.faculty, true, true));
  }
  syncEditPriceFields();
  setEditPreview(book.image);
  document.querySelector('#editBookTitle').textContent = `Chỉnh sửa: ${book.title}`;
  document.body.classList.add('modal-open');
  editDialog.showModal();
  editForm.elements.title.focus();
}

editForm?.elements.availability.addEventListener('change', () => { editMessage.hidden = true; syncEditPriceFields(); });
editForm?.elements.condition.addEventListener('change', () => { editMessage.hidden = true; });
editForm?.elements.coverFile.addEventListener('change', () => {
  const file = editForm.elements.coverFile.files[0];
  setEditPreview(file || editForm.elements.image.value);
});
editForm?.elements.image.addEventListener('change', () => {
  if (!editForm.elements.coverFile.files.length) setEditPreview(editForm.elements.image.value);
});
editDialog?.addEventListener('click', (event) => {
  if (event.target === editDialog || event.target.closest('[data-close-edit]')) editDialog.close();
});
editDialog?.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  setEditPreview('');
  editForm.elements.coverFile.value = '';
  editingBookId = '';
});

editForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const original = adminState.books.find((book) => book.id === editingBookId);
  if (!original) return;
  const values = new FormData(editForm);
  const availability = values.get('availability');
  const book = {
    ...original,
    title: values.get('title').trim(), code: values.get('code').trim().toUpperCase(),
    faculty: values.get('faculty'), author: values.get('author').trim(),
    availability, condition: values.get('condition'),
    price: availability === 'rent' ? 0 : Number(values.get('price')),
    rent: availability === 'buy' ? 0 : Number(values.get('rent')),
    oldPrice: availability === 'rent' ? 0 : Number(values.get('oldPrice') || 0),
    stock: Number(values.get('stock')),
    image: values.get('image').trim() || original.image,
    description: values.get('description').trim()
  };
  if (availability !== 'buy' && book.condition !== 'over80') {
    editMessage.textContent = 'Sách cho thuê phải có độ mới trên 80%.';
    editMessage.hidden = false;
    editForm.elements.condition.focus();
    return;
  }
  if (availability !== 'rent' && book.oldPrice < book.price) {
    editMessage.textContent = 'Giá niêm yết phải bằng hoặc cao hơn giá bán.';
    editMessage.hidden = false;
    editForm.elements.oldPrice.focus();
    return;
  }
  const submit = editForm.querySelector('[type="submit"]');
  submit.disabled = true;
  editMessage.hidden = true;
  let uploadedCover = null;
  let saved = false;
  try {
    const file = editForm.elements.coverFile.files[0];
    if (file) {
      uploadedCover = await window.eduBackend.uploadBookCover(file);
      book.image = uploadedCover.publicUrl;
    }
    await window.eduBackend.updateBook(book);
    saved = true;
    editDialog.close();
    await renderAdminBooks();
    showAdminMessage(`Đã cập nhật “${book.title}”.`);
  } catch (error) {
    if (uploadedCover && !saved) await window.eduBackend.deleteBookCover(uploadedCover.path).catch(() => {});
    if (saved) showAdminMessage(`Đã lưu sách nhưng chưa tải lại danh sách: ${error.message}`, true);
    else { editMessage.textContent = error.message; editMessage.hidden = false; }
  } finally { submit.disabled = false; }
});

function clearCoverPreview() {
  if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
  coverPreviewUrl = '';
  coverPreview.querySelector('img').hidden = true;
  coverPreview.querySelector('img').removeAttribute('src');
  coverPreview.querySelector('span').hidden = false;
}

coverInput?.addEventListener('change', () => {
  clearCoverPreview();
  const file = coverInput.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
    coverInput.value = '';
    showAdminMessage('Ảnh bìa phải là JPG, PNG hoặc WebP và không quá 5 MB.', true);
    return;
  }
  coverPreviewUrl = URL.createObjectURL(file);
  const image = coverPreview.querySelector('img');
  image.src = coverPreviewUrl;
  image.hidden = false;
  coverPreview.querySelector('span').hidden = true;
});

adminForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = new FormData(adminForm);
  const coverFile = values.get('coverFile');
  const hasCoverFile = coverFile instanceof File && coverFile.name !== '';
  const availability = values.get('availability');
  const price = availability === 'rent' ? 0 : Number(values.get('price'));
  const rent = availability === 'buy' ? 0 : Number(values.get('rent'));
  const book = {
    id: `book-${Date.now()}`,
    title: values.get('title').trim(), code: values.get('code').trim().toUpperCase(),
    faculty: values.get('faculty'), author: values.get('author').trim(),
    condition: values.get('condition'), availability,
    price, oldPrice: Math.round(price * 1.8), rent,
    stock: Number(values.get('stock')),
    image: values.get('image').trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    description: values.get('description').trim() || 'Giáo trình được cập nhật bởi EduBook.'
  };
  if (availability !== 'buy' && book.condition !== 'over80') {
    showAdminMessage('Sách cho thuê phải có độ mới trên 80%.', true);
    return;
  }
  const submit = adminForm.querySelector('[type="submit"]');
  submit.disabled = true;
  let uploadedCover = null;
  try {
    if (hasCoverFile) {
      uploadedCover = await window.eduBackend.uploadBookCover(coverFile);
      book.image = uploadedCover.publicUrl;
    }
    await window.eduBackend.saveBook(book);
    adminForm.reset();
    syncPriceFields();
    clearCoverPreview();
    await renderAdminBooks();
    showAdminMessage(`Đã thêm “${book.title}” vào catalog.`);
  } catch (error) {
    if (uploadedCover) await window.eduBackend.deleteBookCover(uploadedCover.path).catch(() => {});
    showAdminMessage(error.message, true);
  }
  finally { submit.disabled = false; }
});

adminList?.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-book]');
  if (editButton) {
    const book = adminState.books.find((item) => item.id === editButton.dataset.editBook);
    if (book) openBookEditor(book);
    return;
  }
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

document.querySelector('#bookSearch')?.addEventListener('input', () => { adminState.page = 1; drawBooks(); adminList.scrollTop = 0; });
document.querySelector('#studentSearch')?.addEventListener('input', drawAccounts);
document.querySelectorAll('[data-page-size]').forEach((button) => button.addEventListener('click', () => {
  adminState.pageSize = Number(button.dataset.pageSize);
  adminState.page = 1;
  document.querySelectorAll('[data-page-size]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  drawBooks();
  adminList.scrollTop = 0;
}));
document.querySelector('#bookPrev')?.addEventListener('click', () => { adminState.page--; drawBooks(); adminList.scrollTop = 0; });
document.querySelector('#bookNext')?.addEventListener('click', () => { adminState.page++; drawBooks(); adminList.scrollTop = 0; });
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
  window.setInterval(() => {
    window.eduOrderHolds.updateCountdowns(orderList);
    updateAdminOrderNotice();
  }, 1000);
  window.setInterval(() => { if (!document.hidden) renderAdminOrders(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderAdminOrders(); });
});
