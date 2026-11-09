(function () {
var CFG = window.VZ_FIREBASE || { configured: false, config: {}, whatsapp: "919082192602" };
var WHATSAPP = CFG.whatsapp, isConfigured = !!CFG.configured, FS = null, dbP = null;
var V = "https://www.gstatic.com/firebasejs/10.12.2/";
function getDb() {
  if (!isConfigured) return Promise.resolve(null);
  if (!dbP) dbP = Promise.all([import(V + "firebase-app.js"), import(V + "firebase-firestore.js")]).then(function (m) { FS = m[1]; return FS.getFirestore(m[0].initializeApp(CFG.config)); }).catch(function (e) { console.error("Firebase load failed", e); return null; });
  return dbP;
}
if (!isConfigured) console.warn("[Varyzon] firebase-config.js is not filled in yet - leads are kept in this browser only.");

var CART_KEY = "varyzon_cart_v1";
var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
var inr = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };
var today = function () { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
var page = function () { return (location.pathname.split("/").pop() || "index.html"); };

/* ---------- save ---------- */
async function save(col, data) {
  data.status = "new"; data.page = page();
  var db = await getDb();
  if (db) { data.createdAt = FS.serverTimestamp(); await FS.addDoc(FS.collection(db, col), data); return; }
  data.createdAt = new Date().toISOString();
  try { var k = "varyzon_pending_" + col, a = JSON.parse(localStorage.getItem(k) || "[]"); a.push(data); localStorage.setItem(k, JSON.stringify(a)); } catch (e) {}
}

/* ---------- modal shell ---------- */
var el, body, bs;
function shell() {
  if (el) return;
  el = document.createElement("div");
  el.className = "modal fade vz-modal"; el.id = "vzModal"; el.tabIndex = -1; el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div class="modal-content"><div class="modal-body">' +
    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button><div id="vzBody"></div></div></div></div>';
  document.body.appendChild(el);
  body = el.querySelector("#vzBody");
}
function show(html) {
  shell(); body.innerHTML = html;
  bs = window.bootstrap.Modal.getOrCreateInstance(el); bs.show();
  var f = body.querySelector("input:not([type=hidden]):not(.vz-hp),select,textarea"); if (f) setTimeout(function () { f.focus(); }, 400);
  return body;
}
function waUrl(text) { return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text); }

function head(icon, title, sub) {
  return '<div class="vz-head"><span class="vz-ic"><i class="fa-solid ' + icon + '"></i></span><h3>' + esc(title) + "</h3>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div>";
}
function field(label, id, extra, col) {
  return '<div class="' + (col || "col-md-6") + '"><label class="vz-fl" for="' + id + '">' + label + "</label>" + extra + "</div>";
}
var NAME = function (p) { return field("Your name *", "vzName", '<input class="form-control" id="vzName" name="name" required maxlength="100" autocomplete="name" placeholder="Your name"' + (p ? ' value="' + esc(p) + '"' : "") + ">"); };
var PHONE = function (p) { return field("Phone number *", "vzPhone", '<input class="form-control" id="vzPhone" name="phone" type="tel" inputmode="tel" required pattern="[0-9+ ]{10,14}" maxlength="14" autocomplete="tel" placeholder="10-digit mobile number"' + (p ? ' value="' + esc(p) + '"' : "") + ">"); };
var HP = '<input type="text" name="website" class="vz-hp" tabindex="-1" autocomplete="off" aria-hidden="true">';

function submitBtn(label) { return '<div class="col-12"><button class="btn btn-choc w-100" type="submit"><span class="vz-lbl">' + label + '</span><span class="vz-spin spinner-border spinner-border-sm ms-2 d-none"></span></button><div class="vz-err d-none" role="alert"></div></div>'; }

/* generic wiring: validate, save, call done(data) */
function wire(form, col, build, done) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
    if (form.website && form.website.value) return;           /* bot */
    var btn = form.querySelector("button[type=submit]"), err = form.querySelector(".vz-err");
    btn.disabled = true; btn.querySelector(".vz-spin").classList.remove("d-none"); err.classList.add("d-none");
    var data = build(form);
    try { await save(col, data); done(data); }
    catch (x) {
      console.error(x); btn.disabled = false; btn.querySelector(".vz-spin").classList.add("d-none");
      err.textContent = "Could not send right now. Please try again or message us on WhatsApp."; err.classList.remove("d-none");
    }
  });
}
var val = function (f, n) { var x = f.elements.namedItem(n); return x && x.value ? x.value.trim() : ""; };

