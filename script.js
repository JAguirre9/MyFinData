document.addEventListener('DOMContentLoaded', () => {

  // --- Selectores DOM ---
  const form = document.getElementById('expenseForm');
  const tableBody = document.getElementById('expenseTable').querySelector('tbody');
  const overallEl = document.getElementById('overall');
  const todayEl = document.getElementById('today');
  
  // NUEVO: Selector para el botón de establecer balance
  const setBalanceBtn = document.getElementById('setBalanceButton');

  // --- Variables Globales de Balance ---
  let overallBalance = 0;
  let todaysBalance = 0;
  const todayString = new Date().toLocaleDateString(); // "11/11/2025"

  // --- LÓGICA DE CARGA INICIAL (Al abrir la página) ---

  // 1. Cargar Balance General (Tu presupuesto restante)
  // Simplemente carga lo que esté guardado, o 0 si no hay nada.
  overallBalance = parseFloat(localStorage.getItem('myOverallBalance')) || 0;
  overallEl.textContent = `Balance Restante: $${overallBalance.toLocaleString()}`;

  // 2. Cargar 'Gastado Hoy' (Con Lógica de Reinicio Diario)
  const lastVisitDate = localStorage.getItem('lastVisitDate') || '';

  if (todayString === lastVisitDate) {
    // Es el mismo día: cargar el gasto guardado
    todaysBalance = parseFloat(localStorage.getItem('myTodaysBalance')) || 0;
  } else {
    // Es un nuevo día: resetear el gasto a 0 y guardar la nueva fecha
    todaysBalance = 0;
    localStorage.setItem('myTodaysBalance', '0');
    localStorage.setItem('lastVisitDate', todayString);
  }
  todayEl.textContent = `Gastado Hoy: $${todaysBalance.toLocaleString()}`;


  // --- LISTENER PARA EL NUEVO BOTÓN "Establecer Balance" ---
  setBalanceBtn.addEventListener('click', () => {
    // Pregunta al usuario por el nuevo balance (sugiere el actual)
    const newBalanceInput = prompt(
      "Ingresa tu balance general (presupuesto):", 
      overallBalance
    );
    
    // Si el usuario no presiona "Cancelar"
    if (newBalanceInput !== null) {
      const newBalance = parseFloat(newBalanceInput);

      // Validamos que sea un número válido
      if (!isNaN(newBalance) && newBalance >= 0) {
        overallBalance = newBalance;
        localStorage.setItem('myOverallBalance', overallBalance);
        overallEl.textContent = `Balance Restante: $${overallBalance.toLocaleString()}`;
        alert(`Tu balance se ha establecido en: $${overallBalance.toLocaleString()}`);
      } else {
        alert("Monto inválido. Por favor, ingresa solo números.");
      }
    }
  });


  // --- LISTENER DEL FORMULARIO (Al agregar un gasto) ---
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1. Obtener valores del formulario
    const date = document.getElementById('date').value;
    const place = document.getElementById('place').value;
    const method = document.getElementById('method').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, ingresa un monto válido.");
      return;
    }

    // 2. Agregar fila a la tabla HTML
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${date}</td>
      <td>${category}</td>
      <td>${place}</td>
      <td>$${amount.toLocaleString()}</td>
      <td>${method}</td>
    `;
    tableBody.appendChild(newRow);

    // 3. Lógica de Cálculo de Balances
    overallBalance -= amount; // Restar del presupuesto
    todaysBalance += amount;  // Sumar a los gastos de hoy

    // 4. Actualizar UI (interfaz)
    overallEl.textContent = `Balance Restante: $${overallBalance.toLocaleString()}`;
    todayEl.textContent = `Gastado Hoy: $${todaysBalance.toLocaleString()}`;
    
    // 5. Guardar nuevos valores en localStorage
    localStorage.setItem('myOverallBalance', overallBalance);
    localStorage.setItem('myTodaysBalance', todaysBalance);
    // Nos aseguramos de guardar la fecha de esta transacción
    localStorage.setItem('lastVisitDate', todayString); 

    // 6. Enviar datos a Google Sheets
    const dataForGoogleSheets = { category, description, amount };

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwtgt2A4fNLHyIOcASbnwryxEG5pD7VYxrotdp7hXEWK2Kp2Mur_9EhRBSbtYcEu4-Q/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataForGoogleSheets),
      });

      if (response.ok) {
        alert("✅ Gasto agregado!");
        form.reset();
      } else {
        alert("❌ Error enviando a Google Sheets");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    }
  });

}); 