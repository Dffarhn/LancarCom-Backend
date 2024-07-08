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
function setActiveNavItem(activeItemId) {
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-id') === activeItemId) {
            item.classList.add('active');
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Fetch the sidebar HTML
    fetch('utils/sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebarContainer').innerHTML = data;

            const token = getCookie('access_token'); // Assuming your JWT is stored in a cookie named 'jwt'
            if (token) {
                const decodedToken = jwt_decode(token);
                // Assume the URL you want to set is based on some property in the token, like user role or user ID
                let href = 'default.html'; // default URL
                if (decodedToken.role > 1) {
                    href = 'indexx.html';
                } else{
                    href = 'index.html';
                }
                document.querySelector('li.nav-item[data-id="dashboard"] a.nav-link').setAttribute('href', href);
            }

            // Get the active item from localStorage
            var activeItem = localStorage.getItem('activeNavItem');
            if (activeItem) {
                setActiveNavItem(activeItem);
            }

            // Add click event listeners to update the active state
            var navLinks = document.querySelectorAll('.nav-item a');
            navLinks.forEach(function(link) {
                link.addEventListener('click', function() {
                    var activeId = this.parentElement.getAttribute('data-id');
                    localStorage.setItem('activeNavItem', activeId);
                    setActiveNavItem(activeId);
                });
            });
        });
});