function success(title, msg, waText, extra) {
  body.innerHTML = '<div class="vz-ok"><span class="vz-tick"><i class="fa-solid fa-check"></i></span><h3>' + esc(title) + "</h3><p>" + esc(msg) + "</p>" +
    (extra || "") +
    '<div class="d-grid gap-2 mt-3"><a class="btn btn-gold" target="_blank" rel="noopener" href="' + waUrl(waText) + '"><i class="fa-brands fa-whatsapp"></i>Also message us on WhatsApp</a>' +
    '<button type="button" class="btn btn-line" data-bs-dismiss="modal">Close</button></div></div>';
}

/* ---------- 1. Place an order ---------- */
function orderPopup(preset) {
  preset = preset || {};
  var b = show(head("fa-bag-shopping", "Place an Order", "Tell us what you'd like - we'll confirm price & availability shortly.") +
    '<form class="row g-3 vz-form" novalidate>' + HP + NAME(preset.name) + PHONE(preset.phone) +
    field("What would you like?", "vzItem", '<input class="form-control" id="vzItem" name="item" maxlength="120" placeholder="e.g. Rasmalai Cake, 1 kg"' + (preset.item ? ' value="' + esc(preset.item) + '"' : "") + ">") +
    field("Occasion", "vzOcc", '<select class="form-select" id="vzOcc" name="occasion"><option value="">Select</option><option>Birthday</option><option>Anniversary</option><option>Wedding</option><option>Baby Shower</option><option>Corporate / Office</option><option>Just Because</option><option>Other</option></select>') +
    field("Weight", "vzKg", '<select class="form-select" id="vzKg" name="weight"><option value="">Select</option><option>500 gms</option><option>1 kg</option><option>1.5 kg</option><option>2 kg</option><option>3 kg+</option></select>') +
    field("Date needed", "vzDate", '<input class="form-control" id="vzDate" name="date" type="date" min="' + today() + '">') +
    field("Pickup or delivery", "vzMode", '<select class="form-select" id="vzMode" name="mode"><option>Pickup from shop</option><option>Home delivery</option></select>', "col-12") +
    field("Message on cake / notes", "vzMsg", '<textarea class="form-control" id="vzMsg" name="message" rows="3" maxlength="600" placeholder="Flavour, filling, design, message on cake..."></textarea>', "col-12") +
    submitBtn("Send Order Request") + "</form>");
  wire(b.querySelector("form"), "orders", function (f) {
    return { type: "order", name: val(f, "name"), phone: val(f, "phone"), item: val(f, "item"), occasion: val(f, "occasion"), weight: val(f, "weight"), date: val(f, "date"), mode: val(f, "mode"), message: val(f, "message") };
  }, function (d) {
    success("Order request received!", "Thank you, " + d.name + ". Our team will call you shortly to confirm.",
      "Hi Varyzon, I am " + d.name + " (" + d.phone + "). I'd like to order " + (d.item || "a cake") + (d.weight ? ", " + d.weight : "") + (d.date ? " for " + d.date : "") + ". " + d.message);
  });
}

