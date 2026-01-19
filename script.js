document.addEventListener('DOMContentLoaded', () => {
  /*🚩 CONFIGURATION & FLAGS - CHANGED: Set to true so your data DOES NOT wipe on every refresh*/
  const IS_PROD = true; 

  const CONFIG = {
    SHEETS_URL: 'YOUR_WEB_APP_URL_HERE', 
    GROQ_KEY: 'YOUR_API_KEY_HERE' 
  };

  const currencyFormat = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  });
  const formatCurrency = (amount) => currencyFormat.format(Math.round(amount || 0));

  // Date and Time constants
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);
  let todaysSpent = parseFloat(localStorage.getItem('myTodaysBalance')) || 0;

  // DEVELOPMENT RESET
  if (!IS_PROD) {
    const devResetKeys = [
      'initialCash', 'initialCard', 'currentCash', 'currentCard',
      'totalDeposits', 'myExpenses', 'fixedPassives', 'myCustomGoals',
      'lastProcessedMonth', 'myTodaysBalance'
    ];
    devResetKeys.forEach(key => localStorage.removeItem(key));
    console.log('[DEV MODE] Data reset enabled');
  }

  // INITIAL STATE (Sync with LocalStorage)
  let state = {
    initialCash: parseFloat(localStorage.getItem('initialCash')) || 0,
    initialCard: parseFloat(localStorage.getItem('initialCard')) || 0,
    currentCash: parseFloat(localStorage.getItem('currentCash')) || 0,
    currentCard: parseFloat(localStorage.getItem('currentCard')) || 0,
    totalDeposits: parseFloat(localStorage.getItem('totalDeposits')) || 0,
    expenses: JSON.parse(localStorage.getItem('myExpenses')) || [],
    fixedPassives: JSON.parse(localStorage.getItem('fixedPassives')) || [],
    goals: JSON.parse(localStorage.getItem('myCustomGoals')) || [],
    lastProcessedMonth: localStorage.getItem('lastProcessedMonth') || ""
  };

  // DOM Elements mapping
  const els = {
    overall: document.getElementById('overall'),
    cashInitial: document.getElementById('cashInitial'),
    cardInitial: document.getElementById('cardInitial'),
    todaySpent: document.getElementById('today'),
    statIngresos: document.querySelector('.stat-card-positive .value'),
    statGastos: document.querySelector('.stat-card-negative .value'),
    statAhorro: document.querySelector('.stat-card-neutral .value'),
    progressBar: document.querySelector('.big-progress'),
    progressText: document.querySelector('.progress-label'),
    chatLog: document.getElementById('chatLog'),
    expenseTableBody: document.querySelector('#expenseTable tbody'),
    passivesList: document.getElementById('wishlistList'),
    passivesTotal: document.getElementById('wishlistTotal'),
    goalsContainer: document.getElementById('goalsContainer'),
    goalFormContainer: document.getElementById('goalFormContainer'),
    // Forms
    initialSetupForm: document.getElementById('initialSetupForm'),
    depositForm: document.getElementById('depositForm'),
    wishlistForm: document.getElementById('wishlistForm'),
    expenseForm: document.getElementById('expenseForm')
  };

  // AUTOMATIC MONTHLY PASSIVES DEDUCTION

  function processAutoMonthlyPassives() {
    if (state.lastProcessedMonth !== currentMonth && state.fixedPassives.length > 0) {
      const totalToDeduct = state.fixedPassives.reduce((sum, p) => sum + Number(p.amount), 0);
      state.currentCard = Math.max(0, state.currentCard - totalToDeduct);
      
      state.expenses.push({
        date: today,
        place: "System",
        description: "Monthly Passive Auto-Deduction",
        category: "Pasivos Fijos",
        amount: totalToDeduct,
        method: "Tarjeta"
      });
      
      state.lastProcessedMonth = currentMonth;
      localStorage.setItem('lastProcessedMonth', currentMonth);
      localStorage.setItem('currentCard', state.currentCard);
      localStorage.setItem('myExpenses', JSON.stringify(state.expenses));
      alert(`📅 New Month: ${formatCurrency(totalToDeduct)} deducted from Card.`);
    }
  }

  // UI UPDATE ENGINE

  function updateAllUI() {
    const totalExpenses = state.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalIncomes = state.initialCash + state.initialCard + state.totalDeposits;
    const currentBalance = state.currentCash + state.currentCard;
    const netSavings = totalIncomes - totalExpenses;

    if(els.statIngresos) els.statIngresos.textContent = formatCurrency(totalIncomes);
    if(els.statGastos) els.statGastos.textContent = formatCurrency(totalExpenses);
    if(els.statAhorro) els.statAhorro.textContent = formatCurrency(netSavings);
    if(els.overall) els.overall.textContent = `Balance General: ${formatCurrency(currentBalance)}`;
    if(els.cashInitial) els.cashInitial.textContent = `Efectivo: ${formatCurrency(state.currentCash)}`;
    if(els.cardInitial) els.cardInitial.textContent = `Tarjeta: ${formatCurrency(state.currentCard)}`;
    if(els.todaySpent) els.todaySpent.textContent = `Gastado Hoy: ${formatCurrency(todaysSpent)}`;

    if (totalIncomes > 0 && els.progressBar) {
      const percent = Math.min(100, Math.round((totalExpenses / totalIncomes) * 100));
      els.progressBar.value = percent;
      els.progressText.textContent = `${percent}% of budget used`;
    }

    updatePassivesUI();
    updateExpenseTable();
    updateGoalsUI();
  }

  function updatePassivesUI() {
    if (!els.passivesList) return;
    els.passivesList.innerHTML = '';
    let total = 0;
    state.fixedPassives.forEach((item, index) => {
      total += Number(item.amount);
      const li = document.createElement('li');
      li.style.cssText = "display: flex; justify-content: space-between; margin-bottom: 5px; background: #f8fafc; padding: 5px 10px; border-radius: 5px;";
      li.innerHTML = `<span>${item.name}</span> <span><b>${formatCurrency(item.amount)}</b> 
                      <button onclick="deletePassive(${index})" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold; margin-left:10px;">×</button></span>`;
      els.passivesList.appendChild(li);
    });
    if(els.passivesTotal) els.passivesTotal.textContent = `Total Pasivos: ${formatCurrency(total)}`;
  }

  function updateExpenseTable() {
    if (!els.expenseTableBody) return;
    els.expenseTableBody.innerHTML = '';
    [...state.expenses].reverse().slice(0, 5).forEach(exp => {
      const row = els.expenseTableBody.insertRow();
      row.innerHTML = `<td>${exp.date}</td><td>${exp.category}</td><td>${exp.description}</td><td>${exp.place}</td><td>${formatCurrency(exp.amount)}</td><td>${exp.method}</td>`;
    });
  }

  // CUSTOM GOALS LOGIC (CRUD)

  document.getElementById('btnNewGoal')?.addEventListener('click', () => {
    els.goalFormContainer.style.display = els.goalFormContainer.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('goalForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const target = parseInt(document.getElementById('goalTarget').value) || 0;
    if (name && target > 0) {
      state.goals.push({ id: Date.now(), nombre: name, objetivo: target });
      localStorage.setItem('myCustomGoals', JSON.stringify(state.goals));
      updateAllUI();
      e.target.reset();
      els.goalFormContainer.style.display = 'none';
    }
  });

  window.deleteGoal = (id) => {
    state.goals = state.goals.filter(g => g.id !== id);
    localStorage.setItem('myCustomGoals', JSON.stringify(state.goals));
    updateAllUI();
  };

  function updateGoalsUI() {
    if (!els.goalsContainer) return;
    els.goalsContainer.innerHTML = '';
    
    const totalSavings = state.expenses
      .filter(exp => exp.category === "Ahorro" || exp.category === "Ahorro / Inversión")
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    let remaining = totalSavings;

    state.goals.forEach(meta => {
      const reached = Math.min(remaining, meta.objetivo);
      remaining -= reached;
      const percent = Math.round((reached / meta.objetivo) * 100) || 0;

      const card = document.createElement('div');
      card.className = 'goal-card';
      card.style.cssText = "background:white; padding:1.2rem; border-radius:12px; border:1px solid #e2e8f0; position:relative; margin-bottom:10px;";
      card.innerHTML = `
        <button onclick="deleteGoal(${meta.id})" style="position:absolute; top:5px; right:10px; border:none; background:none; cursor:pointer;">×</button>
        <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:5px;">
          <span>${meta.nombre}</span><span>${percent}%</span>
        </div>
        <progress value="${reached}" max="${meta.objetivo}" style="width:100%; height:10px;"></progress>
        <div style="font-size:0.8rem; color:gray; margin-top:5px;">${formatCurrency(reached)} / ${formatCurrency(meta.objetivo)}</div>
      `;
      els.goalsContainer.appendChild(card);
    });
  }


  // DATA ENTRY EVENTS (FIXED)
  // FIX 1: Initial Balances
  els.initialSetupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const cash = parseInt(document.getElementById('initialCashInput').value) || 0;
    const card = parseInt(document.getElementById('initialCardInput').value) || 0;
    
    state.initialCash = cash;
    state.initialCard = card;
    state.currentCash = cash;
    state.currentCard = card;

    localStorage.setItem('initialCash', cash);
    localStorage.setItem('initialCard', card);
    localStorage.setItem('currentCash', cash);
    localStorage.setItem('currentCard', card);

    document.getElementById('initialSetupFormContainer').style.display = 'none';
    updateAllUI();
    console.log("Initial balances set:", {cash, card});
  });

  // FIX 2: Deposit Money (Added missing listener)
  els.depositForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseInt(document.getElementById('depositAmount').value) || 0;
    const method = document.getElementById('depositMethod').value;

    if (amount > 0) {
      state.totalDeposits += amount;
      if (method === 'Cash' || method === 'Efectivo') {
        state.currentCash += amount;
      } else {
        state.currentCard += amount;
      }

      localStorage.setItem('totalDeposits', state.totalDeposits);
      localStorage.setItem('currentCash', state.currentCash);
      localStorage.setItem('currentCard', state.currentCard);

      document.getElementById('depositFormContainer').style.display = 'none';
      updateAllUI();
      e.target.reset();
      console.log("Deposit registered:", {amount, method});
    }
  });

  // FIX 3: Fixed Passives
  els.wishlistForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const amount = parseInt(document.getElementById('itemPrice').value) || 0;

    if (name && amount > 0) {
      state.fixedPassives.push({ name, amount });
      localStorage.setItem('fixedPassives', JSON.stringify(state.fixedPassives));
      updateAllUI();
      e.target.reset();
      console.log("Passive added:", {name, amount});
    }
  });

  // Expense Form
  els.expenseForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseInt(document.getElementById('amount').value) || 0;
    const method = document.getElementById('method').value;
    const expense = {
      date: document.getElementById('date').value,
      place: document.getElementById('place').value,
      description: document.getElementById('description').value,
      category: document.getElementById('category').value,
      amount, method
    };
    
    state.expenses.push(expense);
    if (method === 'Efectivo') state.currentCash -= amount; else state.currentCard -= amount;
    
    if (expense.date === today) { 
      todaysSpent += amount; 
      localStorage.setItem('myTodaysBalance', todaysSpent); 
    }

    localStorage.setItem('myExpenses', JSON.stringify(state.expenses));
    localStorage.setItem('currentCash', state.currentCash);
    localStorage.setItem('currentCard', state.currentCard);
    updateAllUI();
    e.target.reset();
  });

  window.deletePassive = (index) => {
    state.fixedPassives.splice(index, 1);
    localStorage.setItem('fixedPassives', JSON.stringify(state.fixedPassives));
    updateAllUI();
  };


  // FINBOT AI LOGIC

  document.getElementById('aiForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('aiQuery').value.trim();
    if (!query) return;

    const log = (msg, isBot) => {
      const p = document.createElement('p');
      p.style.cssText = `padding:8px; border-radius:8px; margin-bottom:8px; font-size:0.85rem; ${isBot ? 'background:#2563eb; color:white;' : 'background:#eee; text-align:right;'}`;
      p.innerHTML = `<strong>${isBot ? 'FinBot' : 'You'}:</strong> ${msg}`;
      els.chatLog.appendChild(p);
      els.chatLog.scrollTop = els.chatLog.scrollHeight;
    };

    log(query, false);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.GROQ_KEY}` },
        body: JSON.stringify({
          model: 'llama3-8192',
          messages: [{ role: 'system', content: 'You are FinBot, a concise financial coach.' }, { role: 'user', content: query }]
        })
      });
      const data = await res.json();
      log(data.choices[0].message.content, true);
    } catch (err) { log("Error connecting to AI", true); }
    e.target.reset();
  });

  // Buttons for showing forms
  document.getElementById('setInitialValues')?.addEventListener('click', () => {
    document.getElementById('initialSetupFormContainer').style.display = 'block';
  });

  document.getElementById('addMoney')?.addEventListener('click', () => {
    document.getElementById('depositFormContainer').style.display = 'block';
  });

  // INITIALIZE
  processAutoMonthlyPassives();
  updateAllUI();
});