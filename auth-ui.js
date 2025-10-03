// auth-ui.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

function updateNavForAuth(user) {
    const loginBtn = document.querySelector('.login-btn');
    let userBtn = document.querySelector('.user-btn');
    if (!userBtn) {
        userBtn = document.createElement('a');
        userBtn.className = 'user-btn';
        userBtn.href = 'user.html';
        userBtn.innerHTML = '<i class="fas fa-user-circle" style="color:#E63946;font-size:28px;"></i>';
        loginBtn.parentNode.insertBefore(userBtn, loginBtn);
    }
    if (user) {
        loginBtn.style.display = 'none';
        userBtn.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        userBtn.style.display = 'none';
    }
}

onAuthStateChanged(auth, (user) => {
    updateNavForAuth(user);
});
