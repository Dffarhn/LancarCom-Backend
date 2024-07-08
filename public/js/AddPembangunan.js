const form = document.getElementById("FormAddPembangunan");
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission
  const payload = {
    nama_pembangunan: document.getElementById("inputNama").value,
    lokasi_pembangunan: document.getElementById("inputLokasi").value,
    dana_pembangunan: document.getElementById("inputDana").value,
  };

  const url = `http://localhost:3002/pembangunan`;

  try {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      // Redirect to login page if access token is not found
      window.location.href = "/login.html";
      return;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      window.location.href = "Pembangunan.html";
    } else {
      alert("Failed to add pembangunan.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

function getCookie(name) {
  let cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");

    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }

  return null;
}
