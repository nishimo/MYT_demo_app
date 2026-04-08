/**
 * Google Apps Script: クイズ結果受信 → スプレッドシート書き込み
 *
 * 使い方:
 * 1. Google Spreadsheetを作成し、シート名を「診断結果」にする
 * 2. 拡張機能 → Apps Script でこのコードを貼り付ける
 * 3. doPost関数を選択してデプロイ → ウェブアプリ → アクセスできるユーザー: 全員
 * 4. デプロイURLを app.js の GAS_ENDPOINT に設定する
 */

const SHEET_NAME = '診断結果';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'シートが見つかりません' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ヘッダーが無ければ作成
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '受信日時',
        '総合スコア', '総合%', '総合グレード',
        'シーシャスコア', 'シーシャ%', 'シーシャグレード',
        '経営スコア', '経営%', '経営グレード',
        'タブ離脱回数',
        'カテゴリ別詳細',
        '全回答データ(JSON)'
      ]);
    }

    const meta = data.meta;
    const row = [
      new Date().toISOString(),
      meta.totalScore, meta.totalPercent, meta.totalGrade,
      meta.shishaScore, meta.shishaPercent, meta.shishaGrade,
      meta.businessScore, meta.businessPercent, meta.businessGrade,
      meta.tabLeaveCount,
      JSON.stringify(data.categories),
      JSON.stringify(data.answers)
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// テスト用: GETでアクセスすると動作確認できる
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'MYT Quiz Results Receiver is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
