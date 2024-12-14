import * as vscode from 'vscode'
import { Big } from 'big.js'

/** ステータスバーアイテム */
let statusBarItem: vscode.StatusBarItem

/** アイコン */
let icon = '🔢' // '🧮'

/** 設定 */
interface ExtensionSettings {
  maxNumbers: number
  maxSelectionLength: number
  aggregateOnlyIsolatedNumbers: boolean
  decimalPlaces: number
}

/** 拡張機能の有効化（初期化処理） */
export const activate = (context: vscode.ExtensionContext) => {
  // 設定の読み込み
  const config = vscode.workspace.getConfiguration('numberAggregator')
  const maxNumbers = config.get<number>('maxNumbers', 100)
  const maxSelectionLength = config.get<number>('maxSelectionLength', 1000)
  const aggregateOnlyIsolatedNumbers = config.get<boolean>('aggregateOnlyIsolatedNumbers', true)
  const decimalPlaces = config.get<number>('decimalPlaces', 2)
  const settings: ExtensionSettings = {
    maxNumbers,
    maxSelectionLength,
    aggregateOnlyIsolatedNumbers,
    decimalPlaces,
  }

  // ステータスバーアイテムの生成と登録
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.command = 'numberAggregator.copyResults'
  context.subscriptions.push(statusBarItem)

  // コマンドの登録：選択範囲の数値を集計
  context.subscriptions.push(
    vscode.commands.registerCommand('numberAggregator.aggregateSelectedText', () => {
      aggregateSelectedText(settings)
    })
  )
  // コマンドの登録：集計結果をクリップボードにコピー
  context.subscriptions.push(
    vscode.commands.registerCommand('numberAggregator.copyResults', () => {
      copyResults(settings)
    })
  )

  /* ステータスバーの更新処理 */

  // テキストの選択変更時
  vscode.window.onDidChangeTextEditorSelection(() => {
    return updateStatusBar(settings)
  })
  // アクティブなテキストエディタの変更時
  vscode.window.onDidChangeActiveTextEditor(() => {
    return updateStatusBar(settings)
  })
  // 初回の更新
  updateStatusBar(settings)
}

/** 選択範囲の数値を集計 */
const aggregateSelectedText = (settings: ExtensionSettings) => {
  statusBarItem.command = undefined

  const editor = vscode.window.activeTextEditor

  if (!editor || editor.selection.isEmpty) {
    statusBarItem.hide()
    return
  }

  const selectedText = editor.document.getText(editor.selection)
  if (!selectedText.trim()) {
    statusBarItem.hide()
    return
  }

  const numbers = extractNumbers(selectedText, settings)
  if (numbers.length === 0) {
    statusBarItem.hide()
    return
  }

  // 集計値の表示
  statusBarItem.text = getAggregateResultForStatus(aggregate(numbers), settings)
  statusBarItem.tooltip = 'クリックして集計結果をコピー'
  statusBarItem.command = 'numberAggregator.copyResults'
  statusBarItem.show()
}

/** ステータスバーの更新 */
const updateStatusBar = async (settings: ExtensionSettings, force: boolean = false) => {
  const editor = vscode.window.activeTextEditor

  if (!editor || editor.selection.isEmpty) {
    statusBarItem.hide()
    return
  }

  const selectedText = editor.document.getText(editor.selection)
  const numbers = extractNumbers(selectedText, settings)

  if (
    // !force &&
    numbers.length > settings.maxNumbers ||
    selectedText.length > settings.maxSelectionLength
  ) {
    statusBarItem.text = `${icon}選択範囲の数値を集計`
    statusBarItem.tooltip = `クリックして選択範囲の数値を集計（数字の数: ${numbers.length}, 選択文字数: ${selectedText.length}）`
    statusBarItem.command = 'numberAggregator.aggregateSelectedText'
    statusBarItem.show()
  } else {
    // 集計値の表示
    aggregateSelectedText(settings)
  }
}

/** 文字列の中から数値を抽出する */
const extractNumbers = (text: string, { aggregateOnlyIsolatedNumbers }: ExtensionSettings) => {
  const regex = aggregateOnlyIsolatedNumbers
    ? /(?<!\S)-?\d{1,3}(,\d{3})*(\.\d+)?(?!\S)/g
    : /-?\d{1,3}(,\d{3})*(\.\d+)?/g
  const matches = text.match(regex)
  return matches ? matches.map((value) => Number(value.replaceAll(',', ''))) : []
}

/** 数値を集計する */
const aggregate = (numbers: number[]) => {
  const count = numbers.length
  let total = new Big(0)
  numbers.forEach((num) => {
    total = total.plus(new Big(num))
  })
  const average = count > 0 ? total.div(new Big(count)) : new Big(0)

  return { numbers, count, total: total.toNumber(), average: average.toNumber() }
}

/** 数値を丸める */
const toFixed = (num: number, decimalPlaces: number, trim: boolean = true) => {
  const value = num.toFixed(decimalPlaces)
  return trim ? value.replace(/0+$/, '').replace(/\.$/, '') : value
}

/** ステータスバーアイテム用の集計結果テキストを取得する */
const getAggregateResultForStatus = (
  { count, total, average }: ReturnType<typeof aggregate>,
  { decimalPlaces }: ExtensionSettings
) => {
  return `${icon} 個数: ${count} 合計: ${toFixed(total, decimalPlaces)} 平均: ${toFixed(
    average,
    decimalPlaces
  )}`
}

/** クリップボードコピー用の集計結果テキストを取得する */
const getAggregateResultForCopy = (
  { numbers, count, total, average }: ReturnType<typeof aggregate>,
  { decimalPlaces }: ExtensionSettings
) => {
  // 丸めた集計値と差があるか
  const diff =
    String(toFixed(total, decimalPlaces)) !== String(total) ||
    String(toFixed(average, decimalPlaces)) !== String(average)
  // テキストの生成
  let text = ``
  text += `個数\t${count}`
  text += `\n合計\t${total}`
  text += diff && `\t${toFixed(total, decimalPlaces, false)}`
  text += `\n平均\t${average}`
  text += diff && `\t${toFixed(average, decimalPlaces, false)}`
  text += `\n集計対象\t${numbers.join('\t')}`
  return text
}

/** 集計結果をクリップボードにコピーする */
const copyResults = async (settings: ExtensionSettings) => {
  const editor = vscode.window.activeTextEditor

  if (!editor || editor.selection.isEmpty) {
    return
  }

  const selectedText = editor.document.getText(editor.selection)
  const numbers = extractNumbers(selectedText, settings)
  if (numbers.length === 0) {
    return
  }

  const getAggregateResult = aggregate(numbers)
  statusBarItem.text = getAggregateResultForStatus(getAggregateResult, settings)
  await vscode.env.clipboard.writeText(getAggregateResultForCopy(getAggregateResult, settings))
  vscode.window.showInformationMessage('集計結果をクリップボードにコピーしました。')
}

/** 拡張機能の非アクティブ化（終了処理） */
export const deactivate = () => {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