/* ---------- 2. Enquiry (replaces the form that went straight to WhatsApp) ---------- */
function enquiryFromForm(form) {
  var g = function (id) { var x = form.querySelector("#" + id); return x ? x.value.trim() : ""; };
  var d = { type: "enquiry", name: g("cName"), phone: g("cPhone"), occasion: g("cOcc"), date: g("cDate"), message: g("cMsg") };
  show(head("fa-envelope-open-text", "Sending your enquiry...", ""));
  save("enquiries", d).then(function () {
    success("Enquiry sent!", "Thank you, " + d.name + ". We'll get back to you very soon.",
      "Hi Varyzon, I am " + d.name + " (" + d.phone + "). " + (d.occasion ? "Occasion: " + d.occasion + ". " : "") + (d.date ? "Date: " + d.date + ". " : "") + d.message);
    form.reset();
  }).catch(function (e) {
    console.error(e);
    body.innerHTML = head("fa-triangle-exclamation", "Couldn't send", "Please try again, or message us on WhatsApp.") +
      '<div class="d-grid gap-2"><a class="btn btn-gold" target="_blank" rel="noopener" href="' + waUrl("Hi Varyzon, I am " + d.name + " (" + d.phone + "). " + d.message) + '"><i class="fa-brands fa-whatsapp"></i>Open WhatsApp</a><button class="btn btn-line" data-bs-dismiss="modal">Close</button></div>';
  });
}

/* ---------- 3. Call us / request a callback ---------- */
function callPopup() {
  var b = show(head("fa-phone-volume", "Talk to Varyzon", "Call us now or leave your number and we'll call you back.") +
    '<a class="btn btn-gold w-100 mb-3" href="tel:+' + WHATSAPP + '"><i class="fa-solid fa-phone"></i>Call +91 90821 92602</a>' +
    '<div class="vz-or"><span>or request a callback</span></div>' +
    '<form class="row g-3 vz-form" novalidate>' + HP + NAME() + PHONE() +
    field("Best time to call", "vzTime", '<select class="form-select" id="vzTime" name="time"><option>Anytime</option><option>Morning (9 - 12)</option><option>Afternoon (12 - 4)</option><option>Evening (4 - 9)</option></select>', "col-12") +
    submitBtn("Request Callback") + "</form>");
  wire(b.querySelector("form"), "callbacks", function (f) {
    return { type: "callback", name: val(f, "name"), phone: val(f, "phone"), time: val(f, "time") };
  }, function (d) {
    success("We'll call you back!", "Thanks " + d.name + " - expect a call from us (" + d.time.toLowerCase() + ").", "Hi Varyzon, please call me back on " + d.phone + ". - " + d.name);
  });
}

/* ---------- 4. WhatsApp buttons -> quick enquiry popup ---------- */
function quickPopup() {
  var b = show(head("fa-brands fa-whatsapp", "Chat with Varyzon", "Share your details and what you need - then continue on WhatsApp.") +
    '<form class="row g-3 vz-form" novalidate>' + HP + NAME() + PHONE() +
    field("How can we help?", "vzMsg", '<textarea class="form-control" id="vzMsg" name="message" rows="3" maxlength="600" placeholder="e.g. 1 kg chocolate truffle cake for Saturday"></textarea>', "col-12") +
    submitBtn("Continue") + "</form>");
  wire(b.querySelector("form"), "enquiries", function (f) {
    return { type: "enquiry", name: val(f, "name"), phone: val(f, "phone"), message: val(f, "message") };
  }, function (d) {
    success("Thanks, " + d.name + "!", "Your details are saved. Tap below to continue the chat on WhatsApp.", "Hi Varyzon, I am " + d.name + " (" + d.phone + "). " + (d.message || "I'd like to order a cake."));
  });
}

