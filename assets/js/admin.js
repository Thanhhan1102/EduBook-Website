const adminSession = window.eduAuth.requireAdmin();
const adminList = document.querySelector('#adminBookList');
const adminCount = document.querySelector('#bookCount');
const adminForm = document.querySelector('#bookForm');
const adminMessage = document.querySelector('#adminMessage');
const money = (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
const conditionText = (book) => ({ new: 'Mới 100%', over80: 'Độ mới trên 80%', over60: 'Độ mới trên 60%', pass: 'Độ mới trên 80%' }[book.condition] || 'Mới 100%');
const stockText = (book) => `Tồn kho: ${Math.max(0, Number(book.stock ?? 10))} cuốn`;

const getBooks = () => window.eduBookStore.getBooks();
const saveBooks = (books) => window.eduBookStore.saveBooks(books);

function renderAdminBooks() {
  const books = getBooks();
  adminCount.textContent = `${books.length} giáo trình đang hiển thị`;
  adminList.innerHTML = books.map((book) => `<article class="admin-book"><img src="${book.image}" alt="" /><div><span>${book.faculty} · ${book.code}</span><h3>${book.title}</h3><p>${book.author}</p><strong>${money(book.price)} · thuê ${money(book.rent)}/kỳ</strong><small class="admin-book-meta">${conditionText(book)} · ${stockText(book)}</small></div><button class="delete-book" type="button" data-delete-book="${book.id}" aria-label="Gỡ ${book.title}">Gỡ</button></article>`).join('');
}

function showAdminMessage(message) {
  adminMessage.textContent = message;
  adminMessage.hidden = false;
}

adminForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = new FormData(adminForm);
  const price = Number(values.get('price'));
  const rent = Number(values.get('rent'));
  const stock = Number(values.get('stock'));
  const book = {
    id: `book-${Date.now()}`,
    title: values.get('title').trim(),
    code: values.get('code').trim().toUpperCase(),
    faculty: values.get('faculty'),
    author: values.get('author').trim(),
    condition: values.get('condition'),
    price,
    oldPrice: Math.round(price * 1.8),
    rent,
    stock,
    image: values.get('image').trim() || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    description: values.get('description').trim() || 'Giáo trình được cập nhật bởi Thư viện IUH.'
  };
  const books = getBooks();
  books.unshift(book);
  saveBooks(books);
  adminForm.reset();
  renderAdminBooks();
  showAdminMessage(`Đã thêm “${book.title}” vào catalog.`);
});

adminList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-delete-book]');
  if (!button) return;
  const books = getBooks().filter((book) => book.id !== button.dataset.deleteBook);
  saveBooks(books);
  renderAdminBooks();
  showAdminMessage('Đã gỡ giáo trình khỏi catalog.');
});

document.querySelector('#restoreBooks')?.addEventListener('click', () => {
  saveBooks(window.eduBookStore.seedBooks);
  renderAdminBooks();
  showAdminMessage('Đã khôi phục danh sách giáo trình mẫu.');
});

document.querySelector('#logoutButton')?.addEventListener('click', () => {
  window.eduAuth.signOut();
  window.location.href = 'login.html';
});

if (adminSession) renderAdminBooks();
