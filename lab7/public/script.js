let allStudents = [];

async function load() {
  const res = await fetch('/api/students');
  allStudents = await res.json();
  show(allStudents);
}

function show(list) {
  const container = document.getElementById('list');
  container.innerHTML = "";

  list.forEach(s => {
    container.innerHTML += `
        <div class="student">
            <b>${s.name}</b> (${s.group})
            <button onclick="deleteStudent(${s.id})">Видалити</button>
        </div>`;
  });
}

function filter() {
  const g = document.getElementById('filter').value.toLowerCase();
  const filtered = allStudents.filter(s => s.group.toLowerCase().includes(g));
  show(filtered);
}

async function addStudent() {
  const student = {
    name: document.getElementById('name').value,
    group: document.getElementById('group').value
  };

  await fetch('/api/students', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student)
  });

  load();
}

async function deleteStudent(id) {
  await fetch(`/api/students/${id}`, { method: 'DELETE' });
  load();
}

load();
