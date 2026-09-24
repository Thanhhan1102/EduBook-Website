(() => {
  let client = null;
  let errorMessage = '';

  const ready = (async () => {
    try {
      if (!window.supabase?.createClient) throw new Error('Không tải được Supabase SDK.');
      const config = window.EDUBOOK_SUPABASE_CONFIG || await fetch('/api/config', { cache: 'no-store' }).then((response) => {
        if (!response.ok) throw new Error('Chưa cấu hình SUPABASE_PUBLISHABLE_KEY trên Vercel.');
        return response.json();
      });
      if (!config.url || !config.publishableKey) throw new Error('Cấu hình Supabase chưa đầy đủ.');
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

  const getBooks = async () => {
    const db = await requireClient();
    return unwrap(await db.from('books').select('*').eq('active', true).order('created_at', { ascending: true })).map(bookFromRow);
  };
  const saveBook = async (book) => {
    const db = await requireClient();
    return unwrap(await db.from('books').insert(bookToRow(book)).select().single());
  };
  const archiveBook = async (id) => {
    const db = await requireClient();
    return unwrap(await db.from('books').update({ active: false }).eq('id', id).select('id').single());
  };
  const addMissingSeeds = async (books) => {
    const db = await requireClient();
    return unwrap(await db.from('books').upsert(books.map(bookToRow), { onConflict: 'id', ignoreDuplicates: true }).select('id'));
  };
  const placeOrder = async (items, contact, pickup) => {
    const db = await requireClient();
    return unwrap(await db.rpc('place_order', {
      p_items: items.map(({ id, mode, quantity }) => ({ id, mode, quantity })),
      p_contact: contact,
      p_pickup: pickup
    }));
  };
  const getOrders = async () => {
    const db = await requireClient();
    return unwrap(await db.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }));
  };
  const setOrderStatus = async (id, status) => {
    const db = await requireClient();
    return unwrap(await db.from('orders').update({ status }).eq('id', id).select('id,status').single());
  };

  window.eduBackend = {
    ready, get client() { return client; }, get error() { return errorMessage; },
    requireClient, getBooks, saveBook, archiveBook, addMissingSeeds,
    placeOrder, getOrders, setOrderStatus
  };
})();
