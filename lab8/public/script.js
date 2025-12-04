document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = document.getElementById("result");

  const json = await res.json();

  if (!res.ok) {
    result.innerHTML = json.errors
      .map(err => `<div class='error'>${err.msg}</div>`)
      .join("");
  } else {
    result.innerHTML = `<div class='success'>Проєкт успішно додано!</div>`;
    e.target.reset();
  }
});
