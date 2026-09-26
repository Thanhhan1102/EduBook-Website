(() => {
  const callbackHash = new URLSearchParams(window.location.hash.slice(1));
  const callbackQuery = new URLSearchParams(window.location.search);
  const callbackValue = (key) => callbackHash.get(key) || callbackQuery.get(key);
  window.eduAuthCallback = {
    error: callbackValue('error'),
    errorCode: callbackValue('error_code'),
    errorDescription: callbackValue('error_description'),
    isEmailCallback: Boolean(
      callbackValue('error') || callbackValue('error_code') ||
      callbackHash.has('access_token') || callbackQuery.has('code') ||
      callbackValue('type') === 'signup'
    )
  };
  let client = null;
  let errorMessage = '';
  let authRedirectUrl = '';

  const ready = (async () => {
    try {
      if (!window.supabase?.createClient) throw new Error('Không tải được Supabase SDK.');
      const config = window.EDUBOOK_SUPABASE_CONFIG || await fetch('/api/config', { cache: 'no-store' }).then((response) => {
        if (!response.ok) throw new Error('Chưa cấu hình SUPABASE_PUBLISHABLE_KEY trên Vercel.');
        return response.json();
      });
      if (!config.url || !config.publishableKey) throw new Error('Cấu hình Supabase chưa đầy đủ.');
      authRedirectUrl = config.authRedirectUrl || '';
      client = window.supabase.createClient(config.url, config.publishableKey);
      return true;
    } catch (error) {
      errorMessage = error.message || 'Không thể kết nối Supabase.';
      return false;
    }
  })();

  const requireClient = async () => {
    await ready;
    if (!client) throw new Error(errorMessage || 'Không thể kết nối Supabase.');
    return client;
  };
  const unwrap = ({ data, error }) => {
    if (error) throw error;
    return data;
  };
  const bookFromRow = (row) => ({
    id: row.id, title: row.title, code: row.code, faculty: row.faculty,
    author: row.author, condition: row.condition, availability: row.availability,
    price: row.price, oldPrice: row.old_price, rent: row.rent_price,
    stock: row.stock, image: row.image_url, description: row.description
  });
  const bookToRow = (book) => ({
    id: book.id, title: book.title, code: book.code, faculty: book.faculty,
    author: book.author, condition: book.condition, availability: book.availability,
    price: book.price, old_price: book.oldPrice, rent_price: book.rent,
    stock: book.stock, image_url: book.image, description: book.description,
    active: true
  });
  const coverBucket = 'book-covers';
  const coverExtensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

  const getBooks = async () => {
    const db = await requireClient();
    return unwrap(await db.from('books').select('*').eq('active', true).order('created_at', { ascending: true })).map(bookFromRow);
  };
  const saveBook = async (book) => {
    const db = await requireClient();
    return unwrap(await db.from('books').insert(bookToRow(book)).select().single());
  };
  const updateBook = async (book) => {
    const db = await requireClient();
    const { id, active, ...changes } = bookToRow(book);
    return unwrap(await db.from('books').update(changes).eq('id', id).select().single());
  };
  const archiveBook = async (id) => {
    const db = await requireClient();
    return unwrap(await db.from('books').update({ active: false }).eq('id', id).select('id').single());
  };
  const addMissingSeeds = async (books) => {
    const db = await requireClient();
    return unwrap(await db.from('books').upsert(books.map(bookToRow), { onConflict: 'id', ignoreDuplicates: true }).select('id'));
  };
  const uploadBookCover = async (file) => {
    if (!file || !coverExtensions[file.type] || file.size === 0 || file.size > 5 * 1024 * 1024) {
      throw new Error('Ảnh bìa phải là JPG, PNG hoặc WebP và không quá 5 MB.');
    }
    const db = await requireClient();
    const { data: userData, error: userError } = await db.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('Bạn cần đăng nhập để tải ảnh bìa.');
    const path = `${userData.user.id}/${crypto.randomUUID()}.${coverExtensions[file.type]}`;
    const uploaded = unwrap(await db.storage.from(coverBucket).upload(path, file, {
      cacheControl: '31536000', contentType: file.type, upsert: false
    }));
    const { data: publicData } = db.storage.from(coverBucket).getPublicUrl(uploaded.path || path);
    return { path: uploaded.path || path, publicUrl: publicData.publicUrl };
  };
  const deleteBookCover = async (path) => {
    const db = await requireClient();
    return unwrap(await db.storage.from(coverBucket).remove([path]));
  };
  const placeOrder = async (items, contact, pickup) => {
    const db = await requireClient();
    const { data: holdsReady, error: holdsError } = await db.rpc('book_holds_ready');
    if (holdsError) throw new Error('Không kiểm tra được cơ chế giữ sách 24 giờ. Hãy kiểm tra migration 202609250005 và hàm book_holds_ready trong Supabase.');
    if (!holdsReady) throw new Error('Job Cron giữ sách 24 giờ chưa hoạt động. Hãy kiểm tra Integrations → Cron và job edubook-expire-book-holds trong Supabase.');
    const result = await db.rpc('place_order', {
      p_items: items.map(({ id, mode, quantity }) => ({ id, mode, quantity })),
      p_contact: contact,
      p_pickup: pickup
    });
    if (result.error?.message?.includes('orders_deposit_free_check')) {
      throw new Error('Hàm đặt sách trên Supabase còn tính cọc theo bản cũ. Vui lòng báo quản trị viên chạy lại migration 202609250004_rental_rules_free_deposit.sql.');
    }
    return unwrap(result);
  };
  const getOrders = async () => {
    const db = await requireClient();
    return unwrap(await db.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }));
  };
  const setOrderStatus = async (id, status) => {
    const db = await requireClient();
    return unwrap(await db.from('orders').update({ status }).eq('id', id).select('id,status').single());
  };
  const getAdminAccounts = async () => {
    const db = await requireClient();
    return unwrap(await db.rpc('list_admin_accounts'));
  };
  const setStudentActive = async (id, active) => {
    const db = await requireClient();
    return unwrap(await db.rpc('set_student_active', { p_user_id: id, p_active: active }));
  };
  const setSubadminRole = async (id, role) => {
    const db = await requireClient();
    return unwrap(await db.rpc('set_subadmin_role', { p_user_id: id, p_role: role }));
  };
  const getSupportMessages = async (userId) => {
    const db = await requireClient();
    const messages = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const page = unwrap(await db.from('support_messages').select('*')
        .eq('user_id', userId).order('created_at', { ascending: true })
        .order('id', { ascending: true }).range(offset, offset + pageSize - 1));
      messages.push(...page);
      if (page.length < pageSize) return messages;
    }
  };
  const getSupportChats = async () => {
    const db = await requireClient();
    return unwrap(await db.rpc('list_support_chats'));
  };
  const sendSupportMessage = async (userId, senderRole, body) => {
    const db = await requireClient();
    return unwrap(await db.from('support_messages')
      .insert({ user_id: userId, sender_role: senderRole, body: body.trim() }).select().single());
  };
  const markSupportRead = async (userId, senderRole) => {
    const db = await requireClient();
    return unwrap(await db.from('support_messages').update({ read_at: new Date().toISOString() })
      .eq('user_id', userId).eq('sender_role', senderRole).is('read_at', null));
  };

  window.eduBackend = {
    ready, get client() { return client; }, get error() { return errorMessage; },
    get authRedirectUrl() { return authRedirectUrl; },
    requireClient, getBooks, saveBook, updateBook, archiveBook, addMissingSeeds,
    uploadBookCover, deleteBookCover,
    placeOrder, getOrders, setOrderStatus, getAdminAccounts, setStudentActive, setSubadminRole,
    getSupportMessages, getSupportChats, sendSupportMessage, markSupportRead
  };
})();
