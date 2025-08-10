const cookieConsent = document.getElementById('cookie-consent');
const acceptBtn = document.getElementById('accept-cookies');
const rejectBtn = document.getElementById('reject-cookies');

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
}

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function showCookieConsent() {
  if (!getCookie('cookieConsent')) {
    cookieConsent.style.display = 'flex';
  }
}

acceptBtn.addEventListener('click', () => {
  setCookie('cookieConsent', 'accepted', 365);
  cookieConsent.style.display = 'none';
});

rejectBtn.addEventListener('click', () => {
  setCookie('cookieConsent', 'rejected', 365);
  cookieConsent.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', showCookieConsent);
