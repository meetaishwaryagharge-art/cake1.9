(function () {
  'use strict';
  var KEY = 'varyzon_cart_v1';
  var WA = '919082192602';
  var fmt = function (n) { return '\u20B9' + Number(n).toLocaleString('en-IN'); };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  var cart = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
  }

  /* ---------- Cart drawer (injected on every page) ---------- */
  var drawer = document.createElement('div');
  drawer.className = 'offcanvas offcanvas-end cart-drawer';
  drawer.id = 'cartDrawer';
  drawer.tabIndex = -1;
  drawer.setAttribute('aria-labelledby', 'cartTitle');
  drawer.innerHTML =
    '<div class="offcanvas-header">' +
      '<h5 class="offcanvas-title" id="cartTitle"><i class="fa-solid fa-cart-shopping me-2"></i>Your Cart</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>' +
    '</div>' +
    '<div class="offcanvas-body" id="cartBody"></div>' +
    '<div class="cart-foot" id="cartFoot">' +
      '<div class="d-flex justify-content-between align-items-center mb-3"><span>Total</span><strong id="cartTotal">\u20B90</strong></div>' +
      '<button type="button" class="btn btn-gold w-100 mb-2" id="cartOrder"><i class="fa-brands fa-whatsapp"></i>Order on WhatsApp</button>' +
      '<button type="button" class="btn btn-link w-100 cart-clear" id="cartClear">Clear cart</button>' +
    '</div>';
  document.body.appendChild(drawer);

  var toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer;
  function showToast(msg) {
    toast.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i>' + msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Cart operations ---------- */
  function count() {
    return Object.keys(cart).reduce(function (n, k) { return n + cart[k].qty; }, 0);
  }
  function total() {
    return Object.keys(cart).reduce(function (n, k) { return n + cart[k].qty * cart[k].price; }, 0);
  }
  function add(item) {
    if (cart[item.id]) cart[item.id].qty += 1;
    else cart[item.id] = { id: item.id, name: item.name, price: item.price, img: item.img, unit: item.unit, qty: 1 };
    save(); render();
  }
  function change(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    save(); render();
  }
  function remove(id) { delete cart[id]; save(); render(); }

  /* ---------- Render everything that depends on the cart ---------- */
  function render() {
    var n = count();
    document.querySelectorAll('.cart-count').forEach(function (b) {
      b.textContent = n;
      b.classList.toggle('has', n > 0);
    });

    /* product cards: swap "Add to Cart" for a quantity stepper */
    document.querySelectorAll('.prod').forEach(function (card) {
      var it = cart[card.dataset.id];
      var addBtn = card.querySelector('.add-btn');
      var qty = card.querySelector('.qty');
      if (!addBtn || !qty) return;
      addBtn.classList.toggle('d-none', !!it);
      qty.classList.toggle('d-none', !it);
      if (it) qty.querySelector('.q').textContent = it.qty;
    });

    /* drawer */
    var body = document.getElementById('cartBody');
    var foot = document.getElementById('cartFoot');
    var keys = Object.keys(cart);
    if (!keys.length) {
      body.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-cake-candles"></i><p>Your cart is empty.</p><p class="small">Add a cake or dessert to get started.</p></div>';
      foot.style.display = 'none';
      return;
    }
    foot.style.display = '';
    body.innerHTML = keys.map(function (k) {
      var it = cart[k];
      return '<div class="cart-line" data-id="' + esc(it.id) + '">' +
        '<img src="' + esc(it.img) + '" alt="" loading="lazy">' +
        '<div class="info">' +
          '<b>' + esc(it.name) + '</b>' +
          '<small>' + fmt(it.price) + ' &middot; ' + esc(it.unit) + '</small>' +
          '<div class="qty sm"><button type="button" data-cart="dec" aria-label="Decrease quantity">&minus;</button>' +
          '<span class="q">' + it.qty + '</span>' +
          '<button type="button" data-cart="inc" aria-label="Increase quantity">+</button></div>' +
        '</div>' +
        '<div class="end"><strong>' + fmt(it.price * it.qty) + '</strong>' +
        '<button type="button" class="rm" data-cart="rm" aria-label="Remove ' + esc(it.name) + '"><i class="fa-solid fa-trash-can"></i></button></div>' +
      '</div>';
    }).join('');
    document.getElementById('cartTotal').textContent = fmt(total());
  }

  /* ---------- Events (delegated, so it works for every card) ---------- */
  document.addEventListener('click', function (e) {
    var addBtn = e.target.closest('.add-btn');
    if (addBtn) {
      var card = addBtn.closest('.prod');
      add({
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        img: card.dataset.img,
        unit: card.dataset.unit
      });
      showToast(esc(card.dataset.name) + ' added to cart');
      return;
    }
    var stepper = e.target.closest('.prod .qty button');
    if (stepper) {
      var id = stepper.closest('.prod').dataset.id;
      change(id, stepper.dataset.act === 'inc' ? 1 : -1);
      return;
    }
    var act = e.target.closest('[data-cart]');
    if (act) {
      var line = act.closest('.cart-line');
      if (!line) return;
      var lid = line.dataset.id;
      if (act.dataset.cart === 'inc') change(lid, 1);
      else if (act.dataset.cart === 'dec') change(lid, -1);
      else remove(lid);
    }
  });

  document.getElementById('cartClear').addEventListener('click', function () {
    cart = {}; save(); render();
  });

  document.getElementById('cartOrder').addEventListener('click', function () {
    var keys = Object.keys(cart);
    if (!keys.length) return;
    var lines = keys.map(function (k, i) {
      var it = cart[k];
      return (i + 1) + '. ' + it.name + ' (' + it.unit + ') x ' + it.qty + ' = ' + fmt(it.price * it.qty);
    });
    var msg = 'Hi Varyzon, I would like to order:\n\n' + lines.join('\n') + '\n\nTotal: ' + fmt(total()) +
      '\n\nPlease confirm availability and delivery details.';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* keep several open tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { cart = load(); render(); }
  });

  /* ---------- "Our Cakes" dropdown: click goes to the cakes page on desktop ---------- */
  document.querySelectorAll('.nav-cakes-toggle').forEach(function (t) {
    t.addEventListener('click', function () {
      if (window.innerWidth >= 992 && t.dataset.href) window.location.href = t.dataset.href;
    });
  });

  /* ---------- Shared chrome for inner pages ---------- */
  var top = document.getElementById('toTop');
  if (top) {
    addEventListener('scroll', function () { top.classList.toggle('show', scrollY > 500); }, { passive: true });
    top.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };
  }
  var menu = document.getElementById('nav');
  if (menu && window.bootstrap) {
    document.querySelectorAll('#nav a:not([data-bs-toggle])').forEach(function (a) {
      a.addEventListener('click', function () {
        if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
      });
    });
  }
  document.querySelectorAll('.prod img').forEach(function (m) {
    m.addEventListener('error', function () {
      var fb = m.dataset.fb;
      if (fb && m.src !== fb) m.src = fb;
    }, { once: true });
  });

  render();
})();
