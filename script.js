/**
 * 在庫管理アプリ用バックエンドスクリプト（2枚シート構成版）
 * * シート構成:
 * 1. 「在庫集計」シート: JANコード, 商品名, 現在在庫 (マスター兼集計)
 * 2. 「在庫リスト」シート: タイムスタンプ, JANコード, 商品名, 変更数量, 操作後の在庫数
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // 同時書き込みを防ぐためロックをかける（30秒）
    lock.waitLock(30000);
    
    const params = JSON.parse(e.postData.contents);
    const targetCode = params.code;
    const targetName = params.name;
    const targetQty = Number(params.qty); // 更新後の絶対値
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const summarySheet = ss.getSheetByName("在庫集計");
    const historySheet = ss.getSheetByName("在庫リスト");
    
    if (!summarySheet || !historySheet) {
      throw new Error("シート「在庫集計」または「在庫リスト」が見つかりません。");
    }

    const summaryData = summarySheet.getDataRange().getValues();
    let rowIndex = -1;
    let previousQty = 0;
    
    // 1. 「在庫集計」シートでJANコードを検索
    for (let i = 1; i < summaryData.length; i++) {
      if (summaryData[i][0] == targetCode) {
        rowIndex = i + 1;
        previousQty = Number(summaryData[i][2]);
        break;
      }
    }
    
    if (rowIndex === -1) {
      // 未登録の場合：新規行を追加
      summarySheet.appendRow([targetCode, targetName, targetQty]);
    } else {
      // 登録済みの場合：商品名と在庫数を更新
      summarySheet.getRange(rowIndex, 2).setValue(targetName);
      summarySheet.getRange(rowIndex, 3).setValue(targetQty);
    }

    // 2. 「在庫リスト」シートに履歴を追記
    const change = targetQty - previousQty;
    historySheet.appendRow([
      new Date(),   // タイムスタンプ
      targetCode,   // JANコード
      targetName,   // 商品名
      change,       // 変動分
      targetQty     // 操作後の在庫
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "集計と履歴の更新が完了しました"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

/**
 * アプリ起動時のデータ読み込み（「在庫集計」シートから取得）
 */
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const summarySheet = ss.getSheetByName("在庫集計");
    const data = summarySheet.getDataRange().getValues();
    
    const master = {};
    const inventory = {};
    
    // 2行目以降（データ部分）をループ
    for (let i = 1; i < data.length; i++) {
      const code = data[i][0];
      const name = data[i][1];
      const qty = data[i][2];
      if (code) {
        master[code] = name;
        inventory[code] = qty;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      "master": master,
      "inventory": inventory
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ "error": e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}