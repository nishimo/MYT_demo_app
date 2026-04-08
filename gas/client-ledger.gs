/**
 * Google Apps Script: 顧客台帳管理ツール
 *
 * 使い方:
 * 1. 顧客台帳スプレッドシートの拡張機能 → Apps Script にこのコードを貼り付ける
 * 2. onOpen() が自動でカスタムメニュー「台帳ツール」を追加
 * 3. 各機能はメニューから実行
 *
 * シート構成:
 * - Clients: マスタ（入力の正）
 * - Winners_当選者: FILTER自動抽出
 * - Invoice_請求対象: FILTER自動抽出
 * - Unpaid_未入金: FILTER自動抽出
 * - Overdue_期限超過: FILTER自動抽出
 * - Lists: 候補リスト（ステータス、担当者等）
 * - Config: 設定（枠数、抽選期等）
 */

// ========== メニュー ==========

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('台帳ツール')
    .addItem('新規顧客を追加（空行へ移動）', 'goToNextEmptyRow')
    .addSeparator()
    .addItem('抽選を実行', 'runLottery')
    .addItem('当選連絡期限チェック', 'checkDeadlines')
    .addSeparator()
    .addItem('ダッシュボード更新', 'updateDashboard')
    .addItem('シート初期化（初回のみ）', 'initializeSheets')
    .addToUi();
}

// ========== シート初期化 ==========

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'シート初期化',
    '台帳の各シートとヘッダーを初期化します。既存データがある場合は上書きされません。続行しますか？',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Clientsシートのヘッダー
  const clientsHeaders = [
    'No', '申込日', '店舗名', '代表者名', '連絡先', '地域',
    '流入経路', 'サービス種別', '審査ランク', '審査メモ',
    '抽選期', '抽選結果', '当選連絡日', '決済期限',
    'ステータス', '請求日', '入金日', '入金額',
    '提出期限', '提出日', '制作開始日', '納品日',
    '担当者', '備考'
  ];

  setupSheet(ss, 'Clients', clientsHeaders);
  setupSheet(ss, 'Lists', ['ステータス一覧', '担当者一覧', '流入経路一覧', 'サービス種別一覧', '審査ランク一覧', '地域一覧']);
  setupSheet(ss, 'Config', ['設定名', '値']);

  // Listsの初期データ
  const listsSheet = ss.getSheetByName('Lists');
  if (listsSheet.getLastRow() <= 1) {
    const statusList = ['申込', '審査中', '抽選待ち', '当選', '次点', '落選', '決済待ち', '決済済', '提出待ち', '制作中', '納品済', '完了', 'キャンセル'];
    const rankList = ['A', 'B', 'C', 'D'];

    statusList.forEach(function(s, i) { listsSheet.getRange(i + 2, 1).setValue(s); });
    rankList.forEach(function(r, i) { listsSheet.getRange(i + 2, 5).setValue(r); });
  }

  // Configの初期データ
  const configSheet = ss.getSheetByName('Config');
  if (configSheet.getLastRow() <= 1) {
    configSheet.getRange(2, 1).setValue('月間枠数');
    configSheet.getRange(2, 2).setValue(5);
    configSheet.getRange(3, 1).setValue('決済期限（時間）');
    configSheet.getRange(3, 2).setValue(48);
    configSheet.getRange(4, 1).setValue('提出期限（日）');
    configSheet.getRange(4, 2).setValue(7);
  }

  // FILTER式による自動抽出シート
  setupFilterSheet(ss, 'Winners_当選者', '抽選結果', '当選');
  setupFilterSheet(ss, 'Invoice_請求対象', 'ステータス', '決済待ち');
  setupFilterSheet(ss, 'Unpaid_未入金', 'ステータス', '決済済');
  setupFilterSheet(ss, 'Overdue_期限超過', null, null);

  // Dashboard
  setupDashboardSheet(ss);

  ui.alert('初期化が完了しました。');
}

function setupSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function setupFilterSheet(ss, name, filterCol, filterValue) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    if (name === 'Overdue_期限超過') {
      // 期限超過: 決済期限を過ぎてもステータスが「決済待ち」のもの
      sheet.getRange('A1').setValue('={"期限超過一覧（自動）";""}'  );
      sheet.getRange('A2').setFormula(
        '=IFERROR(FILTER(Clients!A2:X, Clients!N2:N<TODAY(), Clients!O2:O="決済待ち"), "対象なし")'
      );
    } else {
      // 汎用FILTER
      sheet.getRange('A1').setValue(name + '（自動抽出）');
      var colLetter = getColumnLetterByHeader(filterCol);
      if (colLetter) {
        sheet.getRange('A2').setFormula(
          '=IFERROR(FILTER(Clients!A2:X, Clients!' + colLetter + '2:' + colLetter + '="' + filterValue + '"), "対象なし")'
        );
      }
    }
  }
}

function getColumnLetterByHeader(headerName) {
  var headers = {
    'No': 'A', '申込日': 'B', '店舗名': 'C', '代表者名': 'D', '連絡先': 'E', '地域': 'F',
    '流入経路': 'G', 'サービス種別': 'H', '審査ランク': 'I', '審査メモ': 'J',
    '抽選期': 'K', '抽選結果': 'L', '当選連絡日': 'M', '決済期限': 'N',
    'ステータス': 'O', '請求日': 'P', '入金日': 'Q', '入金額': 'R',
    '提出期限': 'S', '提出日': 'T', '制作開始日': 'U', '納品日': 'V',
    '担当者': 'W', '備考': 'X'
  };
  return headers[headerName] || null;
}

