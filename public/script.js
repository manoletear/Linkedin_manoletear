// ========== Mobile Nav Toggle ==========
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

// Close mobile nav when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ========== Testimonials Carousel ==========
const cards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.carousel-btn-prev');
const nextBtn = document.querySelector('.carousel-btn-next');
const dotsContainer = document.querySelector('.carousel-dots');
let currentIndex = 0;

// Create dots
cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
});

function goToSlide(index) {
    cards[currentIndex].classList.remove('active');
    dotsContainer.children[currentIndex].classList.remove('active');
    currentIndex = index;
    cards[currentIndex].classList.add('active');
    dotsContainer.children[currentIndex].classList.add('active');
}

prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex === 0 ? cards.length - 1 : currentIndex - 1);
});

nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex === cards.length - 1 ? 0 : currentIndex + 1);
});

// Auto-advance every 6 seconds
let autoPlay = setInterval(() => {
    goToSlide(currentIndex === cards.length - 1 ? 0 : currentIndex + 1);
}, 6000);

// Pause auto-advance on hover
const carousel = document.querySelector('.testimonials-carousel');
carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
carousel.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => {
        goToSlide(currentIndex === cards.length - 1 ? 0 : currentIndex + 1);
    }, 6000);
});

// ========== Smooth scroll offset for fixed nav ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 72;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});
