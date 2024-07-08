let currentPage = 1;
let totalPages = 1;
const pageSize = 10;

async function fetchData(page = 1, limit = 10) {
    try {
        const accessToken = getCookie("access_token");

        if (!accessToken) {
            // Redirect to login page if access token is not found
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch(`http://localhost:3002/rekomendasiAI?page=${page}&limit=${limit}&type=Keuangan`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const result = await response.json();
        if (result.msg === "Query Successfully") {
            populateTable(result.data, page, limit);
            currentPage = result.currentPage;
            totalPages = result.totalPages;
            updatePaginationControls();
        } else {
            console.error("Failed to fetch data:", result);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function populateTable(data, page, limit) {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    // Sort data by kondisi in descending order
    data.sort((a, b) => b.kondisi - a.kondisi);

    data.forEach((item, index) => {
        const row = document.createElement('tr');

        const rankingCell = document.createElement('td');
        rankingCell.textContent = (page - 1) * limit + index + 1; // Increment ranking
        row.appendChild(rankingCell);

        const namaCell = document.createElement('td');
        namaCell.textContent = item.asal_daerah; // Assuming item.nama is the name field
        row.appendChild(namaCell);

        const kondisiCell = document.createElement('td');
        kondisiCell.textContent = item.kondisi + "%"; // Assuming item.kondisi is the condition field
        row.appendChild(kondisiCell);

        tableBody.appendChild(row);
    });
}

function updatePaginationControls() {
    const paginationControls = document.querySelector('#paginationControls');
    paginationControls.innerHTML = '';

    const previousPageButton = document.createElement('li');
    previousPageButton.classList.add('page-item');
    if (currentPage === 1) previousPageButton.classList.add('disabled'); // Disable if on first page
    const previousPageLink = document.createElement('a');
    previousPageLink.classList.add('page-link');
    previousPageLink.href = '#';
    previousPageLink.textContent = 'Previous';
    previousPageButton.appendChild(previousPageLink);
    previousPageButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            fetchData(currentPage - 1, pageSize);
        }
    });
    paginationControls.appendChild(previousPageButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('li');
        pageButton.classList.add('page-item');
        if (i === currentPage) pageButton.classList.add('active'); // Highlight the current page
        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageButton.appendChild(pageLink);
        pageButton.addEventListener('click', (e) => {
            e.preventDefault();
            fetchData(i, pageSize);
        });
        paginationControls.appendChild(pageButton);
    }

    const nextPageButton = document.createElement('li');
    nextPageButton.classList.add('page-item');
    if (currentPage === totalPages) nextPageButton.classList.add('disabled'); // Disable if on last page
    const nextPageLink = document.createElement('a');
    nextPageLink.classList.add('page-link');
    nextPageLink.href = '#';
    nextPageLink.textContent = 'Next';
    nextPageButton.appendChild(nextPageLink);
    nextPageButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            fetchData(currentPage + 1, pageSize);
        }
    });
    paginationControls.appendChild(nextPageButton);

    // Update text showing the current page and total number of pages
    const pageInfoText = document.querySelector('#paginationText');
    pageInfoText.textContent = `You are on page ${currentPage} of ${totalPages}`;
}

function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData(currentPage, pageSize);
});
