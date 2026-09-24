const defaultBooks = [
  { id: 'it201', title: 'Cấu Trúc Dữ Liệu & Giải Thuật', code: 'IT201', faculty: 'Khoa Công nghệ thông tin', author: 'TS. Nguyễn Văn Hùng · ĐH IUH', condition: 'new', price: 45000, oldPrice: 85000, rent: 25000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJNX9XEviYQNdnE1QxxnT_8ouOmox3xTBmZttx5PohaC4MWfEK4Tnsw18kaENXT-GNC-I-s0CyU3ToUHUh7T7magfMNdaU8o0_2n2H27DNVKyXOBGS9-X3LqJ41S8_rKxqotmuXfwkdIBf3xMPo7GVmU2Tugal_96p6B52sQa7xJ7qmuft3AILzbdlDWJaj3miIVJiWRxdZLsNC0qBZjgVw-6GJnEeab2LX3flO1w4KnHWYNvYyv0euA', description: 'Giáo trình hệ thống hóa các cấu trúc dữ liệu và thuật toán nền tảng, kèm ví dụ bám sát học phần IT201.' },
  { id: 'it302', title: 'Lập Trình Hướng Đối Tượng với Java', code: 'IT302', faculty: 'Khoa Công nghệ thông tin', author: 'TS. Lê Văn Tuấn · Bộ môn CNPM', condition: 'new', price: 48000, oldPrice: 90000, rent: 25000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8XI9PXunLMctziOpS3AjUozaUjJV6FhZQSvsTe30rg6ph3IbboNqMULzr0XLRURGqjVtfgYY3HLm7gfz0mksU_QQKk2-mHqDzEgNz0ePojOvHK0ggeat_dIZY9fqfBOa6lA2ts6pT-C6qEQIeukZ3DA4_wyamlKhwUGaaSim8lvBNa3dbT_UL3C2ziPMkVu7kYaZ7w1Iib7nxs5QU4oVW4LoRmq7eTyYccKxeDBHDI6N4XhEZWX4S8w', description: 'Tài liệu thực hành Java 17, OOP, collections và design patterns cơ bản cho sinh viên CNTT.' },
  { id: 'acc101', title: 'Nguyên Lý Kế Toán IUH', code: 'KT101', faculty: 'Khoa Quản trị Kinh doanh', author: 'Bộ môn Kế toán Tài chính biên soạn', condition: 'pass', price: 38000, oldPrice: 75000, rent: 22000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLCnFe4AzH0Rgmrl-oEEg4So6ji3gydnNP2L07EsbrA3PLDEcNouBUO_MXqEBPffBaR-5WI62qnbOdwEGxy-em5X-od1iJ6npCagNi04F_VV7zJbZJVghevpm46HuHRCtUa_CwRuyEb2fHvIG_AJcc-SSE5Qj-gwhqLlNm4M6uHkMF2XBxxKmMEsOxTJwKxnRwjkEJkU_RzW3zJ0pEK9EUUB2fyMm8ujQhYrNeF1oEWTBtfqvkwiNzRA', description: 'Giáo trình nguyên lý kế toán theo chương trình đào tạo hiện hành, đã được kiểm tra chất lượng.' },
  { id: 'phy101', title: 'Vật Lý Đại Cương 1 & Thực Hành', code: 'VL101', faculty: 'Khoa Khoa học Cơ bản', author: 'PGS.TS. Trần Đình Khoa biên soạn', condition: 'new', price: 52000, oldPrice: 95000, rent: 27000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1vccs4rbES-1Zhh4cxTQAEl9Rd9KtW_j_0Pqp3mdONC1ZgII_yJTfOrJu_55iA5AwXGU_c1FSpucbTRASi1A9d6unTfOl5n2x9kj6-tfc8be29XdvQJvRPd03J3fldDL72OwlMFGWukUess-3eyoUr2KLTK5I60VVJ2Wzp6mldG1gsBntWbUFB4XMuTRvvdDIlEl5p3u0-HX-PhI75VhUAEchJxzFMx6_cXSQxYZC8beXqKlVvM1j7w', description: 'Lý thuyết và bài tập thực hành vật lý đại cương, trình bày theo cấu trúc học phần của IUH.' },
  { id: 'db201', title: 'Cơ Sở Dữ Liệu SQL Server', code: 'IT204', faculty: 'Khoa Công nghệ thông tin', author: 'Bộ môn Hệ thống Thông tin IUH', condition: 'new', price: 42000, oldPrice: 80000, rent: 23000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgryvHakWbCcSbWt1xDE2IXGH-4yBnOgKXjUOq76TCwC_aX1fYVKCvq9yy4HKEcs2lhtu8mOoyDnqWW5mv2VKq26Wmg9qHw5YLoQ9E7LU9WLctx3cYvn5EaIPyejh_ApzZUNKbQ1tGZ4JNreN8L1Jb_DrbxzgUKQ3kgi6iR9Gegu9twy0EzshbvRLx-tUv3CuaZ-jJVCvcyW5om3dVEpN-z_FGjy1IQUWH0h5ytWVQiAOuPV8lFqCb_Q', description: 'Tài liệu nền tảng về mô hình dữ liệu, SQL Server và các bài tập thiết kế cơ sở dữ liệu.' },
  { id: 'ee101', title: 'Kỹ Thuật Điện Tử Cơ Bản', code: 'EE101', faculty: 'Khoa Công nghệ Điện tử', author: 'TS. Phạm Minh Tuấn · Viện Điện', condition: 'new', price: 58000, oldPrice: 98000, rent: 29000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', description: 'Nhập môn linh kiện, mạch điện tử và kỹ thuật đo cho các học phần khối ngành điện – điện tử.' },
  { id: 'math101', title: 'Toán Cao Cấp A1', code: 'MA101', faculty: 'Khoa Khoa học Cơ bản', author: 'Khoa Khoa học Cơ bản IUH', condition: 'pass', price: 30000, oldPrice: 60000, rent: 18000, image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', description: 'Tuyển tập lý thuyết, bài tập mẫu và đề ôn tập Toán cao cấp A1 cho sinh viên năm nhất.' },
  { id: 'web405', title: 'Lập Trình Web với Java & Spring', code: 'IT405', faculty: 'Khoa Công nghệ thông tin', author: 'ThS. Trần Minh Hoàng · CNPM IUH', condition: 'pass', price: 41000, oldPrice: 82000, rent: 28000, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80', description: 'Giáo trình thực hành xây dựng ứng dụng web với Java, Spring Boot và cơ sở dữ liệu.' }
];

const books = window.eduBookStore?.getBooks?.() || defaultBooks;
const state = { mode: 'buy', query: '', faculty: 'all', condition: 'all', sort: 'relevant', favorites: new Set(), cart: [] };
const initialParams = new URLSearchParams(window.location.search);
if (initialParams.get('mode') === 'rent') state.mode = 'rent';
if (initialParams.get('query')) state.query = initialParams.get('query');
if (['Khoa Công nghệ thông tin', 'Khoa Công nghệ Điện', 'Khoa Công nghệ Điện tử', 'Khoa Công nghệ Động lực', 'Khoa Công nghệ Nhiệt - Lạnh', 'Khoa Công nghệ May - Thời trang', 'Khoa Công nghệ Hóa học', 'Khoa Khoa học Cơ bản', 'Khoa Luật và Khoa học chính trị', 'Khoa Ngoại ngữ', 'Khoa Quản trị Kinh doanh', 'Khoa Thương mại - Du lịch', 'Khoa Kỹ thuật Xây dựng', 'Khoa Khoa học Sức khỏe'].includes(initialParams.get('faculty'))) state.faculty = initialParams.get('faculty');

const el = (selector) => document.querySelector(selector);
const formatMoney = (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
const bookGrid = el('#bookGrid');
const modal = el('#bookModal');
const orderModal = el('#orderModal');
const cartDrawer = el('#cartDrawer');
const backdrop = el('#backdrop');
let modalMode = 'buy';
let toastTimer;
let authRedirectTimer;
const facultyLabels = { all: 'Tất cả khoa', 'Khoa Công nghệ thông tin': 'Khoa Công nghệ thông tin', 'Khoa Công nghệ Điện': 'Khoa Công nghệ Điện', 'Khoa Công nghệ Điện tử': 'Khoa Công nghệ Điện tử', 'Khoa Công nghệ Động lực': 'Khoa Công nghệ Động lực', 'Khoa Công nghệ Nhiệt - Lạnh': 'Khoa Công nghệ Nhiệt - Lạnh', 'Khoa Công nghệ May - Thời trang': 'Khoa Công nghệ May - Thời trang', 'Khoa Công nghệ Hóa học': 'Khoa Công nghệ Hóa học', 'Khoa Khoa học Cơ bản': 'Khoa Khoa học Cơ bản', 'Khoa Luật và Khoa học chính trị': 'Khoa Luật và Khoa học chính trị', 'Khoa Ngoại ngữ': 'Khoa Ngoại ngữ', 'Khoa Quản trị Kinh doanh': 'Khoa Quản trị Kinh doanh', 'Khoa Thương mại - Du lịch': 'Khoa Thương mại - Du lịch', 'Khoa Kỹ thuật Xây dựng': 'Khoa Kỹ thuật Xây dựng', 'Khoa Khoa học Sức khỏe': 'Khoa Khoa học Sức khỏe' };
const conditionLabels = { new: 'Mới 100%', over80: 'Độ mới trên 80%', over60: 'Độ mới trên 60%', pass: 'Độ mới trên 80%' };

const getCondition = (book) => book.condition === 'pass' ? 'over80' : (conditionLabels[book.condition] ? book.condition : 'new');
const conditionLabel = (book) => conditionLabels[getCondition(book)];
const getStock = (book) => Math.max(0, Number.isFinite(Number(book.stock)) ? Number(book.stock) : 10);
const getCartItems = () => state.cart.map((item) => ({ ...item, book: books.find((book) => book.id === item.id) })).filter((item) => item.book);
const getCartTotal = () => getCartItems().reduce((sum, item) => sum + (item.mode === 'rent' ? item.book.rent : item.book.price) * item.quantity, 0);

function setFacultyPicker(value) {
  const trigger = el('#facultySelect');
  if (!trigger) return;
  const selected = facultyLabels[value] ? value : 'all';
  trigger.dataset.value = selected;
  el('#facultySelected').textContent = facultyLabels[selected];
  document.querySelectorAll('[data-faculty-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.facultyOption === selected)));
}

function getVisibleBooks() {
  const normal = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normal(state.query.trim());
  const filtered = books.filter((book) => {
    const searchable = normal(`${book.title} ${book.code} ${book.author} ${book.faculty}`);
    return (!query || searchable.includes(query)) &&
      (state.faculty === 'all' || book.faculty === state.faculty) &&
      (state.condition === 'all' || getCondition(book) === state.condition);
  });
  return filtered.sort((a, b) => {
    const key = state.mode === 'rent' ? 'rent' : 'price';
    if (state.sort === 'price-low') return a[key] - b[key];
    if (state.sort === 'price-high') return b[key] - a[key];
    return 0;
  });
}

function renderBooks() {
  const currentBooks = getVisibleBooks();
  const isRent = state.mode === 'rent';
  el('#catalogDescription').textContent = isRent
    ? 'Thuê giáo trình trong một học kỳ, tiết kiệm đến 70% và hoàn cọc tự động.'
    : 'Giáo trình được kiểm tra độ mới và tồn kho trước khi nhận tại Nhà sách EduBook.';
  el('#resultsText').textContent = `${currentBooks.length} giáo trình ${isRent ? 'cho thuê' : 'đang có sẵn'}`;
  el('#emptyState').hidden = currentBooks.length !== 0;
  bookGrid.hidden = currentBooks.length === 0;
  bookGrid.innerHTML = currentBooks.map((book) => {
    const price = isRent ? book.rent : book.price;
    const saved = state.favorites.has(book.id);
    const discount = Math.round((1 - book.price / book.oldPrice) * 100);
    const condition = getCondition(book);
    const stock = getStock(book);
    return `<article class="book-card">
      <div class="book-image"><button class="image-detail-target" type="button" data-detail="${book.id}" aria-label="Xem chi tiết ${book.title}"><img src="${book.image}" alt="Bìa giáo trình ${book.title}" loading="lazy" /><span class="book-badge badge-${condition}">${conditionLabel(book)}</span></button><button class="favorite ${saved ? 'saved' : ''}" data-favorite="${book.id}" type="button" aria-label="${saved ? 'Bỏ lưu' : 'Lưu'} ${book.title}">${saved ? '♥' : '♡'}</button></div>
      <div class="book-body"><div class="book-meta"><strong>${book.faculty}</strong><span>${book.code}</span></div><h3><button class="book-title-button" type="button" data-detail="${book.id}">${book.title}</button></h3><p class="book-author">${book.author}</p><p class="stock-line ${stock ? '' : 'out-of-stock'}">${stock ? `Còn ${stock} cuốn` : 'Tạm hết sách'}</p><div class="price-row"><div><span class="price">${formatMoney(price)}</span><small>${isRent ? ' / kỳ' : ''}</small>${!isRent ? `<span class="old-price">${formatMoney(book.oldPrice)}</span>` : ''}</div>${!isRent ? `<span class="discount">-${discount}%</span>` : `<span class="discount">Tiết kiệm</span>`}</div><div class="card-actions"><button class="add-button" type="button" data-add="${book.id}" ${stock ? '' : 'disabled'}>${isRent ? 'Thuê sách' : 'Mua ngay'}</button><button class="details-button" type="button" data-detail="${book.id}">Chi tiết</button></div></div>
    </article>`;
  }).join('');
  window.observeReveal?.(bookGrid.querySelectorAll('.book-card'));
  el('#buyTab').setAttribute('aria-selected', String(!isRent));
  el('#rentTab').setAttribute('aria-selected', String(isRent));
}

function setMode(mode) {
  state.mode = mode;
  renderBooks();
  el('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openBook(id, mode = state.mode) {
  const book = books.find((item) => item.id === id);
  if (!book) return;
  modalMode = mode;
  renderModal(book);
  document.body.classList.add('modal-open');
  modal.showModal();
}

function renderModal(book) {
  const rent = modalMode === 'rent';
  const price = rent ? book.rent : book.price;
  const stock = getStock(book);
  el('#modalContent').innerHTML = `<div class="modal-layout"><div class="modal-cover"><img src="${book.image}" alt="Bìa giáo trình ${book.title}" /></div><div class="modal-info"><p class="eyebrow ${rent ? 'green-text' : 'blue-text'}">${book.faculty} · ${book.code}</p><h2>${book.title}</h2><p class="author">${book.author}</p><div class="modal-rating"><strong>★ 4.9 / 5.0</strong><span>184 sinh viên đã dùng học liệu này</span></div><div class="book-specs"><div><span>Độ mới sách</span><strong>${conditionLabel(book)}</strong></div><div><span>Tồn kho</span><strong class="${stock ? 'stock-available' : 'stock-unavailable'}">${stock ? `Còn ${stock} cuốn` : 'Tạm hết sách'}</strong></div></div><div class="mode-picker"><button class="${!rent ? 'active' : ''}" type="button" data-modal-mode="buy">▣ Mua sở hữu</button><button class="${rent ? 'active' : ''}" type="button" data-modal-mode="rent">↻ Thuê 1 học kỳ</button></div><div class="price-panel"><small>${rent ? 'Phí thuê 4 tháng · hoàn cọc tự động' : 'Giá trợ giá cho sinh viên IUH'}</small><strong>${formatMoney(price)}${rent ? ' / kỳ' : ''}</strong>${!rent ? `<small>Giá niêm yết <s>${formatMoney(book.oldPrice)}</s></small>` : '<small>Đặt cọc 0đ qua xác thực SSO</small>'}</div><p class="book-description">${book.description}</p><ul class="modal-benefits"><li>Đúng đề cương CNTT 2024–2025</li><li>Nhận sách tại Nhà sách EduBook hoặc Smart Locker</li><li>Đổi trả miễn phí trong 48 giờ nếu sai học phần</li></ul><button class="button ${rent ? 'green' : 'navy'} full-width" type="button" data-modal-add="${book.id}" ${stock ? '' : 'disabled'}>${stock ? (rent ? 'Thuê sách ngay' : 'Thêm vào giỏ') : 'Tạm hết sách'} <span>→</span></button></div></div>`;
}

function requireTransaction() {
  if (window.eduAuth?.getSession?.()) return true;
  showToast('Hãy đăng nhập hoặc đăng ký tài khoản trước khi giao dịch.');
  clearTimeout(authRedirectTimer);
  authRedirectTimer = setTimeout(() => { window.location.href = 'login.html?next=catalog'; }, 900);
  return false;
}

function addToCart(id, mode = state.mode) {
  if (!requireTransaction()) return;
  const book = books.find((item) => item.id === id);
  if (!book) return;
  const existing = state.cart.find((entry) => entry.id === id && entry.mode === mode);
  if (getStock(book) <= (existing?.quantity || 0)) {
    showToast(`Tồn kho không đủ cho “${book.title}”.`);
    return;
  }
  if (existing) existing.quantity += 1;
  else state.cart.push({ id, mode, quantity: 1 });
  renderCart();
  showToast(`${mode === 'rent' ? 'Đã thêm gói thuê' : 'Đã thêm vào giỏ'}: ${book.title}`);
}

function renderCart() {
  const count = state.cart.reduce((total, item) => total + item.quantity, 0);
  el('#cartCount').textContent = count;
  const items = getCartItems();
  el('#cartItems').innerHTML = items.length ? items.map(({ book, mode, quantity }) => `<div class="cart-item"><img src="${book.image}" alt="" /><div><strong>${book.title}</strong><small>${mode === 'rent' ? 'Thuê 1 học kỳ' : 'Mua sở hữu'} · x${quantity} · còn ${getStock(book)} cuốn</small><strong>${formatMoney((mode === 'rent' ? book.rent : book.price) * quantity)}</strong></div><button class="remove-cart" type="button" data-remove="${book.id}" data-remove-mode="${mode}" aria-label="Xóa ${book.title}">×</button></div>`).join('') : '<p class="cart-empty">Giỏ giáo trình của bạn đang trống.</p>';
  el('#cartTotal').textContent = formatMoney(getCartTotal());
}

function toggleCart(open) {
  cartDrawer.classList.toggle('open', open);
  cartDrawer.setAttribute('aria-hidden', String(!open));
  backdrop.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}

function openOrderModal() {
  if (!requireTransaction()) return;
  const items = getCartItems();
  if (!items.length) {
    showToast('Hãy thêm giáo trình vào giỏ trước nhé.');
    return;
  }
  const session = window.eduAuth.getSession();
  const total = getCartTotal();
  const deposit = Math.ceil(total * 0.2 / 1000) * 1000;
  el('#orderItemCount').textContent = `${items.reduce((sum, item) => sum + item.quantity, 0)} cuốn`;
  el('#orderSummaryItems').innerHTML = items.map(({ book, mode, quantity }) => `<div class="order-item"><img src="${book.image}" alt="" /><div><strong>${book.title}</strong><small>${mode === 'rent' ? 'Thuê 1 học kỳ' : 'Mua sở hữu'} · x${quantity}</small></div><span>${formatMoney((mode === 'rent' ? book.rent : book.price) * quantity)}</span></div>`).join('');
  el('#orderTotal').textContent = formatMoney(total);
  el('#orderDeposit').textContent = formatMoney(deposit);
  el('#orderName').value = session.name || '';
  el('#orderStudentId').value = session.studentId || session.staffId || '';
  el('#orderEmail').value = session.email || '';
  el('#orderPhone').value = session.phone && session.phone !== 'Chưa cập nhật' ? session.phone : '';
  toggleCart(false);
  orderModal.showModal();
}

function completeOrder() {
  const reserved = new Map();
  state.cart.forEach((item) => reserved.set(item.id, (reserved.get(item.id) || 0) + item.quantity));
  books.forEach((book) => {
    if (reserved.has(book.id)) book.stock = Math.max(0, getStock(book) - reserved.get(book.id));
  });
  window.eduBookStore?.saveBooks?.(books);
  state.cart = [];
  renderCart();
  renderBooks();
  orderModal.close();
  showToast('Đã gửi yêu cầu đặt sách. Nhà sách EduBook sẽ xác nhận trong giờ làm việc.');
}

function showToast(message) {
  const toast = el('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
}

el('#heroSearch').addEventListener('submit', (event) => {
  event.preventDefault();
  state.query = el('#searchInput').value;
  state.faculty = el('#facultySelect').dataset.value || 'all';
  renderBooks();
  el('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function setFloatingMenu(menu, trigger, open) {
  menu.hidden = false;
  menu.classList.toggle('is-open', open);
  trigger.setAttribute('aria-expanded', String(open));
}

function placeProductMenu() {
  const menu = el('.product-menu');
  const nav = el('.main-nav');
  const header = el('.site-header');
  if (window.matchMedia('(max-width: 1000px)').matches) nav.append(menu);
  else header.append(menu);
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.matches('.nav-products')) { placeProductMenu(); const menu = el('.product-menu'); setFloatingMenu(menu, target, !menu.classList.contains('is-open')); }
  if (target.matches('.mobile-menu')) { const header = el('.site-header'); const open = !header.classList.contains('mobile-open'); header.classList.toggle('mobile-open', open); el('.main-nav').style.display = open ? 'flex' : ''; target.setAttribute('aria-expanded', String(open)); }
  if (target.dataset.modeLink) { setMode(target.dataset.modeLink); setFloatingMenu(el('.product-menu'), el('.nav-products'), false); }
  if (target.dataset.query) { el('#searchInput').value = target.dataset.query; state.query = target.dataset.query; renderBooks(); el('#catalog').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (target.dataset.mode) setMode(target.dataset.mode);
  if (target.id === 'facultySelect') { const options = el('#facultyOptions'); setFloatingMenu(options, target, !options.classList.contains('is-open')); }
  if (target.dataset.facultyOption) { state.faculty = target.dataset.facultyOption; setFacultyPicker(state.faculty); setFloatingMenu(el('#facultyOptions'), el('#facultySelect'), false); }
  if (target.id === 'filterButton') { const filters = el('#filters'); filters.hidden = !filters.hidden; target.setAttribute('aria-expanded', String(!filters.hidden)); }
  if (target.dataset.filter) { state.condition = target.dataset.filter; document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button === target)); renderBooks(); }
  if (target.dataset.favorite) { const id = target.dataset.favorite; state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id); renderBooks(); }
  if (target.dataset.add) addToCart(target.dataset.add);
  if (target.dataset.detail) openBook(target.dataset.detail);
  if (target.dataset.modalMode) { const title = el('.modal-info h2')?.textContent; const book = books.find((item) => item.title === title); if (book) { modalMode = target.dataset.modalMode; renderModal(book); } }
  if (target.dataset.modalAdd) { addToCart(target.dataset.modalAdd, modalMode); modal.close(); }
  if (target.matches('.modal-close') && !target.dataset.closeOrder) modal.close();
  if (target.dataset.closeOrder !== undefined) orderModal.close();
  if (target.matches('.cart-button')) toggleCart(true);
  if (target.dataset.closeCart !== undefined || target === backdrop) toggleCart(false);
  if (target.dataset.remove) { state.cart = state.cart.filter((item) => !(item.id === target.dataset.remove && item.mode === target.dataset.removeMode)); renderCart(); }
  if (target.id === 'resetFilters') { state.query = ''; state.faculty = 'all'; state.condition = 'all'; el('#searchInput').value = ''; setFacultyPicker('all'); document.querySelectorAll('.chip').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all')); renderBooks(); }
  if (target.id === 'checkoutButton') openOrderModal();
});

el('#sortSelect').addEventListener('change', (event) => { state.sort = event.target.value; renderBooks(); });
el('#orderForm').addEventListener('submit', (event) => { event.preventDefault(); completeOrder(); });
document.addEventListener('click', (event) => {
  if (!event.target.closest('.faculty-picker')) setFloatingMenu(el('#facultyOptions'), el('#facultySelect'), false);
  if (!event.target.closest('.site-header')) setFloatingMenu(el('.product-menu'), el('.nav-products'), false);
});
modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
orderModal.addEventListener('click', (event) => { if (event.target === orderModal) orderModal.close(); });
modal.addEventListener('close', () => document.body.classList.remove('modal-open'));
backdrop.addEventListener('click', () => toggleCart(false));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') toggleCart(false); });

el('#searchInput').value = state.query;
setFacultyPicker(state.faculty);
renderBooks();
renderCart();
placeProductMenu();
window.addEventListener('resize', placeProductMenu);
