/**
 * Elio — Orders (Google Apps Script)
 * ---------------------------------------------------------------------
 * 1) RECEIVES orders POSTed from the side-cart checkout in shop-ui.js
 *    (SITE_CONFIG.orderSync) and writes one row per order into the
 *    "الأوردرات" sheet, matching the Order Tracker layout (Elio_Orders.xlsx).
 *
 * 2) SERVES the private orders page (orders-....html): lists the orders and
 *    changes an order's status / shipping info. Every one of these requests
 *    must carry the admin password. The password is checked HERE (on
 *    Google's side), and it is stored in Script Properties — never in this
 *    file and never in the website — so uploading the website to GitHub
 *    can't leak it.
 *
 * Column layout (must match the sheet's header row exactly):
 *   A  #                         (has its own formula already — never write here)
 *   B  تاريخ الطلب
 *   C  المنتجات
 *   D  اسم العميل
 *   E  رقم التليفون
 *   F  الإيميل
 *   G  العنوان
 *   H  الكمية
 *   I  المبلغ (EGP)
 *   J  الحالة                    (set to "طلب جديد" automatically)
 *   K  تاريخ التسليم المتوقع     (filled in manually, in the sheet)
 *   L  آخر تحديث                 (set automatically when the orders page changes the order)
 *   M  تاريخ الشحن               (set automatically when status becomes "تم الشحن")
 *   N  تاريخ الوصول              (set automatically when status becomes "تم التسليم")
 *   O  شركة الشحن                (editable from the orders page)
 *   P  رقم التتبع                (editable from the orders page)
 *   Q  ملاحظات                   (the customer's own checkout notes)
 *
 * SETUP: see GOOGLE_SHEETS_SETUP.md in this folder.
 * After ANY change to this file: Deploy → Manage deployments → ✏️ Edit →
 * Version: "New version" → Deploy. (The Web app URL stays the same.)
 * ---------------------------------------------------------------------
 */

var SHEET_NAME = "الأوردرات";
var DATA_FIRST_ROW = 8;   // row 7 is the header, data starts at row 8
var DEFAULT_STATUS = "طلب جديد";
var STATUSES = ["طلب جديد", "جاري التجهيز", "جاهز للشحن", "تم الشحن", "في الطريق", "تم التسليم"];
var TZ = "Africa/Cairo";
// ---- Customer confirmation e-mail (sent after an order is saved) -------------
var SEND_CUSTOMER_EMAIL = true;           // false = turn the e-mail off
var SHOP_NAME = "Elio";
var SHOP_WHATSAPP = "+201041403100";      // shown in the e-mail so the customer can reach you
var SHOP_URL = "https://elioderma.com";  // your website (shown in the e-mail footer; "" to hide)
var LOGO_URL = "https://elioderma.com/img/logo.png";   // logo at the top of the e-mail ("" = shop name as text)
var REPLY_TO = "";                        // optional: where the customer's replies go (your e-mail)
var TEST_EMAIL_TO = "";                   // only for testCustomerEmail(): type YOUR e-mail here

var API_VERSION = 2;      // the orders page checks this before sending anything

// OPTIONAL — the easiest way to set the password: type it between the quotes
// below, INSIDE THE APPS SCRIPT EDITOR (then Deploy → New version).
// Do NOT save the password in the copy of this file on your PC / GitHub.
// If left empty, the script uses the Script property ADMIN_PASSWORD instead.
var ADMIN_PASSWORD_LOCAL = "";

/* ------------------------------------------------------------------ */
/*  Entry points                                                       */
/* ------------------------------------------------------------------ */

// GET is a harmless health check (no data is returned).
function doGet() {
  return json_({ status: "ok", app: "elio-orders", version: API_VERSION, hasPassword: !!adminPassword_() });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    // Requests from the orders page carry an "action"; a checkout does not.
    if (data && data.action) return json_(handleAdmin_(data));
    return json_(handleNewOrder_(data));
  } catch (err) {
    return json_({ status: "error", message: err.toString() });
  }
}

/* ------------------------------------------------------------------ */
/*  1) New order from the website                                      */
/* ------------------------------------------------------------------ */

