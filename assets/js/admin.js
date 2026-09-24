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
  adminMessage.textContent = message;
  adminMessage.hidden = false;
  adminMessage.classList.toggle('success', !isError);
}

async function renderAdminBooks() {
  try {
    const books = await window.eduBackend.getBooks();
    adminCount.textContent = `${books.length} giáo trình đang hiển thị`;
    adminList.innerHTML = books.map((book) => `<article class="admin-book"><img src="${escapeHtml(book.image)}" alt="" /><div><span>${escapeHtml(book.faculty)} · ${escapeHtml(book.code)}</span><h3>${escapeHtml(book.title)}</h3><p>${escapeHtml(book.author)}</p><strong>${money(book.price)} · thuê ${money(book.rent)}/kỳ</strong><small class="admin-book-meta">${conditionText(book)} · Tồn kho: ${book.stock} cuốn · ${availabilityText(book)}</small></div><button class="delete-book" type="button" data-delete-book="${escapeHtml(book.id)}" aria-label="Gỡ ${escapeHtml(book.title)}">Gỡ</button></article>`).join('');
  } catch (error) { showAdminMessage(error.message, true); }
}

async function renderAdminOrders() {
  try {
    const orders = await window.eduBackend.getOrders();
    orderCount.textContent = `${orders.length} yêu cầu đặt sách`;
    orderList.innerHTML = orders.length ? orders.map((order) => `
      <article class="admin-order">
        <div><strong>${escapeHtml(order.contact_name)}</strong><small>${escapeHtml(order.student_id)} · ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}</small><small>${new Date(order.created_at).toLocaleString('vi-VN')} · ${escapeHtml(order.pickup)}</small></div>
        <ul>${order.order_items.map((item) => `<li>${escapeHtml(item.book_title)} · ${item.mode === 'rent' ? 'Thuê' : 'Mua'} × ${item.quantity}</li>`).join('')}</ul>
        <div class="admin-order-actions"><strong>${money(order.total)} · cọc ${money(order.deposit)}</strong><select data-order-status="${escapeHtml(order.id)}" aria-label="Trạng thái đơn của ${escapeHtml(order.contact_name)}" ${['completed', 'cancelled'].includes(order.status) ? 'disabled' : ''}>${Object.entries(statusText).map(([value, label]) => `<option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
      </article>`).join('') : '<p class="cart-empty">Chưa có yêu cầu đặt sách.</p>';
  } catch (error) { showAdminMessage(error.message, true); }
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

document.querySelector('#logoutButton')?.addEventListener('click', async () => {
  await window.eduAuth.signOut();
  window.location.href = 'login.html';
});

window.eduAuth.requireAdmin().then((session) => {
  if (!session) return;
  renderAdminBooks();
  renderAdminOrders();
});
