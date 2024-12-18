import * as vscode from 'vscode'
import { aggregate } from './aggregate'

/** アイコン */
let icon: string | undefined

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
  /** アイコン */
  icon?: string
}

/** 設定オブジェクト */
let settings: ExtensionSettings

/** 設定の読み込み */
export const loadSettings = () => {
  const config = vscode.workspace.getConfiguration('number-aggregator')
  settings = {
    maxNumbers: config.get<number>('maxNumbers', 100),
    maxSelectionLength: config.get<number>('maxSelectionLength', 1000),
    aggregateOnlyIsolatedNumbers: config.get<boolean>('aggregateOnlyIsolatedNumbers', true),
    decimalPlaces: config.get<number>('decimalPlaces', 2),
    icon: config.get<string>('icon', '🔢'),
  }
  // console.log({ settings })

  // アイコンの適用
  icon = settings.icon
}

/** ステータスバーアイテムの生成 */
export const createStatusBarItem = () => {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 101) // NOTE: 101以上でカーソル位置表示より左に表示される
  statusBarItem.command = 'number-aggregator.copyResults'
  statusBarItem.name = '数値の集計値'
  return statusBarItem
}

/** ステータスバーの更新 */
export const updateStatusBar = async (statusBarItem: vscode.StatusBarItem) => {
  // 何も選択されていない／数値が抽出されていない場合はステータスバーを表示しない
  const selectionData = getSelectionData()
  if (!selectionData) {
    statusBarItem.hide()
    return
  }
  // ステータスバーの更新
  const { text, numbers } = selectionData
  if (numbers.length > settings.maxNumbers || text.length > settings.maxSelectionLength) {
    // 閾値を超えている場合は集計せず手動集計を促すメッセージを表示
    // statusBarItem.text = `$(symbol-operator) 選択範囲の数値を集計`
    statusBarItem.text = `${icon}選択範囲の数値を集計`
    statusBarItem.tooltip = `クリックして選択範囲の数値を集計（数値の数: ${numbers.length}, 選択文字数: ${text.length}）`
    statusBarItem.command = 'number-aggregator.aggregateSelectedText'
    statusBarItem.show()
  } else {
    // 集計結果の表示
    aggregateSelectedText(statusBarItem)
  }
}

/** 選択範囲の数値を集計 */
export const aggregateSelectedText = (statusBarItem: vscode.StatusBarItem) => {
  // ステータスバーのコマンドをリセット
  statusBarItem.command = undefined
  // 何も選択されていない／数値が抽出されていない場合はステータスバーを表示しない
  const selectionData = getSelectionData()
  if (!selectionData) {
    statusBarItem.hide()
    return
  }
  // 集計結果の取得
  const aggregateResult = aggregate(selectionData.numbers)
  // 集計結果の表示
  statusBarItem.text = getAggregateResultForStatus(aggregateResult)
  statusBarItem.tooltip = 'クリックして集計結果をコピー'
  statusBarItem.command = 'number-aggregator.copyResults'
  statusBarItem.show()
}

/** 集計結果をクリップボードにコピーする */
export const copyResults = async (statusBarItem: vscode.StatusBarItem) => {
  // 何も選択されていない／数値が抽出されていない場合は何もしない
  const selectionData = getSelectionData()
  if (!selectionData) {
    return
  }
  // 集計結果の取得
  const aggregateResult = aggregate(selectionData.numbers)
  // ステータスバーの更新
  statusBarItem.text = getAggregateResultForStatus(aggregateResult)
  // クリップボードにコピー
  await vscode.env.clipboard.writeText(getAggregateResultForCopy(aggregateResult))
  // メッセージの表示
  vscode.window.showInformationMessage('集計結果をクリップボードにコピーしました。')
}

/**
 * 選択範囲の文字列と選択範囲から抽出した数値を取得する
 * ※数値が抽出できた場合のみ結果を返す。
 *  */
const getSelectionData = () => {
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
  const numbers = extractNumbers(text)
  if (numbers.length === 0) {
    return
  }
  return { text, numbers }
}

/** 文字列の中から数値を抽出する */
const extractNumbers = (text: string) => {
  const regex = settings.aggregateOnlyIsolatedNumbers
    ? /(?<!\S)[-+]?\d+(?:,\d{3})*(?:\.\d+)?(?!\S)/g // 前後にスペースや改行がある数字のみ集計対象とする
    : /[-+]?\d+(?:,\d{3})*(?:\.\d+)?/g // 数字が含まれる単語の数字も集計対象とする
  const matches = text.match(regex)
  const numbers = matches ? matches.map((value) => Number(value.replaceAll(',', ''))) : []
  // console.log('[matches]', '\n' + matches?.join('\n'))
  // console.log('[numbers]', '\n' + numbers.join('\n'))
  return numbers
}

/** 数値を丸める */
const toFixed = (num: number, decimalPlaces: number, trim: boolean = true) => {
  const value = num.toFixed(decimalPlaces)
  return trim ? value.replace(/0+$/, '').replace(/\.$/, '') : value
}

/** ステータスバー用の集計結果テキストを取得する */
const getAggregateResultForStatus = ({ count, summary, average }: ReturnType<typeof aggregate>) => {
  const { decimalPlaces } = settings
  return `${icon} 個数: ${count} 合計: ${toFixed(summary, decimalPlaces)} 平均: ${toFixed(
    average,
    decimalPlaces
  )}`
}

/** クリップボードコピー用の集計結果テキストを取得する */
const getAggregateResultForCopy = ({
  numbers,
  count,
  summary,
  average,
  median,
  min,
  max,
}: ReturnType<typeof aggregate>) => {
  const { decimalPlaces } = settings
  // テキストの生成
  let text = ``
  text += `集計対象\t${numbers.join('\t')}`
  text += `\n個数\t${count}`
  text += `\n合計\t${summary}`
  text += `\n平均\t${average}`
  text += `\n中央値\t${median}`
  text += `\n最小値\t${min}`
  text += `\n最大値\t${max}`
  text += `\n`
  return text
}
