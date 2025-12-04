// public/js/app.js

// --- utility ---
function showMsg(el, text, color = 'red') {
  el.innerText = text;
  el.style.color = color;
  setTimeout(() => { el.innerText = ''; }, 4000);
}

// --- Auth pages: register/login ---
if (document.getElementById('btnRegister')) {
  document.getElementById('btnRegister').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    const msg = document.getElementById('msg');
    if (!res.ok) {
      showMsg(msg, data.error || (data.errors && data.errors[0].msg) || 'Error');
    } else {
      showMsg(msg, 'Реєстрація успішна', 'green');
      setTimeout(() => window.location.href = '/dashboard.html', 800);
    }
  });
}

if (document.getElementById('btnLogin')) {
  document.getElementById('btnLogin').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    const msg = document.getElementById('msg');
    if (!res.ok) {
      showMsg(msg, data.error || (data.errors && data.errors[0].msg) || 'Login error');
    } else {
      window.location.href = '/dashboard.html';
    }
  });
}

// --- Dashboard scripts ---
if (document.getElementById('btnLogout')) {
  const greet = document.getElementById('greet');
  const btnLogout = document.getElementById('btnLogout');
  const btnAdd = document.getElementById('btnAdd');
  const taskMsg = document.getElementById('taskMsg');
  const tasksList = document.getElementById('tasksList');
  const filter = document.getElementById('filter');
  const chartCanvas = document.getElementById('chart');
  let chart = null;
  let tasks = [];

  async function loadUser() {
    const res = await fetch('/api/me');
    if (!res.ok) { window.location.href = '/login.html'; return; }
    const j = await res.json();
    greet.innerText = `Вітаємо, ${j.user.name}!`;
  }

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    if (!res.ok) { tasks = []; renderTasks(); renderChart(); return; }
    tasks = await res.json();
    renderTasks();
    renderChart();
  }

  function renderTasks() {
    const f = filter.value;
    let list = tasks.slice();
    if (f === 'done') list = list.filter(t => t.completed);
    if (f === 'notdone') list = list.filter(t => !t.completed);
    if (f === 'high') list = list.filter(t => t.priority === 'висока');

    tasksList.innerHTML = '';
    if (!list.length) tasksList.innerHTML = '<p class="small">Немає завдань</p>';
    list.forEach(t => {
      const div = document.createElement('div');
      div.className = 'task';
      div.innerHTML = `
        <div class="title">${escapeHtml(t.title)}</div>
        <div class="small">Пріоритет: ${t.priority} — Створено: ${new Date(t.createdAt).toLocaleString()}</div>
        <div style="margin-top:8px;">
          <button data-id="${t.id}" class="toggle">${t.completed ? 'Повернути' : 'Виконати'}</button>
          <button data-id="${t.id}" class="del">Видалити</button>
        </div>
      `;
      tasksList.appendChild(div);
    });

    // attach handlers
    document.querySelectorAll('.toggle').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const task = tasks.find(x => x.id == id);
      if (!task) return;
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (res.ok) { await loadTasks(); } else showMsg(taskMsg, 'Error');
    }));

    document.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) { await loadTasks(); } else showMsg(taskMsg, 'Error');
    }));
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const priority = document.getElementById('taskPriority').value;
    if (!title) { showMsg(taskMsg, 'Введіть назву'); return; }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority })
    });
    const data = await res.json();
    if (!res.ok) { showMsg(taskMsg, data.error || (data.errors && data.errors[0].msg)); }
    else {
      document.getElementById('taskTitle').value = '';
      await loadTasks();
    }
  }

  function renderChart() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const notCompleted = total - completed;
    const data = [completed, notCompleted];

    if (!chart) {
      chart = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Виконано', 'Не виконано'],
          datasets: [{ data, backgroundColor: ['#4CAF50', '#F44336'] }]
        }
      });
    } else {
      chart.data.datasets[0].data = data;
      chart.update();
    }
  }

  btnLogout.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  btnAdd.addEventListener('click', addTask);
  filter.addEventListener('change', renderTasks);

  // initial load
  (async () => { await loadUser(); await loadTasks(); })();
}
