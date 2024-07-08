document.addEventListener("DOMContentLoaded", () => {
  // Fetch data and populate the select element on DOMContentLoaded
  fetchData();

  // Add event listener to the form submit event
  const form = document.getElementById("FormAddProgressPembangunan");
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission
    const payload = {
        image_progress: [document.getElementById('inputImage').value],
        progress_pembangunan: document.getElementById('inputProgress').value,
        dana_digunakan: document.getElementById('inputDana').value
    };

    const id_pembangunan = document.getElementById("inputNama").value;
    const url = `http://localhost:3002/progres/pembangunan/${id_pembangunan}`;

    try {
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        // Redirect to login page if access token is not found
        window.location.href = "/login.html";
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.href = "progressPembangunan.html";
      } else {
        alert("Failed to add progress pembangunan.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

// Fetch data from the API
async function fetchData() {
  try {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      window.location.href = "/login.html";
      return;
    }
    const response = await fetch("http://localhost:3002/pembangunans", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const result = await response.json();
    if (result.msg === "Query Successfully") {

      
      populateSelect(result.data);
    } else {
      console.error("Failed to fetch data:", result);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Function to populate the select element
function populateSelect(data) {

  console.log(data)
  const selectElement = document.getElementById("inputNama");
  data.forEach((item) => {
    if (item.progress_pembangunan !== 100) {
      const option = document.createElement("option");
      option.textContent = item.nama_pembangunan;
      option.value = item.id;
      selectElement.appendChild(option);
    }
  });
}

// Function to get cookie value
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


document.getElementById('inputDana').addEventListener('input', function (e) {
  // Remove non-numeric characters
  let value = e.target.value.replace(/\D/g, '');
  
  // Format the number with dots as thousand separators
  e.target.value = formatRupiah(value);
});

function formatRupiah(value) {
  // Convert the value to a string and split into integer and decimal parts if any
  let stringValue = value.toString();
  
  // Format the integer part with dots as thousand separators
  let formattedValue = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return formattedValue;
}

