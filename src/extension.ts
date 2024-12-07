import * as vscode from 'vscode';

/** ステータスバーアイテム */
let statusBarItem: vscode.StatusBarItem;

/** 拡張機能の有効化（初期化処理） */
export function activate(context: vscode.ExtensionContext) {
  // ステータスバーアイテムの生成と登録
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'numberAggregator.copyResults';
  context.subscriptions.push(statusBarItem);

  // コマンドの登録：選択範囲の数値を集計
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'numberAggregator.aggregateSelectedText',
      aggregateSelectedText
    )
  );
  // コマンドの登録：集計結果をクリップボードにコピー
  context.subscriptions.push(
    vscode.commands.registerCommand('numberAggregator.copyResults', copyResults)
  );

  /* ステータスバーの更新処理 */

  // テキストの選択変更時
  vscode.window.onDidChangeTextEditorSelection(() => {
    return updateStatusBar();
  });
  // アクティブなテキストエディタの変更時
  vscode.window.onDidChangeActiveTextEditor(() => {
    return updateStatusBar();
  });
  // 初回の更新
  updateStatusBar();
}

/** 選択範囲の数値を集計 */
function aggregateSelectedText() {
  statusBarItem.command = undefined;

  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.selection.isEmpty) {
    statusBarItem.hide();
    return;
  }

  const selectedText = editor.document.getText(editor.selection);
  if (!selectedText.trim()) {
    statusBarItem.hide();
    return;
  }

  const numbers = extractNumbers(selectedText);
  if (numbers.length === 0) {
    statusBarItem.hide();
    return;
  }

  // 集計値の表示
  statusBarItem.text = getAggregateResultForStatus(aggregate(numbers));
  statusBarItem.tooltip = 'クリックして集計結果をコピー';
  statusBarItem.command = 'numberAggregator.copyResults';
  statusBarItem.show();
}

/** ステータスバーの更新 */
async function updateStatusBar(force: boolean = false) {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.selection.isEmpty) {
    statusBarItem.hide();
    return;
  }

  const config = vscode.workspace.getConfiguration('numberAggregator');
  const maxNumbers = config.get<number>('maxNumbers', 100);
  const maxSelectionLength = config.get<number>('maxSelectionLength', 1000);
  const selectedText = editor.document.getText(editor.selection);
  const numbers = extractNumbers(selectedText);

  if (
    !force &&
    (numbers.length > maxNumbers || selectedText.length > maxSelectionLength)
  ) {
    statusBarItem.text = '🧮選択範囲の数値を集計';
    statusBarItem.tooltip = `クリックして選択範囲の数値を集計（数字の数: ${numbers.length}, 選択文字数: ${selectedText.length}）`;
    statusBarItem.command = 'numberAggregator.aggregateSelectedText';
    statusBarItem.show();
  } else {
    // 集計値の表示
    aggregateSelectedText();
  }
}

/** 文字列の中から数値を抽出する */
function extractNumbers(text: string): number[] {
  const regex = /-?\d+(\.\d+)?/g;
  const matches = text.match(regex);
  return matches ? matches.map(Number) : [];
}

/** 数値を集計する */
function aggregate(numbers: number[]) {
  const count = numbers.length;
  const total = numbers.reduce((sum, num) => sum + num, 0);
  const average = count > 0 ? total / count : 0;

  return { count, total, average };
}

/** ステータスバーアイテム用の集計結果テキストを取得する */
function getAggregateResultForStatus({
  count,
  total,
  average,
}: ReturnType<typeof aggregate>) {
  return `個数: ${count} 合計: ${total} 平均: ${average}`;
}

/** クリップボードコピー用の集計結果テキストを取得する */
function getAggregateResultForCopy({
  count,
  total,
  average,
}: ReturnType<typeof aggregate>) {
  return `個数\t${count}\n合計\t${total}\n平均\t${average}`;
}

/** 集計結果をクリップボードにコピーする */
async function copyResults() {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.selection.isEmpty) {
    return;
  }

  const selectedText = editor.document.getText(editor.selection);
  const numbers = extractNumbers(selectedText);
  if (numbers.length === 0) {
    return;
  }

  const getAggregateResult = aggregate(numbers);
  statusBarItem.text = getAggregateResultForStatus(getAggregateResult);
  await vscode.env.clipboard.writeText(
    getAggregateResultForCopy(getAggregateResult)
  );
  vscode.window.showInformationMessage(
    '集計結果をクリップボードにコピーしました。'
  );
}

/** 拡張機能の非アクティブ化（終了処理） */
export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
