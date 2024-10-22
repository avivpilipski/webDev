const images = [
    'one.jpeg',
    'two.jpeg',
    'three.jpeg',
    'four.jpeg',
    'five.jpeg',
    'six.jpg'
];

const name = "Aviv Pilipski";
let currentIndex = 0;
let letterIndex = 0;
let rotationPattern = 0;
const gallery = document.getElementById('gallery');
const nameContainer = document.getElementById('name-container');
const textBackground = document.getElementById('textBackground');

// Initialize name with hidden letters
name.split('').forEach((letter, index) => {
    const span = document.createElement('span');
    span.className = `letter${letter === ' ' ? ' space' : ''}`;
    span.textContent = letter;
    nameContainer.appendChild(span);
});

const letters = document.querySelectorAll('.letter');

function animateLetters() {
    letters.forEach(letter => letter.classList.remove('visible'));
    letterIndex = 0;
    animateNextLetter();
}

function animateNextLetter() {
    if (letterIndex < letters.length) {
        letters[letterIndex].classList.add('visible');
        letterIndex++;
        setTimeout(animateNextLetter, 50);
    }
}

const rotationPatterns = [
    (index) => `rotateY(${index * (360 / images.length)}deg) translateZ(50vmin)`,
    (index) => `rotateY(${index * (360 / images.length)}deg) rotateX(45deg) translateZ(50vmin)`,
    (index) => `rotateY(${index * (360 / images.length)}deg) rotateX(${index * 15}deg) translateZ(${50 + index * 5}vmin)`,
    (index) => `rotateY(${index * (360 / images.length)}deg) rotateZ(${Math.sin(index) * 20}deg) translateZ(50vmin)`,
    (index) => `rotateY(${index * (360 / images.length)}deg) rotateX(${index * (360 / images.length)}deg) translateZ(50vmin)`,
];

const transitionPatterns = [
    (index) => `rotateY(${-index * (360 / images.length)}deg)`,
    (index) => `rotateY(${-index * (360 / images.length)}deg) rotateX(${index * 45}deg)`,
    (index) => `rotateY(${-index * (360 / images.length)}deg) rotateX(${index * 15}deg) translateZ(${-index * 5}vmin)`,
    (index) => `rotateY(${-index * (360 / images.length)}deg) rotateZ(${Math.sin(index * Math.PI) * 20}deg)`,
    (index) => `rotateY(${-index * (360 / images.length)}deg) rotateX(${-index * (360 / images.length)}deg)`,
];

function initializeGallery() {
    gallery.innerHTML = '';
    const currentPattern = rotationPatterns[rotationPattern];
    
    images.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.transform = currentPattern(index);
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Image ${index + 1}`;
        
        item.appendChild(img);
        gallery.appendChild(item);
    });
}

function updateGalleryPattern() {
    const nextPattern = (rotationPattern + 1) % rotationPatterns.length;
    rotationPattern = nextPattern;
    
    Array.from(gallery.children).forEach((item, index) => {
        item.style.transform = rotationPatterns[rotationPattern](index);
    });
}

const phrases = [
    "Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much.",
    "They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.",
    "Mr. Dursley was the director of a firm called Grunnings, which made drills.",
    "He was a big, beefy man with hardly any neck, although he did have a very large mustache.",
    "Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck.",
    "The Dursleys had everything they wanted, but they also had a secret.",
    "Their greatest fear was that somebody would discover it.",
    "They didn't think they could bear it if anyone found out about the Potters.",
    "Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years.",
    "The Dursleys knew that the Potters had a small son, too, but they had never even seen him.",
    "This boy was another good reason for keeping the Potters away.",
    "They didn't want Dudley mixing with a child like that.",
    "When Mr. and Mrs. Dursley woke up on the dull, gray Tuesday our story starts, there was nothing about the cloudy sky outside to suggest that strange and mysterious things would soon be happening all over the country.",
    "Mr. Dursley hummed as he picked out his most boring tie for work.",
    "Mrs. Dursley gossiped away happily as she wrestled a screaming Dudley into his high chair."
];

function createFloatingText() {
    const line = document.createElement('div');
    line.className = 'text-line';
    const availableHeight = window.innerHeight;
    const lineHeight = availableHeight / 8;
    const randomOffset = Math.floor(Math.random() * lineHeight);
    line.style.top = (Math.floor(Math.random() * 8) * lineHeight + randomOffset) + 'px';
    line.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    textBackground.appendChild(line);

    line.addEventListener('animationend', () => {
        line.remove();
    });
}

setInterval(createFloatingText, 1500);

// Initialize with several lines
for (let i = 0; i < 8; i++) {
    createFloatingText();
}

document.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    const currentTransition = transitionPatterns[rotationPattern];
    gallery.style.transform = currentTransition(currentIndex);
    animateLetters();
    
    if (currentIndex === 0) {
        setTimeout(updateGalleryPattern, 1000);
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > 50 || Math.abs(diffY) > 50) {
        currentIndex = (currentIndex + 1) % images.length;
        const currentTransition = transitionPatterns[rotationPattern];
        gallery.style.transform = currentTransition(currentIndex);
        animateLetters();
        
        if (currentIndex === 0) {
            setTimeout(updateGalleryPattern, 1000);
        }
    }
});

animateLetters();
initializeGallery();