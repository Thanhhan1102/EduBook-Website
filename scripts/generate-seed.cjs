const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/book-store.js'), 'utf8'), sandbox);

const books = sandbox.window.eduBookStore.seedBooks.map((book) => ({
  id: book.id,
  title: book.title,
  code: book.code,
  faculty: book.faculty,
  author: book.author,
  condition: book.condition,
  availability: book.availability,
  price: book.price,
  old_price: book.oldPrice,
  rent_price: book.rent,
  stock: book.stock,
  image_url: book.image,
  description: book.description
}));

const sql = `-- Generated from assets/js/book-store.js. Run after the migration.\n` +
  `-- Existing books and live stock are left untouched.\n` +
  `insert into public.books (id, title, code, faculty, author, condition, availability, price, old_price, rent_price, stock, image_url, description)\n` +
  `select id, title, code, faculty, author, condition, availability, price, old_price, rent_price, stock, image_url, description\n` +
  `from jsonb_to_recordset($seed$${JSON.stringify(books)}$seed$::jsonb) as book(\n` +
  `  id text, title text, code text, faculty text, author text, condition text, availability text,\n` +
  `  price integer, old_price integer, rent_price integer, stock integer, image_url text, description text\n` +
  `)\n` +
  `on conflict (id) do nothing;\n`;

fs.writeFileSync(path.join(root, 'supabase/seed.sql'), sql);
console.log(`Wrote ${books.length} sample books to supabase/seed.sql`);
