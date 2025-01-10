# Number Aggregator

This is a Visual Studio Code extension that aggregates numbers in the selected text within the editor and displays the results in the status bar in real time.

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

- `number-aggregator.aggregateOnlyIsolatedNumbers`: Excludes numbers within words from aggregation. (Only numbers with spaces or line breaks before and after them are aggregated.)
- `number-aggregator.decimalPlaces`: The number of decimal places. Specifies the number of decimal places for the aggregated values displayed in the status bar.
- `number-aggregator.icon`: Sets the icon displayed in the status bar.
- `number-aggregator.maxNumbers`: The maximum number of numbers for real-time aggregation. If the number of numbers extracted from the selection exceeds this setting value, aggregation will not be performed, and the aggregated values will no longer be displayed in the status bar.
- `number-aggregator.maxSelectionLength`: The maximum number of characters for real-time aggregation. If the number of characters in the selection exceeds this setting value, aggregation will not be performed, and the aggregated values will no longer be displayed in the status bar.
