const monthNames = {
    '1': 'January',
    '2': 'February',
    '3': 'March',
    '4': 'April',
    '5': 'May',
    '6': 'June',
    '7': 'July',
    '8': 'August',
    '9': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
};

function transformData(data) {
    const formattedData = data.map(item => ({
        year: item.tahun,
        month: monthNames[item.bulan],
        income: item.uang_masuk,
        outcome: item.uang_keluar,
        current_money: item.uang_sekarang,
        last_update_date: item.tanggal_update_terakhir
    }));

    return formattedData.map(item => (
        `Year: ${item.year}\n` +
        `Month: ${item.month}\n` +
        `Income: ${item.income}\n` +
        `Outcome: ${item.outcome}\n` +
        `Current Money: ${item.current_money}\n` +
        `last_update_date: ${item.last_update_date}\n`
      )).join('\n');
}


// function transformDevelopmentData(data) {
//     return data.map(item => ({
//         development_progress: item.progress_pembangunan,
//         funds_used: item.dana_digunakan,
//         remaining_funds: item.dana_sisa,
//         created_at: item.created_at,
//         development_name: item.nama_pembangunan,
//         development_location: item.lokasi_pembangunan,
//         development_funds: item.dana_pembangunan,
//         development_status: item.status_pembangunan
//     }));
// }

function formatDevelopmentProgress(data) {
    // Function to format individual items
    const formattedData = data.map(item => ({
      development_progress: item.progress_pembangunan,
      funds_used: item.dana_digunakan,
      remaining_funds: item.dana_sisa,
      created_at: item.created_at,
      development_name: item.nama_pembangunan,
      development_location: item.lokasi_pembangunan,
      development_funds: item.dana_pembangunan,
      development_status: item.status_pembangunan
    }));
  
    // Convert formatted data to a string
    return formattedData.map(item => (
      `Development Progress: ${item.development_progress}\n` +
      `Funds Used: ${item.funds_used}\n` +
      `Remaining Funds: ${item.remaining_funds}\n` +
      `Created At: ${item.created_at}\n` +
      `Development Name: ${item.development_name}\n` +
      `Development Location: ${item.development_location}\n` +
      `Development Funds: ${item.development_funds}\n` +
      `Development Status: ${item.development_status}\n`
    )).join('\n');
  }

module.exports = {transformData, formatDevelopmentProgress}