/* ---------- 5. Cart checkout ---------- */
function cartPopup() {
  var cart = {}; try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) {}
  var keys = Object.keys(cart); if (!keys.length) return;
  var oc = document.getElementById("cartDrawer"); if (oc && window.bootstrap) { var oi = window.bootstrap.Offcanvas.getInstance(oc); if (oi) oi.hide(); }
  var total = keys.reduce(function (n, k) { return n + cart[k].qty * cart[k].price; }, 0);
  var rows = keys.map(function (k) { var i = cart[k]; return "<li><span>" + esc(i.name) + " <small>&times; " + i.qty + "</small></span><b>" + inr(i.price * i.qty) + "</b></li>"; }).join("");
  var b = show(head("fa-cart-shopping", "Confirm Your Order", "Add your details and we'll confirm availability & delivery.") +
    '<ul class="vz-sum">' + rows + '<li class="tot"><span>Total (approx.)</span><b>' + inr(total) + "</b></li></ul>" +
    '<form class="row g-3 vz-form" novalidate>' + HP + NAME() + PHONE() +
    field("Date needed", "vzDate", '<input class="form-control" id="vzDate" name="date" type="date" min="' + today() + '">') +
    field("Pickup or delivery", "vzMode", '<select class="form-select" id="vzMode" name="mode"><option>Pickup from shop</option><option>Home delivery</option></select>') +
    field("Delivery address / notes", "vzMsg", '<textarea class="form-control" id="vzMsg" name="message" rows="2" maxlength="600" placeholder="Address, message on cake, etc."></textarea>', "col-12") +
    submitBtn("Place Order") + "</form>");
  wire(b.querySelector("form"), "orders", function (f) {
    return { type: "cart-order", name: val(f, "name"), phone: val(f, "phone"), date: val(f, "date"), mode: val(f, "mode"), message: val(f, "message"),
      items: keys.map(function (k) { return { name: cart[k].name, unit: cart[k].unit || "", qty: cart[k].qty, price: cart[k].price }; }), total: total, item: keys.length + " item(s)" };
  }, function (d) {
    var lines = d.items.map(function (i, n) { return (n + 1) + ". " + i.name + " (" + i.unit + ") x " + i.qty + " = " + inr(i.price * i.qty); });
    success("Order placed!", "Thank you, " + d.name + ". We'll call you to confirm.",
      "Hi Varyzon, I'm " + d.name + " (" + d.phone + "). I'd like to order:\n\n" + lines.join("\n") + "\n\nTotal: " + inr(d.total) + (d.date ? "\nDate: " + d.date : "") + "\n" + d.mode + (d.message ? "\n" + d.message : ""));
    try { localStorage.removeItem(CART_KEY); window.dispatchEvent(new StorageEvent("storage", { key: CART_KEY })); document.querySelectorAll(".cart-count").forEach(function (c) { c.textContent = "0"; c.classList.remove("has"); }); } catch (e) {}
  });
}

/* ---------- global click / submit routing ---------- */
var ORDER_SEL = 'a.btn[href="contact.html"], a.btn[href="#contact"], a.btn[href="#order"], a.btn-order, button.btn-order, [data-order-popup]';
var WA_SEL = 'a.fab.wa, a.btn[href^="https://wa.me/"]';
var CALL_SEL = 'a.btn[href^="tel:"]';

document.addEventListener("click", function (e) {
  if (e.target.closest("#vzModal")) return;
  if (e.target.closest("#custModal a[href*='wa.me']")) {                 /* customise-cake result: log the lead, let WhatsApp open */
    var a = e.target.closest("a"), t = ""; try { t = decodeURIComponent((a.href.split("text=")[1] || "")); } catch (x) {}
    save("customizations", { type: "customization", name: "Website visitor", phone: "-", message: t.slice(0, 1500) }).catch(function () {});
    return;
  }
  var cartBtn = e.target.closest("#cartOrder");
  if (cartBtn) { e.preventDefault(); e.stopImmediatePropagation(); cartPopup(); return; }
  var a2 = e.target.closest(ORDER_SEL);
  if (a2) { e.preventDefault(); orderPopup(); return; }
  var c = e.target.closest(CALL_SEL);
  if (c) { e.preventDefault(); callPopup(); return; }
  var w = e.target.closest(WA_SEL);
  if (w) { e.preventDefault(); quickPopup(); }
}, true);

document.addEventListener("submit", function (e) {
  if (e.target.id === "cForm") { e.preventDefault(); e.stopImmediatePropagation(); enquiryFromForm(e.target); }
}, true);

window.Varyzon = window.Varyzon || {};
window.Varyzon.popups = { order: orderPopup, call: callPopup, chat: quickPopup, cart: cartPopup };
})();
