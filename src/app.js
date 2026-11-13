import {
  node,
  field,
  form,
  panel,
  stat,
  button,
  group,
  empty,
  mount,
  read,
  save,
  id,
  notice,
  localDate,
  download,
  csv,
  validateList,
} from "./ui.js";
import { transaction, valid, summarize, money } from "./model.js";
const key = "budget-trail.v1";
let items = read(key, [], (data) => validateList(data, valid));
let month = localDate().slice(0, 7);
function commit() {
  save(key, items);
  render();
}
function render() {
  const summary = summarize(items, month);
  const monthField = field("Selected month", "month", "month", month);
  monthField.querySelector("input").addEventListener("change", (e) => {
    if (e.target.value) {
      month = e.target.value;
      render();
    }
  });
  const add = form(
    [
      field("Description", "label", "text", "", { maxLength: 180 }),
      field("Amount", "amount", "text", "", { placeholder: "24.50" }),
      field("Type", "kind", "select", "expense", {
        choices: ["expense", "income"],
      }),
      field("Category", "category", "text", "", {
        placeholder: "Groceries",
        maxLength: 80,
      }),
      field("Date", "date", "date", localDate()),
    ],
    (data) => {
      items.push(transaction(data, id()));
      commit();
      notice("Transaction added.");
    },
    "Add transaction",
  );
  const rows = summary.items
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) =>
      node(
        "div",
        { class: "row" },
        node(
          "div",
          {},
          node("h3", {}, item.label),
          node("p", {}, `${item.category} · ${item.date}`),
        ),
        node(
          "strong",
          {},
          (item.kind === "expense" ? "−" : "+") + money(item.amount),
        ),
        button(
          "Delete",
          () => {
            if (confirm("Delete this transaction?")) {
              items = items.filter((i) => i.id !== item.id);
              commit();
            }
          },
          "danger",
        ),
      ),
    );
  mount(
    node(
      "div",
      { class: "stats" },
      stat("Income", money(summary.income)),
      stat("Expenses", money(summary.expense)),
      stat("Remaining", money(summary.balance)),
    ),
    node(
      "div",
      { class: "grid" },
      panel("A new entry", add),
      node(
        "div",
        { class: "stack" },
        panel(
          "This month",
          node(
            "div",
            { class: "toolbar" },
            monthField,
            button("Export CSV", () =>
              download(
                "budget-" + month + ".csv",
                csv([
                  ["date", "type", "category", "description", "amount"],
                  ...summary.items.map((i) => [
                    i.date,
                    i.kind,
                    i.category,
                    i.label,
                    money(i.amount),
                  ]),
                ]),
                "text/csv",
              ),
            ),
          ),
          ...(rows.length
            ? rows
            : [empty("Your ledger is ready. Add your first transaction.")]),
        ),
        panel(
          "Where it goes",
          ...Object.entries(summary.categories)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) =>
              node(
                "div",
                { class: "row" },
                category,
                node("strong", {}, money(amount)),
              ),
            ),
          empty(
            "Amounts use your own consistent currency; no conversion is applied.",
          ),
        ),
      ),
    ),
  );
}
render();