function setupDashboardSheet(ss) {
  var sheet = ss.getSheetByName('Dashboard');
  if (!sheet) {
    sheet = ss.insertSheet('Dashboard');
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange('A1').setValue('MYT 顧客台帳 ダッシュボード').setFontWeight('bold').setFontSize(14);
    sheet.getRange('A3').setValue('総申込数');
    sheet.getRange('B3').setFormula('=COUNTA(Clients!A2:A)');
    sheet.getRange('A4').setValue('当選者数');
    sheet.getRange('B4').setFormula('=COUNTIF(Clients!L2:L,"当選")');
    sheet.getRange('A5').setValue('決済済数');
    sheet.getRange('B5').setFormula('=COUNTIF(Clients!O2:O,"決済済")');
    sheet.getRange('A6').setValue('納品済数');
    sheet.getRange('B6').setFormula('=COUNTIF(Clients!O2:O,"納品済")');
    sheet.getRange('A7').setValue('完了数');
    sheet.getRange('B7').setFormula('=COUNTIF(Clients!O2:O,"完了")');
    sheet.getRange('A9').setValue('未入金件数');
    sheet.getRange('B9').setFormula('=COUNTIF(Clients!O2:O,"決済待ち")');
    sheet.getRange('A10').setValue('期限超過件数');
    sheet.getRange('B10').setFormula('=COUNTIFS(Clients!N2:N,"<"&TODAY(),Clients!O2:O,"決済待ち")');
  }
}

// ========== 操作機能 ==========

// 空行へ移動（新規顧客追加用）
function goToNextEmptyRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Clients');
  if (!sheet) { SpreadsheetApp.getUi().alert('Clientsシートが見つかりません'); return; }

  var lastRow = sheet.getLastRow();
  var nextRow = lastRow + 1;

  // Noを自動付番
  sheet.getRange(nextRow, 1).setValue(lastRow);

  sheet.setActiveRange(sheet.getRange(nextRow, 2));
  SpreadsheetApp.getUi().alert('行 ' + nextRow + ' に移動しました。申込日から入力してください。');
}

// ========== 抽選 ==========

function runLottery() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Clients');
  var configSheet = ss.getSheetByName('Config');

  if (!sheet || !configSheet) {
    ui.alert('必要なシートが見つかりません。先にシート初期化を実行してください。');
    return;
  }

  // 月間枠数を取得
  var maxSlots = configSheet.getRange(2, 2).getValue() || 5;

  // 抽選期の入力
  var response = ui.prompt('抽選実行', '抽選期を入力してください（例: 2026-04）', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var lotteryPeriod = response.getResponseText().trim();

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var lotteryCol = headers.indexOf('抽選期');
  var resultCol = headers.indexOf('抽選結果');
  var rankCol = headers.indexOf('審査ランク');
  var statusCol = headers.indexOf('ステータス');

  // 対象者の抽出（抽選期が一致 && 抽選結果が空）
  var candidates = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][lotteryCol]) === lotteryPeriod && !data[i][resultCol]) {
      candidates.push({ row: i + 1, rank: data[i][rankCol] });
    }
  }

  if (candidates.length === 0) {
    ui.alert('抽選対象者がいません（抽選期: ' + lotteryPeriod + '）');
    return;
  }

  // 審査ランク順にソート（A > B > C > D）
  candidates.sort(function(a, b) {
    return (a.rank || 'Z').localeCompare(b.rank || 'Z');
  });

  // 当選・次点・落選を割り振り
  var winCount = 0;
  for (var j = 0; j < candidates.length; j++) {
    var row = candidates[j].row;
    if (winCount < maxSlots) {
      sheet.getRange(row, resultCol + 1).setValue('当選');
      sheet.getRange(row, statusCol + 1).setValue('当選');
      winCount++;
    } else if (winCount < maxSlots + 2) {
      // 次点2名
      sheet.getRange(row, resultCol + 1).setValue('次点');
      winCount++;
    } else {
      sheet.getRange(row, resultCol + 1).setValue('落選');
    }
  }

  ui.alert('抽選完了: ' + lotteryPeriod + '\n当選: ' + Math.min(candidates.length, maxSlots) + '名\n対象: ' + candidates.length + '名');
}

// ========== 期限チェック ==========

function checkDeadlines() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Clients');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var deadlineCol = headers.indexOf('決済期限');
  var statusCol = headers.indexOf('ステータス');
  var storeCol = headers.indexOf('店舗名');

  var today = new Date();
  var overdue = [];

  for (var i = 1; i < data.length; i++) {
    var deadline = data[i][deadlineCol];
    var status = data[i][statusCol];

    if (status === '決済待ち' && deadline && new Date(deadline) < today) {
      overdue.push(data[i][storeCol] + '（期限: ' + Utilities.formatDate(new Date(deadline), 'Asia/Tokyo', 'yyyy-MM-dd') + '）');
    }
  }

  if (overdue.length === 0) {
    SpreadsheetApp.getUi().alert('期限超過はありません。');
  } else {
    SpreadsheetApp.getUi().alert('期限超過: ' + overdue.length + '件\n\n' + overdue.join('\n'));
  }
}

// ========== ダッシュボード更新 ==========

function updateDashboard() {
  // COUNTIF/COUNTIFS式は自動更新されるため、手動更新は最終更新日時のみ
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
  if (!sheet) return;

  sheet.getRange('A12').setValue('最終更新');
  sheet.getRange('B12').setValue(new Date());

  SpreadsheetApp.getUi().alert('ダッシュボードを更新しました。');
}
