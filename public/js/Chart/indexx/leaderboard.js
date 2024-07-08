async function fetchDataAndCreateButtons() {
    try {
        const response = await fetch('http://localhost:3002/rekomendasiAI',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('access_token')
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        const data = jsonData.data;

        // Sort data by kondisi in descending order
        data.sort((a, b) => b.kondisi - a.kondisi);

        const container = document.getElementById('leaderboardProv');
        container.innerHTML = ''; // Clear existing content

        // Show only first 4 items
        const slicedData = data.slice(0, 4);
        
        slicedData.forEach((item, index) => {
            createButton(container, index + 1, 'img/undraw_profile.svg', item.asal_daerah, item.kondisi + '%');
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}




function createButton(container, number, imgSrc, caption, percentage) {
    // Create container div
    const containerDiv = document.createElement('div');
    containerDiv.className = 'containerr';
    containerDiv.style.width = '100%'; // Add width 100%



    // Create button element
    const button = document.createElement('button');
    button.className = 'btnn d-flex justify-content-between';
    button.style.width = '100%';

    // Create number span
    const numberSpan = document.createElement('span');
    numberSpan.className = 'number';
    numberSpan.textContent = number;

    // Create image element
    const img = document.createElement('img');
    img.className = 'img-profile';
    img.src = imgSrc;
    img.alt = 'Image';

       // Create caption span
       const captionSpan = document.createElement('span');
       captionSpan.className = 'caption';
       // Remove the first word from the caption
       const captionText = caption.split(' ').slice(1).join(' ');
       captionSpan.textContent = captionText;

    // Create percentage span
    const percentageSpan = document.createElement('span');
    percentageSpan.className = 'percentage';
    percentageSpan.textContent = percentage;

    // Append elements to button
    button.appendChild(numberSpan);
    button.appendChild(img);
    button.appendChild(captionSpan);
    button.appendChild(percentageSpan);

    // Append button to container div
    containerDiv.appendChild(button);

    // Append container div to main container
    container.appendChild(containerDiv);
}

// Fetch data and create buttons on page load
fetchDataAndCreateButtons();

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
