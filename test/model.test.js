import test from "node:test";
import assert from "node:assert/strict";
import { cents, transaction, summarize, validDate } from "../src/model.js";
test("money uses exact cents and rejects ambiguous formats", () => {
  assert.equal(cents("0.29"), 29);
  assert.equal(cents("12.5"), 1250);
  for (const v of ["-1", "1.234", "1e2", "NaN", ""])
    assert.throws(() => cents(v));
});
test("dates reject impossible calendar days", () => {
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2025-02-29"), false);
});
test("monthly totals isolate income and expense categories", () => {
  const make = (kind, amount, date = "2026-01-01", category = "Food") =>
    transaction(
      { label: "Entry", kind, amount, date, category },
      Math.random().toString(),
    );
  const r = summarize(
    [
      make("income", "100"),
      make("expense", "25.10"),
      make("expense", "5", "2026-02-01"),
    ],
    "2026-01",
  );
  assert.equal(r.balance, 7490);
  assert.equal(r.categories.Food, 2510);
});
test("prototype-like category names are treated as data", () => {
  const r = summarize(
    [
      transaction(
        {
          label: "x",
          kind: "expense",
          amount: "1",
          date: "2026-01-01",
          category: "constructor",
        },
        "a",
      ),
    ],
    "2026-01",
  );
  assert.equal(r.expense, 100);
  assert.equal(r.categories.constructor, 100);
});

test("special object keys cannot change category storage", () => {
  const r = summarize(
    [
      transaction(
        {
          label: "x",
          kind: "expense",
          amount: "1",
          date: "2026-01-01",
          category: "__proto__",
        },
        "a",
      ),
    ],
    "2026-01",
  );
  assert.equal(r.categories["__proto__"], 100);
  assert.equal(Object.getPrototypeOf(r.categories), null);
});
