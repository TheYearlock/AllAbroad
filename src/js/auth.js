// Simple localStorage-based auth system
const AUTH_KEY = 'allabroad_user';

function isLoggedIn() {
  return !!localStorage.getItem(AUTH_KEY);
}

function login(username) {
  localStorage.setItem(AUTH_KEY, username);
  updateLoginButton();
  window.location.href = '/';
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  updateLoginButton();
  window.location.href = '/';
}

function updateLoginButton() {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    const username = localStorage.getItem(AUTH_KEY);
    if (username) {
      loginBtn.textContent = `${username} (Çıkış)`;
      loginBtn.href = '#';
      loginBtn.onclick = (e) => {
        e.preventDefault();
        logout();
      };
    } else {
      loginBtn.textContent = 'Giriş';
      loginBtn.href = '/giris';
      loginBtn.onclick = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', updateLoginButton);
