async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();

  const container = document.getElementById('users');
  container.innerHTML = "";

  users.forEach(u => {
    container.innerHTML += `
            <div class="user">
                <b>${u.name}</b> (${u.role})<br>
                ${u.email}<br>
                <button onclick="deleteUser(${u.id})">Delete</button>
            </div>
        `;
  });
}

async function addUser() {
  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    role: document.getElementById("role").value
  };

  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });

  loadUsers();
}

async function deleteUser(id) {
  await fetch(`/api/users/${id}`, { method: 'DELETE' });
  loadUsers();
}

loadUsers();
