[※日本語の説明は下にあります。 / The description in Japanese is provided below.](#number-aggregator日本語)

---

# Number Aggregator

Aggregates numerical values within the selected range in the editor and displays the total in real time on the status bar.

## Features

- Extracts numbers from the selected text in the editor and displays the aggregated values in the status bar.
  - You can also manually perform aggregation by selecting the command `Aggregate Numbers in Selection` from the command palette.
  - The aggregated values displayed in the status bar are:
    - Count, Sum, Average
- Copying aggregation results to the clipboard:
  - Click the aggregation results in the status bar or select the command `Copy Aggregation Results` from the command palette.
  - The clipboard will contain the list of extracted numbers from the selection (aggregation targets) and the following values:
    - Count, Sum, Average, Median, Minimum, Maximum
- Configurable conditions for real-time aggregation to prevent processing when large amounts of text are selected.

## Settings

- `number-aggregator.aggregateOnlyIsolatedNumbers`
  - Excludes numbers within words from aggregation. (Only numbers with spaces or line breaks before and after them are aggregated)
- `number-aggregator.decimalPlaces`
  - Number of decimal places for aggregated values displayed in the status bar.
- `number-aggregator.icon`
  - Icon displayed in the status bar.
- `number-aggregator.maxNumbers`
  - Maximum number of numbers for real-time aggregation. When the number of extracted numbers exceeds this value, aggregation stops and values are no longer displayed in the status bar.
- `number-aggregator.maxSelectionLength`
  - Maximum number of characters for real-time aggregation. When the selection length exceeds this value, aggregation stops and values are no longer displayed in the status bar.

---

## Number Aggregator（日本語）

エディタの選択範囲内の数値を集計し、リアルタイムでステータスバーに表示します。

## 特徴

- エディタで選択されたテキストから数値を抽出してステータスバーに集計値を表示します。
  - コマンドパレットから `選択範囲の数値を集計` を選択して手動で集計を実行することもできます。
  - ステータスバーに表示される集計値：
    - 個数、合計、平均
- 集計結果をクリップボードにコピーすることができます。
  - ステータスバーの集計結果をクリックするか、または、コマンドパレットから `集計結果をコピー` を選択します。
  - コピーされる内容：選択範囲から抽出した数値リスト（集計対象）および以下の集計値
    - 個数、合計、平均、中央値、最小値、最大値
- 大量テキスト選択時の処理抑制のための集計条件を設定することができます。

## 設定

- `number-aggregator.aggregateOnlyIsolatedNumbers`
  - 単語内の数値を集計対象から除外。（前後にスペースや改行がある数値のみを集計）
- `number-aggregator.decimalPlaces`
  - ステータスバーに表示される集計値の小数点以下桁数。
- `number-aggregator.icon`
  - ステータスバーに表示するアイコン。
- `number-aggregator.maxNumbers`
  - リアルタイム集計の対象となる数値の数の上限。この値を超えた場合、集計を停止します。
- `number-aggregator.maxSelectionLength`
  - リアルタイム集計を行う選択テキストの最大文字数。この値を超えた場合、集計を停止します。
