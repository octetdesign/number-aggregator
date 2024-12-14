# Number Aggregator

エディタの選択範囲に含まれる数値を集計してリアルタイムにステータスバーに表示する Visual Studio Code 拡張機能です。

Excel に同じような機能がありますが、まさにそれを参考にしています。

## 特徴

- エディタで選択された文字列から数値を抽出してステータスバーに集計値を表示します。
  - コマンドパレットからコマンド`選択範囲の数値を集計`を選択して手動で集計を実行することもできます。
- 表示される集計値は以下の通りです。
  - 個数：抽出した数値の数
  - 合計：抽出した数値の合計値
  - 平均：抽出した数値の平均値
- 集計結果をクリップボードにコピーすることができます。
  - ステータスバーの集計結果をクリックするか、コマンドパレットからコマンド`集計結果をコピー`を選択します。
  - 集計値（個数、合計、平均）に加え、選択範囲から抽出した数値のリストがコピーされます。
- エディタのパフォーマンスを考慮し、リアルタイム集計を抑制する条件を設定することができます。

## 設定

- `number-aggregator.maxNumbers`: リアルタイム集計を行う対象となる数字の最大数です。選択範囲から抽出された数字の数がこの設定値を超えた場合、集計は行われず、ステータスバーには集計値が表示されなくなります。
- `number-aggregator.maxSelectionLength`: リアルタイム集計を行う最大文字数です。選択範囲の文字数がこの設定値を超えた場合、集計は行われず、ステータスバーには集計値が表示されなくなります。
- `number-aggregator.aggregateOnlyIsolatedNumbers`: 数字が含まれる単語の数字は集計対象としない。（前後にスペースや改行がある数字のみ集計対象にします。）
- `number-aggregator.decimalPlaces`: 小数点以下の桁数。ステータスバーに表示される集計値の小数点以下の桁数を指定します。

## リリースノート

### 0.0.5

設定の変更が即時適用されるよう修正

### 0.0.4

数字が含まれる単語の数字を集計対象とした場合の数字の抽出ロジックに問題があったので修正

### 0.0.3

数字の抽出ロジックに問題があったので修正

### 0.0.1

最初のリリース
