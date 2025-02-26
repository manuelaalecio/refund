const form = document.querySelector("form");
const amount = document.querySelector("#amount");
const expense = document.querySelector("#expense");
const category = document.querySelector("#category");

const expenseList = document.querySelector("ul");
const expensesTotal = document.querySelector("aside header h2");
const expensesQuantity = document.querySelector("aside header p span");

amount.oninput = () => {
  let value = amount.value.replace(/\D/g, "");
  value = Number(value) / 100;
  amount.value = formatCurrencyBRL(value);
};

function formatCurrencyBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

document.addEventListener("DOMContentLoaded", loadExpenses);

form.onsubmit = (event) => {
  event.preventDefault();

  const newExpense = {
    id: new Date().getTime(),
    expense: expense.value,
    category_id: category.value,
    category_name: category.options[category.selectedIndex].text,
    amount: amount.value,
    created_at: new Date(),
  };

  expenseAdd(newExpense);
  saveExpenses();
};

function expenseAdd(newExpense) {
  try {
    const expenseItem = document.createElement("li");
    expenseItem.classList.add("expense");
    expenseItem.setAttribute("data-id", newExpense.id);

    const expenseIcon = document.createElement("img");
    expenseIcon.setAttribute("src", `img/${newExpense.category_id}.svg`);
    expenseIcon.setAttribute("alt", newExpense.category_name);

    const expenseInfo = document.createElement("div");
    expenseInfo.classList.add("expense-info");

    const expenseName = document.createElement("strong");
    expenseName.textContent = newExpense.expense;

    const expenseCategory = document.createElement("span");
    expenseCategory.textContent = newExpense.category_name;

    expenseInfo.append(expenseName, expenseCategory);

    const expenseAmount = document.createElement("span");
    expenseAmount.classList.add("expense-amount");
    expenseAmount.innerHTML = `<small>R$</small>${newExpense.amount
      .toUpperCase()
      .replace("R$", "")}`;

    const removeIcon = document.createElement("img");
    removeIcon.classList.add("remove-icon");
    removeIcon.setAttribute("src", "img/remove.svg");
    removeIcon.setAttribute("alt", "remover");

    expenseItem.append(expenseIcon, expenseInfo, expenseAmount, removeIcon);
    expenseList.append(expenseItem);

    resetForm();
    updateTotals();
  } catch (error) {
    alert("Não foi possível atualizar a lista de despesas.");
    console.log(error);
  }
}

function updateTotals() {
  try {
    const items = expenseList.children;

    expensesQuantity.textContent = `${items.length} ${
      items.length > 1 ? "despesas" : "despesa"
    }`;

    let total = 0;
    for (let item of items) {
      const itemAmount = item.querySelector(".expense-amount");
      let value = itemAmount.textContent
        .replace(/[^\d,]/g, "")
        .replace(",", ".");

      value = parseFloat(value);
      if (isNaN(value)) {
        return alert(
          "Não foi possível calcular o total. O valor não parece ser um número."
        );
      }

      total += Number(value);
    }

    const symbolBRL = document.createElement("small");
    symbolBRL.textContent = "R$";

    total = formatCurrencyBRL(total).toUpperCase().replace("R$", "");

    expensesTotal.innerHTML = "";
    expensesTotal.append(symbolBRL, total);
  } catch (error) {
    alert("Não foi possível atualizar os totais.");
    console.log(error);
  }
}

expenseList.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-icon")) {
    const item = event.target.closest(".expense");
    const id = item.getAttribute("data-id");

    item.remove();
    removeExpense(id);
    updateTotals();
  }
});

function resetForm() {
  expense.value = "";
  category.value = "";
  amount.value = "";

  expense.focus();
}

function saveExpenses() {
  const expenses = [];
  document.querySelectorAll(".expense").forEach((item) => {
    expenses.push({
      id: item.getAttribute("data-id"),
      expense: item.querySelector("strong").textContent,
      category_id: item
        .querySelector("img")
        .getAttribute("src")
        .replace("img/", "")
        .replace(".svg", ""),
      category_name: item.querySelector(".expense-info span").textContent,
      amount: item
        .querySelector(".expense-amount")
        .textContent.replace("R$", "")
        .trim(),
    });
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadExpenses() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  expenses.forEach(expenseAdd);
  updateTotals();
}

function removeExpense(id) {
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  expenses = expenses.filter((expense) => expense.id !== id);
  localStorage.setItem("expenses", JSON.stringify(expenses));
}