function handleNewOrder_(data) {
  var res = writeOrder_(data);               // the order is saved first (and the lock released)...
  try { sendCustomerEmail_(data, res.row - (DATA_FIRST_ROW - 1)); }   // ...then the e-mail.
  catch (err) { /* an e-mail problem must never lose or fail an order */ }
  return res;
}

function writeOrder_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);          // two orders at the same second must not share a row
  try {
    var sheet = getSheet_();
    var c = data.customer || {};

    var itemsText = (data.items || []).map(function (it) {
      var price = (it.unitPrice === null || it.unitPrice === undefined)
        ? "price on request"
        : it.unitPrice;
      return it.name + " (" + it.brand + ") x" + it.qty + " — " + price;
    }).join("\n");

    var qtyTotal = (data.items || []).reduce(function (sum, it) {
      return sum + (Number(it.qty) || 0);
    }, 0);

    var row = nextEmptyRow_(sheet);

    // Text columns (C..G and Q) are stored as plain text: this keeps the
    // leading 0 of phone numbers and stops a customer from sneaking a
    // formula (=...) into the sheet through the checkout form.
    sheet.getRange(row, 3, 1, 5).setNumberFormat("@");
    sheet.getRange(row, 17).setNumberFormat("@");

    // Columns B..Q (16 values) — column A already carries its own
    // auto-numbering formula and is never written here.
    sheet.getRange(row, 2, 1, 16).setValues([[
      new Date(data.timestamp || Date.now()), // B تاريخ الطلب
      itemsText,                              // C المنتجات
      c.name || "",                           // D اسم العميل
      c.phone || "",                          // E رقم التليفون
      c.email || "",                          // F الإيميل
      c.address || "",                        // G العنوان
      qtyTotal,                               // H الكمية
      data.total || 0,                        // I المبلغ (EGP)
      DEFAULT_STATUS,                         // J الحالة
      "",                                     // K تاريخ التسليم المتوقع
      "",                                     // L آخر تحديث
      "",                                     // M تاريخ الشحن
      "",                                     // N تاريخ الوصول
      "",                                     // O شركة الشحن
      "",                                     // P رقم التتبع
      c.notes || ""                           // Q ملاحظات
    ]]);

    // Make sure the "#" auto-numbering formula exists on this row too,
    // in case it's beyond the sheet's pre-filled range.
    sheet.getRange(row, 1).setFormula(
      '=IF($B' + row + '="","",ROW()-' + (DATA_FIRST_ROW - 1) + ')'
    );

    SpreadsheetApp.flush();
    return { status: "success", row: row };
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/*  Customer confirmation e-mail                                       */
/* ------------------------------------------------------------------ */

function sendCustomerEmail_(data, n) {
  var c = data.customer || {};
  var to = String(c.email || "").trim();
  if (!SEND_CUSTOMER_EMAIL || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(to)) return;
  var ar = data.lang !== "en";
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  };
  var money = function (v) { return String(Math.round(Number(v) * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (ar ? " ج.م" : " EGP"); };
  var al = ar ? "right" : "left", ol = ar ? "left" : "right";
  var T = ar
    ? { sub: "تأكيد استلام طلبك رقم #" + n + " من " + SHOP_NAME, hi: "أهلاً " + (c.name || "") + "،",
        h: "تم استلام طلبك بنجاح", badge: "طلب رقم #" + n,
        intro: "شكرًا ليك! وصلنا طلبك وفريقنا بدأ يراجعه. هنتواصل معاك على واتساب لتأكيد التفاصيل والشحن.",
        pre: "وصلنا طلبك رقم #" + n + " بإجمالي " + money(data.total || 0),
        p: "ملخص الطلب", req: "السعر عند الطلب", disc: "الخصم", tot: "إجمالي الطلب",
        unp: "الإجمالي لا يشمل المنتجات اللي سعرها عند الطلب.",
        d: "بيانات التوصيل", nm: "الاسم", ph: "التليفون", ad: "العنوان", no: "ملاحظاتك",
        cta: "كلمنا على واتساب", wam: "أهلاً، بخصوص طلبي رقم #" + n, ft: "لأي استفسار كلمنا على واتساب:", thx: "شكرًا لثقتك في " + SHOP_NAME, dir: "rtl" }
    : { sub: "We received your order #" + n + " — " + SHOP_NAME, hi: "Hello " + (c.name || "") + ",",
        h: "We've received your order!", badge: "Order #" + n,
        intro: "Thank you! Our team has started reviewing your order. We'll contact you on WhatsApp to confirm the details and shipping.",
        pre: "We received your order #" + n + " — total " + money(data.total || 0),
        p: "Order summary", req: "Price on request", disc: "Discount", tot: "Order total",
        unp: "The total does not include items priced on request.",
        d: "Delivery details", nm: "Name", ph: "Phone", ad: "Address", no: "Your notes",
        cta: "Message us on WhatsApp", wam: "Hello, about my order #" + n, ft: "Questions? Message us on WhatsApp:", thx: "Thank you for choosing " + SHOP_NAME, dir: "ltr" };
  var items = data.items || [];
  var lineOf = function (it) {
    return (it.unitPrice === null || it.unitPrice === undefined) ? T.req : money((Number(it.unitPrice) || 0) * (Number(it.qty) || 0));
  };
  var wa = "https://wa.me/" + String(SHOP_WHATSAPP).replace(/\D/g, "");
  var sec = function (t) { return '<div style="font-size:12px;font-weight:700;color:#667085;margin:28px 0 8px;text-align:' + al + '">' + t + "</div>"; };
  var td = "padding:14px 0;border-bottom:1px solid #eef0f3;";
  var rows = items.map(function (it) {
    return '<tr><td style="' + td + 'text-align:' + al + '"><div style="font-size:15px;font-weight:700;color:#101828">' + esc(it.name) + "</div>" +
      (it.brand ? '<div style="font-size:12px;color:#667085;margin-top:2px">' + esc(it.brand) + "</div>" : "") + "</td>" +
      '<td style="' + td + 'padding-left:10px;padding-right:10px;text-align:center;white-space:nowrap"><span style="background:#f2f4f7;border-radius:6px;padding:3px 9px;font-size:13px;font-weight:700;color:#344054">×' + esc(it.qty) + "</span></td>" +
      '<td style="' + td + 'text-align:' + ol + ';white-space:nowrap;font-size:14px;font-weight:700;color:#101828">' + esc(lineOf(it)) + "</td></tr>";
  }).join("");
  var info = function (k, v) {
    return v ? '<tr><td valign="top" style="padding:5px 0;font-size:13px;color:#667085;white-space:nowrap;text-align:' + al + '">' + k +
      '</td><td style="padding:5px 12px;font-size:14px;color:#101828;font-weight:600;text-align:' + al + '">' + esc(v) + "</td></tr>" : "";
  };
  var logo = LOGO_URL
    ? '<img src="' + esc(LOGO_URL) + '" alt="' + esc(SHOP_NAME) + '" height="44" style="display:block;margin:0 auto 20px;height:44px;border:0">'
    : '<div style="font-size:22px;font-weight:700;color:#0f2a30;margin-bottom:18px">' + esc(SHOP_NAME) + "</div>";
  var disc = Number(data.discount) > 0;
  var html = '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(T.pre) + "</div>" +
    '<table role="presentation" dir="' + T.dir + '" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 12px;font-family:Tahoma,Arial,sans-serif"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e4e7ec">' +
    '<tr><td style="height:6px;background:#0e7490;font-size:0;line-height:0">&nbsp;</td></tr>' +
    '<tr><td align="center" style="padding:30px 28px 4px">' + logo +
    '<div style="width:64px;height:64px;line-height:64px;margin:0 auto 14px;border-radius:32px;background:#dcfce7;color:#16a34a;font-size:32px;font-weight:700;text-align:center">✓</div>' +
    '<div style="font-size:24px;font-weight:700;color:#101828;line-height:1.3">' + esc(T.h) + "</div>" +
    '<div style="display:inline-block;background:#f2f4f7;color:#344054;border-radius:999px;padding:6px 16px;font-size:13px;font-weight:700;margin-top:12px">' + esc(T.badge) + "</div></td></tr>" +
    '<tr><td style="padding:10px 28px 30px;text-align:' + al + '">' +
    '<p style="margin:14px 0 0;font-size:15px;color:#344054;line-height:1.8"><b>' + esc(T.hi) + "</b><br>" + esc(T.intro) + "</p>" +
    sec(T.p) + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rows + "</table>" +
    (disc ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px"><tr><td style="font-size:14px;color:#667085;text-align:' + al + '">' + T.disc + '</td><td style="font-size:14px;color:#16a34a;font-weight:700;text-align:' + ol + '">- ' + money(data.discount) + "</td></tr></table>" : "") +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:#0f2a30;border-radius:12px"><tr><td style="padding:16px 20px;color:#cbd5db;font-size:14px;text-align:' + al + '">' + T.tot +
    '</td><td style="padding:16px 20px;color:#ffffff;font-size:22px;font-weight:700;text-align:' + ol + ';white-space:nowrap">' + money(data.total || 0) + "</td></tr></table>" +
    (Number(data.unpricedItems) > 0 ? '<p style="margin:8px 0 0;color:#667085;font-size:12px">' + esc(T.unp) + "</p>" : "") +
    sec(T.d) + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px"><tr><td style="padding:12px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
    info(T.nm, c.name) + info(T.ph, c.phone) + info(T.ad, c.address) + info(T.no, c.notes) + "</table></td></tr></table>" +
    '<div style="text-align:center;margin-top:28px"><a href="' + wa + "?text=" + encodeURIComponent(T.wam) + '" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 30px;border-radius:10px">' + esc(T.cta) + "</a></div>" +
    "</td></tr>" +
    '<tr><td style="background:#f9fafb;padding:18px 28px;text-align:center;font-size:12px;color:#98a2b3;border-top:1px solid #eef0f3">' + esc(T.thx) +
    (SHOP_URL ? ' · <a href="' + esc(SHOP_URL) + '" style="color:#98a2b3">' + esc(SHOP_URL.replace(/^https?:\/\//, "")) + "</a>" : "") + "</td></tr>" +
    "</table></td></tr></table>";
  var plainItems = items.map(function (it) {
    return "- " + it.name + (it.brand ? " (" + it.brand + ")" : "") + " x" + it.qty + " — " + lineOf(it);
  }).join("\n");
  var plain = T.hi + "\n\n" + T.intro + "\n\n" + plainItems + "\n\n" + T.tot + ": " + money(data.total || 0) +
    "\n\n" + T.d + "\n" + (c.name || "") + "\n" + (c.phone || "") + "\n" + (c.address || "") + "\n\n" + T.ft + " " + SHOP_WHATSAPP;
  var opts = { to: to, subject: T.sub, body: plain, htmlBody: html, name: SHOP_NAME };
  if (REPLY_TO) opts.replyTo = REPLY_TO;
  MailApp.sendEmail(opts);
}

// Run this ONCE from the Apps Script editor (select it, press ▶ Run): it asks Google for
// the permission to send e-mail, and sends you a sample confirmation. Then deploy a New version.
function testCustomerEmail() {
  if (!TEST_EMAIL_TO) throw new Error("اكتب إيميلك في TEST_EMAIL_TO (فوق في الملف) الأول.");
  sendCustomerEmail_({
    lang: "ar", total: 3500, discount: 0, unpricedItems: 0,
    customer: { name: "عميل تجريبي", phone: "01000000000", email: TEST_EMAIL_TO, address: "القاهرة", notes: "" },
    items: [{ name: "Botox", brand: "Metox", qty: 1, unitPrice: 3500 }]
  }, 1);
}

/* ------------------------------------------------------------------ */
/*  2) Orders page (password protected)                                */
/* ------------------------------------------------------------------ */

function handleAdmin_(data) {
  var auth = checkPassword_(data.pw);
  if (auth !== true) return auth;
  if (data.action === "list") return listOrders_();
  if (data.action === "update") return updateOrder_(data);
  if (data.action === "delete") return deleteOrder_(data);
  return { status: "error", code: "action", message: "Unknown action" };
}

function adminPassword_() {
  if (String(ADMIN_PASSWORD_LOCAL).trim()) return String(ADMIN_PASSWORD_LOCAL).trim();
  var all = PropertiesService.getScriptProperties().getProperties() || {};
  for (var k in all) {
    if (String(k).trim().toUpperCase() === "ADMIN_PASSWORD" && String(all[k]).trim()) return String(all[k]).trim();
  }
  return "";
}

function checkPassword_(pw) {
  var real = adminPassword_();
  if (!real) {
    return {
      status: "error", code: "setup",
      message: "السكريبت اللي الصفحة بتكلمه مفيهوش كلمة مرور. اكتبها في السطر ADMIN_PASSWORD_LOCAL فوق في Code.gs جوه Apps Script (أو في Script properties باسم ADMIN_PASSWORD)، وبعدين Deploy ← Manage deployments ← Edit ← New version."
    };
  }
  if (typeof pw === "string" && safeEq_(pw.trim(), real)) return true;
  Utilities.sleep(1500);         // slows down password guessing
  return { status: "error", code: "auth", message: "كلمة المرور غير صحيحة." };
}

function listOrders_() {
  var sheet = getSheet_();
  var last = sheet.getMaxRows();
  var orders = [];
  if (last >= DATA_FIRST_ROW) {
    var vals = sheet.getRange(DATA_FIRST_ROW, 1, last - DATA_FIRST_ROW + 1, 17).getValues();
    for (var i = 0; i < vals.length; i++) {
      var b = vals[i][1];
      if (b === "" || b === null) continue;          // empty row
      orders.push(rowToOrder_(DATA_FIRST_ROW + i, vals[i]));
    }
  }
  return { status: "ok", statuses: STATUSES, orders: orders };
}

function updateOrder_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var row = Number(data.row);
    if (!(row >= DATA_FIRST_ROW) || row > sheet.getMaxRows() || row % 1 !== 0) {
      return { status: "error", code: "row", message: "رقم الصف غير صحيح." };
    }
    var v = sheet.getRange(row, 1, 1, 17).getValues()[0];

    // The row number alone isn't trusted: if someone sorted or deleted rows
    // in the sheet since the page loaded, the order at this row is a different
    // one, and we must not change it by mistake.
    if (makeKey_(row, v) !== String(data.key)) {
      return { status: "error", code: "stale", message: "الشيت اتغيّر من ساعة ما الصفحة فتحت. بحدّث القائمة..." };
    }

    var now = new Date();
    if (data.status !== undefined && data.status !== null) {
      if (STATUSES.indexOf(data.status) < 0) {
        return { status: "error", code: "status", message: "حالة غير معروفة." };
      }
      sheet.getRange(row, 10).setValue(data.status);                                       // J
      if (data.status === "تم الشحن" && isBlank_(v[12])) sheet.getRange(row, 13).setValue(now);   // M
      if (data.status === "تم التسليم" && isBlank_(v[13])) sheet.getRange(row, 14).setValue(now); // N
    }
    if (typeof data.shipper === "string") {
      sheet.getRange(row, 15).setNumberFormat("@").setValue(data.shipper.slice(0, 100));   // O
    }
    if (typeof data.tracking === "string") {
      sheet.getRange(row, 16).setNumberFormat("@").setValue(data.tracking.slice(0, 100));  // P
    }
    sheet.getRange(row, 12).setValue(now);                                                 // L

    SpreadsheetApp.flush();
    var fresh = sheet.getRange(row, 1, 1, 17).getValues()[0];
    return { status: "ok", order: rowToOrder_(row, fresh) };
  } finally {
    lock.releaseLock();
  }
}

// Delete = copy the order into the "المحذوفات" sheet (safety net), then empty its
// row. The row itself stays, so other orders keep their # numbers, and new orders
// are always added after the last used row (a deleted number is never reused).
function deleteOrder_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var row = Number(data.row);
    if (!(row >= DATA_FIRST_ROW) || row > sheet.getMaxRows() || row % 1 !== 0) {
      return { status: "error", code: "row", message: "رقم الصف غير صحيح." };
    }
    var v = sheet.getRange(row, 1, 1, 17).getValues()[0];
    if (makeKey_(row, v) !== String(data.key)) {
      return { status: "error", code: "stale", message: "الشيت اتغيّر من ساعة ما الصفحة فتحت. بحدّث القائمة..." };
    }
    var ss = sheet.getParent();
    var log = ss.getSheetByName("المحذوفات");
    if (!log) {
      log = ss.insertSheet("المحذوفات");
      log.getRange(1, 1, 1, 18).setValues([["تاريخ الحذف", "رقم الطلب"].concat(sheet.getRange(DATA_FIRST_ROW - 1, 2, 1, 16).getValues()[0])]);
    }
    var r = log.getLastRow() + 1;
    log.getRange(r, 3, 1, 16).setNumberFormat("@");   // plain text: nothing typed by a customer can run as a formula
    log.getRange(r, 1, 1, 18).setValues([[new Date(), row - (DATA_FIRST_ROW - 1)].concat(v.slice(1).map(function (x) {
      return x instanceof Date ? fmt_(x, true) : x;
    }))]);
    sheet.getRange(row, 2, 1, 16).clearContent();       // B..Q (column A keeps its formula)
    SpreadsheetApp.flush();
    return { status: "ok", deleted: row };
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
}

function isBlank_(v) { return v === "" || v === null || v === undefined; }

function safeEq_(a, b) {
  a = String(a); b = String(b);
  var diff = a.length ^ b.length;
  var n = Math.max(a.length, b.length);
  for (var i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function txt_(v) { return v === null || v === undefined ? "" : String(v); }

function fmt_(v, withTime) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, TZ, withTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd");
  }
  return txt_(v);
}

function phone_(v) {
  var s = txt_(v).trim();
  // A phone typed into a non-text cell loses its leading 0 (1012345678).
  if (typeof v === "number" && /^1\d{9}$/.test(s)) s = "0" + s;
  return s;
}

// Identifies one order: its row + its order date + its phone digits.
function makeKey_(row, v) {
  var b = v[1];
  var bs = (b instanceof Date) ? String(b.getTime()) : txt_(b);
  return row + "|" + bs + "|" + txt_(v[4]).replace(/\D/g, "");
}

function rowToOrder_(row, v) {
  return {
    row: row,
    key: makeKey_(row, v),
    n: row - (DATA_FIRST_ROW - 1),          // same number as column A
    date: fmt_(v[1], true),
    items: txt_(v[2]),
    name: txt_(v[3]),
    phone: phone_(v[4]),
    email: txt_(v[5]),
    address: txt_(v[6]),
    qty: Number(v[7]) || 0,
    total: Number(v[8]) || 0,
    status: txt_(v[9]),
    expected: fmt_(v[10], false),
    updated: fmt_(v[11], true),
    shipped: fmt_(v[12], false),
    arrived: fmt_(v[13], false),
    shipper: txt_(v[14]),
    tracking: txt_(v[15]),
    notes: txt_(v[16])
  };
}

/**
 * Finds the row after the last used one (column B of an order is never empty).
 * Rows emptied by the orders page's delete are left as gaps, never reused.
 * (Old note:) it checks column B We check column B instead of using
 * sheet.appendRow()/getLastRow(), because column A is pre-filled with a
 * "#" formula on every row — which would make every row look
 * "occupied" to appendRow and push every new order to the very bottom
 * of the sheet.
 */
function nextEmptyRow_(sheet) {
  var max = Math.max(sheet.getMaxRows(), DATA_FIRST_ROW);
  var v = sheet.getRange(DATA_FIRST_ROW, 2, max - DATA_FIRST_ROW + 1, 1).getValues();
  var last = -1;
  for (var i = v.length - 1; i >= 0; i--) {
    if (v[i][0] !== "" && v[i][0] !== null) { last = i; break; }
  }
  var row = DATA_FIRST_ROW + last + 1;      // right after the last used row
  if (row > sheet.getMaxRows()) sheet.insertRowAfter(sheet.getMaxRows());   // sheet full — add a row
  return row;
}
