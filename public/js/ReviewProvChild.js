let currentPage = 1;
let totalPages = 1;
const pageSize = 12;
let selectedType = "Keuangan"; // Default type

document.addEventListener("DOMContentLoaded", () => {
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    // Redirect to login page if access token is not found
    window.location.href = "/login.html";
    return;
  }

  if (accessToken) {
    fetchReviewData(selectedType);
  } else {
    console.error("No access token found in cookies");
  }

  const generateReviewBtn = document.getElementById("generateReviewBtn");
  const loadingBtn = document.getElementById("loadingBtn");

  generateReviewBtn.addEventListener("click", () => generateNewReview(selectedType));

  const dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      selectedType = item.getAttribute("data-type");
      fetchReviewData(selectedType);
    });
  });

  // Add event listener to the search input with debounce
  const searchInput = document.querySelector(".search-input");
  const debouncedFetch = debounce(() => {
    const searchQuery = searchInput.value.trim();
    fetchReviewData(selectedType, 1, searchQuery);
  }, 1000); // 1 second debounce time

  searchInput.addEventListener("input", debouncedFetch);
});



async function fetchReviewData(type, page = 1, searchQuery = "") {
  console.log("Attempting to fetch data...");
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    console.error("Access token is missing.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3002/rekomendasiAI?type=${type}&page=${page}&limit=${pageSize}&search=${searchQuery}`, {
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
      currentPage = data.currentPage;
      totalPages = data.totalPages;

      console.log(currentPage, totalPages);
      console.log("Data fetched successfully:", data.data);
      populateCards(data.data, type);
      updatePaginationControls();
    } else {
      console.error("Failed to fetch data:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function generateNewReview(type) {
  const generateReviewBtn = document.getElementById("generateReviewBtn");
  const loadingBtn = document.getElementById("loadingBtn");

  try {
    showLoading(generateReviewBtn, loadingBtn);
    const response = await fetch(`http://localhost:3002/askAi?tipe=${type}`, {
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
    await fetchReviewData(type);
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

function populateCards(data, type) {
  const chartRow = document.getElementById("chartRow");
  chartRow.innerHTML = ""; // Clear existing content

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "col-md-6 col-lg-3 mb-4";

    const asalDaerah = item.asal_daerah || "N/A";
    const kondisi = item.kondisi !== null ? item.kondisi + "%" : "N/A";
    const alasan = item.alasan ? truncateText(item.alasan, 50) : "N/A";
    const rekomendasiAi = item.rekomendasi_ai ? truncateText(item.rekomendasi_ai, 50) : "N/A";

    card.innerHTML = `
        <a href="ReviewProvSpesific.html?id=${item.rekomendasi_ke}&&tipe=${type}" style="text-decoration: none; color: inherit; display: block;">
          <div class="card" style="width: 18rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
            onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';" 
            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
            <div class="card-body">
              <h5 class="card-title">${asalDaerah}</h5>
              <p class="card-text">Kondisi: ${kondisi}</p>
              <p class="card-text">Alasan: ${alasan}</p>
              <p class="card-text">Rekomendasi: ${rekomendasiAi}</p>
            </div>
          </div>
        </a>
      `;

    chartRow.appendChild(card);
  });
}

function updatePaginationControls() {
  const paginationControls = document.querySelector(".pagination");
  paginationControls.innerHTML = "";

  const previousPageButton = document.createElement("li");
  previousPageButton.classList.add("page-item");
  if (currentPage <= 1) {
    previousPageButton.classList.add("disabled");
  }
  const previousPageLink = document.createElement("a");
  previousPageLink.classList.add("page-link");
  previousPageLink.href = "#";
  previousPageLink.textContent = "Previous";
  previousPageButton.appendChild(previousPageLink);
  previousPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      fetchReviewData(selectedType, currentPage - 1);
    }
  });
  paginationControls.appendChild(previousPageButton);

  for (let i = 1; i <= totalPages; i++) {
    if (currentPage == i) {
      const pageButton = document.createElement("li");
      pageButton.classList.add("page-item");
      pageButton.classList.add("active");
      const pageLink = document.createElement("a");
      pageLink.classList.add("page-link");
      pageLink.href = "#";
      pageLink.textContent = i;
      pageButton.appendChild(pageLink);
      pageButton.addEventListener("click", () => {
        fetchReviewData(selectedType, i);
      });
      paginationControls.appendChild(pageButton);
    } else {
      const pageButton = document.createElement("li");
      pageButton.classList.add("page-item");
      const pageLink = document.createElement("a");
      pageLink.classList.add("page-link");
      pageLink.href = "#";
      pageLink.textContent = i;
      pageButton.appendChild(pageLink);
      pageButton.addEventListener("click", () => {
        fetchReviewData(selectedType, i);
      });
      paginationControls.appendChild(pageButton);
    }
  }

  const nextPageButton = document.createElement("li");
  nextPageButton.classList.add("page-item");
  if (currentPage == totalPages) {
    nextPageButton.classList.add("disabled");
  }
  const nextPageLink = document.createElement("a");
  nextPageLink.classList.add("page-link");
  nextPageLink.href = "#";
  nextPageLink.textContent = "Next";
  nextPageButton.appendChild(nextPageLink);
  nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      fetchReviewData(selectedType, currentPage + 1);
    }
  });
  paginationControls.appendChild(nextPageButton);

  // Update text showing the current page and total number of pages
  const pageInfoText = document.querySelector("#paginationText");
  pageInfoText.textContent = `You are on page ${currentPage} of ${totalPages}`;
}

function showToast(type, message) {
  const toastElement = type === "success" ? document.getElementById('toastSuccess') : document.getElementById('toastError');
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

