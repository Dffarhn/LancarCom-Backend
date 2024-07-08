async function fetchInboxData() {
    try {
        const response = await fetch('http://localhost:3002/inbox', {
            headers: {
                'Authorization': `Bearer ${getCookie('access_token')}`
            }
        });
        const data = await response.json();
        if (data.msg === "Query Successfully") {
            populateInbox(data.data);
        } else {
            console.error('Failed to fetch data:', data.msg);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function populateInbox(inboxItems) {
    const inboxList = document.getElementById('inbox-list');
    inboxList.innerHTML = ''; // Clear the list before populating

    inboxItems.forEach(item => {
        // const createdAt = new Date(item.created_at);
        // const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const inboxItem = document.createElement('a');
        inboxItem.href = `Mail2.html?id=${item.id}`;
        inboxItem.classList.add('list-group-item', 'list-group-item-action');
        inboxItem.innerHTML = `
            <div class="row d-flex justify-content-between">
                <div class="col-md-6 InboxSender">${item.asal_daerah}</div>
                <div class="col-md-3 InboxTime">${item.created_at}</div>
            </div>
            <div class="row">
                <div class="col-md-6 InboxSubject">Hasil Rekomendasi</div>
            </div>
            <div class="row">
                <div class="col-md-12">${item.rekomendasi_ai.substring(0, 60)}...</div>
            </div>
        `;
        inboxList.appendChild(inboxItem);
    });
}

document.addEventListener('DOMContentLoaded', fetchInboxData);
