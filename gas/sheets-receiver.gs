/**
 * Google Apps Script: クイズ結果受信 → スプレッドシート整形書き込み
 *
 * 使い方:
 * 1. Google Spreadsheetを開く
 * 2. 拡張機能 → Apps Script でこのコードを貼り付ける
 * 3. doPost関数を選択してデプロイ → ウェブアプリ → アクセスできるユーザー: 全員
 * 4. デプロイURLを app.js の GAS_ENDPOINT に設定する
 */

const SUMMARY_SHEET = 'サマリー';
// 管理画面(admin.html)へ全レコードを返すための生JSON保存シート
const RECORDS_SHEET = '_records';
// スタンドアロンスクリプトのため、スプレッドシートIDを直接指定
const SPREADSHEET_ID = '1xu8z_x6OBRh8J5r10qIu5WU8nlhv1qtBCj8M2QtS4AU';
function getSpreadsheet() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

// セクション別の背景色
const SECTION_COLORS = {
  'Ⅰ. シーシャの土台理解': '#E8F4FD',
  'Ⅱ. 熱と炭の扱い':       '#FEF9E7',
  'Ⅲ. 吸い方・人の影響':   '#EAFAF1',
  'Ⅳ. 道具・環境の理解':   '#F9EBEA',
  'Ⅴ. 学習・復旧能力':     '#F5EEF8',
};
const BUSINESS_COLOR = '#EBF5FB';
const HEADER_COLOR   = '#2C3E50';
const CORRECT_COLOR  = '#D5F5E3';
const WRONG_COLOR    = '#FADBD8';
const TIMEOUT_COLOR  = '#FDEBD0';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = getSpreadsheet();

    ensureSummarySheet(ss, data);
    createClientSheet(ss, data);
    saveRawRecord(ss, data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── サマリーシート（全クライアント一覧） ───────────────────────────
function ensureSummarySheet(ss, data) {
  let sheet = ss.getSheetByName(SUMMARY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SUMMARY_SHEET, 0);
    const headers = [
      '受診者名', '診断日時',
      '総合スコア', '総合%', '総合グレード',
      'シーシャスコア', 'シーシャ%', 'シーシャグレード',
      '経営スコア', '経営%', '経営グレード',
      'タブ離脱回数'
    ];
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground(HEADER_COLOR);
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const meta = data.meta;
  const jst  = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const dateStr = Utilities.formatDate(jst, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

  sheet.appendRow([
    meta.clientName || '（未入力）',
    dateStr,
    meta.totalScore,    meta.totalPercent,    meta.totalGrade,
    meta.shishaScore,   meta.shishaPercent,   meta.shishaGrade,
    meta.businessScore, meta.businessPercent, meta.businessGrade,
    meta.tabLeaveCount
  ]);

  // 最終行に色付け
  const lastRow = sheet.getLastRow();
  const grade   = meta.totalGrade;
  const rowBg   = grade === 'A' ? '#D5F5E3' : grade === 'B' ? '#EBF5FB' : grade === 'C' ? '#FEF9E7' : '#FADBD8';
  sheet.getRange(lastRow, 1, 1, 12).setBackground(rowBg);
}

// ─── クライアント別シート ────────────────────────────────────────────
function createClientSheet(ss, data) {
  const meta     = data.meta;
  const answers  = data.answers  || [];
  const comments = data.sectionComments || {};

  const jst     = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const dateStr = Utilities.formatDate(jst, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
  const name    = meta.clientName || '（未入力）';

  // シート名：「名前 MM/DD HH:mm」で重複回避
  const shortDate = Utilities.formatDate(jst, 'Asia/Tokyo', 'MMdd-HHmm');
  const sheetName = (name + ' ' + shortDate).substring(0, 100);

  const sheet = ss.insertSheet(sheetName);

  let row = 1;

  // ── ① スコアサマリー ──────────────────────────────────────────
  writeTitle(sheet, row, '📋 診断サマリー');
  row++;

  const summaryHeaders = [['項目', 'スコア', '%', 'グレード']];
  const summaryData = [
    ['受診者名',   name,                '',                   ''],
    ['診断日時',   dateStr,             '',                   ''],
    ['総合',       meta.totalScore,     meta.totalPercent,    meta.totalGrade],
    ['シーシャ技術', meta.shishaScore,  meta.shishaPercent,   meta.shishaGrade],
    ['経営知識',   meta.businessScore,  meta.businessPercent, meta.businessGrade],
    ['タブ離脱回数', meta.tabLeaveCount, '',                  ''],
  ];

  const summaryHeaderRange = sheet.getRange(row, 1, 1, 4);
  summaryHeaderRange.setValues(summaryHeaders);
  summaryHeaderRange.setBackground(HEADER_COLOR);
  summaryHeaderRange.setFontColor('#FFFFFF');
  summaryHeaderRange.setFontWeight('bold');
  row++;

  sheet.getRange(row, 1, summaryData.length, 4).setValues(summaryData);
  row += summaryData.length + 1;

  // ── ② セクションコメント ──────────────────────────────────────
  if (comments['Q9-15'] || comments['Q16-21'] || comments['Q22-26'] || comments['Q27-30']) {
    writeTitle(sheet, row, '💬 セクション別疑問点');
    row++;

    const commentHeaders = [['セクション', '疑問点・コメント']];
    const commentData = [
      ['問９〜１５', comments['Q9-15']  || '（記入なし）'],
      ['問１６〜２１', comments['Q16-21'] || '（記入なし）'],
      ['問２２〜２６', comments['Q22-26'] || '（記入なし）'],
      ['問２７〜３０', comments['Q27-30'] || '（記入なし）'],
    ];

    const commentHeaderRange = sheet.getRange(row, 1, 1, 2);
    commentHeaderRange.setValues(commentHeaders);
    commentHeaderRange.setBackground(HEADER_COLOR);
    commentHeaderRange.setFontColor('#FFFFFF');
    commentHeaderRange.setFontWeight('bold');
    row++;

    sheet.getRange(row, 1, commentData.length, 2).setValues(commentData);
    sheet.getRange(row, 2, commentData.length, 1).setWrap(true);
    row += commentData.length + 1;
  }

  // ── ③ 回答詳細 ───────────────────────────────────────────────
  writeTitle(sheet, row, '📝 回答詳細');
  row++;

  const detailHeaders = [['No', '分類', 'カテゴリ', '問題', '回答', '正誤', '自由記述']];
  const detailHeaderRange = sheet.getRange(row, 1, 1, 7);
  detailHeaderRange.setValues(detailHeaders);
  detailHeaderRange.setBackground(HEADER_COLOR);
  detailHeaderRange.setFontColor('#FFFFFF');
  detailHeaderRange.setFontWeight('bold');
  row++;

  const detailStartRow = row;

  answers.forEach(function(r) {
    const answerStr = r.answer === true  ? '○' :
                      r.answer === false ? '×' : '時間切れ';
    const correctStr = r.correct ? '◎' : '✗';

    sheet.getRange(row, 1, 1, 7).setValues([[
      r.index,
      r.quizType,
      r.category,
      r.question,
      answerStr,
      correctStr,
      r.userExplanation || ''
    ]]);

    // 正誤で行の色を変える
    const bg = r.answer === '時間切れ' ? TIMEOUT_COLOR :
               r.correct              ? CORRECT_COLOR : WRONG_COLOR;
    sheet.getRange(row, 1, 1, 7).setBackground(bg);

    // カテゴリの色
    const catColor = SECTION_COLORS[r.category] || BUSINESS_COLOR;
    sheet.getRange(row, 3).setBackground(catColor);

    row++;
  });

  // ── 列幅の調整 ──────────────────────────────────────────────
  sheet.setColumnWidth(1, 45);   // No
  sheet.setColumnWidth(2, 90);   // 分類
  sheet.setColumnWidth(3, 160);  // カテゴリ
  sheet.setColumnWidth(4, 380);  // 問題
  sheet.setColumnWidth(5, 55);   // 回答
  sheet.setColumnWidth(6, 50);   // 正誤
  sheet.setColumnWidth(7, 220);  // 自由記述

  // 問題列は折り返し
  sheet.getRange(detailStartRow, 4, answers.length, 1).setWrap(true);
  sheet.getRange(detailStartRow, 7, answers.length, 1).setWrap(true);

  sheet.setFrozenRows(1);
}

// ─── 生レコード保存（管理画面API用） ──────────────────────────────────
// admin.html がそのまま表示できるよう、受信したJSONを1行1件で保存する。
function saveRawRecord(ss, data) {
  let sheet = ss.getSheetByName(RECORDS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(RECORDS_SHEET);
    sheet.getRange(1, 1, 1, 2).setValues([['exportedAt', 'json']]);
    sheet.setFrozenRows(1);
    sheet.hideSheet();
  }
  const exportedAt = (data.meta && data.meta.exportedAt) || '';
  sheet.appendRow([exportedAt, JSON.stringify(data)]);
}

// ─── タイトル行ヘルパー ───────────────────────────────────────────────
function writeTitle(sheet, row, title) {
  const cell = sheet.getRange(row, 1);
  cell.setValue(title);
  cell.setFontWeight('bold');
  cell.setFontSize(12);
  cell.setBackground('#F2F2F2');
  sheet.getRange(row, 1, 1, 7).setBackground('#F2F2F2');
}

// ─── 管理画面API：全レコード取得 / 個別削除 ─────────────────────────
// GET ?action=delete&exportedAt=<値> → 該当レコードを削除
// GET（パラメータなし）→ 全レコードをJSON配列で返す
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};

    if (params.action === 'delete') {
      const exportedAt = params.exportedAt || '';
      if (!exportedAt) return jsonRes({status: 'error', message: 'exportedAt required'});
      const ss    = getSpreadsheet();
      const sheet = ss.getSheetByName(RECORDS_SHEET);
      if (!sheet || sheet.getLastRow() <= 1) return jsonRes({status: 'error', message: 'not found'});
      const col1 = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < col1.length; i++) {
        if (String(col1[i][0]).trim() === exportedAt) {
          sheet.deleteRow(i + 2);
          return jsonRes({status: 'ok'});
        }
      }
      return jsonRes({status: 'error', message: 'not found'});
    }

    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName(RECORDS_SHEET);
    const records = [];
    if (sheet && sheet.getLastRow() > 1) {
      const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
      values.forEach(function(row) {
        const json = row[0];
        if (!json) return;
        try { records.push(JSON.parse(json)); } catch (e) {}
      });
    }
    records.reverse();
    return jsonRes({status: 'ok', records: records});

  } catch (err) {
    return jsonRes({status: 'error', message: err.message});
  }
}

