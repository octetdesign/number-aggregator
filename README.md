# Number Aggregator

[English](#English) | [日本語](#日本語)

## English

Aggregates the numerical values within the selected range in the editor and displays the total in real time on the status bar.

## Features

- Extracts numbers from the selected text in the editor and displays the aggregated values in the status bar.
  - You can also manually perform aggregation by selecting the command `Aggregate Numbers in Selection` from the command palette.
  - The aggregated values displayed in the status bar are as follows:
    - Count, Summary, Average
- You can copy the aggregation results to the clipboard.
  - Click the aggregation results in the status bar or select the command `Copy Aggregation Results` from the command palette.
  - The clipboard will contain the list of extracted numbers from the selection (the aggregation targets) and the following aggregated values:
    - Count, Summary, Average, Median, Minimum, Maximum
- You can set conditions for real-time aggregation to suppress aggregation processing when a large amount of text is selected.

## Settings

- `number-aggregator.aggregateOnlyIsolatedNumbers`: 数字が含まれる単語の数字は集計対象としない。（前後にスペースや改行がある数字のみ集計対象にします。）
- `number-aggregator.decimalPlaces`: 小数点以下の桁数。ステータスバーに表示される集計値の小数点以下の桁数を指定します。
- `number-aggregator.icon`: ステータスバーに表示するアイコンを設定します。
- `number-aggregator.maxNumbers`: リアルタイム集計を行う対象となる数字の最大数です。選択範囲から抽出された数字の数がこの設定値を超えた場合、集計は行われず、ステータスバーには集計値が表示されなくなります。
- `number-aggregator.maxSelectionLength`: リアルタイム集計を行う最大文字数です。選択範囲の文字数がこの設定値を超えた場合、集計は行われず、ステータスバーには集計値が表示されなくなります。

---

## 日本語

エディタの選択範囲に含まれる数値を集計してリアルタイムにステータスバーに表示します。

## 特徴

- エディタで選択された文字列から数値を抽出してステータスバーに集計値を表示します。
  - コマンドパレットからコマンド `選択範囲の数値を集計` を選択して手動で集計を実行することもできます。
  - ステータスバーに表示される集計値は以下の通りです。
    - 個数、合計、平均
- 集計結果をクリップボードにコピーすることができます。
  - ステータスバーの集計結果をクリックするか、コマンドパレットからコマンド `集計結果をコピー` を選択します。
  - クリップボードには選択範囲から抽出した数値のリスト（集計対象）と以下の集計値がコピーされます。
    - 個数、合計、平均、中央値、最小値、最大値
- リアルタイム集計を行う条件を設定して、大量のテキストが選択された際の集計処理を抑制することができます。

## 設定

- `number-aggregator.aggregateOnlyIsolatedNumbers`: 数字が含まれる単語の数字は集計対象としない。（前後にスペースや改行がある数字のみ集計対象にします。）
- `number-aggregator.decimalPlaces`: 小数点以下の桁数。ステータスバーに表示される集計値の小数点以下の桁数を指定します。
- `number-aggregator.icon`: ステータスバーに表示するアイコンを設定します。
- `number-aggregator.maxNumbers`: リアルタイム集計を行う対象となる数字の最大数です。選択範囲から抽出された数字の数がこの設定値を超えた場合、集計は行われず、ステータスバーには集計値が表示されなくなります。
- `number-aggregator.maxSelectionLength`: リアルタイム集計を行う最大文字数です。選択範囲の文字数がこの設定値を超えた場合、集計は行われず、ステータスバーには集計値が表示されなくなります。
