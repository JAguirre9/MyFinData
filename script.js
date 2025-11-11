// Select DOM elements
const form = document.getElementById('expenseForm');
const tableBody = document.getElementById('expenseTable').querySelector('tbody');

// Submit the form
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Request values
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;
  const place = document.getElementById('place').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const method = document.getElementById('method').value;

  //New row creation
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${date}</td>
    <td>${category}</td>
    <td>${place}</td>
    <td>$${amount.toLocaleString()}</td>
    <td>${method}</td>
  `;

  tableBody.appendChild(newRow);

  form.reset();
});
