import * as vscode from 'vscode'
import { Big } from 'big.js'
import { ExtensionSettings } from './extension'

/** アイコン */
let icon = '🔢' // '🧮'

/** ステータスバーアイテムの生成 */
export const createStatusBarItem = () => {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.command = 'numberAggregator.copyResults'
  return statusBarItem
}

/** ステータスバーの更新 */
export const updateStatusBar = async (
  statusBarItem: vscode.StatusBarItem,
  settings: ExtensionSettings
) => {
  // 何も選択されていない／数値が抽出されていない場合はステータスバーを表示しない
  const selectionData = getSelectionData(settings)
  if (!selectionData) {
    statusBarItem.hide()
    return
  }
  // ステータスバーの更新
  const { text, numbers } = selectionData
  if (numbers.length > settings.maxNumbers || text.length > settings.maxSelectionLength) {
    // 閾値を超えている場合は集計せず手動集計を促すメッセージを表示
    statusBarItem.text = `${icon}選択範囲の数値を集計`
    statusBarItem.tooltip = `クリックして選択範囲の数値を集計（数字の数: ${numbers.length}, 選択文字数: ${text.length}）`
    statusBarItem.command = 'numberAggregator.aggregateSelectedText'
    statusBarItem.show()
  } else {
    // 集計結果の表示
    aggregateSelectedText(statusBarItem, settings)
  }
}

/** 選択範囲の数値を集計 */
export const aggregateSelectedText = (
  statusBarItem: vscode.StatusBarItem,
  settings: ExtensionSettings
) => {
  // ステータスバーのコマンドをリセット
  statusBarItem.command = undefined
  // 何も選択されていない／数値が抽出されていない場合はステータスバーを表示しない
  const selectionData = getSelectionData(settings)
  if (!selectionData) {
    statusBarItem.hide()
    return
  }
  // 集計結果の取得
  const aggregateResult = aggregate(selectionData.numbers)
  // 集計結果の表示
  statusBarItem.text = getAggregateResultForStatus(aggregateResult, settings)
  statusBarItem.tooltip = 'クリックして集計結果をコピー'
  statusBarItem.command = 'numberAggregator.copyResults'
  statusBarItem.show()
}

/** 集計結果をクリップボードにコピーする */
export const copyResults = async (
  statusBarItem: vscode.StatusBarItem,
  settings: ExtensionSettings
) => {
  // 何も選択されていない／数値が抽出されていない場合は何もしない
  const selectionData = getSelectionData(settings)
  if (!selectionData) {
    return
  }
  // 集計結果の取得
  const aggregateResult = aggregate(selectionData.numbers)
  // ステータスバーの更新
  statusBarItem.text = getAggregateResultForStatus(aggregateResult, settings)
  // クリップボードにコピー
  await vscode.env.clipboard.writeText(getAggregateResultForCopy(aggregateResult, settings))
  // メッセージの表示
  vscode.window.showInformationMessage('集計結果をクリップボードにコピーしました。')
}

/**
 * 選択範囲の文字列と選択範囲から抽出した数値を取得する
 * ※数値が抽出できた場合のみ結果を返す。
 *  */
const getSelectionData = (settings: ExtensionSettings) => {
  const editor = vscode.window.activeTextEditor
  if (!editor || editor.selection.isEmpty) {
    return
  }
  // 選択範囲の文字列を取得
  const text = editor.document.getText(editor.selection)
  if (!text.trim()) {
    return
  }
  // 数値の抽出
  const numbers = extractNumbers(text, settings)
  if (numbers.length === 0) {
    return
  }
  return { text, numbers }
}

/** 文字列の中から数値を抽出する */
const extractNumbers = (text: string, { aggregateOnlyIsolatedNumbers }: ExtensionSettings) => {
  const regex = aggregateOnlyIsolatedNumbers
    ? /(?<!\S)-?\d{1,3}(,\d{3})*(\.\d+)?(?!\S)/g // 前後にスペースや改行がある数字のみ集計対象とする
    : /-?\d{1,3}(,\d{3})*(\.\d+)?/g // 数字が含まれる単語の数字も集計対象とする
  const matches = text.match(regex)
  return matches ? matches.map((value) => Number(value.replaceAll(',', ''))) : []
}

/** 数値を集計する */
const aggregate = (numbers: number[]) => {
  // 個数
  const count = numbers.length
  // 合計
  let total = new Big(0)
  numbers.forEach((num) => {
    total = total.plus(new Big(num))
  })
  // 平均
  const average = count > 0 ? total.div(new Big(count)) : new Big(0)

  return { numbers, count, total: total.toNumber(), average: average.toNumber() }
}

/** 数値を丸める */
const toFixed = (num: number, decimalPlaces: number, trim: boolean = true) => {
  const value = num.toFixed(decimalPlaces)
  return trim ? value.replace(/0+$/, '').replace(/\.$/, '') : value
}

/** ステータスバー用の集計結果テキストを取得する */
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
  text += diff ? `\t${toFixed(total, decimalPlaces, false)}` : ''
  text += `\n平均\t${average}`
  text += diff ? `\t${toFixed(average, decimalPlaces, false)}` : ''
  text += `\n集計対象\t${numbers.join('\t')}`
  return text
}
