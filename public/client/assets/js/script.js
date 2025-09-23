// Initialize Main Swiper Slideshow
var swiper = new Swiper(".mySwiper", {
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  loop: true,
});

// Initialize Feature Swiper
var featureSwiper = new Swiper(".featureSwiper", {
  slidesPerView: 5,
  spaceBetween: 15,
  scrollbar: {
    el: ".swiper-scrollbar",
    hide: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320: { slidesPerView: 2, spaceBetween: 10 },
    640: { slidesPerView: 3, spaceBetween: 12 },
    1024: { slidesPerView: 5, spaceBetween: 15 },
  },
});

// Initialize Deal Swiper
var dealSwiper = new Swiper(".dealSwiper", {
  slidesPerView: 6,
  spaceBetween: 15,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320: { slidesPerView: 1, spaceBetween: 10 },
    640: { slidesPerView: 2, spaceBetween: 12 },
    1024: { slidesPerView: 6, spaceBetween: 15 },
  },
});

// Countdown
function startCountdown(hours, minutes, seconds) {
  let h = hours, m = minutes, s = seconds;
  setInterval(() => {
    if (s > 0) s--;
    else {
      s = 59;
      if (m > 0) m--;
      else {
        m = 59;
        if (h > 0) h--;
      }
    }
    document.getElementById("h").innerText = h.toString().padStart(2, "0");
    document.getElementById("m").innerText = m.toString().padStart(2, "0");
    document.getElementById("s").innerText = s.toString().padStart(2, "0");
  }, 1000);
}
startCountdown(6, 47, 6);

// Toggle Social Links
const toggleBtn = document.getElementById('toggleBtn');
const socialLinks = document.querySelector('.social-links');

toggleBtn.addEventListener('click', () => {
  socialLinks.classList.toggle('show');
  toggleBtn.classList.toggle('open');
});

