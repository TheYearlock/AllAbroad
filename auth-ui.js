// auth-ui.js
import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function updateNavForAuth(user) {
    const loginBtn = document.querySelector('.login-btn');
    const userBtn = document.querySelector('.user-btn');
    if (!loginBtn || !userBtn) return;
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
