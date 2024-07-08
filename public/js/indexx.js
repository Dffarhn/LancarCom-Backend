document.addEventListener('DOMContentLoaded', async () => {
    const spinnerTotal = document.getElementById('spinner-total');
    const spinnerMasuk = document.getElementById('spinner-masuk');
    const spinnerKeluar = document.getElementById('spinner-keluar');

    const totalUangContainer = document.getElementById('totalUang');
    const uangMasukContainer = document.getElementById('uangMasuk');
    const uangKeluarContainer = document.getElementById('uangKeluar');

    try {
        // Get access token from cookie
        const accessToken = getCookie('access_token');

        if (!accessToken) {
            // Redirect to login page if access token is not found
            window.location.href = '/login.html';
            return;
        }

        // Fetch the data from the server (using a simulated endpoint here)
        const response = await fetch('http://localhost:3002/dompet', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log(data.data)
        console.log(formatNumberWithCommas( data.data[0].uang_sekarang))

        const totalUang = formatNumberWithCommas( data.data[0].uang_sekarang) || 0;
        const uangMasuk = formatNumberWithCommas( data.data[0].uang_masuk) || 0;
        const uangKeluar = formatNumberWithCommas( data.data[0].uang_keluar) || 0;

        totalUangContainer.textContent = `Rp${totalUang.toLocaleString()}`;
        uangMasukContainer.textContent = `Rp${uangMasuk.toLocaleString()}`;
        uangKeluarContainer.textContent = `Rp${uangKeluar.toLocaleString()}`;

        // Hide spinners
        spinnerTotal.classList.add('hidden');
        spinnerMasuk.classList.add('hidden');
        spinnerKeluar.classList.add('hidden');

        // Show data containers
        totalUangContainer.classList.remove('hidden');
        uangMasukContainer.classList.remove('hidden');
        uangKeluarContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching financial data:', error);
    }
});

// Function to get cookie value by name
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

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}



