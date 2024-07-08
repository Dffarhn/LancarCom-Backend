let currentPage = 1;
let totalPages = 1;
const pageSize = 10;

async function fetchData(page = 1, limit = 10) {
  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      // Redirect to login page if access token is not found
      window.location.href = "/login.html";
      return;
    }

    const response = await fetch(`http://localhost:3002/data/penerima/keuangans?page=${page}&limit=${limit}`, {
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

function formatRupiah(value) {
  if (value === null || value === undefined) return "N/A";
  let stringValue = value.toString();
  return "Rp." + stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function populateTable(data) {
  const tableBody = document.querySelector("#DataTable tbody");
  tableBody.innerHTML = ""; // Clear any existing rows

  data.forEach((item) => {
    const row = document.createElement("tr");

    const pemberiCell = document.createElement("td");
    pemberiCell.textContent = item.pemberi_name;
    row.appendChild(pemberiCell);

    const uangTurunanCell = document.createElement("td");
    uangTurunanCell.textContent = formatRupiah(item.uang_turunan);
    row.appendChild(uangTurunanCell);

    const tanggalDiturunkanCell = document.createElement("td");
    tanggalDiturunkanCell.textContent = item.tgl_turunan ? new Date(item.tgl_turunan).toLocaleDateString() : "N/A";
    row.appendChild(tanggalDiturunkanCell);

    const verifyCell = document.createElement("td");
    const verifyButton = document.createElement("button");
    verifyButton.textContent = item.status === "pending" ? "Verify" : "Verified";
    verifyButton.classList.add("btn", item.status === "pending" ? "btn-primary" : "btn-success");
    verifyButton.disabled = item.status !== "pending";
    verifyButton.addEventListener("click", () => {
      if (item.status === "pending") {
        window.location.href = `VerifyDana.html?id=${item.id}`;
      }
    });
    verifyCell.appendChild(verifyButton);
    row.appendChild(verifyCell);

    tableBody.appendChild(row);
  });
}

function updatePaginationControls() {
  const paginationControls = document.querySelector("#paginationControls");
  paginationControls.innerHTML = "";

  const previousPageButton = document.createElement("li");
  previousPageButton.classList.add("page-item", currentPage === 1 ? "disabled" : "");
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
    const pageButton = document.createElement("li");
    pageButton.classList.add("page-item", currentPage === i ? "active" : "");
    const pageLink = document.createElement("a");
    pageLink.classList.add("page-link");
    pageLink.href = "#";
    pageLink.textContent = i;
    pageButton.appendChild(pageLink);
    pageButton.addEventListener("click", () => {
      fetchData(i, pageSize);
    });
    paginationControls.appendChild(pageButton);
  }

  const nextPageButton = document.createElement("li");
  nextPageButton.classList.add("page-item", currentPage === totalPages ? "disabled" : "");
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
});
