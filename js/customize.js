/* Varyzon – "Customise Your Cake" system
   - Step-by-step cake builder with a live cake preview + price estimate
   - Mounts inline on customize-your-cake.html and in a popup (modal) on every other page
   - Adds the floating button, animated promo cakes, and wires every [data-customize] trigger
   Sends the finished request to WhatsApp (same number as the rest of the site). */
(function () {
  'use strict';

  var WA = '919082192602';
  var KEY = 'varyzon_custom_v1';
  var FB = 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=700&q=75';

  /* ====================== DATA ====================== */
  var OCCASIONS = [
    { n: 'Birthday', img: 'truffle-temptation', sign: 'Happy Birthday' },
    { n: 'Anniversary', img: 'red-velvet-rogan', sign: 'Anniversary' },
    { n: 'Wedding', img: 'opera-cake', sign: 'Just Married' },
    { n: 'Baby Shower', img: 'strawberry-serenade', sign: 'Baby Shower' },
    { n: 'Corporate / Office', img: 'belgium-truffle', sign: 'Congrats!' },
    { n: 'Festival', img: 'motichoor-cake', sign: 'Celebrate' },
    { n: 'Just Because', img: 'rainbow-spectacle', sign: 'Enjoy!' }
  ];
  var MSG_IDEAS = {
    'Birthday': ['Happy Birthday', 'Happy Birthday Mom', 'Happy Birthday Dad', 'Many Happy Returns'],
    'Anniversary': ['Happy Anniversary', 'Forever & Always', 'Love You Always'],
    'Wedding': ['Happy Wedding', 'Mr & Mrs', 'Just Married'],
    'Baby Shower': ['Welcome Baby', 'Oh Baby!', 'Baby on the Way'],
    'Corporate / Office': ['Congratulations', 'Well Done Team', 'Happy Work Anniversary'],
    'Festival': ['Happy Diwali', 'Happy Holi', 'Happy Festival'],
    'Just Because': ['Just for You', 'Thank You', 'Sorry!']
  };
  var SHAPES = [
    { id: 'round', n: 'Round' }, { id: 'square', n: 'Square' },
    { id: 'rect', n: 'Rectangle' }, { id: 'heart', n: 'Heart', add: 100 }
  ];
  var TIERS = [{ v: 1, n: '1 Tier', min: 0.5 }, { v: 2, n: '2 Tiers', min: 2 }, { v: 3, n: '3 Tiers', min: 4 }];
  var TIER_MULT = { 1: 1, 2: 1.2, 3: 1.4 };
  var WEIGHTS = [0.5, 1, 1.5, 2, 3, 4, 5];
  var FLAVOURS = [
    { n: 'Chocolate', img: 'double-choco-delight', b: 1000, k: ['choc', 'truffle', 'fudge', 'dark'] }, { n: 'Vanilla', img: 'vanilla-chip-charm', b: 900, k: ['vanilla', 'white'] },
    { n: 'Red Velvet', img: 'red-velvet-rogan', b: 1400, k: ['velvet'] }, { n: 'Butterscotch', img: 'butterscotch-bliss', b: 1000, k: ['butterscotch', 'caramel'] },
    { n: 'Pineapple', img: 'pineapple-bliss', b: 900, k: ['pineapple'] }, { n: 'Black Forest', img: 'midnight-forest-delight', b: 1100, k: ['forest'] },
    { n: 'Strawberry', img: 'strawberry-serenade', b: 1000, k: ['strawberry'] }, { n: 'Mango', img: 'mango-cheese-cake', b: 1100, k: ['mango'] },
    { n: 'Rasmalai', img: 'rasmalai-cake', b: 1400, k: ['rasmalai'] }, { n: 'Mocha', img: 'choco-mocha-delight', b: 1100, k: ['mocha', 'coffee'] }
  ];
  var FILLINGS = [
    { n: 'Chocolate Truffle', add: 0, img: 'dark-fantasy-fudge', d: 'Silky, deep chocolate ganache layered between soft sponge.' },
    { n: 'Velvet Sponge', add: 0, img: 'white-forest-delight', d: 'Light, moist and airy sponge that melts in the mouth.' },
    { n: 'Salted Caramel', add: 100, img: 'caramel-cocoa-dream', d: 'Buttery caramel with a pinch of salt for a sweet and savoury finish.' },
    { n: 'Berry Compote', add: 100, img: 'blueberry-bliss-delight', d: 'Tangy berry compote that cuts through the richness of chocolate.' },
    { n: 'Crunchy Praline', add: 200, img: 'rocher-fusion', d: 'Nutty praline crunch for texture in every bite.' }
  ];
  var STYLES = [
    { id: 'classic', n: 'Classic Cream', add: 0, d: 'Smooth cream, piped borders' },
    { id: 'drip', n: 'Chocolate Drip', add: 150, d: 'Glossy ganache drip' },
    { id: 'floral', n: 'Floral Piping', add: 250, d: 'Buttercream roses' },
    { id: 'fondant', n: 'Fondant Theme', add: 500, d: 'Smooth, sculpted finish' },
    { id: 'photo', n: 'Photo Cake', add: 300, d: 'Edible photo print' },
    { id: 'naked', n: 'Semi-Naked', add: 100, d: 'Rustic with fresh berries' }
  ];
  var TOPPERS = [
    { id: 'none', n: 'None', flat: 0 }, { id: 'candles', n: 'Candles', flat: 0 },
    { id: 'sign', n: 'Message Topper', flat: 80 }, { id: 'flowers', n: 'Fresh Flowers', flat: 250 },
    { id: 'figure', n: 'Golden Star', flat: 150 }
  ];
  var COLORS = [
    { n: 'Blush Pink', c: '#f4c6c6' }, { n: 'Rose', c: '#e58ea3' }, { n: 'Ivory', c: '#fbf1e2' }, { n: 'White', c: '#ffffff' },
    { n: 'Chocolate', c: '#5a2e1d' }, { n: 'Cocoa', c: '#9a6a47' }, { n: 'Mint', c: '#bfe3d0' }, { n: 'Sky Blue', c: '#bcd9f0' },
    { n: 'Lavender', c: '#d4c3ee' }, { n: 'Butter Yellow', c: '#f7e08c' }, { n: 'Peach', c: '#f9c6a4' }, { n: 'Ruby Red', c: '#b5283a' },
    { n: 'Gold', c: '#d4a53a' }
  ];
  var STEPS = ['Occasion', 'Shape & Size', 'Flavour', 'Design', 'Details'];

  /* catalogue used for "closest from our collection" suggestions (same list as the shop pages) */
  var CAKES = [
    { n: 'Truffle Temptation', f: 'Chocolate Truffle', p: 500, c: 'Chocolate', i: 'photo-1578985545062-69928b1d9587' },
    { n: 'Alpine Truffle Elegance', f: 'Chocolate Truffle', p: 500, c: 'All Season', i: 'photo-1519340333755-56e9c1d04579' },
    { n: 'Double Choco Delight', f: 'Chocolate Truffle', p: 600, c: 'Premium', i: 'photo-1578985545062-69928b1d9587' },
    { n: 'Dark Fantasy Fudge', f: 'Chocolate Truffle', p: 600, c: 'Premium', i: 'photo-1565958011703-44f9829ba187' },
    { n: 'Belgium Truffle', f: 'Chocolate Truffle', p: 700, c: 'All Season', i: 'photo-1565958011703-44f9829ba187' },
    { n: 'Opera Cake', f: 'Chocolate Truffle', p: 900, c: 'Exotic Gateau', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Pineapple Bliss', f: 'Velvet Sponge', p: 450, c: 'Fruit Cake', i: 'photo-1488477181946-6428a0291777' },
    { n: 'Vanilla Chip Charm', f: 'Velvet Sponge', p: 500, c: 'All Season', i: 'photo-1519340333755-56e9c1d04579' },
    { n: 'Fresh Fruit Symphony', f: 'Velvet Sponge', p: 500, c: 'Fruit Cake', i: 'photo-1488477181946-6428a0291777' },
    { n: 'White Forest Delight', f: 'Velvet Sponge', p: 600, c: 'All Season', i: 'photo-1519340333755-56e9c1d04579' },
    { n: 'Red Velvet Rogan', f: 'Velvet Sponge', p: 700, c: 'Premium', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Rasmalai Cake', f: 'Velvet Sponge', p: 700, c: 'Indian Sweet', i: 'photo-1558636508-e0db3814bd1d' },
    { n: 'Caramel Cocoa Dream', f: 'Salted Caramel', p: 450, c: 'Fruit Cake', i: 'photo-1578985545062-69928b1d9587' },
    { n: 'Butterscotch Bliss', f: 'Salted Caramel', p: 500, c: 'All Season', i: 'photo-1519340333755-56e9c1d04579' },
    { n: 'Choco Mocha Delight', f: 'Salted Caramel', p: 500, c: 'All Season', i: 'photo-1578985545062-69928b1d9587' },
    { n: 'Biscoff Dream Bonanza', f: 'Salted Caramel', p: 800, c: 'Exotic Gateau', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Biscoff Cheese Cake', f: 'Salted Caramel', p: 900, c: 'Cheese Cake', i: 'photo-1565958011703-44f9829ba187' },
    { n: 'Biscoff Spread', f: 'Salted Caramel', p: 1200, c: 'Exotic Gateau', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Strawberry Serenade', f: 'Berry Compote', p: 450, c: 'Fruit Cake', i: 'photo-1488477181946-6428a0291777' },
    { n: 'Blueberry Bliss Delight', f: 'Berry Compote', p: 450, c: 'Fruit Cake', i: 'photo-1488477181946-6428a0291777' },
    { n: 'Blueberry Cheese Cake', f: 'Berry Compote', p: 800, c: 'Cheese Cake', i: 'photo-1565958011703-44f9829ba187' },
    { n: 'Strawberry Cheese Cake', f: 'Berry Compote', p: 800, c: 'Cheese Cake', i: 'photo-1565958011703-44f9829ba187' },
    { n: 'Rainbow Spectacle', f: 'Berry Compote', p: 800, c: 'Exotic Gateau', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Mango Cheese Cake', f: 'Berry Compote', p: 800, c: 'Cheese Cake', i: 'photo-1565958011703-44f9829ba187' },
    { n: 'Chipster Choco Paradise', f: 'Crunchy Praline', p: 500, c: 'All Season', i: 'photo-1519340333755-56e9c1d04579' },
    { n: 'Choco Walnut Wonder', f: 'Crunchy Praline', p: 700, c: 'Premium', i: 'photo-1578985545062-69928b1d9587' },
    { n: 'Almond Bliss Delight', f: 'Crunchy Praline', p: 700, c: 'Premium', i: 'photo-1578985545062-69928b1d9587' },
    { n: 'Rocher Fusion', f: 'Crunchy Praline', p: 800, c: 'Exotic Gateau', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Nutty Nutella Marvel', f: 'Crunchy Praline', p: 800, c: 'Exotic Gateau', i: 'photo-1464349095431-e9a21285b5f3' },
    { n: 'Hazelnut Cheese Cake', f: 'Crunchy Praline', p: 900, c: 'Cheese Cake', i: 'photo-1565958011703-44f9829ba187' }
  ];

  /* ====================== HELPERS ====================== */
  function slug(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inr(v) { return '₹' + Math.round(v).toLocaleString('en-IN'); }
  function find(list, key, val) { for (var i = 0; i < list.length; i++) if (String(list[i][key]) === String(val)) return list[i]; return list[0]; }
  function kgText(kg) { return kg < 1 ? '500 gms' : kg + ' kg'; }
  function serves(kg) { return Math.round(kg * 8) + '–' + Math.round(kg * 10); }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function shade(h, a) { var c = rgb(h), t = a < 0 ? 0 : 255, p = Math.abs(a); return 'rgb(' + c.map(function (v) { return Math.round(v + (t - v) * p); }).join(',') + ')'; }
  function lum(h) { var c = rgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function tryLS(fn) { try { return fn(); } catch (e) { return null; } }

  /* ====================== CAKE ILLUSTRATION ====================== */
  var UID = 0;
  var HEART = 'M100 172C22 114 -2 62 38 32C68 10 100 30 100 52C100 30 132 10 162 32C202 62 178 114 100 172Z';

  function rosette(x, y, r, col) {
    var d = shade(col, -0.28);
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '" stroke="' + d + '" stroke-width=".8"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.62) + '" fill="none" stroke="' + d + '" stroke-width=".8"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.26) + '" fill="' + d + '" opacity=".6"/>';
  }
  function bow(x, y, col) {
    var d = shade(col, -0.25);
    return '<g transform="translate(' + x + ' ' + y + ')"><ellipse cx="-9" cy="0" rx="9" ry="5.5" transform="rotate(-22 -9 0)" fill="' + col + '" stroke="' + d + '" stroke-width=".8"/>' +
      '<ellipse cx="9" cy="0" rx="9" ry="5.5" transform="rotate(22 9 0)" fill="' + col + '" stroke="' + d + '" stroke-width=".8"/>' +
      '<circle r="3.6" fill="' + shade(col, -0.12) + '" stroke="' + d + '" stroke-width=".8"/></g>';
  }
  function flower(x, y, petal) {
    var o = '', a;
    for (a = 0; a < 5; a++) o += '<circle cx="' + (x + Math.cos(a * 1.2566) * 6) + '" cy="' + (y + Math.sin(a * 1.2566) * 6) + '" r="4.6" fill="' + petal + '" stroke="rgba(0,0,0,.12)" stroke-width=".6"/>';
    return o + '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#e9b53b"/>';
  }

  function tierSVG(s, t, idx, isTop, u) {
    var cx = 150, w = t.w, h = t.h, yt = t.yt, yb = t.yb, x0 = cx - w / 2, x1 = cx + w / 2;
    var round = s.shape === 'round', ry = Math.max(7, w * 0.085), ky = ry * 1.5, k = w * 0.06, rx = w / 2;
    var ic = s.icing, ac = s.accent, st = s.style;
    var bodyD = round ? 'M' + x0 + ' ' + yt + 'L' + x0 + ' ' + yb + 'A' + rx + ' ' + ry + ' 0 0 0 ' + x1 + ' ' + yb + 'L' + x1 + ' ' + yt + 'Z'
      : 'M' + x0 + ' ' + yt + 'H' + x1 + 'V' + yb + 'H' + x0 + 'Z';
    function topTag(attrs, sc) {
      sc = sc || 1;
      if (round) return '<ellipse cx="' + cx + '" cy="' + yt + '" rx="' + (rx * sc) + '" ry="' + (ry * sc) + '" ' + (attrs || '') + '/>';
      var cy = yt - ky / 2, hw = w / 2 * sc, hk = (w / 2 - k) * sc, hy = ky / 2 * sc;
      return '<polygon points="' + [cx - hw, cy + hy, cx + hw, cy + hy, cx + hk, cy - hy, cx - hk, cy - hy].join(' ') + '" ' + (attrs || '') + '/>';
    }
    var topCy = round ? yt : yt - ky / 2;
    function rimY(x, base) { return round ? base + ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2))) : base; }
    function band(y, hh, fill) {
      if (!round) return '<rect x="' + x0 + '" y="' + y + '" width="' + w + '" height="' + hh + '" fill="' + fill + '"/>';
      return '<path d="M' + x0 + ' ' + y + 'A' + rx + ' ' + ry + ' 0 0 0 ' + x1 + ' ' + y + 'L' + x1 + ' ' + (y + hh) + 'A' + rx + ' ' + ry + ' 0 0 1 ' + x0 + ' ' + (y + hh) + 'Z" fill="' + fill + '"/>';
    }
    var cid = u + 'c' + idx, o = '';
    var bodyFill = st === 'naked' ? '#e7c79c' : ic;
    var topFill = st === 'drip' ? ac : (st === 'naked' ? ic : shade(ic, 0.32));
    o += '<clipPath id="' + cid + '"><path d="' + bodyD + '"/>' + topTag('') + '</clipPath>';
    o += '<path d="' + bodyD + '" fill="' + bodyFill + '"/>';
    o += '<g clip-path="url(#' + cid + ')">';
    if (st === 'naked') { o += band(yt + h * 0.3, 8, ic) + band(yt + h * 0.62, 8, ic) + band(yt - 2, 12, ic); }
    if (st === 'fondant') {
      var d, j;
      for (j = 0; j < Math.round(w / 15); j++) for (d = 0; d < 2; d++) o += '<circle cx="' + (x0 + 8 + j * 15 + d * 7.5) + '" cy="' + (yt + ry + 6 + d * 14) + '" r="2.4" fill="#fff" opacity=".55"/>';
      o += band(yb - 26, 15, ac);
    }
    if (st === 'drip') {
      o += band(yt - 1, 9, ac);
      var cnt = Math.max(5, Math.round(w / 21)), i, x, len;
      for (i = 0; i < cnt; i++) {
        x = x0 + (i + 0.5) * w / cnt; len = 10 + 17 * Math.abs(Math.sin(i * 2.1 + idx * 1.3));
        o += '<rect x="' + (x - 5) + '" y="' + (rimY(x, yt) + 2) + '" width="10" height="' + len + '" rx="5" fill="' + ac + '"/>';
      }
    }
    o += '<path d="' + bodyD + '" fill="url(#' + u + 'g)"/></g>';
    o += topTag('fill="' + topFill + '" stroke="rgba(0,0,0,.09)" stroke-width="1"');
    if (st === 'classic') {
      var n1 = Math.round(w / 13), q, px;
      for (q = 0; q < n1; q++) { px = x0 + 7 + q * (w - 14) / (n1 - 1); o += '<circle cx="' + px + '" cy="' + (rimY(px, yt) + 3) + '" r="4.2" fill="' + shade(ic, 0.35) + '" stroke="' + shade(ic, -0.2) + '" stroke-width=".7"/>'; }
      for (q = 0; q < n1; q++) { px = x0 + 7 + q * (w - 14) / (n1 - 1); o += '<circle cx="' + px + '" cy="' + (rimY(px, yb) - 3) + '" r="4.2" fill="' + shade(ic, 0.35) + '" stroke="' + shade(ic, -0.2) + '" stroke-width=".7"/>'; }
    }
    if (st === 'floral') {
      var n2 = Math.max(4, Math.round(w / 27)), r2, qx;
      for (r2 = 0; r2 < n2; r2++) {
        qx = x0 + 13 + r2 * (w - 26) / (n2 - 1);
        if (r2 < n2 - 1) { var mx = qx + (w - 26) / (n2 - 1) / 2; o += '<ellipse cx="' + mx + '" cy="' + (rimY(mx, yt) + 5) + '" rx="6" ry="2.6" fill="#7fae7a" transform="rotate(-18 ' + mx + ' ' + (rimY(mx, yt) + 5) + ')"/>'; }
      }
      for (r2 = 0; r2 < n2; r2++) { qx = x0 + 13 + r2 * (w - 26) / (n2 - 1); o += rosette(qx, rimY(qx, yt) + 4, 7.2, ac); }
      if (isTop) { o += rosette(cx - 13, topCy + 1, 8.5, ac) + rosette(cx + 13, topCy + 1, 8.5, shade(ac, 0.15)) + rosette(cx, topCy - 4, 8.5, ac); }
    }
    if (st === 'fondant' && isTop) o += bow(cx, rimY(cx, yb - 26) + 7, shade(ac, 0.1));
    if (st === 'photo' && isTop) {
      o += topTag('fill="url(#' + u + 'p)" stroke="#fff" stroke-width="2.5"', 0.66);
      o += '<circle cx="' + (cx + w * 0.12) + '" cy="' + (topCy - ky * 0.08) + '" r="' + Math.max(3, w * 0.035) + '" fill="#fff6c9"/>';
    }
    if (st === 'naked' && isTop) {
      o += '<circle cx="' + (cx - w * 0.18) + '" cy="' + (topCy) + '" r="7" fill="#c0392b"/><circle cx="' + (cx + w * 0.02) + '" cy="' + (topCy + 2) + '" r="6" fill="#6a3d9a"/><circle cx="' + (cx + w * 0.2) + '" cy="' + (topCy - 1) + '" r="7" fill="#c0392b"/><circle cx="' + (cx - w * 0.06) + '" cy="' + (topCy - 4) + '" r="5" fill="#7fae7a"/>';
    }
    return { svg: o, topCy: topCy, yt: yt, yb: yb, w: w, h: h, ry: round ? ry : 0 };
  }

  function topperSVG(kind, cx, y, s, wTop) {
    var o = '', i, x;
    if (kind === 'candles') {
      var cols = ['#f2a7b8', '#9fd0e8', '#f7e08c'], off = [-Math.min(22, wTop * 0.2), 0, Math.min(22, wTop * 0.2)];
      for (i = 0; i < 3; i++) {
        x = cx + off[i];
        o += '<rect x="' + (x - 2.4) + '" y="' + (y - 28) + '" width="4.8" height="28" rx="1.6" fill="' + cols[i] + '" stroke="rgba(0,0,0,.15)" stroke-width=".6"/>' +
          '<ellipse cx="' + x + '" cy="' + (y - 34) + '" rx="3.4" ry="5.6" fill="#ffb21e"/><ellipse cx="' + x + '" cy="' + (y - 33) + '" rx="1.5" ry="3" fill="#fff3b0"/>';
      }
    } else if (kind === 'sign') {
      var txt = esc(s.sign || 'Celebrate');
      o += '<line x1="' + cx + '" y1="' + y + '" x2="' + cx + '" y2="' + (y - 34) + '" stroke="#b98e56" stroke-width="2.4" stroke-linecap="round"/>' +
        '<rect x="' + (cx - 38) + '" y="' + (y - 58) + '" width="76" height="26" rx="6" fill="#fff" stroke="#d4a53a" stroke-width="1.5"/>' +
        '<text x="' + cx + '" y="' + (y - 40) + '" text-anchor="middle" font-family="Great Vibes,cursive" font-size="16" fill="#4a1f12">' + txt + '</text>';
    } else if (kind === 'flowers') {
      o += '<ellipse cx="' + (cx - 20) + '" cy="' + (y - 2) + '" rx="8" ry="3" fill="#7fae7a" transform="rotate(-25 ' + (cx - 20) + ' ' + (y - 2) + ')"/><ellipse cx="' + (cx + 26) + '" cy="' + (y - 2) + '" rx="8" ry="3" fill="#7fae7a" transform="rotate(25 ' + (cx + 26) + ' ' + (y - 2) + ')"/>' +
        flower(cx - 12, y - 8, '#ffffff') + flower(cx + 12, y - 10, '#f7c6d9') + flower(cx, y - 18, '#f6e08a');
    } else if (kind === 'figure') {
      o += '<line x1="' + cx + '" y1="' + y + '" x2="' + cx + '" y2="' + (y - 30) + '" stroke="#b98e56" stroke-width="2.4" stroke-linecap="round"/>' +
        '<polygon transform="translate(' + cx + ' ' + (y - 42) + ')" points="0,-15 4.4,-4.8 15,-4.6 6.6,2.4 9.4,13 0,6.6 -9.4,13 -6.6,2.4 -15,-4.6 -4.4,-4.8" fill="#e9b53b" stroke="#b98e56" stroke-width="1.2" stroke-linejoin="round"/>';
    }
    return o;
  }

  function cakeSVG(s, label) {
    var u = 'k' + (++UID), heart = s.shape === 'heart', n = heart ? 1 : (s.tiers || 1), o = [], i;
    o.push('<svg viewBox="0 0 300 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(label || 'Preview of your custom cake') + '">');
    o.push('<defs><linearGradient id="' + u + 'g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".3" stop-color="#fff" stop-opacity=".14"/><stop offset=".7" stop-color="#000" stop-opacity=".02"/><stop offset="1" stop-color="#000" stop-opacity=".27"/></linearGradient>' +
      '<linearGradient id="' + u + 'p" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f6a5b8"/><stop offset=".55" stop-color="#f9c58f"/><stop offset="1" stop-color="#8fc3e8"/></linearGradient></defs>');
    o.push('<ellipse cx="150" cy="269" rx="138" ry="15" fill="#d9c3a8" opacity=".55"/><ellipse cx="150" cy="262" rx="138" ry="15" fill="#fff" stroke="#e6d2bd" stroke-width="2"/><ellipse cx="150" cy="261" rx="116" ry="10" fill="#fbf3ea"/>');
    var textBase = 150, textW = 120, topY = 118, topW = 100;
    if (heart) {
      var bodyFill = s.style === 'naked' ? '#e7c79c' : s.icing, glaze = s.style === 'drip';
      o.push('<g transform="translate(50 66)"><clipPath id="' + u + 'h"><path d="' + HEART + '"/></clipPath>');
      o.push('<path d="' + HEART + '" transform="translate(0 15)" fill="' + shade(bodyFill, -0.28) + '"/>');
      o.push('<path d="' + HEART + '" fill="' + bodyFill + '"/>');
      o.push('<path d="' + HEART + '" fill="url(#' + u + 'g)"/>');
      if (glaze) o.push('<path d="' + HEART + '" transform="translate(100 95) scale(.84) translate(-100 -95)" fill="' + s.accent + '"/>');
      if (s.style === 'classic') o.push('<path d="' + HEART + '" transform="translate(100 98) scale(.93) translate(-100 -98)" fill="none" stroke="' + shade(s.icing, 0.4) + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 10"/>');
      if (s.style === 'floral') o.push('<path d="' + HEART + '" transform="translate(100 98) scale(.92) translate(-100 -98)" fill="none" stroke="' + s.accent + '" stroke-width="13" stroke-linecap="round" stroke-dasharray="0 17"/><path d="' + HEART + '" transform="translate(100 98) scale(.92) translate(-100 -98)" fill="none" stroke="' + shade(s.accent, -0.3) + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="0 17"/>');
      if (s.style === 'fondant') o.push('<path d="' + HEART + '" transform="translate(100 98) scale(.9) translate(-100 -98)" fill="none" stroke="' + s.accent + '" stroke-width="9"/>' + bow(100, 55, shade(s.accent, 0.1)));
      if (s.style === 'photo') o.push('<path d="' + HEART + '" transform="translate(100 96) scale(.6) translate(-100 -96)" fill="url(#' + u + 'p)" stroke="#fff" stroke-width="5"/><circle cx="112" cy="92" r="6" fill="#fff6c9"/>');
      if (s.style === 'naked') o.push('<circle cx="86" cy="64" r="7" fill="#c0392b"/><circle cx="104" cy="70" r="6" fill="#6a3d9a"/><circle cx="118" cy="62" r="7" fill="#c0392b"/><circle cx="100" cy="58" r="5" fill="#7fae7a"/>');
      o.push('</g>');
      textBase = 170; textW = 96; topY = 126; topW = 70;
    } else {
      var wList = n === 1 ? [214] : n === 2 ? [196, 132] : [196, 146, 98], hList = n === 1 ? [118] : n === 2 ? [76, 64] : [58, 50, 44];
      var mult = s.shape === 'rect' ? 1.12 : 1, yb = 256, info = [];
      for (i = 0; i < n; i++) { info.push({ w: wList[i] * mult, h: hList[i], yb: yb, yt: yb - hList[i] }); yb -= hList[i]; }
      var last = null;
      for (i = 0; i < n; i++) { last = tierSVG(s, info[i], i, i === n - 1, u); o.push(last.svg); }
      topY = last.topCy; topW = last.w;
      textBase = last.yt + last.ry + Math.max(15, (last.h - last.ry) * 0.42) + 6; textW = last.w - 22;
    }
    var msg = (s.msg || '').trim();
    if (msg) {
      var bg = s.style === 'drip' || s.style === 'classic' || s.style === 'floral' || s.style === 'fondant' || heart ? s.icing : '#e7c79c';
      if (heart && s.style === 'drip') bg = s.accent;
      var fs = Math.max(9, Math.min(22, textW / (msg.length * 0.4)));
      o.push('<text x="150" y="' + textBase + '" text-anchor="middle" font-family="Great Vibes,cursive" font-size="' + fs.toFixed(1) + '" fill="' + (lum(bg) > 0.62 ? '#4a1f12' : '#ffffff') + '">' + esc(msg) + '</text>');
    }
    if (s.topper && s.topper !== 'none') o.push(topperSVG(s.topper, 150, topY, s, topW));
    o.push('</svg>');
    return o.join('');
  }

  /* ====================== STATE + PRICE ====================== */
  function defaults() {
    return { occasion: 'Birthday', shape: 'round', tiers: 1, kg: 1, flavour: 'Chocolate', filling: 'Chocolate Truffle', style: 'drip', icing: '#fbf1e2', accent: '#5a2e1d', topper: 'candles', msg: '', date: '', slot: 'Evening', mode: 'Pickup', notes: '', name: '', phone: '' };
  }
  function normalise(S) {
    S.tiers = Number(S.tiers) || 1; S.kg = Number(S.kg) || 1;
    if (S.shape === 'heart') S.tiers = 1;
    var minKg = find(TIERS, 'v', S.tiers).min;
    if (S.kg < minKg) S.kg = minKg;
    S.msg = String(S.msg || '').slice(0, 30);
    return S;
  }
  function estimate(S) {
    var f = find(FLAVOURS, 'n', S.flavour), fl = find(FILLINGS, 'n', S.filling), st = find(STYLES, 'id', S.style), sh = find(SHAPES, 'id', S.shape), tp = find(TOPPERS, 'id', S.topper);
    var perKg = f.b + fl.add + st.add + (sh.add || 0);
    var total = perKg * S.kg * TIER_MULT[S.tiers] + tp.flat;
    return Math.round(total / 10) * 10;
  }
  function suggestions(S) {
    var target = estimate(S) * 0.72, fl = find(FLAVOURS, 'n', S.flavour);
    return CAKES.map(function (c) {
      var est = c.p * S.kg * 2, name = c.n.toLowerCase(), match = fl.k.some(function (k) { return name.indexOf(k) > -1; });
      var score = Math.abs(est - target) / Math.max(target, 1) - (match ? 0.7 : 0) - (c.f === S.filling ? 0.35 : 0);
      return { c: c, est: est, score: score };
    }).sort(function (a, b) { return a.score - b.score; }).slice(0, 3);
  }
  function waText(S) {
    var f = find(FILLINGS, 'n', S.filling), L = [];
    L.push('Hi Varyzon, I would like to order a custom cake.', '');
    L.push('Name: ' + S.name + ' (' + S.phone + ')');
    L.push('Occasion: ' + S.occasion);
    L.push('Shape: ' + find(SHAPES, 'id', S.shape).n + ' | ' + S.tiers + (S.tiers > 1 ? ' tiers' : ' tier') + ' | ' + kgText(S.kg) + ' (serves ~' + serves(S.kg) + ')');
    L.push('Flavour: ' + S.flavour + ' | Filling: ' + f.n);
    L.push('Design: ' + find(STYLES, 'id', S.style).n);
    L.push('Icing colour: ' + find(COLORS, 'c', S.icing).n + ' | Accent: ' + find(COLORS, 'c', S.accent).n);
    L.push('Topper: ' + find(TOPPERS, 'id', S.topper).n);
    if (S.msg) L.push('Message on cake: "' + S.msg + '"');
    L.push((S.date ? 'Needed on: ' + S.date + ' (' + S.slot + ')' : 'Date: to be confirmed') + ' | ' + S.mode);
    if (S.notes) L.push('Notes: ' + S.notes);
    L.push('', 'Estimated: about ' + inr(estimate(S)) + ' (please confirm final price).');
    return L.join('\n');
  }
  function shapeIcon(id) {
    var m = {
      round: '<circle cx="16" cy="16" r="12"/>', square: '<rect x="5" y="5" width="22" height="22" rx="3"/>',
      rect: '<rect x="2" y="8" width="28" height="16" rx="3"/>', heart: '<path d="M16 28C4 19 3 10 9 7C13 5 16 8 16 10C16 8 19 5 23 7C29 10 28 19 16 28Z"/>'
    };
    return '<svg width="30" height="30" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' + m[id] + '</svg>';
  }

  /* ====================== CUSTOMISE FORM (popup) ====================== */
  /* Same flow as the home-page popup: fill the form -> top 3 cake picks -> order on WhatsApp.
     Photos come from images/products/<cake-name>.jpg (falls back to the stock photo if a file is missing). */
  var FORM_OCC = ['Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Corporate / Office', 'Just Because'];
  var FORM_WT = [['0.5', '500 gms'], ['1', '1 kg'], ['1.5', '1.5 kg'], ['2', '2 kg'], ['3', '3 kg']];
  var FORM_BUD = [['0-Infinity', 'Any budget'], ['0-800', 'Up to \u20B9800'], ['800-1500', '\u20B9800 \u2013 \u20B91,500'], ['1500-2500', '\u20B91,500 \u2013 \u20B92,500'], ['2500-Infinity', '\u20B92,500 & above']];

  function top3(fill, kg, lo, hi) {
    var list = CAKES.filter(function (c) { return c.f === fill; }).map(function (c) { return Object.assign({}, c, { est: c.p * kg * 2 }); }).sort(function (a, b) { return a.est - b.est; });
    var ok = list.filter(function (c) { return c.est >= lo && c.est <= hi; }), pick = [];
    if (ok.length >= 3) pick = [ok[0], ok[Math.floor((ok.length - 1) / 2)], ok[ok.length - 1]];
    else {
      pick = ok.slice();
      var mid = isFinite(hi) ? (lo + hi) / 2 : (lo * 1.2 || 0);
      list.filter(function (c) { return pick.indexOf(c) < 0; }).sort(function (a, b) { return Math.abs(a.est - mid) - Math.abs(b.est - mid); })
        .forEach(function (c) { if (pick.length < 3) pick.push(c); });
      pick.sort(function (a, b) { return a.est - b.est; });
    }
    return pick;
  }

  function Form(root) {
    var self = this, uid = 'cf' + (++UID);
    this.root = root; this.uid = uid;
    root.classList.add('cust-form'); if (!root.closest('.modal')) root.classList.add('cb-inline');
    function opts(list, sel) { return list.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''); }
    root.innerHTML =
      '<div class="cust-pane" data-pane="1">' +
        '<div class="kicker">Make it yours</div><h3 class="cf-title">Customise Your Cake</h3>' +
        '<p class="lead-s">Tell us what you have in mind and we will show you our top 3 cake picks for you.</p>' +
        '<form novalidate><div class="row g-3">' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'n">Your name</label><input class="form-control" id="' + uid + 'n" data-f="name" autocomplete="name" placeholder="Your name" required></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'p">Phone number</label><input class="form-control" id="' + uid + 'p" data-f="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile number" pattern="[0-9+ ]{10,14}" required></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'o">Occasion</label><select class="form-select" id="' + uid + 'o" data-f="occ" required><option value="">Select occasion</option>' + opts(FORM_OCC) + '</select></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'f">Favourite filling</label><select class="form-select" id="' + uid + 'f" data-f="fill" required>' + opts(FILLINGS.map(function (x) { return x.n; })) + '</select></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'w">Cake weight</label><select class="form-select" id="' + uid + 'w" data-f="wt" required>' + opts(FORM_WT, '1') + '</select></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'b">Budget</label><select class="form-select" id="' + uid + 'b" data-f="bud" required>' + opts(FORM_BUD) + '</select></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'd">Date needed</label><input class="form-control" id="' + uid + 'd" data-f="date" type="date"></div>' +
          '<div class="col-md-6"><label class="fl" for="' + uid + 'm">Message on cake (optional)</label><input class="form-control" id="' + uid + 'm" data-f="msg" maxlength="40" placeholder="e.g. Happy Birthday Riya"></div>' +
          '<div class="col-12"><label class="fl" for="' + uid + 't">Design ideas / special notes</label><textarea class="form-control" id="' + uid + 't" data-f="note" rows="2" placeholder="Theme, colours, eggless, photo cake, etc."></textarea></div>' +
          '<div class="col-12 text-center"><button type="submit" class="btn btn-gold px-5">Show My 3 Cake Options</button></div>' +
        '</div></form>' +
      '</div>' +
      '<div class="cust-pane" data-pane="2" hidden>' +
        '<div class="kicker">Picked for you</div><h3 class="cf-title">Your Top 3 Cake Options</h3>' +
        '<div class="sum-chips" data-r="sum"></div><div class="row g-4" data-r="res"></div>' +
        '<div class="text-center mt-4 d-flex flex-wrap justify-content-center gap-3">' +
          '<button type="button" class="btn btn-line" data-r="back">Change Details</button>' +
          '<a class="btn btn-choc" data-r="all" href="#" target="_blank" rel="noopener">Send Details on WhatsApp</a></div>' +
        '<p class="cm-note-f">Prices are estimates based on weight. Final price depends on design. Please confirm with us.</p>' +
      '</div>';
    this.q = function (s) { return root.querySelector(s); };
    this.f = function (k) { return root.querySelector('[data-f=' + k + ']'); };
    this.p1 = this.q('[data-pane="1"]'); this.p2 = this.q('[data-pane="2"]');
    this.q('form').addEventListener('submit', function (e) { e.preventDefault(); self.submit(); });
    this.q('[data-r=back]').addEventListener('click', function () { self.show(1); });
    this.reset();
  }
  Form.prototype.reset = function () { this.show(1); this.f('date').min = todayStr(); };
  Form.prototype.show = function (n) {
    this.p1.hidden = n !== 1; this.p2.hidden = n !== 2;
    var mb = this.root.closest('.modal-body'); if (mb) mb.scrollTop = 0;
  };
  Form.prototype.preset = function (p) {
    p = p || {};
    if (p.filling && FILLINGS.some(function (x) { return x.n === p.filling; })) this.f('fill').value = p.filling;
    if (p.occasion && FORM_OCC.indexOf(p.occasion) > -1) this.f('occ').value = p.occasion;
    if (p.kg && FORM_WT.some(function (x) { return x[0] === String(p.kg); })) this.f('wt').value = String(p.kg);
    this.reset();
  };
  Form.prototype.submit = function () {
    var form = this.q('form'); if (!form.checkValidity()) { form.reportValidity(); return; }
    var self = this, v = function (k) { return self.f(k).value.trim(); };
    var kg = parseFloat(v('wt')), range = v('bud').split('-').map(Number), lo = range[0], hi = range[1], fill = v('fill');
    var cakes = top3(fill, kg, lo, hi), wt = kgText(kg);
    this.q('[data-r=sum]').innerHTML = [v('occ'), fill, wt, this.f('bud').selectedOptions[0].text].map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    var base = 'Hi Varyzon, I am ' + v('name') + ' (' + v('phone') + '). Occasion: ' + v('occ') + '. Filling: ' + fill + '. Weight: ' + wt + '.' +
      (v('date') ? ' Needed on: ' + v('date') + '.' : '') + (v('msg') ? ' Message on cake: ' + v('msg') + '.' : '') + (v('note') ? ' Notes: ' + v('note') + '.' : '');
    var res = this.q('[data-r=res]');
    res.innerHTML = cakes.map(function (c, n) {
      var msg = base + ' I like the "' + c.n + '" (approx. ' + inr(c.est) + '). Please confirm availability.';
      return '<div class="col-md-4"><div class="rcard"><span class="rank">' + (n + 1) + '</span>' +
        '<img src="images/products/' + slug(c.n) + '.jpg" data-fb="' + c.i + '" alt="' + esc(c.n) + '">' +
        '<div class="rb"><span class="rt">' + esc(c.c) + '</span><h4>' + esc(c.n) + '</h4><div class="rp">' + inr(c.est) + '</div>' +
        '<small>Approx. for ' + wt + ' &middot; ' + esc(fill) + ' filling</small>' +
        '<a class="btn btn-choc" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '">Order This</a></div></div></div>';
    }).join('');
    res.querySelectorAll('img').forEach(function (m) {
      m.addEventListener('error', function () { var u = 'https://images.unsplash.com/' + m.dataset.fb + '?auto=format&fit=crop&w=600&q=75'; if (m.src !== u && m.src !== FB) m.src = u; else m.src = FB; }, { once: true });
    });
    this.q('[data-r=all]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(base + ' Options shown: ' + cakes.map(function (c) { return c.n; }).join(', ') + '.');
    this.show(2);
  };

  /* ====================== PAGE WIRING ====================== */
  var inline = null, modalBuilder = null, modalEl = null;

  function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade cust-modal'; modalEl.id = 'custModal'; modalEl.tabIndex = -1; modalEl.setAttribute('aria-label', 'Customise your cake'); modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg modal-fullscreen-sm-down"><div class="modal-content"><div class="modal-body">' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
      '<div id="custBuilderModal"></div></div></div></div>';
    document.body.appendChild(modalEl);
    modalBuilder = new Form(modalEl.querySelector('#custBuilderModal'));
    modalEl.addEventListener('show.bs.modal', function () { fab && fab.classList.add('hide'); });
    modalEl.addEventListener('hidden.bs.modal', function () { fab && fab.classList.remove('hide'); });
  }
  function open(preset) {
    if (inline) { inline.preset(preset); var r = document.getElementById('customBuilder'); r.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (!window.bootstrap) return;
    ensureModal(); modalBuilder.reset(); modalBuilder.preset(preset);
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  var fab = null;
  function init() {
    var mount = document.getElementById('customBuilder');
    if (mount) {
      inline = new Form(mount);
      var q = new URLSearchParams(location.search), p = {};
      ['occasion', 'filling', 'flavour', 'style', 'shape', 'kg'].forEach(function (k) { if (q.get(k)) p[k] = q.get(k); });
      if (Object.keys(p).length) inline.preset(p);
    } else {
      fab = document.createElement('button');
      fab.type = 'button'; fab.className = 'fab-custom'; fab.setAttribute('aria-label', 'Customise your cake');
      fab.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>Customise Your Cake</span>';
      fab.addEventListener('click', function () { open(); });
      document.body.appendChild(fab);
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-customize]'); if (!t) return;
      e.preventDefault();
      var p = {}; ['occasion', 'filling', 'flavour', 'style', 'shape', 'kg'].forEach(function (k) { if (t.dataset[k]) p[k] = t.dataset[k]; });
      open(Object.keys(p).length ? p : null);
    });

    /* animated demo cakes (promo bands + home feature) */
    var DEMOS = [
      { n: 'Chocolate Drip', s: { shape: 'round', tiers: 1, style: 'drip', icing: '#fbf1e2', accent: '#5a2e1d', topper: 'candles', msg: 'Happy Birthday' } },
      { n: 'Floral Piping', s: { shape: 'round', tiers: 2, style: 'floral', icing: '#f4c6c6', accent: '#e58ea3', topper: 'flowers', msg: 'Congratulations' } },
      { n: 'Heart Cake', s: { shape: 'heart', tiers: 1, style: 'classic', icing: '#e58ea3', accent: '#ffffff', topper: 'none', msg: 'Love You' } },
      { n: 'Fondant Tiers', s: { shape: 'round', tiers: 3, style: 'fondant', icing: '#ffffff', accent: '#d4c3ee', topper: 'figure', msg: 'Mr & Mrs' } },
      { n: 'Semi-Naked', s: { shape: 'square', tiers: 1, style: 'naked', icing: '#fbf1e2', accent: '#d4a53a', topper: 'sign', msg: '', sign: 'Anniversary' } }
    ];
    var demos = [].slice.call(document.querySelectorAll('[data-cake-demo]'));
    if (demos.length) {
      var idx = 0, still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var paint = function () {
        var d = DEMOS[idx % DEMOS.length];
        demos.forEach(function (el) {
          var box = el.querySelector('.cp-svg'), tag = el.querySelector('.cp-tag');
          if (box) box.innerHTML = cakeSVG(d.s, d.n + ' cake example');
          if (tag) tag.textContent = d.n;
        });
      };
      paint();
      if (!still) setInterval(function () { if (document.hidden) return; idx++; paint(); }, 3200);
    }
  }
  window.Varyzon = window.Varyzon || {};
  window.Varyzon.customize = { open: open };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
