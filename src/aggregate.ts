import { Big } from 'big.js'

/** 個数 */
const count = (numbers: number[]) => new Big(numbers.length)

/** 合計 */
const summary = (bigNumbers: Big[]) => {
  let sum = new Big(0)
  bigNumbers.forEach((num) => {
    sum = sum.plus(new Big(num))
  })
  return sum
}

/** 平均 */
const average = (count: Big, sum: Big) => (count.toNumber() > 0 ? sum.div(count).toNumber() : 0)

/** 中央値 */
const median = (count: Big, bigNumbers: Big[]) => {
  if (count.toNumber() === 0) {
    return 0
  }
  // 配列を昇順にソート
  const sortedNumbers = [...bigNumbers].sort((a, b) => a.toNumber() - b.toNumber())
  const midIndex = Math.floor(sortedNumbers.length / 2)
  // 配列の長さが奇数の場合
  if (sortedNumbers.length % 2 !== 0) {
    return sortedNumbers[midIndex].toNumber()
  }
  // 配列の長さが偶数の場合（中央の2つの要素の平均を返す）
  return sortedNumbers[midIndex - 1].plus(sortedNumbers[midIndex]).div(2).toNumber()
}

/** 最小 */
const min = (numbers: number[]) => Math.min(...numbers)

/** 最大 */
const max = (numbers: number[]) => Math.max(...numbers)

/** 数値を集計する */
export const aggregate = (numbers: number[]) => {
  const bigNumbers = numbers.map((num) => new Big(num))
  const cnt = count(numbers)
  let sum = summary(bigNumbers)
  return {
    numbers,
    count: cnt.toNumber(),
    summary: sum.toNumber(),
    average: average(cnt, sum),
    median: median(cnt, bigNumbers),
    min: min(numbers),
    max: max(numbers),
  }
}
