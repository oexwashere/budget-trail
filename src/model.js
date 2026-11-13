export function cents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value).trim()))
    throw Error("Use a nonnegative amount with up to two decimal places.");
  const [whole, fraction = ""] = String(value).trim().split(".");
  const n = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(n) || n > 1e12) throw Error("Amount is too large.");
  return n;
}
export const money = (n) => (n / 100).toFixed(2);
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T12:00:00Z");
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
}
export function transaction(data, id) {
  if (!data.label?.trim() || data.label.length > 180)
    throw Error("Add a description under 180 characters.");
  if (!["income", "expense"].includes(data.kind))
    throw Error("Choose income or expense.");
  if (!validDate(data.date)) throw Error("Choose a valid date.");
  if (!data.category?.trim() || data.category.length > 80)
    throw Error("Add a category under 80 characters.");
  const amount = cents(data.amount);
  if (amount === 0) throw Error("Amount must be greater than zero.");
  return {
    id,
    label: data.label.trim(),
    category: data.category.trim(),
    kind: data.kind,
    date: data.date,
    amount,
  };
}
export function valid(item) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.category === "string" &&
    ["income", "expense"].includes(item.kind) &&
    validDate(item.date) &&
    Number.isSafeInteger(item.amount) &&
    item.amount > 0 &&
    item.amount <= 1e12
  );
}
export function summarize(items, month) {
  const selected = items.filter((i) => i.date.startsWith(month));
  let income = 0,
    expense = 0;
  const categories = Object.create(null);
  for (const item of selected) {
    if (item.kind === "income") income += item.amount;
    else {
      expense += item.amount;
      categories[item.category] =
        (Object.hasOwn(categories, item.category)
          ? categories[item.category]
          : 0) + item.amount;
    }
  }
  return {
    income,
    expense,
    balance: income - expense,
    categories,
    items: selected,
  };
}
