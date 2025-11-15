document.addEventListener('DOMContentLoaded', () => {

  // 🚩 FLAG FOR DEMO MODE 🚩
  // Set to 'true' to ensure the app starts clean for the buyer/demo.
  // Set to 'false' for regular development or user operation.
  const IS_DEMO_MODE = true; 
  
  // If the flag is true, clear all user data immediately upon load.
  if (IS_DEMO_MODE) {
      const keysToClear = [
          'initialCash', 
          'initialCard', 
          'myOverallBalance', 
          'myTodaysBalance', 
          'lastVisitDate',
          'myExpenses' 
      ];
      keysToClear.forEach(key => {
          localStorage.removeItem(key);
      });
      // OPTIONAL: You might want to remove the alert, but it's good for confirmation.
      // alert("DEMO MODE ACTIVE: All previous data has been cleared.");
  }


  // Global variables
  let overallBalance = 0;
  let todaysBalance = 0;
  const todayString = new Date().toLocaleDateString();
  const EXPENSE_STORAGE_KEY = 'myExpenses'; 

  // New initial values
  let initialCash = parseFloat(localStorage.getItem('initialCash')) || 0;
  let initialCard = parseFloat(localStorage.getItem('initialCard')) || 0;
  let expenses = JSON.parse(localStorage.getItem(EXPENSE_STORAGE_KEY)) || [];


  // DOM Elements
  const tableBody = document.getElementById('expenseTable') ?
    document.getElementById('expenseTable').querySelector('tbody') :
    null;
  const form = document.getElementById('expenseForm');
  const setInitialButton = document.getElementById('setInitialValues');


  // --- UI Update Functions ---
  function updateInitialUI() {
    if (document.getElementById("cashInitial")) {
      document.getElementById("cashInitial").textContent =
        `Valor Inicial Cash: $${initialCash.toLocaleString()}`;
    }
    if (document.getElementById("cardInitial")) {
      document.getElementById("cardInitial").textContent =
        `Valor Inicial Card: $${initialCard.toLocaleString()}`;
    }
    if (document.getElementById("totalInitial")) {
      document.getElementById("totalInitial").textContent =
        `Valor Inicial Total: $${(initialCash + initialCard).toLocaleString()}`;
    }
    
    checkInitialValuesSet();
  }

  function updateBalanceUI() {
    if (document.getElementById('overall')) {
      document.getElementById('overall').textContent =
        `Balance General: $${overallBalance.toLocaleString()}`;
    }
    if (document.getElementById('today')) {
      document.getElementById('today').textContent =
        `Gastado Hoy: $${todaysBalance.toLocaleString()}`;
    }
  }

  function addRowToTable(expense) {
    if (!tableBody) return;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${expense.date}</td>
      <td>${expense.category}</td>
      <td>${expense.place}</td>
      <td>$${expense.amount.toLocaleString()}</td>
      <td>${expense.method}</td>
    `;
    tableBody.appendChild(newRow);
  }

  function loadExpenses() {
    if (tableBody) {
      tableBody.innerHTML = ''; 
      expenses.forEach(addRowToTable);
    }
  }
  
  function checkInitialValuesSet() {
      if (setInitialButton && (initialCash > 0 || initialCard > 0)) {
          setInitialButton.disabled = true;
          setInitialButton.textContent = "Valores Iniciales Establecidos";
          setInitialButton.title = "Usa el botón 'Añadir Dinero' para incrementar el balance.";
      } else if (setInitialButton) {
          setInitialButton.disabled = false;
          setInitialButton.textContent = "Establecer Valores Iniciales";
      }
  }


  // --- Initialization Logic ---
  
  updateInitialUI(); 
  
  // load general balance (use initial values if overall is missing)
  overallBalance = parseFloat(localStorage.getItem('myOverallBalance')) || (initialCash + initialCard); 
  
  // daily spent 
  const lastVisitDate = localStorage.getItem('lastVisitDate') || '';

  if (todayString === lastVisitDate) {
    todaysBalance = parseFloat(localStorage.getItem('myTodaysBalance')) || 0;
  } else {
    todaysBalance = 0;
    localStorage.setItem('myTodaysBalance', '0');
    localStorage.setItem('lastVisitDate', todayString);
  }

  updateBalanceUI();
  loadExpenses();


  // --- Feature 1: Set/Update Initial Values ---
  if (setInitialButton) {
      setInitialButton.addEventListener('click', () => {
      const newCash = parseFloat(prompt("Ingresa el valor inicial Cash:", initialCash));
      const newCard = parseFloat(prompt("Ingresa el valor inicial Card:", initialCard));

      if (!isNaN(newCash) && newCash >= 0 && !isNaN(newCard) && newCard >= 0) {
          
          if (initialCash === 0 && initialCard === 0) {
              overallBalance = newCash + newCard;
          }

          initialCash = newCash;
          initialCard = newCard;
          
          localStorage.setItem("initialCash", initialCash);
          localStorage.setItem("initialCard", initialCard);
          localStorage.setItem('myOverallBalance', overallBalance);
          
          alert("Valores iniciales establecidos exitosamente.");
      } else {
          alert("Valores inválidos. Por favor, ingrese números válidos.");
      }

      updateInitialUI();
      updateBalanceUI();
    });
  }


  // --- Feature 2: Deposit/Add Money ---
  if (document.getElementById('addMoney')) {
      document.getElementById('addMoney').addEventListener('click', () => {
      const depositAmount = parseFloat(prompt("Ingresa el monto a depositar:", 0));
      const depositMethod = prompt("Depositar a (Cash/Card):", "Cash");

      if (isNaN(depositAmount) || depositAmount <= 0) {
          alert("Monto de depósito inválido!");
          return;
      }

      overallBalance += depositAmount;

      if (depositMethod && depositMethod.toLowerCase() === "cash") {
          initialCash += depositAmount;
          localStorage.setItem("initialCash", initialCash);
          alert(`Depósito de $${depositAmount.toLocaleString()} añadido a Cash.`);
      } else if (depositMethod && depositMethod.toLowerCase() === "card") {
          initialCard += depositAmount;
          localStorage.setItem("initialCard", initialCard);
          alert(`Depósito de $${depositAmount.toLocaleString()} añadido a Card.`);
      } else {
          alert("Método de depósito no reconocido. Se agregó solo al Balance General.");
      }

      localStorage.setItem('myOverallBalance', overallBalance);
      updateInitialUI();
      updateBalanceUI();
    });
  }


  // --- Feature 3: Add Expense ---
  // ... (Your existing expense submission logic) ...
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const date = document.getElementById('date').value;
      const place = document.getElementById('place').value;
      const method = document.getElementById('method').value;
      const category = document.getElementById('category').value;
      const description = document.getElementById('description').value;
      const amount = parseFloat(document.getElementById('amount').value);

      if (isNaN(amount) || amount <= 0) {
        alert("Monto inválido!");
        return;
      }

      const newExpense = {
          date,
          place,
          method,
          category,
          description,
          amount
      };

      // 1. Add row and persist expense
      addRowToTable(newExpense);
      expenses.push(newExpense);
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses)); 

      // 2. Update initial balances (Money available in cash/card)
      if (method === "Cash") {
        initialCash -= amount;
        localStorage.setItem("initialCash", initialCash);
      } else {
        initialCard -= amount;
        localStorage.setItem("initialCard", initialCard);
      }

      updateInitialUI();

      // 3. Update overall and daily balances
      overallBalance -= amount;
      todaysBalance += amount;

      localStorage.setItem('myOverallBalance', overallBalance);
      localStorage.setItem('myTodaysBalance', todaysBalance);
      localStorage.setItem('lastVisitDate', todayString);
      updateBalanceUI();


      // 4. Send to google sheets - DB 
      const dataToSend = { date, place, method, category, description, amount };

      try {
        const response = await fetch(
          "YOUR_GOOGLE_SCRIPT_URL_HERE",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
          }
        );

        if (!response.ok) alert("❌ Error enviando a Google Sheets");
      } catch (err) {
        console.log(err);
      }

      form.reset();
      alert("Gasto agregado!");
    });
  }
});