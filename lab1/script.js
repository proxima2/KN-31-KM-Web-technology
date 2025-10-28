const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'pie', // тип діаграми: 'line', 'bar', 'pie'
  data: {
    labels: ['Ігри', 'Навчання', 'Робота'],
    datasets: [{
      label: 'Годин',
      data: [8, 2, 8],
      borderWidth: 1,
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',   
        'rgba(54, 162, 235, 0.5)',   
        'rgba(255, 206, 86, 0.5)'    
      ],
    }]
  },
  options: {
    responsive: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
