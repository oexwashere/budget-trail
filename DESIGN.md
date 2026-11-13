# Design notes

## Scope

Follow your monthly income and expenses, one clear transaction at a time.

## Implementation decisions

Amounts are parsed into integer cents instead of repeatedly summing floating-point currency. Dates are checked against real calendar dates. Monthly summaries keep income and expenses separate and group expenses by category.

## Boundaries

One currency per workspace; there are no exchange rates, bank connections, recurring transactions, or cross-device sync. Entries are saved locally; CSV export is your backup path. Browser data clearing removes your ledger.

## Verification

Domain functions are tested with the Node built-in test runner; browser workflows are checked separately.

Tests describe expected behavior rather than depending on a live external service. CI configuration is included, but remote CI execution is not implied by local test results.
