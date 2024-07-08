document.addEventListener("DOMContentLoaded", function() {
    loadTopbar(); // Load the topbar content

    // Fetch inbox data when the DOM is loaded
    fetchInboxDataHeader();
});

async function loadTopbar() {
    try {
        const response = await fetch('utils/topbar/topbar.html');
        if (!response.ok) {
            throw new Error(`Failed to fetch topbar: ${response.status} ${response.statusText}`);
        }
        const data = await response.text();
        document.getElementById('topbarContainer').innerHTML = data;

        const token = getCookieHeader('access_token');
        if (token) {
            const decodedToken = jwt_decode(token);
            const username = decodedToken.name || decodedToken.username || 'User';
            document.getElementById('username').textContent = username;
        } else {
            console.error('Token not found in cookies');
        }
    } catch (error) {
        console.error('Error loading topbar:', error);
    }
}

async function fetchInboxDataHeader() {
    try {
        const token = getCookie('access_token');
        if (!token) {
            console.error('Token not found in cookies');
            return;
        }
        
        const response = await fetch('http://localhost:3002/inbox', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch inbox data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.msg === "Query Successfully") {

            console.log(data.data)
            populateInboxMessageHeader(data.data);
        } else {
            console.error('Failed to fetch inbox data:', data.msg);
        }
    } catch (error) {
        console.error('Error fetching inbox data:', error);
    }
}

function getCookieHeader(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function populateInboxMessageHeader(data) {
    const dropdownMenu = document.getElementById('MessagePemberitahuan');
    dropdownMenu.innerHTML = ''; // Clear existing content

    const header = document.createElement('h6');
    header.classList.add(`dropdown-header`);

    header.textContent = "Message Center"


    dropdownMenu.append(header)

    data.forEach(recommendation => {
        const dropdownItem = document.createElement('a');
        dropdownItem.classList.add('dropdown-item', 'd-flex', 'align-items-center');
        dropdownItem.href = `Mail2.html?id=${recommendation.id}`;

        const dropdownListImage = document.createElement('div');
        dropdownListImage.classList.add('dropdown-list-image', 'mr-3');
        const img = document.createElement('img');
        img.classList.add('rounded-circle'); // Placeholder image URL
        img.src = `img/undraw_profile.svg`;
        img.alt = 'Profile Image';
        dropdownListImage.appendChild(img);

        const statusIndicator = document.createElement('div');
        statusIndicator.classList.add('status-indicator', 'bg-success'); // Default to success status
        dropdownListImage.appendChild(statusIndicator);

        const messageDetails = document.createElement('div');

        const messageText = document.createElement('div');
        messageText.classList.add('font-weight-bold', 'text-truncate');
        messageText.textContent = recommendation.rekomendasi_ai; // Recommendation text

        const messageMeta = document.createElement('div');
        messageMeta.classList.add('small', 'text-gray-500');
        messageMeta.textContent = `Created at ${recommendation.created_at}`; // Created timestamp

        messageDetails.appendChild(messageText);
        messageDetails.appendChild(messageMeta);

        dropdownItem.appendChild(dropdownListImage);
        dropdownItem.appendChild(messageDetails);

        dropdownMenu.appendChild(dropdownItem);
    });

    // Add "Read More Messages" link at the end
    const readMoreLink = document.createElement('a');
    readMoreLink.classList.add('dropdown-item', 'text-center', 'small', 'text-gray-500');
    readMoreLink.href = 'Mail.html';
    readMoreLink.textContent = 'Read More Messages';
    dropdownMenu.appendChild(readMoreLink);
}

