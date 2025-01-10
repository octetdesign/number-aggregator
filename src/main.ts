import * as vscode from 'vscode'
import { aggregate } from './aggregate'

// NOTE: 国際化対応のためのコード（参考：https://qiita.com/wraith13/items/8f873a1867a5cc2865a8）
import localeEn from '../package.nls.json'
import localeJa from '../package.nls.ja.json'
export type LocaleKeyType = keyof typeof localeEn
interface LocaleEntry {
  [key: string]: string
}
const localeTableKey = vscode.env.language
const localeTable = Object.assign(
  localeEn,
  (<{ [key: string]: LocaleEntry }>{
    ja: localeJa,
  })[localeTableKey] || {}
)
const localeString = (key: string): string => localeTable[key] || key
// const localeMap = (key: LocaleKeyType): string => localeString(key)

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
  statusBarItem.name = localeString('statusBarItem.aggregateNumbers.name') // '数値の集計'
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
    statusBarItem.text = `${icon}${localeString('statusBarItem.aggregateNumbers.text')}` // `${icon}選択範囲の数値を集計`
    statusBarItem.tooltip = localeString('statusBarItem.aggregateNumbers.tooltip')
      .replace('${numbersLength}', String(numbers.length))
      .replace('${selectionLength}', String(text.length)) // `クリックして選択範囲の数値を集計（数値の数: ${numbersLength}, 選択文字数: ${selectionLength}）`
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
  statusBarItem.tooltip = localeString('statusBarItem.clickToCopy.tooltip') // 'クリックして集計結果をコピー'
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
  vscode.window.showInformationMessage(localeString('message.aggregationResultsCopied')) // '集計結果をクリップボードにコピーしました。'
}

/**
 * 選択範囲の文字列と選択範囲から抽出した数値を取得する
 * ※数値が２つ以上抽出できた場合のみ結果を返す。
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
  if (numbers.length < 2) {
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
  return (
    `${icon} ` +
    `${localeString('text.count')}: ` + // '個数: '
    `${count} ` +
    `${localeString('text.summary')}: ` + // '合計: '
    `${toFixed(summary, decimalPlaces)} ` +
    `${localeString('text.average')}: ` + // '平均: '
    `${toFixed(average, decimalPlaces)}`
  )
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
  // テキストの生成
  let text = ``
  text += `${localeString('text.numbersToAggregate')}\t${numbers.join('\t')}` // 集計対象
  text += `\n${localeString('text.count')}\t${count}` // 個数
  text += `\n${localeString('text.summary')}\t${summary}` // 合計
  text += `\n${localeString('text.average')}\t${average}` // 平均
  text += `\n${localeString('text.median')}\t${median}` // 中央値
  text += `\n${localeString('text.min')}\t${min}` // 最小値
  text += `\n${localeString('text.max')}\t${max}` // 最大値
  text += `\n`
  return text
}
