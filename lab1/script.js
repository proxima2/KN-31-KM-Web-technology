const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'pie', // тип діаграми: 'line', 'bar', 'pie'
  data: {
    labels: ['Ігри', 'Навчання', 'Робота'],
    datasets: [{
      label: 'Годин',
      data: [8, 2, 8],
      borderWidth: 1,
      backgroundColor: 'rgba(36, 221, 113, 0.6)'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
