// Function to get a cookie value by name
function getCookie(cookieName) {
  const cookieValue = document.cookie.match("(^|[^;]+)\\s*" + cookieName + "\\s*=\\s*([^;]+)");
  return cookieValue ? cookieValue.pop() : "";
}

// Function to fetch data and update UI with Authorization header
function fetchDataAndUpdateUI() {
  const token = getCookie("access_token"); // Replace 'your_cookie_name' with the actual cookie name containing the token

  fetch("http://localhost:3002/statistic/pembangunan", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const { count_pending, count_ongoing, count_completed } = data.data[0];

      // Update the HTML with the fetched data

      document.getElementById("icon_pending").textContent = count_pending;

      document.getElementById("icon_ongoing").textContent = count_ongoing;

      document.getElementById("icon_completed").textContent = count_completed;
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Call fetchDataAndUpdateUI function when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchDataAndUpdateUI();
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    // Redirect to login page if access token is not found
    window.location.href = "/login.html";
    return;
  }
});
