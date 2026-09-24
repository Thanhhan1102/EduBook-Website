const productToggle = document.querySelector('.nav-products');
const productMenu = document.querySelector('.product-menu');
const mobileToggle = document.querySelector('.mobile-menu');
const mobileNav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

function placeProductMenu() {
  if (window.matchMedia('(max-width: 1000px)').matches) mobileNav.append(productMenu);
  else header.append(productMenu);
}

productToggle?.addEventListener('click', () => {
  placeProductMenu();
  const isOpen = !productMenu.classList.contains('is-open');
  productMenu.hidden = false;
  productMenu.classList.toggle('is-open', isOpen);
  productToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header') && productMenu) {
    productMenu.classList.remove('is-open');
    productToggle?.setAttribute('aria-expanded', 'false');
  }
});

mobileToggle?.addEventListener('click', () => {
  const isOpen = !header.classList.contains('mobile-open');
  header.classList.toggle('mobile-open', isOpen);
  mobileNav.style.display = isOpen ? 'flex' : '';
  mobileToggle.setAttribute('aria-expanded', String(isOpen));
});

window.addEventListener('resize', placeProductMenu);
placeProductMenu();
