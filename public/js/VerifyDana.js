document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error('No ID found in URL');
        return;
    }

    // Function to get the access token from cookies
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

    // Get the access token from cookies
    const accessToken = getCookie("access_token");

    if (!accessToken) {
        // Redirect to login page if access token is not found
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/data/penerima/keuangan/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const result = await response.json();

        if (result.msg === "Query Successfully") {
            const data = result.data[0]; // Assuming the data is an array and we need the first item

            document.getElementById('inputPemberi').value = data.pemberi_name;
            document.getElementById('inputPenerima').value = data.penerima_name;
            document.getElementById('inputUangTurunan').value = formatRupiah(data.uang_turunan);
        } else {
            console.error("Failed to fetch data:", result);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

document.getElementById('inputUangDiterima').addEventListener('input', function (e) {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Format the number with dots as thousand separators
    e.target.value = formatRupiah(value);
});

function formatRupiah(value) {
    // Convert the value to a string and split into integer and decimal parts if any
    let stringValue = value.toString();
    
    // Format the integer part with dots as thousand separators
    let formattedValue = "Rp. " + stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return formattedValue;
}

document.getElementById('FormVerifyDana').addEventListener('submit', async function (e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error('No ID found in URL');
        return;
    }

    const uangDiterimaElement = document.getElementById('inputUangDiterima');
    const uangDiterima = uangDiterimaElement.value.replace(/\D/g, ''); // Remove non-numeric characters

    console.log(uangDiterima)

    // Get the access token from cookies
    const accessToken = getCookie("access_token");

    if (!accessToken) {
        // Redirect to login page if access token is not found
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/verify/alur/keuangan/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ uang_diterima: parseInt(uangDiterima) }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Data successfully updated!');
            window.location.href = '/AliranDanaPenerima.html'; // Redirect to AliranDanaPenerima.html
        } else {
            console.error('Failed to update data:', result);
            alert('Failed to update data.');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        alert('Error updating data.');
    }
});
