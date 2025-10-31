const apiUrl = "https://v2.jokeapi.dev/joke/Programming";

// --- Запит через Fetch ---
document.getElementById("btnFetch").addEventListener("click", async () => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    showJoke(data, "Fetch");
  } catch (error) {
    document.getElementById("result").textContent = "Помилка при Fetch-запиті!";
  }
});

// --- Запит через Axios ---
document.getElementById("btnAxios").addEventListener("click", async () => {
  try {
    const response = await axios.get(apiUrl);
    showJoke(response.data, "Axios");
  } catch (error) {
    document.getElementById("result").textContent = "Помилка при Axios-запиті!";
  }
});

// --- Відображення жарту ---
function showJoke(data, method) {
  let jokeText = "";

  if (data.type === "single") {
    jokeText = data.joke;
  } else {
    jokeText = `${data.setup}<br><b>${data.delivery}</b>`;
  }

  document.getElementById("result").innerHTML = `
    <h3>Жарт отримано через ${method}:</h3>
    <p>${jokeText}</p>
  `;
}
