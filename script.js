document.addEventListener('DOMContentLoaded', () => {

  // floabl variables
  let overallBalance = 0;
  let todaysBalance = 0;
  const todayString = new Date().toLocaleDateString();

  // New initial values
  let initialCash = parseFloat(localStorage.getItem('initialCash')) || 0;
  let initialCard = parseFloat(localStorage.getItem('initialCard')) || 0;


  function updateInitialUI() {
    document.getElementById("cashInitial").textContent =
      `Valor Inicial Cash: $${initialCash.toLocaleString()}`;

    document.getElementById("cardInitial").textContent =
      `Valor Inicial Card: $${initialCard.toLocaleString()}`;

    document.getElementById("totalInitial").textContent =
      `Valor Inicial Total: $${(initialCash + initialCard).toLocaleString()}`;
  }

  updateInitialUI();


  // load general balance
  overallBalance = parseFloat(localStorage.getItem('myOverallBalance')) || 0;
  document.getElementById('overall').textContent =
    `Balance General: $${overallBalance.toLocaleString()}`;

  // daily spent 
  const lastVisitDate = localStorage.getItem('lastVisitDate') || '';

  if (todayString === lastVisitDate) {
    todaysBalance = parseFloat(localStorage.getItem('myTodaysBalance')) || 0;
  } else {
    todaysBalance = 0;
    localStorage.setItem('myTodaysBalance', '0');
    localStorage.setItem('lastVisitDate', todayString);
  }

  document.getElementById('today').textContent =
    `Gastado Hoy: $${todaysBalance.toLocaleString()}`;


  // establish initial values
  document.getElementById('setInitialValues').addEventListener('click', () => {
    const newCash = parseFloat(prompt("Ingresa el valor inicial Cash:", initialCash));
    const newCard = parseFloat(prompt("Ingresa el valor inicial Card:", initialCard));

    if (!isNaN(newCash)) {
      initialCash = newCash;
      localStorage.setItem("initialCash", initialCash);
    }

    if (!isNaN(newCard)) {
      initialCard = newCard;
      localStorage.setItem("initialCard", initialCard);
    }

    updateInitialUI();
  });


  // add spent 
  const form = document.getElementById('expenseForm');
  const tableBody = document.getElementById('expenseTable').querySelector('tbody');

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

    //  Add row 
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${date}</td>
      <td>${category}</td>
      <td>${place}</td>
      <td>$${amount.toLocaleString()}</td>
      <td>${method}</td>
    `;
    tableBody.appendChild(newRow);


    // update initial values
    if (method === "Cash") {
      initialCash -= amount;
      localStorage.setItem("initialCash", initialCash);
    } else {
      initialCard -= amount;
      localStorage.setItem("initialCard", initialCard);
    }

    updateInitialUI();


    // Update previous values
    overallBalance -= amount;
    todaysBalance += amount;

    document.getElementById('overall').textContent =
      `Balance General: $${overallBalance.toLocaleString()}`;

    document.getElementById('today').textContent =
      `Gastado Hoy: $${todaysBalance.toLocaleString()}`;

    localStorage.setItem('myOverallBalance', overallBalance);
    localStorage.setItem('myTodaysBalance', todaysBalance);
    localStorage.setItem('lastVisitDate', todayString);


    // Send to google sheets - DB 
    const dataToSend = { category, description, amount };

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
});
