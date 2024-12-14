import * as vscode from 'vscode'
import { aggregateSelectedText, copyResults, createStatusBarItem, updateStatusBar } from './main'

/** ステータスバーアイテム */
let statusBarItem: vscode.StatusBarItem

/** 設定 */
export interface ExtensionSettings {
  /** 集計を行う数字の最大数 */
  maxNumbers: number
  /** 集計を行う最大文字数 */
  maxSelectionLength: number
  /** 前後にスペースや改行がある数字のみ集計対象にする */
  aggregateOnlyIsolatedNumbers: boolean
  /** 小数点以下の桁数 */
  decimalPlaces: number
}

/** 拡張機能の有効化（初期化処理） */
export const activate = (context: vscode.ExtensionContext) => {
  // 設定の読み込み
  const config = vscode.workspace.getConfiguration('numberAggregator')
  const settings: ExtensionSettings = {
    maxNumbers: config.get<number>('maxNumbers', 100),
    maxSelectionLength: config.get<number>('maxSelectionLength', 1000),
    aggregateOnlyIsolatedNumbers: config.get<boolean>('aggregateOnlyIsolatedNumbers', true),
    decimalPlaces: config.get<number>('decimalPlaces', 2),
  }

  /* コマンドの登録 */

  // コマンド：選択範囲の数値を集計
  context.subscriptions.push(
    vscode.commands.registerCommand('numberAggregator.aggregateSelectedText', () => {
      aggregateSelectedText(statusBarItem, settings)
    })
  )
  // コマンド：集計結果をクリップボードにコピー
  context.subscriptions.push(
    vscode.commands.registerCommand('numberAggregator.copyResults', () => {
      copyResults(statusBarItem, settings)
    })
  )

  // ステータスバーアイテムの生成と登録
  statusBarItem = createStatusBarItem()
  context.subscriptions.push(statusBarItem)

  /* ステータスバーの更新処理 */

  // テキストの選択変更時
  vscode.window.onDidChangeTextEditorSelection(() => {
    return updateStatusBar(statusBarItem, settings)
  })
  // アクティブなテキストエディタの変更時
  vscode.window.onDidChangeActiveTextEditor(() => {
    return updateStatusBar(statusBarItem, settings)
  })
  // 初回の更新
  updateStatusBar(statusBarItem, settings)
}

/** 拡張機能の非アクティブ化（終了処理） */
export const deactivate = () => {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
