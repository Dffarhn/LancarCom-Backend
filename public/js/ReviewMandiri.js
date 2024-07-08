document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chatInput");
  const chatHistory = document.getElementById("chatHistory");

  const accessToken = getCookie("access_token");

  if (!accessToken) {
    // Redirect to login page if access token is not found
    window.location.href = "/login.html";
    return;
  }

  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const message = chatInput.value.trim();
      if (message) {
        appendUserMessage(message);
        chatInput.value = "";
        postMessageToAPI(message);
      }
    }
  });

  function appendUserMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    const messageElement = document.createElement("li");
    messageElement.classList.add("clearfix");
    messageElement.innerHTML = `
            <div class="message-data text-right">
                <span class="message-data-time">${timestamp}</span>
            </div>
            <div class="message other-message float-right">${message}</div>
        `;
    chatHistory.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: "smooth" }); // Auto-scroll to the new message
  }

  function appendBotMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    const messageElement = document.createElement("li");
    messageElement.classList.add("clearfix");
    messageElement.innerHTML = `
            <div class="message-data">
                <span class="message-data-time">${timestamp}</span>
            </div>
            <div class="message my-message">${message}</div>
        `;
    chatHistory.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: "smooth" }); // Auto-scroll to the new message
  }

  async function postMessageToAPI(message) {
    try {
      const response = await fetch("http://localhost:3002/ChatAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getCookie("access_token"),
        },
        body: JSON.stringify({ pesan: message }),
      });

      const result = await response.json();

      if (result.msg === "Query Successful") {
        appendBotMessage(result.data);
      } else {
        console.error("Failed to get response from API:", result);
      }
    } catch (error) {
      console.error("Error posting message to API:", error);
    }
  }
});

function getCookie(name) {
  const cookieString = document.cookie;
  const cookies = cookieString.split(";");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName.trim() === name) {
      return cookieValue;
    }
  }
  return null;
}