function jsonRes(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── 過去データ移行（手動実行・1回のみ） ──────────────────────────────
// デプロイ以前に作成された「クライアント別シート」を解析して _records に取り込む。
// Apps Scriptエディタで migrateExistingSheets を選択して実行する。
// exportedAt（診断日時）が既に _records にあるものはスキップするため、再実行しても重複しない。
// 注意: 模範解答(modelAnswer)は過去シートに保存されていないため、移行データでは空欄になる。
function migrateExistingSheets() {
  const ss = getSpreadsheet();

  // _records を用意し、既存のexportedAtを控える（重複防止）
  let recSheet = ss.getSheetByName(RECORDS_SHEET);
  if (!recSheet) {
    recSheet = ss.insertSheet(RECORDS_SHEET);
    recSheet.getRange(1, 1, 1, 2).setValues([['exportedAt', 'json']]);
    recSheet.setFrozenRows(1);
    recSheet.hideSheet();
  }
  const existing = {};
  if (recSheet.getLastRow() > 1) {
    recSheet.getRange(2, 1, recSheet.getLastRow() - 1, 1).getValues()
      .forEach(function(r) { if (r[0]) existing[r[0]] = true; });
  }

  // 移行対象シート（サマリー・_recordsを除く）を解析
  const migrated = [];
  ss.getSheets().forEach(function(sheet) {
    const nm = sheet.getName();
    if (nm === SUMMARY_SHEET || nm === RECORDS_SHEET) return;
    const rec = parseClientSheet(sheet);
    if (rec && rec.meta && rec.meta.exportedAt && !existing[rec.meta.exportedAt]) {
      migrated.push(rec);
    }
  });

  // 診断日時の昇順で追記（doGetがreverseして新しい順に表示する）
  migrated.sort(function(a, b) {
    return String(a.meta.exportedAt).localeCompare(String(b.meta.exportedAt));
  });
  migrated.forEach(function(rec) {
    recSheet.appendRow([rec.meta.exportedAt, JSON.stringify(rec)]);
  });

  getSpreadsheet().toast(
    migrated.length + ' 件の過去データを移行しました', 'MYT 移行', 5);
}

// クライアント別シート1枚をadmin.html用レコードに復元する
function parseClientSheet(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(7, sheet.getLastColumn());
  if (lastRow < 3) return null;
  const grid = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  // ラベル → 行を引くヘルパー
  function findRow(label) {
    for (let i = 0; i < grid.length; i++) {
      if (String(grid[i][0]).trim() === label) return grid[i];
    }
    return null;
  }
  const nameRow = findRow('受診者名');
  const dateRow = findRow('診断日時');
  if (!nameRow || !dateRow) return null;  // クライアントシートでなければ除外

  const totalRow = findRow('総合');
  const shishaRow = findRow('シーシャ技術');
  const bizRow   = findRow('経営知識');
  const tabRow   = findRow('タブ離脱回数');

  const cell = function(r, i) { return r ? String(r[i]).trim() : ''; };

  const meta = {
    clientName:     cell(nameRow, 1) || '（未入力）',
    exportedAt:     cell(dateRow, 1),
    totalScore:     cell(totalRow, 1),  totalPercent:    cell(totalRow, 2),  totalGrade:    cell(totalRow, 3),
    shishaScore:    cell(shishaRow, 1), shishaPercent:   cell(shishaRow, 2), shishaGrade:   cell(shishaRow, 3),
    businessScore:  cell(bizRow, 1),    businessPercent: cell(bizRow, 2),    businessGrade: cell(bizRow, 3),
    tabLeaveCount:  Number(cell(tabRow, 1)) || 0
  };

  // セクションコメント
  const commentMap = {
    '問９〜１５':   'Q9-15',
    '問１６〜２１': 'Q16-21',
    '問２２〜２６': 'Q22-26',
    '問２７〜３０': 'Q27-30'
  };
  const sectionComments = { 'Q9-15': '', 'Q16-21': '', 'Q22-26': '', 'Q27-30': '' };
  Object.keys(commentMap).forEach(function(label) {
    const r = findRow(label);
    if (r) {
      const v = cell(r, 1);
      sectionComments[commentMap[label]] = (v === '（記入なし）') ? '' : v;
    }
  });

  // 回答詳細：ヘッダー「No|分類|カテゴリ|問題|回答|正誤|自由記述」の次行から
  let startIdx = -1;
  for (let i = 0; i < grid.length; i++) {
    if (String(grid[i][0]).trim() === 'No' && String(grid[i][3]).trim() === '問題') {
      startIdx = i + 1;
      break;
    }
  }
  const answers = [];
  if (startIdx >= 0) {
    for (let i = startIdx; i < grid.length; i++) {
      const row = grid[i];
      if (String(row[0]).trim() === '') continue;
      const ansStr = String(row[4]).trim();
      answers.push({
        index:           Number(row[0]) || (answers.length + 1),
        quizType:        String(row[1]).trim(),
        category:        String(row[2]).trim(),
        question:        String(row[3]).trim(),
        answer:          ansStr === '○' ? true : ansStr === '×' ? false : '時間切れ',
        correct:         String(row[5]).trim() === '◎',
        userExplanation: String(row[6]).trim(),
        modelAnswer:     ''  // 過去シートには保存されていない
      });
    }
  }

  // カテゴリ別成績は回答から再集計
  const categories = {};
  answers.forEach(function(a) {
    if (!a.category) return;
    if (!categories[a.category]) categories[a.category] = { correct: 0, total: 0 };
    categories[a.category].total++;
    if (a.correct) categories[a.category].correct++;
  });
  Object.keys(categories).forEach(function(k) {
    const c = categories[k];
    c.percent = Math.round((c.correct / c.total) * 100) + '%';
  });

  return { meta: meta, categories: categories, sectionComments: sectionComments, answers: answers };
}

// ─── 旧フォーマット（フラットテーブル）からの移行（手動実行・1回のみ） ──
// シート名「シート1」などの旧形式（受信日時・JSON列形式）を _records に取り込む。
// migrateExistingSheets と同様に重複スキップ。
function migrateFlatTable() {
  const ss = getSpreadsheet();

  // _records を用意
  let recSheet = ss.getSheetByName(RECORDS_SHEET);
  if (!recSheet) {
    recSheet = ss.insertSheet(RECORDS_SHEET);
    recSheet.getRange(1, 1, 1, 2).setValues([['exportedAt', 'json']]);
    recSheet.setFrozenRows(1);
    recSheet.hideSheet();
  }
  const existing = {};
  if (recSheet.getLastRow() > 1) {
    recSheet.getRange(2, 1, recSheet.getLastRow() - 1, 1).getValues()
      .forEach(function(r) { if (r[0]) existing[r[0]] = true; });
  }

  // 旧フォーマットのシートを探す（ヘッダーに「受信日時」がある）
  const migrated = [];
  ss.getSheets().forEach(function(sheet) {
    const nm = sheet.getName();
    if (nm === SUMMARY_SHEET || nm === RECORDS_SHEET) return;
    if (sheet.getLastRow() < 2) return;
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (String(header[0]).trim() !== '受信日時') return;

    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    rows.forEach(function(row) {
      const exportedAt = String(row[0]).trim();
      if (!exportedAt || existing[exportedAt]) return;

      var categories = {};
      var answers = [];
      try { categories = JSON.parse(String(row[11])); } catch(e) {}
      try { answers    = JSON.parse(String(row[12])); } catch(e) {}

      const pct = function(s) { return String(s).endsWith('%') ? String(s) : String(s) + '%'; };
      const rec = {
        meta: {
          clientName:     '（未入力）',
          exportedAt:     exportedAt,
          totalScore:     String(row[1]), totalPercent:    pct(row[2]), totalGrade:    String(row[3]),
          shishaScore:    String(row[4]), shishaPercent:   pct(row[5]), shishaGrade:   String(row[6]),
          businessScore:  String(row[7]), businessPercent: pct(row[8]), businessGrade: String(row[9]),
          tabLeaveCount:  Number(row[10]) || 0
        },
        categories: categories,
        sectionComments: { 'Q9-15': '', 'Q16-21': '', 'Q22-26': '', 'Q27-30': '' },
        answers: answers
      };
      migrated.push(rec);
      existing[exportedAt] = true;
    });
  });

  migrated.sort(function(a, b) {
    return String(a.meta.exportedAt).localeCompare(String(b.meta.exportedAt));
  });
  migrated.forEach(function(rec) {
    recSheet.appendRow([rec.meta.exportedAt, JSON.stringify(rec)]);
  });

  ss.toast(migrated.length + ' 件の旧データを移行しました', 'MYT 移行', 5);
}
