// Mobile header hamburger menu logic
const hamburger = document.querySelector('.hamburger');
const navRight = document.querySelector('.nav-right');
if (hamburger && navRight) {
  hamburger.addEventListener('click', function() {
    navRight.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}
