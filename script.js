/**
 * script.js (GAS サーバーサイド)
 * clasp push で GAS に送信するファイルです。
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) throw new Error("Timeout");

    console.log("POST引数: ", JSON.stringify(e));

    const jan = e.parameter.jan;
    const qty = e.parameter.qty;

    if (!jan || !qty) throw new Error("データ不足");

    const timestamp = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet(); 
    const sheet = ss.getSheetByName('在庫リスト');
    
    if (!sheet) throw new Error("『在庫リスト』シートが見つかりません");

    // JANコードの前にシングルクォートをつけて文字列として保存
    sheet.appendRow([timestamp, "'" + jan, qty]);

    return createJsonResponse({"status": "success", "message": "OK"});

  } catch (err) {
    console.error("POSTエラー: " + err.toString());
    return createJsonResponse({"status": "error", "message": err.toString()});
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const summarySheet = ss.getSheetByName('在庫集計');
    
    if (!summarySheet) throw new Error("『在庫集計』シートが見つかりません");

    const range = summarySheet.getDataRange();
    const data = range.getValues();
    const inventoryData = {};

    if (data.length <= 1) {
       return createJsonResponse({ status: "success", data: {} });
    }

    for (let i = 1; i < data.length; i++) {
      // データの整形
      const jan = String(data[i][0]).replace(/'/g, "").trim();
      const stock = data[i][1];
      if (jan) {
        inventoryData[jan] = stock;
      }
    }

    return createJsonResponse({ status: "success", data: inventoryData });

  } catch (err) {
    console.error("GETエラー: " + err.toString());
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}