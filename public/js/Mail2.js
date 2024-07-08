// Function to fetch email content using access token and id from URL
const fetchEmailContent = () => {
    const accessToken = getCookie('access_token'); // Replace with your actual cookie name
    console.log("halo")
    if (!accessToken) {
        console.error('Access token not found in cookie');
        return;
    }

    // Function to get id from URL
    const getIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    };

    const id = getIdFromUrl();

    if (!id) {
        console.error('ID parameter not found in URL');
        return;
    }

    fetch(`http://localhost:3002/inbox/message/${id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.msg === "Query Successfully" && data.data.length > 0) {
            const emailData = data.data[0];
            console.log(emailData)

            
            const emailContainer = document.getElementById('container');
            const timeString = emailData.created_at; // Use the provided created_at time
            console.log(timeString)

            // Update the emailContainer innerHTML with fetched data
            emailContainer.innerHTML = `
                <a href="Mail.html" class="btn btn-primary mb-4">&larr; Back to Inbox</a>
                <h2 id="email-subject">rekomendasi</h2>
                <p><strong>Nama Provinsi</strong> <span id="email-sender">${emailData.asal_daerah}</span></p>
                <p><strong>Time:</strong> <span id="email-time">${timeString}</span></p>
                <hr>
                <p><strong>Hasil Rekomendasi: </strong>${emailData.rekomendasi_ai}</p>
            `;
        } else {
            console.error('No data found or query was unsuccessful');
        }
    })
    .catch(error => console.error('Error fetching data:', error));
};

// Call the fetchEmailContent function when DOM content is loaded
document.addEventListener('DOMContentLoaded', fetchEmailContent);
