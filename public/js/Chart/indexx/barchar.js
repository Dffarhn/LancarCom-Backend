// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"), '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + "").replace(",", "").replace(" ", "");
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
    dec = typeof dec_point === "undefined" ? "." : dec_point,
    s = "",
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec);
}

// Function to fetch data from API
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      // Redirect to login page if access token is not found
      window.location.href = "/login.html";
      return;
    }
    const response = await fetch("http://localhost:3002/statistic/dompet", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responsedata = await response.json();
    const data = responsedata.data;

    console.log(data);

    // Process the data here
    const labels = data.map((item) => getMonthName(item.bulan)); // Assuming your data has a "month" field
    const uangTotal = data.map((item) => item.uang_sekarang); // Assuming your data has a "uangTotal" field
    const uangMasuk = data.map((item) => item.uang_masuk); // Assuming your data has a "uangMasuk" field
    const uangKeluar = data.map((item) => item.uang_keluar); // Assuming your data has a "uangKeluar" field
    // Get the maximum value from uang_sekarang
    const max = Math.max(...uangTotal);
    // Create the chart
    var ctx = document.getElementById("myBarChart");
    var myBarChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Uang Total",
            backgroundColor: "#4e73df",
            hoverBackgroundColor: "#2e59d9",
            borderColor: "#4e73df",
            data: uangTotal,
          },
          {
            label: "Uang Masuk",
            backgroundColor: "#1cc88a",
            hoverBackgroundColor: "#17a673",
            borderColor: "#1cc88a",
            data: uangMasuk,
          },
          {
            label: "Uang Keluar",
            backgroundColor: "#F33B3B",
            hoverBackgroundColor: "#2c9faf",
            borderColor: "#F33B3B",
            data: uangKeluar,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0,
          },
        },
        scales: {
          xAxes: [
            {
              time: {
                unit: "month",
              },
              gridLines: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                maxTicksLimit: 12,
              },
              maxBarThickness: 25,
            },
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                max: max, // Adjusted the maximum value to accommodate larger data range
                maxTicksLimit: 8,
                padding: 10,
                // Include a dollar sign in the ticks
                callback: function (value, index, values) {
                  return "Rp" + number_format(value) + " " + "Juta";
                },
              },
              gridLines: {
                color: "rgb(234, 236, 244)",
                zeroLineColor: "rgb(234, 236, 244)",
                drawBorder: false,
                borderDash: [2],
                zeroLineBorderDash: [2],
              },
            },
          ],
        },
        legend: {
          display: true, // Set to true if you want to display the legend
        },
        tooltips: {
          titleMarginBottom: 10,
          titleFontColor: "#6e707e",
          titleFontSize: 14,
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: "#dddfeb",
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
          callbacks: {
            label: function (tooltipItem, chart) {
              var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || "";
              return datasetLabel + ": Rp" + number_format(tooltipItem.yLabel) + " Juta";
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
});

function getMonthName(month) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return monthNames[parseInt(month) - 1];
}
