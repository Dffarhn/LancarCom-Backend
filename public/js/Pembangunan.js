document.addEventListener('DOMContentLoaded', () => {
    const accessToken = getCookie('access_token');

    if (accessToken) {
        fetch('http://localhost:3002/pembangunans', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.msg === 'Query Successfully') {
                populateCards(data.data);
            } else {
                console.error('Failed to fetch data');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('No access token found in cookies');
    }
});

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


function formatRupiah(angka, prefix) {
    if (angka === null || angka === undefined) {
        return 'N/A';  // Nilai default jika null atau undefined
    }
    
    let numberString = angka.toString().replace(/[^,\d]/g, ''),
        split = numberString.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // Tambahkan titik jika ada ribuan
    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return 'Rp.' + rupiah 
}



document.write(`
    <div class="card" style="width: 18rem;">
        <div class="card-body">
            <h5 class="card-title">${item.nama_pembangunan}</h5>
            <button type="button" class="btn ${item.progress.progress_pembangunan === 100 ? 'btn-success' : (item.progress.progress_pembangunan === null ? 'btn-secondary' : 'btn-warning')} mb-3">
                ${item.progress.progress_pembangunan === 100 ? 'Success' : (item.progress.progress_pembangunan === null ? 'Pending' : 'In Progress')}
            </button>
            <p class="card-text">Tempat: ${item.lokasi_pembangunan}</p>
            <p class="card-text">Budget: ${formatRupiah(item.dana_pembangunan)}</p>
            <p class="card-text">Dana Sisa: ${formatRupiah(item.progress.dana_sisa)}</p>
            <div class="progress mb-3">
                <div class="progress-bar" role="progressbar" style="width: ${item.progress.progress_pembangunan === null ? 0 : item.progress.progress_pembangunan}%" aria-valuenow="${item.progress.progress_pembangunan === null ? 0 : item.progress.progress_pembangunan}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        </div>
    </div>
`);


function populateCards(data) {
    const chartRow = document.getElementById('chartRow');
    data.forEach(item => {
       
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-3 mb-4';
            card.innerHTML = `
                <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${item.nama_pembangunan}</h5>
                    <button type="button" class="btn ${item.progress.progress_pembangunan === 100 ? 'btn-success' : (item.progress.progress_pembangunan === null ? 'btn-secondary' : 'btn-warning')} mb-3">
                        ${item.progress.progress_pembangunan === 100 ? 'Success' : (item.progress.progress_pembangunan === null ? 'Pending' : 'In Progress')}
                    </button>
                    <p class="card-text">Tempat: ${item.lokasi_pembangunan}</p>
                    <p class="card-text">Budget: ${formatRupiah(item.dana_pembangunan)}</p>
                    <p class="card-text">Dana Sisa: ${formatRupiah(item.progress.dana_sisa)}</p>
                    <div class="progress mb-3">
                        <div class="progress-bar" role="progressbar" style="width: ${item.progress.progress_pembangunan === null ? 0 : item.progress.progress_pembangunan}%" aria-valuenow="${item.progress.progress_pembangunan === null ? 0 : item.progress.progress_pembangunan}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                </div>

            `;
            chartRow.appendChild(card);
        
    });
}