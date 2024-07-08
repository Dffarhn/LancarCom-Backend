document.addEventListener("DOMContentLoaded", async () => {
  // Set new default font family and font color to mimic Bootstrap's default styling
  (Chart.defaults.global.defaultFontFamily = "Nunito"), '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
  Chart.defaults.global.defaultFontColor = "#858796";

  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      // Redirect to login page if access token is not found
      window.location.href = "/login.html";
      return;
    }

    const responseDropdown = await fetch("http://localhost:3002/statistic/keuangans/month", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!responseDropdown.ok) {
      throw new Error("Network response for dropdown data was not ok");
    }
    const dropdownData = await responseDropdown.json();

    // Process the dropdown data
    const dropdownMenu = document.getElementById("dropdownMenu");

    // Set the value of the first dropdown item
    const firstDropdownItem = dropdownData.data[0];
    const firstMonthName = getMonthName(firstDropdownItem.month);
    const firstYear = firstDropdownItem.year;
    document.getElementById("dropdownMenuButton").textContent = `${firstMonthName} ${firstYear}`;

    dropdownData.data.forEach((dataItem) => {
      const monthName = getMonthName(dataItem.month);
      const year = dataItem.year;
      const monthItem = document.createElement("a");
      monthItem.classList.add("dropdown-item");
      monthItem.href = "#";
      monthItem.textContent = `${monthName} ${year}`;
      monthItem.addEventListener("click", () => {
        document.getElementById("dropdownMenuButton").textContent = `${monthName} ${year}`;
        fetchChartData(dataItem.month, year, accessToken); // Fetch chart data when a dropdown item is clicked
      });
      dropdownMenu.appendChild(monthItem);
    });

    // Fetch initial chart data
    fetchChartData(firstDropdownItem.month, firstYear, accessToken);
  } catch (error) {
    console.error("Error:", error);
  }
});

let myPieChart

async function fetchChartData(month, year, accessToken) {
  try {
    const responseChart = await fetch(`http://localhost:3002/statistic/keuangans?month=${month}&year=${year}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!responseChart.ok) {
      throw new Error("Network response for chart data was not ok");
    }
    const chartData = await responseChart.json();

    // Process the chart data

    console.log(chartData);
    const chartDataItem = chartData.data[0]; // Assuming there's only one item in the data array
    const labels = chartDataItem.statuses.map((statusItem) => statusItem.status);
    const datasetData = chartDataItem.statuses.map((statusItem) => statusItem.count);

    console.log(labels);

    const parameter = ["pending", "success", "investigasi"];
    const dataparameter = [0, 0, 0];

    labels.forEach((label, index) => {
      const paramIndex = parameter.indexOf(label);
      if (paramIndex !== -1) {
        dataparameter[paramIndex] = datasetData[index];
      }
    });

    console.log(dataparameter);

    // Pie Chart Example
    const ctx = document.getElementById("myPieChart");
    if (myPieChart) {
        myPieChart.destroy();
    }

    myPieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: parameter,
        datasets: [
          {
            data: dataparameter,
            backgroundColor: ["#4e73df", "#1cc88a", "#e74a3b"],
            hoverBackgroundColor: ["#2e59d9", "#17a673", "#2c9faf"],
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: "#dddfeb",
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
        },
        legend: {
          display: false,
        },
        cutoutPercentage: 0,
      },
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function getCookie(name) {
  const cookieString = document.cookie;
  const cookies = cookieString.split(";");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName.trim() === name) {
      return cookieValue;
    }
  }
  return null;
}

function getMonthName(month) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return monthNames[parseInt(month) - 1];
}
