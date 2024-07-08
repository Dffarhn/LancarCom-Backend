let currentPage = 1;
let totalPages = 1;
const pageSize = 10;

async function fetchData(page = 1, limit = 10,searchQuery = "") {
  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      // Redirect to login page if access token is not found
      window.location.href = "/login.html";
      return;
    }

    const response = await fetch(`http://localhost:3002/data/pemberi/keuangans?page=${page}&limit=${limit}&search=${searchQuery}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const result = await response.json();
    if (result.msg === "Query Successfully") {
      populateTable(result.data);
      currentPage = result.currentPage;
      totalPages = result.totalPages;
      updatePaginationControls();
    } else {
      console.error("Failed to fetch data:", result);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateTable(data) {
  const tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = ""; // Clear any existing rows

  data.forEach((item) => {
    const row = document.createElement("tr");

    const pemberiCell = document.createElement("td");
    pemberiCell.textContent = item.pemberi_name;
    row.appendChild(pemberiCell);

    const penerimaCell = document.createElement("td");
    penerimaCell.textContent = item.penerima_name;
    row.appendChild(penerimaCell);

    const uangTurunanCell = document.createElement("td");
    uangTurunanCell.textContent = item.uang_turunan;
    row.appendChild(uangTurunanCell);

    const uangDiterimaCell = document.createElement("td");
    uangDiterimaCell.textContent = item.uang_diterima === null ? "N/A" : item.uang_diterima;
    row.appendChild(uangDiterimaCell);

    const tanggalDiterimaCell = document.createElement("td");
    tanggalDiterimaCell.textContent = item.tgl_diterima === null ? "N/A" : new Date(item.tgl_diterima).toLocaleDateString();
    row.appendChild(tanggalDiterimaCell);

    const statusCell = document.createElement("td");
    statusCell.textContent = item.status;
    row.appendChild(statusCell);

    // Assigning different classes based on status
    switch (item.status) {
      case "investigasi":
        row.classList.add("table-warning");
        break;
      case "success":
        row.classList.add("table-success");
        break;
      case "pending":
        row.classList.add("table-default");
        break;
      default:
        break;
    }

    tableBody.appendChild(row);
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
      fetchData(currentPage - 1, pageSize);
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
        fetchData(i);
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
        fetchData(i);
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
      fetchData(currentPage + 1, pageSize);
    }
  });
  paginationControls.appendChild(nextPageButton);

  // Update text showing the current page and total number of pages
  const pageInfoText = document.querySelector("#paginationText");
  pageInfoText.textContent = `You are on page ${currentPage} of ${totalPages}`;
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

document.addEventListener("DOMContentLoaded", () => {
  fetchData(currentPage, pageSize);
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    // Redirect to login page if access token is not found
    window.location.href = "/login.html";
    return;
  }

    // Add event listener to the search input with debounce
    const searchInput = document.querySelector(".search-input");
    const debouncedFetch = debounce(() => {
      const searchQuery = searchInput.value.trim();
      fetchData(1,pageSize, searchQuery);
    }, 1000); // 1 second debounce time
  
    searchInput.addEventListener("input", debouncedFetch);
});


function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}
