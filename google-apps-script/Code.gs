/**
 * Elio — Order Sync (Google Apps Script)
 * ---------------------------------------------------------------------
 * Receives order data POSTed from cart.js (SITE_CONFIG.orderSync) and
 * writes one row per order into the "الأوردرات" sheet, matching the
 * Order Tracker layout (see Elio_Orders.xlsx).
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
 *   K  تاريخ التسليم المتوقع     (left blank — filled in manually)
 *   L  آخر تحديث                 (left blank — filled in manually)
 *   M  تاريخ الشحن               (left blank — filled in manually)
 *   N  تاريخ الوصول              (left blank — filled in manually)
 *   O  شركة الشحن                (left blank — filled in manually)
 *   P  رقم التتبع                (left blank — filled in manually)
 *   Q  ملاحظات                   (the customer's own checkout notes)
 *
 * SETUP: see GOOGLE_SHEETS_SETUP.md in this folder.
 * ---------------------------------------------------------------------
 */

var SHEET_NAME = "الأوردرات";
var DATA_FIRST_ROW = 8;   // row 7 is the header, data starts at row 8
var DEFAULT_STATUS = "طلب جديد";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
      || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var data = JSON.parse(e.postData.contents);
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

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", row: row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Finds the first row (from DATA_FIRST_ROW down) whose "تاريخ الطلب"
 * (column B) is empty. We check column B instead of using
 * sheet.appendRow()/getLastRow(), because column A is pre-filled with a
 * "#" formula on every row — which would make every row look
 * "occupied" to appendRow and push every new order to the very bottom
 * of the sheet.
 */
function nextEmptyRow_(sheet) {
  var lastPossibleRow = Math.max(sheet.getMaxRows(), DATA_FIRST_ROW);
  var values = sheet.getRange(DATA_FIRST_ROW, 2, lastPossibleRow - DATA_FIRST_ROW + 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === "" || values[i][0] === null) {
      return DATA_FIRST_ROW + i;
    }
  }
  // Sheet is completely full — add a fresh row at the bottom.
  sheet.insertRowAfter(sheet.getMaxRows());
  return sheet.getMaxRows();
}
