// auth-ui.js
import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Set or clear a cached flag so pages can read it immediately to avoid flicker/delay
function setCachedAuth(isSignedIn) {
    try {
        localStorage.setItem('allabroad_signed_in', isSignedIn ? '1' : '0');
    } catch (e) {
        // localStorage may be unavailable in some environments
    }
}

function readCachedAuth() {
    try {
        return localStorage.getItem('allabroad_signed_in') === '1';
    } catch (e) {
        return false;
    }
}

function makeUserIcon() {
    // prettier, accessible SVG user icon; size controlled by CSS
    return `
        <span class="user-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <circle cx="12" cy="8" r="3.2" fill="#E63946" />
                <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" stroke="#E63946" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>
    `;
}

function findLoginAndUserButtons() {
    // pages include auth-ui.js from different relative paths. Use broad selectors.
    const loginBtn = document.querySelector('.login-btn');
    let userBtn = document.querySelector('.user-btn');

    // If there's no user-btn, try to create one next to login button (graceful fallback)
    if (!userBtn && loginBtn && loginBtn.parentNode) {
        userBtn = document.createElement('a');
        userBtn.className = 'user-btn';
        userBtn.href = 'user.html';
        userBtn.innerHTML = makeUserIcon();
        userBtn.style.display = 'none';
        loginBtn.parentNode.insertBefore(userBtn, loginBtn);
    }

    // Ensure userBtn has the icon markup
    if (userBtn && !userBtn.querySelector('.user-icon')) {
        userBtn.innerHTML = makeUserIcon();
    }

    return { loginBtn, userBtn };
}

function updateNavForAuth(user) {
    const { loginBtn, userBtn } = findLoginAndUserButtons();
    if (!loginBtn && !userBtn) return;

    const showUser = !!user || readCachedAuth();

    if (loginBtn) loginBtn.style.display = showUser ? 'none' : 'inline-block';
    if (userBtn) userBtn.style.display = showUser ? 'inline-block' : 'none';
}

// Apply cached state immediately on load to reduce perceived delay
// Try to update immediately (module may load after DOM parsed)
try { updateNavForAuth(null); } catch (e) {}
document.addEventListener('DOMContentLoaded', () => {
    updateNavForAuth(null);
});

// Listen using the modular SDK (when available)
try {
    if (auth) {
        onAuthStateChanged(auth, (user) => {
            setCachedAuth(!!user);
            updateNavForAuth(user);
        });
    }
} catch (e) {
    // ignore
}

// Also listen for compat SDK auth state changes in case some pages use the compat API
// Note: repo now uses modular API for sign-in/sign-out. If you still need compat
// support in the future you can re-add a compat listener here.

// Also expose a small function that other scripts can call after sign-in flows complete
// e.g. window.allabroadAuthUpdate(true)
window.allabroadAuthUpdate = function(isSignedIn) {
    setCachedAuth(!!isSignedIn);
    updateNavForAuth(!!isSignedIn ? {} : null);
};
