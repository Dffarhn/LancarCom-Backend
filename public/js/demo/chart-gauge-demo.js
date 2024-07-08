document.addEventListener("DOMContentLoaded", function() {
  // Reference to the container
  const chartRow = document.getElementById('chartRow');

  // Function to determine the background color based on the value
  function getBackgroundColor(value) {
      if (value < 30) return ["red", "red", "#eee", "#eee", "#eee"];
      if (value < 60) return ["yellow", "yellow", "yellow", "#eee", "#eee"];
      if (value < 90) return ["orange", "orange", "orange", "orange", "#eee"];
      return ["green", "green", "green", "green", "green"];
  }

  // Function to create a chart card
  function createChartCard(chartInfo, index) {
      // Create card elements
      const colDiv = document.createElement('div');
      colDiv.classList.add('col-xl-4', 'col-lg-5');
      
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card', 'shadow', 'mb-4');
      
      const cardHeaderDiv = document.createElement('div');
      cardHeaderDiv.classList.add('card-header', 'py-3');
      
      const headerTitle = document.createElement('h6');
      headerTitle.classList.add('m-0', 'font-weight-bold', 'text-primary');
      headerTitle.innerText = chartInfo.title;
      
      const cardBodyDiv = document.createElement('div');
      cardBodyDiv.classList.add('card-body');
      
      const canvasHolderDiv = document.createElement('div');
      canvasHolderDiv.style.width = '100%';
      
      const canvas = document.createElement('canvas');
      canvas.id = 'chart' + index;
      


      // Append elements to build the card structure
      canvasHolderDiv.appendChild(canvas);
      cardBodyDiv.appendChild(canvasHolderDiv);
      cardHeaderDiv.appendChild(headerTitle);
      cardDiv.appendChild(cardHeaderDiv);
      cardDiv.appendChild(cardBodyDiv);
      colDiv.appendChild(cardDiv);
      
      // Append the card to the row
      chartRow.appendChild(colDiv);
      
      // Create and initialize the chart
      const chart = new Chart(canvas, {
          type: 'gauge',
          data: {
              datasets: [{
                  data: chartInfo.data,
                  value: chartInfo.value,
                  backgroundColor: getBackgroundColor(chartInfo.value),
                  borderWidth: 2
              }]
          },
          options: {
              responsive: true,
              title: {
                  display: true,
                  text: chartInfo.title
              },
              layout: {
                  padding: {
                      bottom: 30
                  }
              },
              needle: {
                  radiusPercentage: 2,
                  widthPercentage: 3.2,
                  lengthPercentage: 80,
                  color: "rgba(0, 0, 0, 1)"
              },
              valueLabel: {
                  formatter: Math.round
              }
          }
      });

      // Attach the chart instance to the chartInfo object
      chartInfo.chartInstance = chart;
  }

  // Function to randomize chart data
  function randomizeChartData(chart, chartInfo) {
      const newValue = Math.random() * 100;
      chart.data.datasets[0].value = newValue;
      chart.data.datasets[0].backgroundColor = getBackgroundColor(newValue);
      chart.update();
  }

  // Fetch data from the server and generate chart cards dynamically
  fetch('http://localhost:3002/progres/pembangunans', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('access_token')}` // Replace with your actual token or other headers as needed
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.msg === "Query Successfully") {
          const chartData = data.data.map((item, index) => {
              let data = [0, 30, 60, 90, 100];
              data.push(parseInt(item.progress_pembangunan, 10));
              data.sort((a, b) => a - b); // Sort the data array
              
              return {
                  title: item.nama_pembangunan,
                  data: data, // Use the updated data array
                  value: item.progress_pembangunan
              };
          });
          
          // Generate chart cards dynamically
          chartData.forEach((chartInfo, index) => {
              createChartCard(chartInfo, index);
          });
      }
  })
  .catch(error => {
      console.error('Error fetching data:', error);
  });
});
