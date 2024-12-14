import * as vscode from 'vscode'
import {
  aggregateSelectedText,
  copyResults,
  createStatusBarItem,
  loadSettings,
  updateStatusBar,
} from './main'

/** ステータスバーアイテム */
let statusBarItem: vscode.StatusBarItem

/** 拡張機能の有効化（初期化処理） */
export const activate = (context: vscode.ExtensionContext) => {
  // 設定の読み込み
  loadSettings()

  // 設定変更後
  vscode.workspace.onDidChangeConfiguration((e) => {
    // 設定の読み込み
    loadSettings()
  })

  /* コマンドの登録 */

  // コマンド：選択範囲の数値を集計
  context.subscriptions.push(
    vscode.commands.registerCommand('number-aggregator.aggregateSelectedText', () => {
      aggregateSelectedText(statusBarItem)
    })
  )
  // コマンド：集計結果をクリップボードにコピー
  context.subscriptions.push(
    vscode.commands.registerCommand('number-aggregator.copyResults', () => {
      copyResults(statusBarItem)
    })
  )

  // ステータスバーアイテムの生成と登録
  statusBarItem = createStatusBarItem()
  context.subscriptions.push(statusBarItem)

  /* ステータスバーの更新処理 */

  // テキストの選択変更時
  vscode.window.onDidChangeTextEditorSelection(() => {
    return updateStatusBar(statusBarItem)
  })
  // アクティブなテキストエディタの変更時
  vscode.window.onDidChangeActiveTextEditor(() => {
    return updateStatusBar(statusBarItem)
  })
  // 初回の更新
  updateStatusBar(statusBarItem)
}

/** 拡張機能の非アクティブ化（終了処理） */
export const deactivate = () => {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
