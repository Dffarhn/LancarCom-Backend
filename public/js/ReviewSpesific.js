let pesan = null;
document.addEventListener("DOMContentLoaded", () => {
  let selectedType = "Keuangan"; // Default type

  const accessToken = getCookie("access_token");

  if (!accessToken) {
    // Redirect to login page if access token is not found
    window.location.href = "/login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const rekomendasi_ke = params.get("id");
  console.log(rekomendasi_ke);
  selectedType = params.get("tipe");

  if (accessToken) {
    fetchReviewData(selectedType, rekomendasi_ke);
  } else {
    console.error("No access token found in cookies");
  }

  const generateReviewBtn = document.getElementById("generateReviewBtn");
  const loadingBtn = document.getElementById("loadingBtn");

  generateReviewBtn.addEventListener("click", () => generateNewReview(selectedType, rekomendasi_ke));

  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      selectedType = item.getAttribute("data-type");
      fetchReviewData(selectedType, rekomendasi_ke);
    });
  });

  document.getElementById("sendMessageBtn").addEventListener("click", () => sendMessage(rekomendasi_ke, pesan));
});

async function fetchReviewData(type, rekomendasi_ke) {
  console.log("Attempting to fetch data...");
  const accessToken = getCookie("access_token");
  console.log(type);

  if (!accessToken) {
    console.error("Access token is missing.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3002/rekomendasiAI/${rekomendasi_ke}?type=${type}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.msg === "Query Successfully") {
      console.log("Data fetched successfully:", data.data);
      pesan = data.data[0].id;
      populateCards(data.data);
    } else {
      console.error("Failed to fetch data:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function generateNewReview(type, id) {
  const generateReviewBtn = document.getElementById("generateReviewBtn");
  const loadingBtn = document.getElementById("loadingBtn");

  console.log(type);

  try {
    showLoading(generateReviewBtn, loadingBtn);
    const response = await fetch(`http://localhost:3002/askAi/${id}?tipe=${type}`, {
      // Fixed the typo here
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getCookie("access_token"),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to generate new review");
    }
    const responseData = await response.json();
    console.log(responseData);
    await fetchReviewData(type, id);
    showToast("success", "New review generated successfully");
  } catch (error) {
    console.error("Error:", error);
    showToast("error", "Failed to generate new review");
  } finally {
    hideLoading(generateReviewBtn, loadingBtn);
  }
}

function showLoading(generateReviewBtn, loadingBtn) {
  generateReviewBtn.style.display = "none";
  loadingBtn.style.display = "inline-block";
}

function hideLoading(generateReviewBtn, loadingBtn) {
  generateReviewBtn.style.display = "inline-block";
  loadingBtn.style.display = "none";
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

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

function populateCards(data) {
  const chartRow = document.getElementById("chartRow");
  chartRow.innerHTML = ""; // Clear existing content
  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "col mb-4 px-5";
    card.innerHTML = `
            <div class="card" style="width: 100%; ">
                <div class="card-body">
                    <h5 class="card-title">${item.asal_daerah}</h5>
                    <p class="card-text">Kondisi: ${item.kondisi}%</p>
                    <p class="card-text">Alasan: ${item.alasan}</p>
                    <p class="card-text">Rekomendasi: ${item.rekomendasi_ai}</p>
                </div>
            </div>
        `;
    chartRow.appendChild(card);
  });
}


function showToast(type, message) {
  const toastElement = type === "success" ? document.getElementById('toastSuccess') : document.getElementById('toastError');
  const toastBody = toastElement.querySelector('.toast-body');
  toastBody.textContent = message; // Set the message
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}



function sendMessage(rekomendasi_ke, pesan) {
  // Define the message data
  const messageData = {
    isi_rekomendasi: pesan,
    rekomendasi_ke: rekomendasi_ke,
  };

  // Get the access_token cookie
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    alert("No access token found!");
    return;
  }

  // Send the message data using fetch
  fetch("http://localhost:3002/send/rekomendasiAI", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(messageData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      showToast("success", "Message Send Successfully");
    })
    .catch((error) => {
      console.error("Error:", error);
      showToast("error", "Failed to Send Message");
    });
}
